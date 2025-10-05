// Convex functions for SEO-related operations
import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all approved tools for sitemap generation
export const getAllApprovedTools = query({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db
      .query("aiTools")
      .withIndex("by_isApproved", (q) => q.eq("isApproved", true))
      .collect();

    return tools.map((tool) => ({
      _id: tool._id,
      _creationTime: tool._creationTime,
      name: tool.name,
      url: tool.url,
      category: tool.category,
    }));
  },
});

// Get tool by ID for dynamic meta tags
export const getToolForSEO = query({
  args: { toolId: v.id("aiTools") },
  handler: async (ctx, args) => {
    const tool = await ctx.db.get(args.toolId);
    if (!tool || !tool.isApproved) {
      return null;
    }

    return {
      _id: tool._id,
      name: tool.name,
      description: tool.description,
      url: tool.url,
      category: tool.category,
      pricing: tool.pricing,
      averageRating: tool.averageRating,
      totalReviews: tool.totalReviews,
      logoUrl: tool.logoUrl,
      language: tool.language,
    };
  },
});

// Get statistics for SEO (total tools, categories, etc.)
export const getSEOStats = query({
  args: {},
  handler: async (ctx) => {
    const allTools = await ctx.db
      .query("aiTools")
      .withIndex("by_isApproved", (q) => q.eq("isApproved", true))
      .collect();

    const categories = new Set(allTools.map((tool) => tool.category));
    const totalReviews = allTools.reduce((sum, tool) => sum + (tool.totalReviews || 0), 0);

    return {
      totalTools: allTools.length,
      totalCategories: categories.size,
      totalReviews,
      lastUpdated: Date.now(),
    };
  },
});
