import { createContextLogger } from "../lib/logger";
import {
  cacheGet,
  cacheSet,
  cacheDel,
  cacheInvalidatePattern,
} from "../lib/redis";
import { MemoryEpisode } from "../models/MemoryEpisode";
import { MemoryFact } from "../models/MemoryFact";
import { UserProfile } from "../models/UserProfile";
import { computeEmbedding, cosineSimilarity } from "@signhify/memory";

const log = createContextLogger("memory-manager");

const PROFILE_CACHE_TTL = 3600; // 1 hour
const FACT_CACHE_TTL = 1800; // 30 min
const EPISODE_CACHE_TTL = 900; // 15 min

export class MemoryManager {
  // ─── Episodes ─────────────────────────────────────────────────────

  async addEpisode(params: {
    userId: string;
    threadId?: string;
    summary: string;
    participants?: string[];
    keyFacts?: string[];
    sentiment?: "positive" | "negative" | "neutral" | "mixed";
    topics?: string[];
  }): Promise<any> {
    const embedding = computeEmbedding(params.summary).vector;
    const episode = await MemoryEpisode.create({
      userId: params.userId,
      threadId: params.threadId,
      summary: params.summary,
      participants: params.participants ?? [],
      keyFacts: params.keyFacts ?? [],
      sentiment: params.sentiment,
      topics: params.topics ?? [],
      embedding,
      timestamp: new Date(),
    });

    await cacheInvalidatePattern(`episodes:${params.userId}:*`);
    log.debug(
      { userId: params.userId, topics: params.topics },
      "Episode stored",
    );
    return episode;
  }

