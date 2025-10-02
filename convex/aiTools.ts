import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const normalizeName = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "")
    .trim();

const normalizeUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Remove trailing slash, normalize to lowercase
    let normalized = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
    // Remove trailing slash from path
    normalized = normalized.replace(/\/$/, '');
    return normalized.toLowerCase();
  } catch {
    // If URL is invalid, return trimmed lowercase version
    return url.trim().toLowerCase().replace(/\/$/, '');
  }
};

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
    const searchQuery = ctx.db
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
    url: v.optional(v.string()),
    name: v.optional(v.string()),
    excludeToolId: v.optional(v.id("aiTools")), // For editing existing tools
  },
  handler: async (ctx, args) => {
    const response: {
      isDuplicate: boolean;
      reason?: string;
      existingTool?: string;
      urlDuplicate: boolean;
      urlDuplicateReason?: string;
      existingUrlTool?: string;
      nameDuplicate: boolean;
      nameDuplicateReason?: string;
      existingNameTool?: string;
    } = {
      isDuplicate: false,
      urlDuplicate: false,
      nameDuplicate: false,
    };

    const trimmedUrl = args.url?.trim();
    const trimmedName = args.name?.trim();
    const normalizedName = trimmedName ? normalizeName(trimmedName) : undefined;
    const normalizedUrl = trimmedUrl ? normalizeUrl(trimmedUrl) : undefined;

    // Check URL duplicate - This works well with direct index lookup
    if (trimmedUrl && normalizedUrl) {
      // First check exact match
      let existingByUrl = await ctx.db
        .query("aiTools")
        .withIndex("by_url", (q) => q.eq("url", trimmedUrl))
        .first();

      // If no exact match, check normalized URL against all tools
      if (!existingByUrl) {
        const allTools = await ctx.db
          .query("aiTools")
          .withIndex("by_isApproved", (q) => q.eq("isApproved", true))
          .collect();
        
        existingByUrl = allTools.find((tool) => {
          const toolNormalizedUrl = normalizeUrl(tool.url);
          return toolNormalizedUrl === normalizedUrl;
        }) ?? null;
      }

      if (existingByUrl && existingByUrl._id !== args.excludeToolId) {
        response.isDuplicate = true;
        response.urlDuplicate = true;
        response.urlDuplicateReason = "URL already exists";
        response.existingUrlTool = existingByUrl.name;

        if (!response.reason) {
          response.reason = response.urlDuplicateReason;
          response.existingTool = existingByUrl.name;
        }
      }
    }

    // Check name duplicate - Improved with better search strategy
    if (trimmedName && normalizedName && trimmedName.length >= 2) {
      // Strategy 1: Check exact normalized name match (fastest, most reliable)
      let existingByName = await ctx.db
        .query("aiTools")
        .withIndex("by_normalizedName", (q) => q.eq("normalizedName", normalizedName))
        .first();

      // Only if no exact normalized match, check exact case-insensitive match
      if (!existingByName) {
        const allTools = await ctx.db
          .query("aiTools")
          .withIndex("by_isApproved", (q) => q.eq("isApproved", true))
          .collect();
        
        // Check for exact case-insensitive match
        existingByName = allTools.find((tool) => 
          tool.name.toLowerCase() === trimmedName.toLowerCase()
        ) ?? null;
        
        // If still no match and name is long enough, check for normalized matches
        if (!existingByName && trimmedName.length >= 3) {
          existingByName = allTools.find((tool) => {
            const toolNormalized = tool.normalizedName ?? normalizeName(tool.name);
            return toolNormalized === normalizedName;
          }) ?? null;
        }
      }

      if (existingByName && existingByName._id !== args.excludeToolId) {
        response.isDuplicate = true;
        response.nameDuplicate = true;
        const isExactCaseInsensitiveMatch =
          existingByName.name.toLowerCase() === trimmedName.toLowerCase();
        response.nameDuplicateReason = isExactCaseInsensitiveMatch
          ? "Tool name already exists"
          : "A similar tool name already exists";
        response.existingNameTool = existingByName.name;

        if (!response.reason) {
          response.reason = response.nameDuplicateReason;
          response.existingTool = existingByName.name;
        }
      }
    }

    return response;
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
    const trimmedName = args.name.trim();
    const normalizedName = normalizeName(trimmedName);
    
    // Validate required fields
    if (!trimmedName) {
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
      const url = new URL(args.url);
      if (!url.protocol.match(/^https?:$/)) {
        throw new Error("URL must use http:// or https:// protocol");
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("protocol")) {
        throw error;
      }
      throw new Error("Please provide a valid URL starting with http:// or https://");
    }
    
    // Check for duplicates with detailed error messages
    const duplicateCheck = await ctx.db
      .query("aiTools")
      .withIndex("by_url", (q) => q.eq("url", args.url.trim()))
      .first();
    
    if (duplicateCheck) {
      throw new Error(`This URL is already registered in our database by the tool "${duplicateCheck.name}". Each tool must have a unique URL.`);
    }
    
    const normalizedNameCheck = await ctx.db
      .query("aiTools")
      .withIndex("by_normalizedName", (q) => q.eq("normalizedName", normalizedName))
      .first();

    if (normalizedNameCheck) {
      throw new Error(`A tool named "${normalizedNameCheck.name}" already exists`);
    }

    const nameCheck = await ctx.db
      .query("aiTools")
      .filter((q) => q.eq(q.field("name"), trimmedName))
      .first();
    
    if (nameCheck) {
      throw new Error(`A tool named "${nameCheck.name}" already exists`);
    }
    
    // Clean and validate tags
    const cleanTags = args.tags
      .filter(tag => tag.trim().length > 0)
      .map(tag => tag.trim().toLowerCase())
      .slice(0, 10); // Limit to 10 tags
    
    // Insert the new tool
    const toolId = await ctx.db.insert("aiTools", {
      name: trimmedName,
      description: args.description.trim(),
      url: args.url.trim(),
      category: args.category.trim(),
      tags: cleanTags,
      pricing: args.pricing,
      language: args.language,
      logoUrl: args.logoUrl?.trim() || undefined,
      submittedBy: userId || undefined,
      isApproved: true, // Auto-approve for now
      normalizedName,
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
    const trimmedName = args.name.trim();
    const normalizedName = normalizeName(trimmedName);

    if (!trimmedName) {
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
    
    if (trimmedName !== existingTool.name) {
      const normalizedDuplicate = await ctx.db
        .query("aiTools")
        .withIndex("by_normalizedName", (q) => q.eq("normalizedName", normalizedName))
        .first();

      if (normalizedDuplicate && normalizedDuplicate._id !== args.toolId) {
        throw new Error(`A tool named "${normalizedDuplicate.name}" already exists`);
      }

      const nameDuplicate = await ctx.db
        .query("aiTools")
        .filter((q) => q.eq(q.field("name"), trimmedName))
        .first();
      
      if (nameDuplicate && nameDuplicate._id !== args.toolId) {
        throw new Error(`A tool named "${nameDuplicate.name}" already exists`);
      }
    }
    
    // Clean tags
    const cleanTags = args.tags
      .filter(tag => tag.trim().length > 0)
      .map(tag => tag.trim().toLowerCase())
      .slice(0, 10);
    
    // Update the tool
    await ctx.db.patch(args.toolId, {
      name: trimmedName,
      description: args.description.trim(),
      url: args.url.trim(),
      category: args.category.trim(),
      tags: cleanTags,
      pricing: args.pricing,
      logoUrl: args.logoUrl?.trim() || undefined,
      normalizedName,
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
      .withIndex("by_submittedBy", (q) => q.eq("submittedBy", userId))
      .order("desc")
      .collect();
  },
});

export const getCategories = query({
  args: {
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
  },
  handler: async (ctx, args) => {
    const baseQuery = args.language
      ? ctx.db
          .query("aiTools")
          .withIndex("by_language_and_isApproved", (q) =>
            q.eq("language", args.language!).eq("isApproved", true)
          )
      : ctx.db
          .query("aiTools")
          .withIndex("by_isApproved", (q) => q.eq("isApproved", true));

    const tools = await baseQuery.collect();

    const categories = [...new Set(tools.map(tool => tool.category))];
    return categories.sort();
  },
});

export const getToolStats = query({
  args: {},
  handler: async (ctx) => {
    const approvedTools = await ctx.db
      .query("aiTools")
      .withIndex("by_isApproved", (q) => q.eq("isApproved", true))
      .collect();

    const stats = {
      total: approvedTools.length,
      byPricing: {
        free: approvedTools.filter(t => t.pricing === "free").length,
        freemium: approvedTools.filter(t => t.pricing === "freemium").length,
        paid: approvedTools.filter(t => t.pricing === "paid").length,
      },
      byLanguage: {
        en: approvedTools.filter(t => t.language === "en").length,
        vi: approvedTools.filter(t => t.language === "vi").length,
      },
      categories: [...new Set(approvedTools.map(t => t.category))].length,
    };

    return stats;
  },
});
