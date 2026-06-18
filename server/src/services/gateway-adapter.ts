import { createContextLogger } from "../lib/logger";
import { memoryManager } from "./memory-manager";

export interface GatewayMessage {
  id: string;
  userId: string;
  text: string;
  platform: "telegram" | "discord";
  chatId: string;
  replyTo?: string;
  attachments?: Array<{ type: string; url: string }>;
}

export interface GatewayReply {
  text: string;
  parseMode?: "markdown" | "html";
  replyToMessageId?: string;
}

/**
 * Base class for messaging gateway adapters.
 * Both Telegram and Discord extend this.
 */
export abstract class GatewayAdapter {
  protected log: ReturnType<typeof createContextLogger>;

  constructor(
    protected name: string,
    protected platform: "telegram" | "discord",
  ) {
    this.log = createContextLogger(`gateway:${name}`);
  }

  /** Initialize the gateway connection */
  abstract start(): Promise<void>;

  /** Send a reply message */
  abstract sendReply(chatId: string, reply: GatewayReply): Promise<void>;

  /** Send a typing indicator */
  abstract sendTyping(chatId: string): Promise<void>;

  /** Stop the gateway */
  abstract stop(): Promise<void>;

  /**
   * Process an incoming message through the agent pipeline.
   * Subclasses call this after parsing platform-specific messages.
   */
  async processMessage(
    msg: GatewayMessage,
    runAgent: (message: string, userId: string) => Promise<string>,
  ): Promise<GatewayReply> {
    const { chatId, text, userId } = msg;

    try {
      // Check if user wants memory context
      if (text.startsWith("/context ")) {
        const query = text.slice(9).trim();
        const context = await memoryManager.getRelevantContext(userId, query);
        return {
          text: context
            ? `**Relevant Context:**\n\n${context}`
            : "No relevant context found.",
          parseMode: "markdown",
        };
      }

      // Check if user wants to save a memory
      if (text.startsWith("/remember ")) {
        const parts = text.slice(10).trim().split("=");
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const value = parts.slice(1).join("=").trim();
          await memoryManager.addFact({
            userId,
            key,
            value,
            source: "explicit",
          });
          return {
            text: `Remembered: **${key}** = ${value}`,
            parseMode: "markdown",
          };
        }
        return {
          text: "Usage: /remember <key> = <value>",
          parseMode: "markdown",
        };
      }

      // Check if user wants to recall a memory
      if (text.startsWith("/recall ")) {
        const key = text.slice(8).trim();
        const fact = await memoryManager.getFact(userId, key);
        return {
          text: fact
            ? `**${fact.key}** = ${fact.value}`
            : `No memory found for "${key}".`,
          parseMode: "markdown",
        };
      }

      // Default: run through agent
      await this.sendTyping(chatId);
      const response = await runAgent(text, userId);

      // Store as episode
      await memoryManager.addEpisode({
        userId,
        summary: `${msg.platform} message: ${text.slice(0, 200)}`,
        keyFacts: [text.slice(0, 100)],
        topics: [msg.platform],
      });

      return { text: response, parseMode: "markdown" };
    } catch (err: any) {
      this.log.error({ err, userId, chatId }, "Failed to process message");
      return { text: `Error: ${err.message}`, parseMode: "markdown" };
    }
  }
}
