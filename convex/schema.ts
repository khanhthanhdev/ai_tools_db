import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  aiTools: defineTable({
    name: v.string(),
    description: v.string(),
    url: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    pricing: v.union(v.literal("free"), v.literal("freemium"), v.literal("paid")),
    language: v.union(v.literal("en"), v.literal("vi")),
    submittedBy: v.optional(v.id("users")),
    isApproved: v.boolean(),
    logoUrl: v.optional(v.string()),
  })
    .index("by_category", ["category"])
    .index("by_pricing", ["pricing"])
    .index("by_language", ["language"])
    .index("by_url", ["url"])
    .searchIndex("search_tools", {
      searchField: "name",
      filterFields: ["category", "pricing", "language", "isApproved"],
    }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
