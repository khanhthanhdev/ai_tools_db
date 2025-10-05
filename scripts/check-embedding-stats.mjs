#!/usr/bin/env node

/**
 * Script to check embedding statistics
 */

import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: VITE_CONVEX_URL not found in .env.local");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

try {
  const stats = await client.query("aiTools:getEmbeddingStats", {});

  console.log("\n📊 EMBEDDING STATISTICS");
  console.log("=".repeat(40));
  console.log(`Total Tools: ${stats.total}`);
  console.log(`With Embeddings: ${stats.withEmbeddings}`);
  console.log(`Without Embeddings: ${stats.withoutEmbeddings}`);
  console.log(`Coverage: ${stats.coveragePercentage}%`);
  console.log("=".repeat(40) + "\n");

  if (stats.withoutEmbeddings > 0) {
    const estimatedTime = stats.withoutEmbeddings * 4; // 4 seconds per tool
    console.log(`⏱️  Estimated time to generate all: ~${Math.ceil(estimatedTime / 60)} minutes`);
  } else {
    console.log("✅ All tools have embeddings!");
  }
} catch (error) {
  console.error("❌ Error:", error.message || error);
  process.exit(1);
}
