import TelegramBot from "node-telegram-bot-api";
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
let bot: TelegramBot | null = null;

const chatUserMap = new Map<number, string>();

export function initTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.log(
      "[Telegram Gateway] TELEGRAM_BOT_TOKEN not set. Gateway offline.",
    );
    return;
  }

  bot = new TelegramBot(token, { polling: true });
  console.log("[Telegram Gateway] Telegram Bot initialized in polling mode.");

  bot.onText(/\/start/, (msg) => {
    bot?.sendMessage(
      msg.chat.id,
      "Welcome to Signhify AI!\n\n" +
        "Link your account:\n`/login <email> <password>`\n\n" +
        "Commands:\n" +
        "• `/ask <query>` — Run agents\n" +
        "• `/remember <key> = <value>` — Save a memory\n" +
        "• `/recall <key>` — Recall a memory\n" +
        "• `/context <query>` — Get relevant context\n" +
        "• `/stats` — Memory stats",
    );
  });

  bot.onText(/\/login (.+) (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!match) return;
    const email = match[1].trim();
    const password = match[2].trim();

    try {
      const user = await User.findOne({ email });
      if (!user) {
        bot?.sendMessage(chatId, "User not found.");
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        bot?.sendMessage(chatId, "Invalid password.");
        return;
      }

      chatUserMap.set(chatId, user._id.toString());
      bot?.sendMessage(chatId, `Linked to account: ${user.displayName}`);
    } catch (err: any) {
      bot?.sendMessage(chatId, `Login failed: ${err.message}`);
    }
  });

  bot.onText(/\/remember (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = chatUserMap.get(chatId);
    if (!userId) {
      bot?.sendMessage(
        chatId,
        "Please link your account first using `/login <email> <password>`.",
      );
      return;
    }
    if (!match) return;

    const text = match[1].trim();
    const eqIdx = text.indexOf("=");
    if (eqIdx === -1) {
      bot?.sendMessage(chatId, "Usage: `/remember <key> = <value>`");
      return;
    }

    const key = text.slice(0, eqIdx).trim();
    const value = text.slice(eqIdx + 1).trim();

    try {
      await memoryManager.addFact({ userId, key, value, source: "explicit" });
      bot?.sendMessage(chatId, `Remembered: ${key}`);
    } catch (err: any) {
      bot?.sendMessage(chatId, `Failed to save: ${err.message}`);
    }
  });

  bot.onText(/\/recall (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = chatUserMap.get(chatId);
    if (!userId) {
      bot?.sendMessage(
        chatId,
        "Please link your account first using `/login <email> <password>`.",
      );
      return;
    }
    if (!match) return;

    const key = match[1].trim();
    try {
      const fact = await memoryManager.getFact(userId, key);
      if (fact) {
        bot?.sendMessage(chatId, `${fact.key} = ${fact.value}`);
      } else {
        bot?.sendMessage(chatId, `No memory found for "${key}".`);
      }
    } catch (err: any) {
      bot?.sendMessage(chatId, `Failed to recall: ${err.message}`);
    }
  });

  bot.onText(/\/context (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = chatUserMap.get(chatId);
    if (!userId) {
      bot?.sendMessage(
        chatId,
        "Please link your account first using `/login <email> <password>`.",
      );
      return;
    }
    if (!match) return;

    const query = match[1].trim();
    try {
      const context = await memoryManager.getRelevantContext(userId, query);
      bot?.sendMessage(chatId, context || "No relevant context found.");
    } catch (err: any) {
      bot?.sendMessage(chatId, `Failed to get context: ${err.message}`);
    }
  });

  bot.onText(/\/stats/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = chatUserMap.get(chatId);
    if (!userId) {
      bot?.sendMessage(
        chatId,
        "Please link your account first using `/login <email> <password>`.",
      );
      return;
    }

    try {
      const stats = await memoryManager.getMemoryStats(userId);
      bot?.sendMessage(
        chatId,
        `Memory Stats:\n` +
          `• Episodes: ${stats.episodes}\n` +
          `• Facts: ${stats.facts}\n` +
          `• Profile: ${stats.profileExists ? "Active" : "None"}`,
      );
    } catch (err: any) {
      bot?.sendMessage(chatId, `Failed to get stats: ${err.message}`);
    }
  });

  bot.onText(/\/ask (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    if (!match) return;
    const text = match[1].trim();

    const userId = chatUserMap.get(chatId);
    if (!userId) {
      bot?.sendMessage(
        chatId,
        "Please link your account first using `/login <email> <password>`.",
      );
      return;
    }

    await handleAgentQuery(chatId, userId, text);
  });

  // Handle generic messages (non-command)
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    if (!text || text.startsWith("/")) return;

    const userId = chatUserMap.get(chatId);
    if (!userId) {
      bot?.sendMessage(
        chatId,
        "Please link your account first using `/login <email> <password>`.",
      );
      return;
    }

    await handleAgentQuery(chatId, userId, text);
  });
}

async function handleAgentQuery(chatId: number, userId: string, text: string) {
  bot?.sendChatAction(chatId, "typing");

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
      bot?.sendMessage(chatId, "Error: No API keys configured on the server.");
      return;
    }

    // Get relevant memory context
    const memoryContext = await memoryManager.getRelevantContext(userId, text);
    const enrichedMessage = memoryContext
      ? `[User Context]\n${memoryContext}\n\n[User Query]\n${text}`
      : text;

    const agentType = await classifyIntent(text, allKeys.gemini);
    bot?.sendMessage(chatId, `✦ Routing to: [${agentType.toUpperCase()}]`);

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
      summary: `Telegram: ${text.slice(0, 200)}`,
      keyFacts: [text.slice(0, 100)],
      topics: ["telegram"],
    });

    // Split long messages for Telegram (4096 char limit)
    if (fullContent.length <= 4096) {
      bot?.sendMessage(chatId, fullContent);
    } else {
      let remaining = fullContent;
      while (remaining.length > 0) {
        bot?.sendMessage(chatId, remaining.slice(0, 4096));
        remaining = remaining.slice(4096);
      }
    }
  } catch (err: any) {
    bot?.sendMessage(chatId, `Failed: ${err.message}`);
  }
}

export default router;
