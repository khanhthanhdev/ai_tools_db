import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { GEMINI_EMBEDDING_DIMENSIONS } from "./lib/constants";

const applicationTables = {
  aiTools: defineTable({
    name: v.string(),
    description: v.string(),
    detail: v.optional(v.string()),
    url: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    pricing: v.union(v.literal("free"), v.literal("freemium"), v.literal("paid")),
    language: v.union(v.literal("en"), v.literal("vi")),
    submittedBy: v.optional(v.id("users")),
    isApproved: v.boolean(),
    logoUrl: v.optional(v.string()),
    normalizedName: v.optional(v.string()),
    averageRating: v.optional(v.number()),
    totalReviews: v.optional(v.number()),
    totalFavourites: v.optional(v.number()),
    ratingSum: v.optional(v.number()),
    embedding: v.optional(v.array(v.number())),
    embeddingVersion: v.optional(v.string()), // Track which model generated the embedding
  })
    .index("by_category", ["category"])
    .index("by_pricing", ["pricing"])
    .index("by_language", ["language"])
    .index("by_url", ["url"])
    .index("by_isApproved", ["isApproved"])
    .index("by_submittedBy", ["submittedBy"])
    .index("by_normalizedName", ["normalizedName"])
    .index("by_language_and_isApproved", ["language", "isApproved"])
    .index("by_pricing_and_isApproved", ["pricing", "isApproved"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: GEMINI_EMBEDDING_DIMENSIONS, // Google Gemini gemini-embedding-001 configured output size
      filterFields: ["isApproved", "language", "category", "pricing"],
    })
    .searchIndex("search_tools", {
      searchField: "name",
      filterFields: ["category", "pricing", "language", "isApproved"],
    }),
  favourites: defineTable({
    userId: v.id("users"),
    toolId: v.id("aiTools"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_tool", ["toolId"])
    .index("by_user_and_tool", ["userId", "toolId"]),
  reviews: defineTable({
    userId: v.id("users"),
    toolId: v.id("aiTools"),
    rating: v.number(),
    reviewText: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    helpfulCount: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_tool", ["toolId"])
    .index("by_user_and_tool", ["userId", "toolId"])
    .index("by_tool_and_created", ["toolId", "createdAt"])
    .index("by_tool_and_rating", ["toolId", "rating"])
    .index("by_tool_and_helpful", ["toolId", "helpfulCount"]),
  reviewVotes: defineTable({
    userId: v.id("users"),
    reviewId: v.id("reviews"),
    createdAt: v.number(),
  })
    .index("by_user_and_review", ["userId", "reviewId"])
    .index("by_review", ["reviewId"]),
  searchCache: defineTable({
    query: v.string(),
    queryHash: v.string(),
    results: v.array(v.id("aiTools")),
    embedding: v.array(v.number()),
    createdAt: v.number(),
    expiresAt: v.number(),
    hitCount: v.number(),
  })
    .index("by_query_hash", ["queryHash"])
    .index("by_expires", ["expiresAt"]),
  searchAnalytics: defineTable({
    query: v.string(),
    userId: v.optional(v.string()),
    resultsCount: v.number(),
    clickedToolId: v.optional(v.id("aiTools")),
    clickedPosition: v.optional(v.number()),
    timestamp: v.number(),
    searchType: v.string(), // "semantic", "keyword", "hybrid", "click"
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_query", ["query"])
    .index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
