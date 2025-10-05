#!/usr/bin/env node

/**
 * Script to generate embeddings for all AI tools
 * Calls the generateAllEmbeddings action in Convex
 */

import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.VITE_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("❌ Error: VITE_CONVEX_URL not found in .env.local");
  console.error("Please make sure your .env.local file contains VITE_CONVEX_URL");
  process.exit(1);
}

console.log("🚀 Starting embedding generation...");
console.log(`📡 Connecting to Convex: ${CONVEX_URL}\n`);

const client = new ConvexHttpClient(CONVEX_URL);

try {
  // Call the generateAllEmbeddings action
  const result = await client.action("actions:generateAllEmbeddings", {});

  console.log("\n" + "=".repeat(60));
  console.log("📊 EMBEDDING GENERATION RESULTS");
  console.log("=".repeat(60));
  console.log(`✅ Success: ${result.success ? "Yes" : "No"}`);
  console.log(`📝 Total Processed: ${result.totalProcessed}`);
  console.log(`✓  Successful: ${result.successCount}`);
  console.log(`✗  Failed: ${result.failureCount}`);
  console.log(`⊘  Skipped: ${result.skippedCount}`);
  console.log(`⏱️  Duration: ${result.durationSeconds}s`);
  console.log(`🕐 Started: ${result.startTime}`);
  console.log(`🕑 Ended: ${result.endTime}`);
  console.log("=".repeat(60));

  if (result.failures && result.failures.length > 0) {
    console.log("\n❌ Failed Tools:");
    result.failures.forEach((failure, index) => {
      console.log(`  ${index + 1}. ${failure.toolName} (${failure.toolId})`);
      console.log(`     Error: ${failure.error}`);
    });
  }

  console.log(`\n${result.message}`);

  if (result.success) {
    console.log("\n🎉 All embeddings generated successfully!");
    process.exit(0);
  } else {
    console.log("\n⚠️  Some embeddings failed to generate. Check the errors above.");
    process.exit(1);
  }
} catch (error) {
  console.error("\n❌ Error running embedding generation:");
  console.error(error.message || error);
  process.exit(1);
}
