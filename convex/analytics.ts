import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Log a search query with its results count and search type
 * Used to track search usage and identify popular queries
 */
export const logSearch = mutation({
  args: {
    query: v.string(),
    resultsCount: v.number(),
    searchType: v.string(), // "semantic", "keyword", "hybrid"
  },
  handler: async (ctx, args) => {
    // Get user ID if authenticated (optional)
    const userId = await getAuthUserId(ctx);

    await ctx.db.insert("searchAnalytics", {
      query: args.query,
      userId: userId ?? undefined,
      resultsCount: args.resultsCount,
      timestamp: Date.now(),
      searchType: args.searchType,
    });
  },
});

/**
 * Log when a user clicks on a search result
 * Used to track click-through rate and result relevance
 */
export const logSearchClick = mutation({
  args: {
    query: v.string(),
    toolId: v.id("aiTools"),
    position: v.number(), // Position in search results (0-indexed)
  },
  handler: async (ctx, args) => {
    // Get user ID if authenticated (optional)
    const userId = await getAuthUserId(ctx);

    await ctx.db.insert("searchAnalytics", {
      query: args.query,
      userId: userId ?? undefined,
      resultsCount: 0, // Not applicable for click events
      clickedToolId: args.toolId,
      clickedPosition: args.position,
      timestamp: Date.now(),
      searchType: "click", // Special type for click events
    });
  },
});

/**
 * Get popular search queries ranked by frequency
 * Returns queries with their search count, excluding click events
 */
export const getPopularSearches = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    // Get all search events (exclude click events)
    const searches = await ctx.db
      .query("searchAnalytics")
      .filter((q) => q.neq(q.field("searchType"), "click"))
      .collect();

    // Count occurrences of each query
    const queryCounts = new Map<string, number>();
    for (const search of searches) {
      const count = queryCounts.get(search.query) || 0;
      queryCounts.set(search.query, count + 1);
    }

    // Convert to array and sort by count descending
    const popularQueries = Array.from(queryCounts.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return popularQueries;
  },
});

/**
 * Get queries that returned zero results
 * Useful for identifying gaps in the tool database or search quality issues
 */
export const getZeroResultQueries = query({
  args: {},
  handler: async (ctx, args) => {
    // Get all search events with zero results
    const zeroResultSearches = await ctx.db
      .query("searchAnalytics")
      .filter((q) => 
        q.and(
          q.eq(q.field("resultsCount"), 0),
          q.neq(q.field("searchType"), "click")
        )
      )
      .collect();

    // Count occurrences of each zero-result query
    const queryCounts = new Map<string, number>();
    for (const search of zeroResultSearches) {
      const count = queryCounts.get(search.query) || 0;
      queryCounts.set(search.query, count + 1);
    }

    // Convert to array and sort by count descending
    const zeroResultQueries = Array.from(queryCounts.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count);

    return zeroResultQueries;
  },
});
