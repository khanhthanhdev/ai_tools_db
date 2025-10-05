/**
 * Convex Actions for Semantic Search
 * Actions can call external APIs and perform side effects
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { getGeminiClient, generateEmbedding } from "./lib/gemini";
import { createEmbeddingText } from "./lib/embeddingHelpers";
import { hashQuery, getCacheExpiry } from "./lib/cache";

/**
 * Verify Gemini API configuration
 * Tests that the API key is set and accessible
 */
export const verifyGeminiConfig = action({
  args: {},
  handler: async () => {
    try {
      // Test with a simple embedding generation (will throw if API key is missing)
      const testEmbedding = await generateEmbedding("test");
      
      return {
        success: true,
        message: "Gemini API is configured correctly",
        embeddingDimensions: testEmbedding.length,
        expectedDimensions: 768,
        isCorrectDimension: testEmbedding.length === 768,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to verify Gemini configuration",
        error: error.toString(),
      };
    }
  },
});

/**
 * Generate embedding for a single tool
 * Retrieves tool data, constructs embedding text, generates embedding via Gemini API,
 * and stores it in the database
 * 
 * @param toolId - ID of the tool to generate embedding for
 * @returns Success status and embedding info
 * @throws Error if tool not found or embedding generation fails
 */
export const generateToolEmbedding = action({
  args: {
    toolId: v.id("aiTools"),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    toolId: any;
    toolName?: string;
    embeddingDimensions?: number;
    embeddingVersion?: string;
    message: string;
    error?: string;
  }> => {
    try {
      // Retrieve tool data
      const tool: any = await ctx.runQuery(api.aiTools.getToolById, {
        toolId: args.toolId,
      });

      if (!tool) {
        throw new Error(`Tool with ID ${args.toolId} not found or not approved`);
      }

      // Construct embedding text from tool fields
      const embeddingText = createEmbeddingText({
        name: tool.name,
        description: tool.description,
        detail: tool.detail,
        category: tool.category,
        tags: tool.tags,
        pricing: tool.pricing,
      });

      console.log(`Generating embedding for tool: ${tool.name}`);
      console.log(`Embedding text length: ${embeddingText.length} characters`);

      // Generate embedding via Gemini API
      const embedding = await generateEmbedding(embeddingText);

      // Validate embedding
      if (!embedding || embedding.length !== 768) {
        throw new Error(
          `Invalid embedding generated: expected 768 dimensions, got ${embedding?.length || 0}`
        );
      }

      // Store embedding in database via mutation
      await ctx.runMutation(internal.aiTools.updateToolEmbedding, {
        toolId: args.toolId,
        embedding,
        embeddingVersion: "gemini-embedding-001",
      });

      console.log(`Successfully generated embedding for tool: ${tool.name}`);

      return {
        success: true,
        toolId: args.toolId,
        toolName: tool.name,
        embeddingDimensions: embedding.length,
        embeddingVersion: "gemini-embedding-001",
        message: `Embedding generated successfully for "${tool.name}"`,
      };
    } catch (error: any) {
      console.error(`Failed to generate embedding for tool ${args.toolId}:`, error);
      
      return {
        success: false,
        toolId: args.toolId,
        error: error.message || "Unknown error occurred",
        message: `Failed to generate embedding: ${error.message || "Unknown error"}`,
      };
    }
  },
});

/**
 * Generate embeddings for all tools in batch
 * Processes all tools without embeddings, respecting rate limits
 * Continues processing even if individual tools fail
 * 
 * @returns Statistics on success/failure counts and processing details
 */
