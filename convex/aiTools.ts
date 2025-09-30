import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listTools = query({
  args: {
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
    category: v.optional(v.string()),
    pricing: v.optional(v.union(v.literal("free"), v.literal("freemium"), v.literal("paid"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("aiTools").filter((q) => q.eq(q.field("isApproved"), true));
    
    if (args.language) {
      query = query.filter((q) => q.eq(q.field("language"), args.language));
    }
    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }
    if (args.pricing) {
      query = query.filter((q) => q.eq(q.field("pricing"), args.pricing));
    }
    
    return await query.order("desc").take(100);
  },
});

export const searchTools = query({
  args: {
    searchTerm: v.string(),
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
    category: v.optional(v.string()),
    pricing: v.optional(v.union(v.literal("free"), v.literal("freemium"), v.literal("paid"))),
  },
  handler: async (ctx, args) => {
    let searchQuery = ctx.db
      .query("aiTools")
      .withSearchIndex("search_tools", (q) => {
        let query = q.search("name", args.searchTerm).eq("isApproved", true);
        
        if (args.language) {
          query = query.eq("language", args.language);
        }
        if (args.category) {
          query = query.eq("category", args.category);
        }
        if (args.pricing) {
          query = query.eq("pricing", args.pricing);
        }
        
        return query;
      });
    
    return await searchQuery.take(50);
  },
});

export const checkDuplicate = query({
  args: {
    url: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check for URL duplicates
    const existingByUrl = await ctx.db
      .query("aiTools")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();
    
    if (existingByUrl) {
      return { isDuplicate: true, reason: "URL already exists", existingTool: existingByUrl.name };
    }
    
    // Check for name duplicates (case-insensitive)
    const existingByName = await ctx.db
      .query("aiTools")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
    
    if (existingByName) {
      return { isDuplicate: true, reason: "Tool name already exists", existingTool: existingByName.name };
    }
    
    return { isDuplicate: false };
  },
});

export const addTool = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    url: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    pricing: v.union(v.literal("free"), v.literal("freemium"), v.literal("paid")),
    language: v.union(v.literal("en"), v.literal("vi")),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    // Validate required fields
    if (!args.name.trim()) {
      throw new Error("Tool name is required");
    }
    if (!args.description.trim()) {
      throw new Error("Tool description is required");
    }
    if (!args.url.trim()) {
      throw new Error("Tool URL is required");
    }
    if (!args.category.trim()) {
      throw new Error("Tool category is required");
    }
    
    // Validate URL format
    try {
      new URL(args.url);
    } catch {
      throw new Error("Please provide a valid URL");
    }
    
    // Check for duplicates with detailed error messages
    const duplicateCheck = await ctx.db
      .query("aiTools")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .first();
    
    if (duplicateCheck) {
      throw new Error(`This URL is already used by "${duplicateCheck.name}"`);
    }
    
    const nameCheck = await ctx.db
      .query("aiTools")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();
    
    if (nameCheck) {
      throw new Error(`A tool named "${args.name}" already exists`);
    }
    
    // Clean and validate tags
    const cleanTags = args.tags
      .filter(tag => tag.trim().length > 0)
      .map(tag => tag.trim().toLowerCase())
      .slice(0, 10); // Limit to 10 tags
    
    // Insert the new tool
    const toolId = await ctx.db.insert("aiTools", {
      name: args.name.trim(),
      description: args.description.trim(),
      url: args.url.trim(),
      category: args.category.trim(),
      tags: cleanTags,
      pricing: args.pricing,
      language: args.language,
      logoUrl: args.logoUrl?.trim() || undefined,
      submittedBy: userId || undefined,
      isApproved: true, // Auto-approve for now
    });
    
    // Return success with the created tool ID
    return {
      success: true,
      toolId,
      message: "Tool successfully added to the database"
    };
  },
});

