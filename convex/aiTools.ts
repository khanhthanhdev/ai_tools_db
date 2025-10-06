import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import {
  GEMINI_EMBEDDING_DIMENSIONS,
  GEMINI_EMBEDDING_MODEL,
} from "./lib/constants";

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

/**
 * Calculate cosine similarity between two vectors
 * Returns a value between -1 and 1, where 1 means identical direction
 * 
 * @param vectorA - First embedding vector
 * @param vectorB - Second embedding vector
 * @returns Cosine similarity score between -1 and 1
 */
const cosineSimilarity = (vectorA: number[], vectorB: number[]): number => {
  // Handle edge case: different lengths
  if (vectorA.length !== vectorB.length) {
    console.warn(
      `Vector length mismatch: ${vectorA.length} vs ${vectorB.length}. Returning 0.`
    );
    return 0;
  }

  // Handle edge case: empty vectors
  if (vectorA.length === 0) {
    console.warn("Empty vectors provided. Returning 0.");
    return 0;
  }

  // Calculate dot product and magnitudes
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  // Handle edge case: zero vectors (magnitude is 0)
  if (magnitudeA === 0 || magnitudeB === 0) {
    console.warn("Zero vector detected. Returning 0.");
    return 0;
  }

  // Calculate cosine similarity
  const similarity = dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));

  // Clamp to [-1, 1] to handle floating point precision issues
  return Math.max(-1, Math.min(1, similarity));
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

/**
 * Paginated version of listTools for better performance
 * Uses cursor-based pagination to efficiently load large datasets
 */
export const listToolsPaginated = query({
  args: {
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
    category: v.optional(v.string()),
    pricing: v.optional(v.union(v.literal("free"), v.literal("freemium"), v.literal("paid"))),
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
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

    // Use cursor-based pagination for better performance
    const result = await query.order("desc").paginate(args.paginationOpts);
    
    return {
      page: result.page,
      nextCursor: result.continueCursor,
      isDone: result.isDone,
    };
  },
});

/**
 * Paginated version of searchTools for better performance
 * Uses cursor-based pagination to efficiently load search results
 */
export const searchToolsPaginated = query({
  args: {
    searchTerm: v.string(),
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
    category: v.optional(v.string()),
    pricing: v.optional(v.union(v.literal("free"), v.literal("freemium"), v.literal("paid"))),
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.union(v.string(), v.null()),
    }),
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

    // Use cursor-based pagination for search results
    const result = await searchQuery.paginate(args.paginationOpts);
    
    return {
      page: result.page,
      nextCursor: result.continueCursor,
      isDone: result.isDone,
    };
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
    detail: v.optional(v.string()),
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
      detail: args.detail?.trim() || undefined,
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

    // Schedule embedding generation asynchronously
    // This runs in the background without blocking the tool creation
    await ctx.scheduler.runAfter(0, api.actions.generateToolEmbedding, {
      toolId,
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
    detail: v.optional(v.string()),
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

    // Detect if relevant fields changed (fields that affect embeddings)
    const nameChanged = trimmedName !== existingTool.name;
    const descriptionChanged = args.description.trim() !== existingTool.description;
    const categoryChanged = args.category.trim() !== existingTool.category;
    
    // Compare tags arrays (order-independent comparison)
    const existingTagsSet = new Set(existingTool.tags);
    const newTagsSet = new Set(cleanTags);
    const tagsChanged = 
      existingTagsSet.size !== newTagsSet.size ||
      ![...existingTagsSet].every(tag => newTagsSet.has(tag));

    const shouldRegenerateEmbedding = 
      nameChanged || descriptionChanged || categoryChanged || tagsChanged;

    // Update the tool
    await ctx.db.patch(args.toolId, {
      name: trimmedName,
      description: args.description.trim(),
      detail: args.detail?.trim() || undefined,
      url: args.url.trim(),
      category: args.category.trim(),
      tags: cleanTags,
      pricing: args.pricing,
      logoUrl: args.logoUrl?.trim() || undefined,
      normalizedName,
    });

    // Schedule embedding regeneration if relevant fields changed
    if (shouldRegenerateEmbedding) {
      await ctx.scheduler.runAfter(0, api.actions.generateToolEmbedding, {
        toolId: args.toolId,
      });
    }

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

    // Count tools by category
    const categoryCount: Record<string, number> = {};
    approvedTools.forEach(tool => {
      categoryCount[tool.category] = (categoryCount[tool.category] || 0) + 1;
    });

    // Convert to array format to avoid non-ASCII field name issues
    const categoryArray = Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count,
    }));

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
      byCategory: categoryArray,
    };

    return stats;
  },
});

/**
 * Get tools that don't have embeddings yet
 * Used for migration and monitoring embedding coverage
 */
export const getToolsWithoutEmbeddings = query({
  args: {},
  handler: async (ctx) => {
    const allTools = await ctx.db
      .query("aiTools")
      .withIndex("by_isApproved", (q) => q.eq("isApproved", true))
      .collect();

    // Filter tools that don't have embeddings or have wrong version
    return allTools.filter(
      (tool) => !tool.embedding || tool.embeddingVersion !== GEMINI_EMBEDDING_MODEL
    );
  },
});

/**
 * Get embedding statistics for monitoring
 * Shows coverage percentage and counts
 */
