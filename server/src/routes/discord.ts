import { Client, GatewayIntentBits, Partials } from "discord.js";
import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { memoryManager } from "../services/memory-manager";
import {
  classifyIntent,
  runScribeAgent,
  runScoutAgent,
  runForgeAgent,
  runVaultAgent,
  runHeraldAgent,
  runVisionAgent,
  createLLM,
  streamResponse,
} from "@signhify/agents";

const router: Router = Router();
let client: Client | null = null;

const discordUserMap = new Map<string, string>();

export function initDiscordBot() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.log(
      "[Discord Gateway] DISCORD_BOT_TOKEN not set. Gateway offline.",
    );
    return;
  }

  client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel],
  });

  client.once("ready", () => {
    console.log(`[Discord Gateway] Logged in as ${client?.user?.tag}!`);
  });

  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    const content = message.content.trim();
    const discordUserId = message.author.id;

    // Login command
    if (content.startsWith("!login ")) {
      const parts = content.split(" ");
      if (parts.length < 3) {
        message.reply("Usage: `!login <email> <password>`");
        return;
      }
      const email = parts[1].trim();
      const password = parts[2].trim();

      try {
        const user = await User.findOne({ email });
        if (!user) {
          message.reply("User not found.");
          return;
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
          message.reply("Invalid credentials.");
          return;
        }

        discordUserMap.set(discordUserId, user._id.toString());
        message.reply(`Linked to Signhify user: ${user.displayName}`);
      } catch (err: any) {
        message.reply(`Login failed: ${err.message}`);
      }
      return;
    }

    const userId = discordUserMap.get(discordUserId);

    // Remember command
    if (content.startsWith("!remember ")) {
      if (!userId) {
        message.reply(
          "Please link your account first using `!login <email> <password>`.",
        );
        return;
      }
      const text = content.slice(10).trim();
      const eqIdx = text.indexOf("=");
      if (eqIdx === -1) {
        message.reply("Usage: `!remember <key> = <value>`");
        return;
      }
      const key = text.slice(0, eqIdx).trim();
      const value = text.slice(eqIdx + 1).trim();

      try {
        await memoryManager.addFact({ userId, key, value, source: "explicit" });
        message.reply(`Remembered: **${key}**`);
      } catch (err: any) {
        message.reply(`Failed to save: ${err.message}`);
      }
      return;
    }

    // Recall command
    if (content.startsWith("!recall ")) {
      if (!userId) {
        message.reply(
          "Please link your account first using `!login <email> <password>`.",
        );
        return;
      }
      const key = content.slice(8).trim();

      try {
        const fact = await memoryManager.getFact(userId, key);
        if (fact) {
          message.reply(`**${fact.key}** = ${fact.value}`);
        } else {
          message.reply(`No memory found for "${key}".`);
        }
      } catch (err: any) {
        message.reply(`Failed to recall: ${err.message}`);
      }
      return;
    }

    // Context command
    if (content.startsWith("!context ")) {
      if (!userId) {
        message.reply(
          "Please link your account first using `!login <email> <password>`.",
        );
        return;
      }
      const query = content.slice(9).trim();

      try {
        const ctx = await memoryManager.getRelevantContext(userId, query);
        message.reply(ctx || "No relevant context found.");
      } catch (err: any) {
        message.reply(`Failed: ${err.message}`);
      }
      return;
    }

    // Stats command
    if (content === "!stats") {
      if (!userId) {
        message.reply(
          "Please link your account first using `!login <email> <password>`.",
        );
        return;
      }

      try {
        const stats = await memoryManager.getMemoryStats(userId);
        message.reply(
          `**Memory Stats:**\n` +
            `• Episodes: ${stats.episodes}\n` +
            `• Facts: ${stats.facts}\n` +
            `• Profile: ${stats.profileExists ? "Active" : "None"}`,
        );
      } catch (err: any) {
        message.reply(`Failed: ${err.message}`);
      }
      return;
    }

    // Ask command or DM
    if (content.startsWith("!ask ") || message.channel.isDMBased()) {
      if (!userId) {
        message.reply(
          "Please link your account first using `!login <email> <password>`.",
        );
        return;
      }
      const prompt = content.startsWith("!ask ")
        ? content.slice(5).trim()
        : content;
      if (!prompt) return;

      await handleDiscordAgentQuery(message, userId, prompt);
    }
  });

  client.login(token).catch((err) => {
    console.error("[Discord Gateway] Login failed:", err.message);
  });
}

async function handleDiscordAgentQuery(
  message: any,
  userId: string,
  prompt: string,
) {
  try {
    await message.channel.sendTyping();
  } catch {
    // ignore permission errors
  }

  try {
    const allKeys = {
      gemini: process.env.SYSTEM_GEMINI_KEY || process.env.GEMINI_API_KEY,
      groq: process.env.GROQ_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      openrouter: process.env.OPENROUTER_API_KEY,
    };

    if (
      !allKeys.gemini &&
      !allKeys.groq &&
      !allKeys.openai &&
      !allKeys.anthropic &&
      !allKeys.openrouter
    ) {
      message.reply("Error: No API keys configured on the server.");
      return;
    }

    // Get relevant memory context
    const memoryContext = await memoryManager.getRelevantContext(
      userId,
      prompt,
    );
    const enrichedMessage = memoryContext
      ? `[User Context]\n${memoryContext}\n\n[User Query]\n${prompt}`
      : prompt;

    const agentType = await classifyIntent(prompt, allKeys.gemini);
    const routingMsg = await message.reply(
      `✦ Routing to: [${agentType.toUpperCase()}]`,
    );

    let fullContent = "";
    const onToken = () => {};

    if (agentType === "scribe") {
      fullContent = await runScribeAgent(
        { task: enrichedMessage },
        allKeys,
        onToken,
      );
    } else if (agentType === "scout") {
      const result = await runScoutAgent(
        { query: enrichedMessage },
        allKeys,
        onToken,
      );
      fullContent = result.answer;
    } else if (agentType === "forge") {
      fullContent = await runForgeAgent(
        { task: enrichedMessage },
        allKeys,
        onToken,
      );
    } else if (agentType === "vault") {
      const result = await runVaultAgent(
        { task: enrichedMessage },
        allKeys,
        onToken,
      );
      fullContent = result.response;
    } else if (agentType === "herald") {
      fullContent = await runHeraldAgent(
        { task: enrichedMessage },
        allKeys,
        onToken,
      );
    } else if (agentType === "vision") {
      fullContent = await runVisionAgent(
        { task: enrichedMessage },
        allKeys,
        onToken,
      );
    } else {
      const model = createLLM(allKeys, "default");
      fullContent = await streamResponse(
        model,
        [{ role: "user", content: enrichedMessage }],
        onToken,
      );
    }

    // Store episode
    await memoryManager.addEpisode({
      userId,
      summary: `Discord: ${prompt.slice(0, 200)}`,
      keyFacts: [prompt.slice(0, 100)],
      topics: ["discord"],
    });

    // Discord 2000 char limit
    if (fullContent.length <= 2000) {
      await routingMsg.edit(fullContent);
    } else {
      await routingMsg.edit(fullContent.slice(0, 2000));
      let remaining = fullContent.slice(2000);
      while (remaining.length > 0) {
        await message.channel.send(remaining.slice(0, 2000));
        remaining = remaining.slice(2000);
      }
    }
  } catch (err: any) {
    message.reply(`Failed: ${err.message}`);
  }
}

export default router;