  async searchEpisodes(
    userId: string,
    query: string,
    topK = 5,
  ): Promise<Array<any & { score: number }>> {
    const cacheKey = `episodes:${userId}:${query}:${topK}`;
    const cached = await cacheGet<Array<any & { score: number }>>(cacheKey);
    if (cached) return cached;

    const queryVec = computeEmbedding(query).vector;
    const episodes = await MemoryEpisode.find({ userId })
      .sort({ timestamp: -1 })
      .limit(200);

    const scored = episodes
      .filter((e) => e.embedding && e.embedding.length > 0)
      .map((e) => ({
        ...e.toObject(),
        score: cosineSimilarity(queryVec, e.embedding!),
      }))
      .filter((e) => e.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    await cacheSet(cacheKey, scored, EPISODE_CACHE_TTL);
    return scored;
  }

  async getRecentEpisodes(userId: string, limit = 10): Promise<any[]> {
    return MemoryEpisode.find({ userId }).sort({ timestamp: -1 }).limit(limit);
  }

  // ─── Facts ────────────────────────────────────────────────────────

  async addFact(params: {
    userId: string;
    key: string;
    value: string;
    confidence?: number;
    source?: "conversation" | "explicit" | "inferred" | "profile";
    tags?: string[];
  }): Promise<any> {
    const embedding = computeEmbedding(`${params.key}: ${params.value}`).vector;

    const fact = await MemoryFact.findOneAndUpdate(
      { userId: params.userId, key: params.key },
      {
        $set: {
          value: params.value,
          confidence: params.confidence ?? 0.7,
          source: params.source ?? "conversation",
          embedding,
          lastConfirmed: new Date(),
          tags: params.tags ?? [],
        },
        $setOnInsert: {
          firstSeen: new Date(),
        },
      },
      { upsert: true, new: true },
    );

    await cacheInvalidatePattern(`facts:${params.userId}:*`);
    log.debug({ userId: params.userId, key: params.key }, "Fact upserted");
    return fact;
  }

  async getFact(userId: string, key: string): Promise<any | null> {
    const cacheKey = `facts:${userId}:${key}`;
    const cached = await cacheGet<any>(cacheKey);
    if (cached) return cached;

    const fact = await MemoryFact.findOne({ userId, key });
    if (fact) {
      await cacheSet(cacheKey, fact.toObject(), FACT_CACHE_TTL);
    }
    return fact;
  }

  async searchFacts(
    userId: string,
    query: string,
    topK = 10,
  ): Promise<Array<any & { score: number }>> {
    const queryVec = computeEmbedding(query).vector;
    const facts = await MemoryFact.find({ userId }).limit(200);

    return facts
      .filter((f) => f.embedding && f.embedding.length > 0)
      .map((f) => ({
        ...f.toObject(),
        score: cosineSimilarity(queryVec, f.embedding!),
      }))
      .filter((f) => f.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  async listFacts(userId: string): Promise<any[]> {
    return MemoryFact.find({ userId }).sort({ confidence: -1, updatedAt: -1 });
  }

  async deleteFact(userId: string, key: string): Promise<boolean> {
    const result = await MemoryFact.findOneAndDelete({ userId, key });
    if (result) {
      await cacheDel(`facts:${userId}:${key}`);
      return true;
    }
    return false;
  }

  async contradictFact(
    userId: string,
    key: string,
    newValue: string,
  ): Promise<any | null> {
    const existing = await MemoryFact.findOne({ userId, key });
    if (!existing) return null;

    existing.value = newValue;
    existing.confidence = Math.max(0.3, existing.confidence - 0.2);
    existing.lastConfirmed = new Date();
    existing.embedding = computeEmbedding(`${key}: ${newValue}`).vector;
    await existing.save();

    await cacheDel(`facts:${userId}:${key}`);
    return existing;
  }

  // ─── User Profile ─────────────────────────────────────────────────

  async getProfile(userId: string): Promise<any | null> {
    const cacheKey = `profile:${userId}`;
    const cached = await cacheGet<any>(cacheKey);
    if (cached) return cached;

    const profile = await UserProfile.findOne({ userId });
    if (profile) {
      await cacheSet(cacheKey, profile.toObject(), PROFILE_CACHE_TTL);
    }
    return profile;
  }

  async upsertProfile(userId: string, data: Partial<any>): Promise<any> {
    const profile = await UserProfile.findOneAndUpdate(
      { userId },
      { $set: data },
      { upsert: true, new: true },
    );

    await cacheDel(`profile:${userId}`);
    return profile;
  }

  async updateProfileInteraction(
    userId: string,
    agentType: string,
    messageCount = 1,
  ): Promise<void> {
    await UserProfile.findOneAndUpdate(
      { userId },
      {
        $inc: {
          "interactionStats.totalMessages": messageCount,
          "interactionStats.totalSessions": 1,
        },
        $set: {
          "interactionStats.lastActiveAt": new Date(),
        },
        $addToSet: {
          "interactionStats.topAgents": agentType,
        },
      },
      { upsert: true },
    );

    await cacheDel(`profile:${userId}`);
  }

  // ─── Context Retrieval (for agent injection) ──────────────────────

  async getRelevantContext(userId: string, query: string): Promise<string> {
    const [episodes, facts] = await Promise.all([
      this.searchEpisodes(userId, query, 3),
      this.searchFacts(userId, query, 5),
    ]);

    const parts: string[] = [];

    if (facts.length > 0) {
      parts.push(
        "Known facts about the user:\n" +
          facts.map((f) => `- ${f.key}: ${f.value}`).join("\n"),
      );
    }

    if (episodes.length > 0) {
      parts.push(
        "Relevant past interactions:\n" +
          episodes.map((e) => `- ${e.summary}`).join("\n"),
      );
    }

    return parts.join("\n\n");
  }

  // ─── Maintenance ──────────────────────────────────────────────────

  async cleanupExpiredFacts(): Promise<number> {
    const result = await MemoryFact.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount ?? 0;
  }

  async getMemoryStats(userId: string): Promise<{
    episodes: number;
    facts: number;
    profileExists: boolean;
  }> {
    const [episodes, facts, profile] = await Promise.all([
      MemoryEpisode.countDocuments({ userId }),
      MemoryFact.countDocuments({ userId }),
      UserProfile.findOne({ userId }).lean(),
    ]);

    return {
      episodes,
      facts,
      profileExists: !!profile,
    };
  }
}

export const memoryManager = new MemoryManager();