export const generateAllEmbeddings = action({
  args: {},
  handler: async (ctx): Promise<{
    success: boolean;
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    skippedCount: number;
    failures: Array<{ toolId: string; toolName: string; error: string }>;
    message: string;
    startTime: string;
    endTime: string;
    durationSeconds: number;
  }> => {
    const startTime = new Date();
    console.log(`Starting batch embedding generation at ${startTime.toISOString()}`);

    // Get all tools without embeddings
    const toolsWithoutEmbeddings: any[] = await ctx.runQuery(
      api.aiTools.getToolsWithoutEmbeddings
    );

    console.log(`Found ${toolsWithoutEmbeddings.length} tools without embeddings`);

    if (toolsWithoutEmbeddings.length === 0) {
      return {
        success: true,
        totalProcessed: 0,
        successCount: 0,
        failureCount: 0,
        skippedCount: 0,
        failures: [],
        message: "All tools already have embeddings",
        startTime: startTime.toISOString(),
        endTime: new Date().toISOString(),
        durationSeconds: 0,
      };
    }

    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;
    const failures: Array<{ toolId: string; toolName: string; error: string }> = [];

    // Process each tool sequentially with rate limiting
    for (let i = 0; i < toolsWithoutEmbeddings.length; i++) {
      const tool = toolsWithoutEmbeddings[i];

      try {
        console.log(
          `Processing tool ${i + 1}/${toolsWithoutEmbeddings.length}: ${tool.name}`
        );

        // Construct embedding text from tool fields
        const embeddingText = createEmbeddingText({
          name: tool.name,
          description: tool.description,
          detail: tool.detail,
          category: tool.category,
          tags: tool.tags,
          pricing: tool.pricing,
        });

        // Generate embedding via Gemini API
        const embedding = await generateEmbedding(embeddingText);

        // Validate embedding
        if (!embedding || embedding.length !== 768) {
          throw new Error(
            `Invalid embedding: expected 768 dimensions, got ${embedding?.length || 0}`
          );
        }

        // Store embedding in database
        await ctx.runMutation(internal.aiTools.updateToolEmbedding, {
          toolId: tool._id,
          embedding,
          embeddingVersion: "gemini-embedding-001",
        });

        successCount++;
        console.log(`✓ Successfully generated embedding for: ${tool.name}`);

        // Rate limiting: Wait 4 seconds between requests (15 requests/minute for free tier)
        // Skip delay for the last tool
        if (i < toolsWithoutEmbeddings.length - 1) {
          console.log("Waiting 4 seconds before next request (rate limiting)...");
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error: any) {
        failureCount++;
        const errorMessage = error.message || "Unknown error occurred";
        
        console.error(`✗ Failed to generate embedding for ${tool.name}:`, errorMessage);
        
        failures.push({
          toolId: tool._id,
          toolName: tool.name,
          error: errorMessage,
        });

        // Continue processing remaining tools even if one fails
        // Add a small delay after errors to avoid cascading failures
        if (i < toolsWithoutEmbeddings.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    }

    const endTime = new Date();
    const durationSeconds = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

    const message = `Batch embedding generation completed. Processed ${toolsWithoutEmbeddings.length} tools: ${successCount} succeeded, ${failureCount} failed, ${skippedCount} skipped. Duration: ${durationSeconds}s`;

    console.log(message);
    console.log(`Finished at ${endTime.toISOString()}`);

    return {
      success: failureCount === 0,
      totalProcessed: toolsWithoutEmbeddings.length,
      successCount,
      failureCount,
      skippedCount,
      failures,
      message,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationSeconds,
    };
  },
});

/**
 * Semantic search using natural language queries
 * Generates query embedding via Gemini API and performs vector search
 * Falls back to keyword search if embedding generation fails
 * Implements caching to reduce API calls and improve performance
 * 
 * @param query - Natural language search query
 * @param limit - Maximum number of results (default: 20)
 * @param language - Optional language filter (en/vi)
 * @param category - Optional category filter
 * @param pricing - Optional pricing filter (free/freemium/paid)
 * @returns Array of tools with similarity scores, sorted by relevance
 */
export const semanticSearch = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
    category: v.optional(v.string()),
    pricing: v.optional(v.union(v.literal("free"), v.literal("freemium"), v.literal("paid"))),
  },
  handler: async (ctx, args): Promise<any[]> => {
    const limit = args.limit || 20;
    const trimmedQuery = args.query.trim();

    // Validate query
    if (!trimmedQuery) {
      return [];
    }

    console.log(`Semantic search for query: "${trimmedQuery}"`);

    // Generate cache key from query and filters
    const cacheKey = JSON.stringify({
      query: trimmedQuery,
      language: args.language,
      category: args.category,
      pricing: args.pricing,
    });
    const queryHash = hashQuery(cacheKey);

    try {
      // Check cache first
      console.log(`Checking cache for query hash: ${queryHash}`);
      const cachedSearch = await ctx.runQuery(api.cache.getCachedSearch, {
        queryHash,
      });

      if (cachedSearch) {
        console.log(`Cache hit! Using cached results (hit count: ${cachedSearch.hitCount})`);
        
        // Increment cache hit count
        await ctx.runMutation(api.cache.incrementCacheHit, {
          cacheId: cachedSearch._id,
        });

        // Retrieve full tool data for cached result IDs
        // Use the cached embedding to perform vector search with same filters
        const results: any[] = await ctx.runQuery(api.aiTools.vectorSearch, {
          vector: cachedSearch.embedding,
          limit,
          language: args.language,
          category: args.category,
          pricing: args.pricing,
        });

        console.log(`Returned ${results.length} cached results`);
        return results;
      }

      console.log("Cache miss. Generating new embedding...");

      // Generate query embedding via Gemini API
      const queryEmbedding: number[] = await generateEmbedding(trimmedQuery);

      // Validate embedding
      if (!queryEmbedding || queryEmbedding.length !== 768) {
        throw new Error(
          `Invalid query embedding: expected 768 dimensions, got ${queryEmbedding?.length || 0}`
        );
      }

      console.log(`Query embedding generated successfully (${queryEmbedding.length} dimensions)`);

      // Perform vector search with filters
      const results: any[] = await ctx.runQuery(api.aiTools.vectorSearch, {
        vector: queryEmbedding,
        limit,
        language: args.language,
        category: args.category,
        pricing: args.pricing,
      });

      console.log(`Vector search returned ${results.length} results`);

      // Store results in cache for future use
      try {
        const resultIds = results.map((tool) => tool._id);
        const expiresAt = getCacheExpiry();

        await ctx.runMutation(api.cache.storeSearchCache, {
          query: trimmedQuery,
          queryHash,
          results: resultIds,
          embedding: queryEmbedding,
          expiresAt,
        });

        console.log(`Stored search results in cache (expires at: ${new Date(expiresAt).toISOString()})`);
      } catch (cacheError: any) {
        // Log cache storage error but don't fail the search
        console.error("Failed to store results in cache:", cacheError.message || cacheError);
      }

      return results;
    } catch (error: any) {
      // Log the error for debugging
      console.error("Semantic search failed, falling back to keyword search:", error.message || error);

      // Fallback to keyword search on error
      try {
        console.log("Attempting keyword search fallback...");
        
        const fallbackResults: any[] = await ctx.runQuery(api.aiTools.searchTools, {
          searchTerm: trimmedQuery,
          language: args.language,
          category: args.category,
          pricing: args.pricing,
        });

        console.log(`Keyword search fallback returned ${fallbackResults.length} results`);

        return fallbackResults;
      } catch (fallbackError: any) {
        // If even keyword search fails, log and return empty array
        console.error("Keyword search fallback also failed:", fallbackError.message || fallbackError);
        return [];
      }
    }
  },
});

