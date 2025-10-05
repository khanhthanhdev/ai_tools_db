/**
 * Search cache queries and mutations
 * Implements caching layer for semantic search to reduce API calls and improve performance
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get cached search results by query hash
 * Returns cached results if they exist and haven't expired
 * 
 * @param queryHash - Hash of the search query
 * @returns Cached search entry or null if not found/expired
 */
export const getCachedSearch = query({
  args: { 
    queryHash: v.string() 
  },
  handler: async (ctx, args) => {
    const { queryHash } = args;
    
    // Find cache entry by query hash
    const cacheEntry = await ctx.db
      .query("searchCache")
      .withIndex("by_query_hash", (q) => q.eq("queryHash", queryHash))
      .first();
    
    // Return null if not found
    if (!cacheEntry) {
      return null;
    }
    
    // Check if cache entry has expired
    const now = Date.now();
    if (cacheEntry.expiresAt <= now) {
      // Cache expired, return null
      return null;
    }
    
    // Return valid cache entry
    return cacheEntry;
  },
});

/**
 * Store search results in cache
 * Creates a new cache entry with query, results, and embedding
 * 
 * @param query - Original search query text
 * @param queryHash - Hash of the query for fast lookup
 * @param results - Array of tool IDs in the result set
 * @param embedding - Query embedding vector (768 dimensions)
 * @param expiresAt - Timestamp when cache entry expires
 */
export const storeSearchCache = mutation({
  args: {
    query: v.string(),
    queryHash: v.string(),
    results: v.array(v.id("aiTools")),
    embedding: v.array(v.number()),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { query, queryHash, results, embedding, expiresAt } = args;
    
    // Check if cache entry already exists
    const existing = await ctx.db
      .query("searchCache")
      .withIndex("by_query_hash", (q) => q.eq("queryHash", queryHash))
      .first();
    
    if (existing) {
      // Update existing cache entry
      await ctx.db.patch(existing._id, {
        query,
        results,
        embedding,
        expiresAt,
        hitCount: 0, // Reset hit count on update
        createdAt: Date.now(),
      });
      return existing._id;
    }
    
    // Create new cache entry
    const cacheId = await ctx.db.insert("searchCache", {
      query,
      queryHash,
      results,
      embedding,
      createdAt: Date.now(),
      expiresAt,
      hitCount: 0,
    });
    
    return cacheId;
  },
});

/**
 * Increment cache hit count
 * Tracks how many times a cached result has been used
 * 
 * @param cacheId - ID of the cache entry to increment
 */
export const incrementCacheHit = mutation({
  args: { 
    cacheId: v.id("searchCache") 
  },
  handler: async (ctx, args) => {
    const { cacheId } = args;
    
    // Get current cache entry
    const cacheEntry = await ctx.db.get(cacheId);
    
    if (!cacheEntry) {
      throw new Error("Cache entry not found");
    }
    
    // Increment hit count
    await ctx.db.patch(cacheId, {
      hitCount: cacheEntry.hitCount + 1,
    });
  },
});

/**
 * Clean up expired cache entries
 * Removes all cache entries that have passed their expiration time
 * Should be run periodically to prevent cache table from growing indefinitely
 * 
 * @returns Number of cache entries deleted
 */
export const cleanupExpiredCache = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    // Find all expired cache entries
    const expiredEntries = await ctx.db
      .query("searchCache")
      .withIndex("by_expires")
      .filter((q) => q.lte(q.field("expiresAt"), now))
      .collect();
    
    // Delete each expired entry
    let deletedCount = 0;
    for (const entry of expiredEntries) {
      await ctx.db.delete(entry._id);
      deletedCount++;
    }
    
    return {
      deletedCount,
      message: `Cleaned up ${deletedCount} expired cache entries`,
    };
  },
});