export const updateTool = mutation({
  args: {
    toolId: v.id("aiTools"),
    name: v.string(),
    description: v.string(),
    url: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    pricing: v.union(v.literal("free"), v.literal("freemium"), v.literal("paid")),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }
    
    // Get the existing tool
    const existingTool = await ctx.db.get(args.toolId);
    if (!existingTool) {
      throw new Error("Tool not found");
    }
    
    // Check if user has permission to update (tool owner or admin)
    if (existingTool.submittedBy !== userId) {
      throw new Error("You don't have permission to update this tool");
    }
    
    // Validate fields
    if (!args.name.trim()) {
      throw new Error("Tool name is required");
    }
    if (!args.description.trim()) {
      throw new Error("Tool description is required");
    }
    if (!args.url.trim()) {
      throw new Error("Tool URL is required");
    }
    
    // Check for duplicates (excluding current tool)
    if (args.url !== existingTool.url) {
      const urlDuplicate = await ctx.db
        .query("aiTools")
        .withIndex("by_url", (q) => q.eq("url", args.url))
        .first();
      
      if (urlDuplicate && urlDuplicate._id !== args.toolId) {
        throw new Error(`This URL is already used by "${urlDuplicate.name}"`);
      }
    }
    
    if (args.name !== existingTool.name) {
      const nameDuplicate = await ctx.db
        .query("aiTools")
        .filter((q) => q.eq(q.field("name"), args.name))
        .first();
      
      if (nameDuplicate && nameDuplicate._id !== args.toolId) {
        throw new Error(`A tool named "${args.name}" already exists`);
      }
    }
    
    // Clean tags
    const cleanTags = args.tags
      .filter(tag => tag.trim().length > 0)
      .map(tag => tag.trim().toLowerCase())
      .slice(0, 10);
    
    // Update the tool
    await ctx.db.patch(args.toolId, {
      name: args.name.trim(),
      description: args.description.trim(),
      url: args.url.trim(),
      category: args.category.trim(),
      tags: cleanTags,
      pricing: args.pricing,
      logoUrl: args.logoUrl?.trim() || undefined,
    });
    
    return {
      success: true,
      message: "Tool successfully updated"
    };
  },
});

export const deleteTool = mutation({
  args: {
    toolId: v.id("aiTools"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }
    
    // Get the existing tool
    const existingTool = await ctx.db.get(args.toolId);
    if (!existingTool) {
      throw new Error("Tool not found");
    }
    
    // Check if user has permission to delete
    if (existingTool.submittedBy !== userId) {
      throw new Error("You don't have permission to delete this tool");
    }
    
    // Delete the tool
    await ctx.db.delete(args.toolId);
    
    return {
      success: true,
      message: "Tool successfully deleted"
    };
  },
});

export const getToolById = query({
  args: {
    toolId: v.id("aiTools"),
  },
  handler: async (ctx, args) => {
    const tool = await ctx.db.get(args.toolId);
    if (!tool || !tool.isApproved) {
      return null;
    }
    return tool;
  },
});

export const getUserTools = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    
    return await ctx.db
      .query("aiTools")
      .filter((q) => q.eq(q.field("submittedBy"), userId))
      .order("desc")
      .collect();
  },
});

export const getCategories = query({
  args: {
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
  },
  handler: async (ctx, args) => {
    const tools = await ctx.db
      .query("aiTools")
      .filter((q) => {
        let filter = q.eq(q.field("isApproved"), true);
        if (args.language) {
          filter = q.and(filter, q.eq(q.field("language"), args.language));
        }
        return filter;
      })
      .collect();
    
    const categories = [...new Set(tools.map(tool => tool.category))];
    return categories.sort();
  },
});

export const getToolStats = query({
  args: {},
  handler: async (ctx) => {
    const allTools = await ctx.db
      .query("aiTools")
      .filter((q) => q.eq(q.field("isApproved"), true))
      .collect();
    
    const stats = {
      total: allTools.length,
      byPricing: {
        free: allTools.filter(t => t.pricing === "free").length,
        freemium: allTools.filter(t => t.pricing === "freemium").length,
        paid: allTools.filter(t => t.pricing === "paid").length,
      },
      byLanguage: {
        en: allTools.filter(t => t.language === "en").length,
        vi: allTools.filter(t => t.language === "vi").length,
      },
      categories: [...new Set(allTools.map(t => t.category))].length,
    };
    
    return stats;
  },
});