/**
 * Hybrid search combining semantic and keyword search
 * Executes both search types and merges results with semantic prioritized
 * Deduplicates tools appearing in both result sets
 * 
 * @param query - Search query (natural language or keywords)
 * @param limit - Maximum number of results (default: 20)
 * @param language - Optional language filter (en/vi)
 * @param category - Optional category filter
 * @param pricing - Optional pricing filter (free/freemium/paid)
 * @returns Array of tools with scores, semantic results prioritized
 */
export const hybridSearch = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
    category: v.optional(v.string()),
    pricing: v.optional(v.union(v.literal("free"), v.literal("freemium"), v.literal("paid"))),
  },
  handler: async (ctx, args): Promise<any[]> => {
    const limit = args.limit || 20;
    const trimmedQuery = args.query.trim();

    // Validate query
    if (!trimmedQuery) {
      return [];
    }

    console.log(`Hybrid search for query: "${trimmedQuery}"`);

    try {
      // Execute both searches in parallel for better performance
      const [semanticResults, keywordResults] = await Promise.all([
        // Semantic search with higher limit to ensure good coverage
        ctx.runAction(api.actions.semanticSearch, {
          query: trimmedQuery,
          limit: limit * 2, // Get more results to have better selection after merging
          language: args.language,
          category: args.category,
          pricing: args.pricing,
        }),
        // Keyword search
        ctx.runQuery(api.aiTools.searchTools, {
          searchTerm: trimmedQuery,
          language: args.language,
          category: args.category,
          pricing: args.pricing,
        }),
      ]);

      console.log(`Semantic search returned ${semanticResults.length} results`);
      console.log(`Keyword search returned ${keywordResults.length} results`);

      // Create a map to track tools by ID for deduplication
      const toolsMap = new Map<string, any>();

      // Add semantic results first (prioritized)
      // These already have _score from vector search
      for (const tool of semanticResults) {
        toolsMap.set(tool._id, {
          ...tool,
          _searchType: "semantic",
        });
      }

      // Add keyword results, but only if not already present
      // Assign a lower score to keyword-only results
      for (const tool of keywordResults) {
        if (!toolsMap.has(tool._id)) {
          toolsMap.set(tool._id, {
            ...tool,
            _score: 0.5, // Lower score for keyword-only matches
            _searchType: "keyword",
          });
        } else {
          // Tool found in both searches - mark it as hybrid
          const existingTool = toolsMap.get(tool._id);
          existingTool._searchType = "hybrid";
        }
      }

      // Convert map to array and sort by score (semantic results will be first)
      const mergedResults = Array.from(toolsMap.values())
        .sort((a, b) => {
          // Sort by score descending (higher scores first)
          const scoreA = a._score ?? 0;
          const scoreB = b._score ?? 0;
          return scoreB - scoreA;
        })
        .slice(0, limit); // Limit to requested number of results

      console.log(
        `Hybrid search merged ${mergedResults.length} unique results ` +
        `(${mergedResults.filter(r => r._searchType === "semantic").length} semantic, ` +
        `${mergedResults.filter(r => r._searchType === "keyword").length} keyword-only, ` +
        `${mergedResults.filter(r => r._searchType === "hybrid").length} both)`
      );

      return mergedResults;
    } catch (error: any) {
      // If hybrid search fails, fall back to keyword search only
      console.error("Hybrid search failed, falling back to keyword search:", error.message || error);

      try {
        const fallbackResults: any[] = await ctx.runQuery(api.aiTools.searchTools, {
          searchTerm: trimmedQuery,
          language: args.language,
          category: args.category,
          pricing: args.pricing,
        });

        console.log(`Keyword search fallback returned ${fallbackResults.length} results`);

        return fallbackResults;
      } catch (fallbackError: any) {
        console.error("Keyword search fallback also failed:", fallbackError.message || fallbackError);
        return [];
      }
    }
  },
});