export const getEmbeddingStats = query({
  args: {},
  handler: async (ctx) => {
    const allTools = await ctx.db
      .query("aiTools")
      .withIndex("by_isApproved", (q) => q.eq("isApproved", true))
      .collect();

    const withEmbeddings = allTools.filter(
      (tool) => tool.embedding && tool.embeddingVersion === GEMINI_EMBEDDING_MODEL
    );

    const total = allTools.length;
    const withEmbeddingsCount = withEmbeddings.length;
    const withoutEmbeddingsCount = total - withEmbeddingsCount;
    const coveragePercentage = total > 0 ? (withEmbeddingsCount / total) * 100 : 0;

    return {
      total,
      withEmbeddings: withEmbeddingsCount,
      withoutEmbeddings: withoutEmbeddingsCount,
      coveragePercentage: Math.round(coveragePercentage * 100) / 100,
    };
  },
});

/**
 * Vector search query using embeddings
 * Searches for tools similar to the provided embedding vector
 * 
 * @param vector - The query embedding vector (matches Gemini embedding dimensions)
 * @param limit - Maximum number of results to return
 * @param language - Optional language filter
 * @param category - Optional category filter
 * @param pricing - Optional pricing filter
 * @returns Array of tools with similarity scores, sorted by score descending
 */
export const vectorSearch = query({
  args: {
    vector: v.array(v.number()),
    limit: v.number(),
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
    category: v.optional(v.string()),
    pricing: v.optional(v.union(v.literal("free"), v.literal("freemium"), v.literal("paid"))),
  },
  handler: async (ctx, args) => {
    // Validate vector dimensions
    if (args.vector.length !== GEMINI_EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Invalid vector dimensions: expected ${GEMINI_EMBEDDING_DIMENSIONS}, got ${args.vector.length}`
      );
    }

    // Get all approved tools with embeddings
    // We'll manually calculate similarity since Convex vector search API may vary
    const allTools = await ctx.db
      .query("aiTools")
      .withIndex("by_isApproved", (q) => q.eq("isApproved", true))
      .collect();

    // Filter tools that have embeddings and match optional filters
    let filteredTools = allTools.filter((tool) => {
      // Must have valid embedding
      if (!tool.embedding || tool.embedding.length !== GEMINI_EMBEDDING_DIMENSIONS) {
        return false;
      }

      // Apply language filter
      if (args.language && tool.language !== args.language) {
        return false;
      }

      // Apply category filter
      if (args.category && tool.category !== args.category) {
        return false;
      }

      // Apply pricing filter
      if (args.pricing && tool.pricing !== args.pricing) {
        return false;
      }

      return true;
    });

    // Calculate similarity scores for each tool
    const resultsWithScores = filteredTools.map((tool) => {
      const score = cosineSimilarity(args.vector, tool.embedding!);
      return {
        ...tool,
        _score: score,
      };
    });

    // Sort by similarity score descending (highest similarity first)
    // and limit to requested number of results
    const sortedResults = resultsWithScores
      .sort((a, b) => b._score - a._score)
      .slice(0, args.limit);

    return sortedResults;
  },
});

/**
 * Get similar tools based on embedding similarity
 * Finds tools with similar embeddings to the source tool
 * 
 * @param toolId - The source tool ID to find similar tools for
 * @param limit - Maximum number of similar tools to return (default: 5)
 * @returns Array of similar tools with similarity scores, excluding the source tool
 */
export const getSimilarTools = query({
  args: {
    toolId: v.id("aiTools"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;

    // Get the source tool
    const sourceTool = await ctx.db.get(args.toolId);
    
    // If tool doesn't exist or doesn't have an embedding, return empty array
    if (
      !sourceTool ||
      !sourceTool.embedding ||
      sourceTool.embedding.length !== GEMINI_EMBEDDING_DIMENSIONS
    ) {
      return [];
    }

    // Get all approved tools with embeddings
    const allTools = await ctx.db
      .query("aiTools")
      .withIndex("by_isApproved", (q) => q.eq("isApproved", true))
      .collect();

    // Filter tools that have valid embeddings and exclude the source tool
    const toolsWithEmbeddings = allTools.filter((tool) => {
      // Exclude the source tool itself
      if (tool._id === args.toolId) {
        return false;
      }

      // Must have valid embedding
      if (!tool.embedding || tool.embedding.length !== GEMINI_EMBEDDING_DIMENSIONS) {
        return false;
      }

      return true;
    });

    // Calculate similarity scores for each tool
    const resultsWithScores = toolsWithEmbeddings.map((tool) => {
      const score = cosineSimilarity(sourceTool.embedding!, tool.embedding!);
      return {
        ...tool,
        _score: score,
      };
    });

    // Sort by similarity score descending (highest similarity first)
    // and limit to requested number of results
    const sortedResults = resultsWithScores
      .sort((a, b) => b._score - a._score)
      .slice(0, limit);

    return sortedResults;
  },
});

/**
 * Internal mutation to update tool embedding
 * Called by generateToolEmbedding action after generating embedding via Gemini API
 * 
 * @internal - Only callable from other Convex functions
 */
export const updateToolEmbedding = internalMutation({
  args: {
    toolId: v.id("aiTools"),
    embedding: v.array(v.number()),
    embeddingVersion: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate embedding dimensions
    if (args.embedding.length !== GEMINI_EMBEDDING_DIMENSIONS) {
      throw new Error(
        `Invalid embedding dimensions: expected ${GEMINI_EMBEDDING_DIMENSIONS}, got ${args.embedding.length}`
      );
    }

    // Update the tool with embedding data
    await ctx.db.patch(args.toolId, {
      embedding: args.embedding,
      embeddingVersion: args.embeddingVersion,
    });

    console.log(`Updated embedding for tool ${args.toolId} with version ${args.embeddingVersion}`);
  },
});
