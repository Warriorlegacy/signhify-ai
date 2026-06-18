import cron from "node-cron";
import { createContextLogger } from "../lib/logger";
import { memoryManager } from "./memory-manager";
import { UserProfile } from "../models/UserProfile";
import { MemoryEpisode } from "../models/MemoryEpisode";
import { MemoryFact } from "../models/MemoryFact";

const log = createContextLogger("profile-regen");

/**
 * Regenerate user profiles based on recent episodes, facts, and interaction patterns.
 * Runs weekly on Sunday at 3:00 AM.
 */
export async function regenerateProfiles(): Promise<void> {
  log.info("Starting weekly profile regeneration");

  const activeUsers = await UserProfile.find({
    "interactionStats.lastActiveAt": {
      $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Active in last 30 days
    },
  });

  log.info({ count: activeUsers.length }, "Active users to process");

  for (const profile of activeUsers) {
    try {
      await regenerateUserProfile(profile.userId.toString());
    } catch (err: any) {
      log.error(
        { userId: profile.userId, err },
        "Failed to regenerate profile",
      );
    }
  }

  log.info("Weekly profile regeneration complete");
}

async function regenerateUserProfile(userId: string): Promise<void> {
  // Gather recent episodes (last 30 days)
  const recentEpisodes = await MemoryEpisode.find({
    userId,
    timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  }).sort({ timestamp: -1 });

  // Gather facts with highest confidence
  const topFacts = await MemoryFact.find({ userId })
    .sort({ confidence: -1 })
    .limit(50);

  // Extract topics from episodes
  const topicCounts = new Map<string, number>();
  for (const ep of recentEpisodes) {
    for (const topic of ep.topics ?? []) {
      topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
    }
  }

  // Top topics by frequency
  const topTopics = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic]) => topic);

  // Sentiment distribution
  const sentimentCounts = { positive: 0, negative: 0, neutral: 0, mixed: 0 };
  for (const ep of recentEpisodes) {
    if (ep.sentiment) {
      sentimentCounts[ep.sentiment as keyof typeof sentimentCounts]++;
    }
  }

  // Agent usage distribution
  const agentCounts = new Map<string, number>();
  for (const ep of recentEpisodes) {
    for (const topic of ep.topics ?? []) {
      if (
        ["scribe", "scout", "forge", "vault", "herald", "vision"].includes(
          topic,
        )
      ) {
        agentCounts.set(topic, (agentCounts.get(topic) ?? 0) + 1);
      }
    }
  }

  const topAgents = Array.from(agentCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([agent]) => agent);

  // Build enhanced profile data
  const profileData = {
    topicsOfInterest: topTopics,
    recentSentiment: sentimentCounts,
    preferredAgents: topAgents,
    factCount: topFacts.length,
    episodeCount: recentEpisodes.length,
    lastRegenerated: new Date(),
  };

  // Upsert profile with enriched data
  await UserProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        topicsOfInterest: topTopics,
        recentSentiment: sentimentCounts,
        preferredAgents: topAgents,
        lastRegenerated: new Date(),
      },
      $addToSet: {
        goals: { $each: [] }, // Preserved, not overwritten
      },
    },
    { upsert: true },
  );

  log.debug(
    { userId, topics: topTopics.length, facts: topFacts.length },
    "Profile regenerated",
  );
}

/**
 * Initialize the weekly profile regeneration cron job.
 */
export function initProfileRegeneration(): void {
  // Run every Sunday at 3:00 AM
  cron.schedule("0 3 * * 0", async () => {
    try {
      await regenerateProfiles();
    } catch (err: any) {
      log.error({ err }, "Profile regeneration cron job failed");
    }
  });

  log.info("Profile regeneration cron scheduled (Sundays 3:00 AM)");
}
