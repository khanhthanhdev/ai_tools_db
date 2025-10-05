# Semantic Search Implementation Guide

## AI Tool Database with Convex + Google Gemini Embeddings

---

## 📋 Overview

**Goal:** Allow users to search tools using natural language descriptions  
**Technology:** Convex Vector Search + Google Gemini API (gemini-embedding-001)  
**Timeline:** 1-2 weeks  
**Cost:** FREE up to 1,500 requests/day, then $0.00001/1K characters

**Example Queries:**

- "I need something to help me write blog posts faster"
- "tool for creating images from text"
- "automate my email responses"
- "Vietnamese language translation"

---

## 🎯 Why Google Gemini?

### Advantages over OpenAI:

- ✅ **FREE tier:** 1,500 requests/day (15 RPM)
- ✅ **Lower cost:** $0.00001/1K chars vs OpenAI's $0.0001/1K tokens
- ✅ **768 dimensions (configurable via `outputDimensionality`):** Balanced vectors for speed + accuracy
- ✅ **Multilingual:** Excellent for Vietnamese + English
- ✅ **Latest model:** gemini-embedding-001 (2024)

### Comparison:

| Feature      | Gemini      | OpenAI     |
| ------------ | ----------- | ---------- |
| Free tier    | 1,500/day   | None       |
| Dimensions   | 768         | 1,536      |
| Cost (paid)  | $0.00001/1K | $0.0001/1K |
| Multilingual | Excellent   | Good       |

---

## 🏗️ Architecture

```
User Query
    ↓
Generate Embedding (Google Gemini API)
    ↓
Vector Search in Convex
    ↓
Return Ranked Results
```

---

## 📐 Phase 1: Setup Google AI Studio (Day 1)

### Step 1.1: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Get API Key"
3. Create or select a project
4. Copy your API key

### Step 1.2: Add API Key to Convex

```bash
npx convex env set GEMINI_API_KEY your_api_key_here
```

### Step 1.3: Install Google AI SDK

```bash
npm install @google/generative-ai
```

---

## 📐 Phase 2: Update Schema (Day 1)

### Step 2.1: Add Vector Field to aiTools

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  aiTools: defineTable({
    // Existing fields
    name: v.string(),
    description: v.string(),
    url: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    pricing: v.union(
      v.literal("free"),
      v.literal("freemium"),
      v.literal("paid")
    ),
    language: v.union(v.literal("en"), v.literal("vi")),
    submittedBy: v.optional(v.id("users")),
    isApproved: v.boolean(),
    logoUrl: v.optional(v.string()),
    averageRating: v.optional(v.number()),
    totalReviews: v.optional(v.number()),
    totalFavourites: v.optional(v.number()),

    // NEW: Vector embeddings for semantic search
    embedding: v.optional(v.array(v.number())), // 768 dimensions for Gemini
    embeddingVersion: v.optional(v.string()), // Track which model was used
  })
    .index("by_category", ["category"])
    .index("by_pricing", ["pricing"])
    .index("by_language", ["language"])
    .index("by_url", ["url"])
    .index("by_rating", ["averageRating"])
    .index("by_favourites", ["totalFavourites"])
    // NEW: Vector index for semantic search
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768, // Gemini gemini-embedding-001 configured via outputDimensionality
      filterFields: ["isApproved", "language", "category", "pricing"],
    })
    .searchIndex("search_tools", {
      searchField: "name",
      filterFields: ["category", "pricing", "language", "isApproved"],
    }),

  // ... rest of your tables (favourites, reviews, etc.)
});
```

### Step 2.2: Push Schema Changes

```bash
npx convex dev
```

---

## 🔧 Phase 3: Generate Embeddings (Day 2-3)

### Step 3.1: Create Embedding Utility Function

```typescript
// convex/lib/gemini.ts
import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";

// Initialize Gemini
export function getGeminiClient(apiKey: string) {
  return new GoogleGenerativeAI(apiKey);
}

// Generate embedding for text
export async function generateEmbedding(
  text: string,
  apiKey: string
): Promise<number[]> {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

  const result = await model.embedContent({
    content: { role: "user", parts: [{ text }] },
    taskType: TaskType.SEMANTIC_SIMILARITY,
    outputDimensionality: 768,
  });
  const embedding = result.embedding;

  return embedding.values;
}

// Generate embeddings in batch (more efficient)
export async function generateEmbeddingsBatch(
  texts: string[],
  apiKey: string
): Promise<number[][]> {
  const genAI = getGeminiClient(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

  const results = await Promise.all(
    texts.map((text) =>
      model.embedContent({
        content: { role: "user", parts: [{ text }] },
        taskType: TaskType.SEMANTIC_SIMILARITY,
        outputDimensionality: 768,
      })
    )
  );

  return results.map((result) => result.embedding.values);
}
```

### Step 3.2: Create Helper to Build Embedding Text

```typescript
// convex/lib/embeddingHelpers.ts

interface Tool {
  name: string;
  description: string;
  category: string;
  tags: string[];
  pricing: string;
}

export function createEmbeddingText(tool: Tool): string {
  // Combine multiple fields for better semantic understanding
  const parts = [
    `Tool Name: ${tool.name}`,
    `Description: ${tool.description}`,
    `Category: ${tool.category}`,
    `Features: ${tool.tags.join(", ")}`,
    `Pricing Model: ${tool.pricing}`,
  ];

  return parts.join("\n");
}

// Alternative: Shorter version (saves API costs)
export function createEmbeddingTextShort(tool: Tool): string {
  return `${tool.name}. ${tool.description} (${tool.category})`;
}
```

### Step 3.3: Create Action to Generate Single Embedding

```typescript
// convex/actions.ts
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { generateEmbedding } from "./lib/gemini";
import { createEmbeddingText } from "./lib/embeddingHelpers";

// Generate embedding for a single tool
export const generateToolEmbedding = action({
  args: {
    toolId: v.id("aiTools"),
  },
  handler: async (ctx, args) => {
    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    // Get the tool
    const tool = await ctx.runQuery(api.tools.getToolById, {
      id: args.toolId,
    });

    if (!tool) {
      throw new Error("Tool not found");
    }

    // Create text for embedding
    const textToEmbed = createEmbeddingText(tool);

    try {
      // Generate embedding using Gemini
      const embedding = await generateEmbedding(textToEmbed, apiKey);

      // Store embedding in database
      await ctx.runMutation(api.tools.updateToolEmbedding, {
        toolId: args.toolId,
        embedding: embedding,
        embeddingVersion: "gemini-gemini-embedding-001",
      });

      return {
        success: true,
        dimensions: embedding.length,
      };
    } catch (error: any) {
      console.error("Failed to generate embedding:", error);
      throw new Error(`Embedding generation failed: ${error.message}`);
    }
  },
});
```

### Step 3.4: Create Mutation to Store Embedding

```typescript
// convex/tools.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updateToolEmbedding = mutation({
  args: {
    toolId: v.id("aiTools"),
    embedding: v.array(v.number()),
    embeddingVersion: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.toolId, {
      embedding: args.embedding,
      embeddingVersion: args.embeddingVersion,
    });
  },
});

export const getToolById = query({
  args: { id: v.id("aiTools") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

### Step 3.5: Batch Generate for All Tools

```typescript
// convex/actions.ts

export const generateAllEmbeddings = action({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    // Get all tools without embeddings
    const tools = await ctx.runQuery(api.tools.getToolsWithoutEmbeddings);

    console.log(`Generating embeddings for ${tools.length} tools...`);

    let successCount = 0;
    let errorCount = 0;

    for (const tool of tools) {
      try {
        await ctx.runAction(api.actions.generateToolEmbedding, {
          toolId: tool._id,
        });
        successCount++;

        // Rate limit: Gemini free tier allows 15 requests/minute
        // Wait 4 seconds between requests to be safe (15 per minute = 1 per 4 seconds)
        await new Promise((resolve) => setTimeout(resolve, 4000));
      } catch (error) {
        console.error(`Failed to generate embedding for ${tool._id}:`, error);
        errorCount++;

        // If rate limit hit, wait longer
        if (error.message?.includes("RESOURCE_EXHAUSTED")) {
          console.log("Rate limit hit, waiting 60 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 60000));
        }
      }
    }

    return {
      success: true,
      processed: tools.length,
      successful: successCount,
      failed: errorCount,
    };
  },
});

// Faster batch version (if you have paid tier)
export const generateAllEmbeddingsBatch = action({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const tools = await ctx.runQuery(api.tools.getToolsWithoutEmbeddings);
    console.log(
      `Generating embeddings for ${tools.length} tools in batches...`
    );

    const BATCH_SIZE = 10;
    let successCount = 0;

    // Process in batches
    for (let i = 0; i < tools.length; i += BATCH_SIZE) {
      const batch = tools.slice(i, i + BATCH_SIZE);

      const texts = batch.map((tool) => createEmbeddingText(tool));

      try {
        const { generateEmbeddingsBatch } = await import("./lib/gemini");
        const embeddings = await generateEmbeddingsBatch(texts, apiKey);

        // Store all embeddings
        for (let j = 0; j < batch.length; j++) {
          await ctx.runMutation(api.tools.updateToolEmbedding, {
            toolId: batch[j]._id,
            embedding: embeddings[j],
            embeddingVersion: "gemini-gemini-embedding-001",
          });
          successCount++;
        }

        // Rate limit between batches
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`Batch ${i / BATCH_SIZE} failed:`, error);
      }
    }

    return { success: true, processed: successCount };
  },
});
```

### Step 3.6: Query Helper Functions

```typescript
// convex/tools.ts

export const getToolsWithoutEmbeddings = query({
  args: {},
  handler: async (ctx) => {
    const tools = await ctx.db
      .query("aiTools")
      .filter((q) => q.eq(q.field("embedding"), undefined))
      .collect();

    return tools;
  },
});

export const getEmbeddingStats = query({
  args: {},
  handler: async (ctx) => {
    const allTools = await ctx.db.query("aiTools").collect();
    const withEmbeddings = allTools.filter((t) => t.embedding !== undefined);

    return {
      total: allTools.length,
      withEmbeddings: withEmbeddings.length,
      withoutEmbeddings: allTools.length - withEmbeddings.length,
      percentage: ((withEmbeddings.length / allTools.length) * 100).toFixed(1),
    };
  },
});
```

---

## 🔍 Phase 4: Implement Semantic Search (Day 3-4)

### Step 4.1: Create Semantic Search Action

```typescript
// convex/actions.ts

export const semanticSearch = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
    category: v.optional(v.string()),
    pricing: v.optional(
      v.union(v.literal("free"), v.literal("freemium"), v.literal("paid"))
    ),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const limit = args.limit || 20;

    try {
      // 1. Generate embedding for search query
      const queryEmbedding = await generateEmbedding(args.query, apiKey);

      // 2. Perform vector search
      const results = await ctx.runQuery(api.tools.vectorSearch, {
        vector: queryEmbedding,
        limit: limit,
        language: args.language,
        category: args.category,
        pricing: args.pricing,
      });

      return results;
    } catch (error: any) {
      console.error("Semantic search failed:", error);

      // Fallback to keyword search if embedding fails
      return await ctx.runQuery(api.tools.keywordSearch, {
        query: args.query,
        limit: limit,
        language: args.language,
        category: args.category,
      });
    }
  },
});
```

### Step 4.2: Create Vector Search Query

```typescript
// convex/tools.ts

export const vectorSearch = query({
  args: {
    vector: v.array(v.number()),
    limit: v.number(),
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
    category: v.optional(v.string()),
    pricing: v.optional(
      v.union(v.literal("free"), v.literal("freemium"), v.literal("paid"))
    ),
  },
  handler: async (ctx, args) => {
    // Perform vector search with filters
    const results = await ctx.db
      .query("aiTools")
      .withIndex("by_embedding", (q) => {
        let query = q.eq("isApproved", true);

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
      })
      .order("desc")
      .take(args.limit);

    // Calculate similarity scores
    return results
      .map((tool) => {
        if (!tool.embedding) {
          return { ...tool, _score: 0 };
        }

        // Calculate cosine similarity
        const score = cosineSimilarity(args.vector, tool.embedding);

        return {
          ...tool,
          _score: score,
        };
      })
      .sort((a, b) => b._score - a._score);
  },
});

// Helper: Calculate cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);

  return magnitude === 0 ? 0 : dotProduct / magnitude;
}
```

### Step 4.3: Create Fallback Keyword Search

```typescript
// convex/tools.ts

export const keywordSearch = query({
  args: {
    query: v.string(),
    limit: v.number(),
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Use existing search index
    let searchQuery = ctx.db
      .query("aiTools")
      .withSearchIndex("search_tools", (q) => {
        let sq = q.search("name", args.query);

        if (args.language) {
          sq = sq.eq("language", args.language);
        }

        if (args.category) {
          sq = sq.eq("category", args.category);
        }

        return sq.eq("isApproved", true);
      });

    return await searchQuery.take(args.limit);
  },
});
```

### Step 4.4: Create Hybrid Search

```typescript
// convex/actions.ts

export const hybridSearch = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const halfLimit = Math.ceil(limit / 2);

    try {
      // 1. Get semantic results
      const semanticResults = await ctx.runAction(api.actions.semanticSearch, {
        query: args.query,
        language: args.language,
        category: args.category,
        limit: halfLimit,
      });

      // 2. Get keyword results
      const keywordResults = await ctx.runQuery(api.tools.keywordSearch, {
        query: args.query,
        language: args.language,
        category: args.category,
        limit: halfLimit,
      });

      // 3. Merge and deduplicate
      const seenIds = new Set<string>();
      const merged: any[] = [];

      // Add semantic results first (higher priority)
      for (const result of semanticResults) {
        if (!seenIds.has(result._id)) {
          merged.push({ ...result, source: "semantic" });
          seenIds.add(result._id);
        }
      }

      // Add keyword results
      for (const result of keywordResults) {
        if (!seenIds.has(result._id)) {
          merged.push({ ...result, source: "keyword", _score: 0.5 });
          seenIds.add(result._id);
        }
      }

      // Return top N results
      return merged.slice(0, limit);
    } catch (error) {
      console.error("Hybrid search failed:", error);
      // Fallback to keyword only
      return await ctx.runQuery(api.tools.keywordSearch, {
        query: args.query,
        language: args.language,
        category: args.category,
        limit: limit,
      });
    }
  },
});
```

---

## 💻 Phase 5: Frontend Integration (Day 5-6)

### Step 5.1: Create Search Bar Component

```typescript
// components/SearchBar.tsx
"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, Loader2 } from "lucide-react";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<"semantic" | "keyword" | "hybrid">("hybrid");

  const semanticSearch = useAction(api.actions.semanticSearch);
  const hybridSearch = useAction(api.actions.hybridSearch);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      let searchResults;

      if (searchType === "hybrid") {
        searchResults = await hybridSearch({ query, limit: 20 });
      } else {
        searchResults = await semanticSearch({ query, limit: 20 });
      }

      setResults(searchResults);
    } catch (error) {
      console.error("Search failed:", error);
      // Show error to user
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe what you're looking for..."
          className="w-full px-4 py-3 pl-12 pr-24 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Search"
          )}
        </button>
      </div>

      {/* Search Type Toggle */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setSearchType("semantic")}
          className={`px-3 py-1 rounded text-sm ${
            searchType === "semantic"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Smart Search
        </button>
        <button
          onClick={() => setSearchType("hybrid")}
          className={`px-3 py-1 rounded text-sm ${
            searchType === "hybrid"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          Hybrid
        </button>
      </div>

      {/* Example Queries */}
      {!query && (
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">Try searching:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              "help me write better emails",
              "create images from text",
              "translate Vietnamese",
              "automate social media",
            ].map((example) => (
              <button
                key={example}
                onClick={() => setQuery(example)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-gray-600">
            Found {results.length} tools
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((tool) => (
              <ToolCard
                key={tool._id}
                tool={tool}
                showScore={searchType === "semantic"}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && query && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No tools found for "{query}"</p>
          <p className="text-sm text-gray-400 mt-2">
            Try different keywords or check your filters
          </p>
        </div>
      )}
    </div>
  );
}
```

### Step 5.2: Create Tool Card Component

```typescript
// components/ToolCard.tsx

interface ToolCardProps {
  tool: any;
  showScore?: boolean;
}

export function ToolCard({ tool, showScore = false }: ToolCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      {/* Logo */}
      {tool.logoUrl && (
        <img
          src={tool.logoUrl}
          alt={tool.name}
          className="w-12 h-12 object-cover rounded mb-3"
        />
      )}

      {/* Name & Score */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">{tool.name}</h3>
        {showScore && tool._score && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            {(tool._score * 100).toFixed(0)}% match
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {tool.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {tool.tags.slice(0, 3).map((tag: string) => (
          <span
            key={tag}
            className="text-xs bg-gray-100 px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">{tool.category}</span>
        <span className={`font-medium ${
          tool.pricing === "free"
            ? "text-green-600"
            : tool.pricing === "freemium"
            ? "text-blue-600"
            : "text-purple-600"
        }`}>
          {tool.pricing}
        </span>
      </div>
    </div>
  );
}
```

### Step 5.3: Create Search Page

```typescript
// app/search/page.tsx
"use client";

import { SearchBar } from "@/components/SearchBar";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Find Your Perfect AI Tool
          </h1>
          <p className="text-gray-600">
            Describe what you need in natural language
          </p>
        </div>

        <SearchBar />
      </div>
    </div>
  );
}
```

---

## 🔄 Phase 6: Auto-Generate Embeddings (Day 7)

### Step 6.1: Generate on Tool Creation

```typescript
// convex/tools.ts

export const createTool = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    url: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    pricing: v.union(
      v.literal("free"),
      v.literal("freemium"),
      v.literal("paid")
    ),
    language: v.union(v.literal("en"), v.literal("vi")),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get user
    const identity = await ctx.auth.getUserIdentity();

    // Insert tool
    const toolId = await ctx.db.insert("aiTools", {
      ...args,
      submittedBy: identity?.subject as any,
      isApproved: false, // Requires approval
    });

    // Schedule embedding generation (async, doesn't block)
    await ctx.scheduler.runAfter(0, api.actions.generateToolEmbedding, {
      toolId: toolId,
    });

    return toolId;
  },
});
```

---

## 💰 Phase 7: Cost Optimization (Day 8)

### Step 7.1: Implement Query Caching

```typescript
// convex/schema.ts - Add cache table

export default defineSchema({
  // ... existing tables

  searchCache: defineTable({
    query: v.string(),
    queryHash: v.string(), // MD5 hash for faster lookup
    results: v.array(v.id("aiTools")),
    embedding: v.array(v.number()),
    createdAt: v.number(),
    expiresAt: v.number(),
    hitCount: v.number(),
  })
    .index("by_query_hash", ["queryHash"])
    .index("by_expires", ["expiresAt"]),
});
```

```typescript
// convex/lib/cache.ts

export function hashQuery(query: string): string {
  // Simple hash function (you can use crypto.createHash in production)
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    const char = query.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export function getCacheExpiry(): number {
  // Cache for 1 hour
  return Date.now() + 60 * 60 * 1000;
}
```

```typescript
// convex/actions.ts - Update semantic search with caching

export const semanticSearchCached = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
    category: v.optional(v.string()),
    pricing: v.optional(
      v.union(v.literal("free"), v.literal("freemium"), v.literal("paid"))
    ),
  },
  handler: async (ctx, args) => {
    const { hashQuery } = await import("./lib/cache");
    const queryHash = hashQuery(args.query.toLowerCase().trim());

    // 1. Check cache first
    const cached = await ctx.runQuery(api.cache.getCachedSearch, {
      queryHash: queryHash,
    });

    if (cached && cached.expiresAt > Date.now()) {
      console.log("Cache hit for:", args.query);

      // Increment hit count
      await ctx.runMutation(api.cache.incrementCacheHit, {
        cacheId: cached._id,
      });

      // Return cached results
      return await ctx.runQuery(api.tools.getToolsByIds, {
        ids: cached.results,
        limit: args.limit || 20,
      });
    }

    // 2. Cache miss - generate embedding and search
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const queryEmbedding = await generateEmbedding(args.query, apiKey);

    const results = await ctx.runQuery(api.tools.vectorSearch, {
      vector: queryEmbedding,
      limit: args.limit || 20,
      language: args.language,
      category: args.category,
      pricing: args.pricing,
    });

    // 3. Store in cache
    const { getCacheExpiry } = await import("./lib/cache");
    await ctx.runMutation(api.cache.storeSearchCache, {
      query: args.query,
      queryHash: queryHash,
      results: results.map((r: any) => r._id),
      embedding: queryEmbedding,
      expiresAt: getCacheExpiry(),
    });

    return results;
  },
});
```

```typescript
// convex/cache.ts - Cache queries and mutations

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getCachedSearch = query({
  args: { queryHash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("searchCache")
      .withIndex("by_query_hash", (q) => q.eq("queryHash", args.queryHash))
      .first();
  },
});

export const storeSearchCache = mutation({
  args: {
    query: v.string(),
    queryHash: v.string(),
    results: v.array(v.id("aiTools")),
    embedding: v.array(v.number()),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("searchCache", {
      ...args,
      createdAt: Date.now(),
      hitCount: 0,
    });
  },
});

export const incrementCacheHit = mutation({
  args: { cacheId: v.id("searchCache") },
  handler: async (ctx, args) => {
    const cache = await ctx.db.get(args.cacheId);
    if (cache) {
      await ctx.db.patch(args.cacheId, {
        hitCount: cache.hitCount + 1,
      });
    }
  },
});

// Cleanup expired cache entries (run periodically)
export const cleanupExpiredCache = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("searchCache")
      .withIndex("by_expires", (q) => q.lt("expiresAt", now))
      .collect();

    for (const cache of expired) {
      await ctx.db.delete(cache._id);
    }

    return { deleted: expired.length };
  },
});
```

### Step 7.2: Rate Limiting

```typescript
// convex/lib/rateLimit.ts

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// Simple in-memory rate limiter (for production, use Redis or database)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  userId: string,
  config: RateLimitConfig = { maxRequests: 15, windowMs: 60000 }
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const userLimit = requestCounts.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    // New window
    requestCounts.set(userId, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  if (userLimit.count >= config.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  userLimit.count++;
  return { allowed: true, remaining: config.maxRequests - userLimit.count };
}
```

```typescript
// convex/actions.ts - Add rate limiting to search

export const semanticSearchWithLimit = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get user identity
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject || "anonymous";

    // Check rate limit
    const { checkRateLimit } = await import("./lib/rateLimit");
    const rateCheck = checkRateLimit(userId, {
      maxRequests: 15, // 15 searches per minute (Gemini free tier limit)
      windowMs: 60000,
    });

    if (!rateCheck.allowed) {
      throw new Error(
        "Rate limit exceeded. Please wait a minute before searching again."
      );
    }

    // Proceed with search
    return await ctx.runAction(api.actions.semanticSearchCached, args);
  },
});
```

### Step 7.3: Batch Embedding Generation

```typescript
// convex/actions.ts

// Generate embeddings in batches (more efficient for initial setup)
export const generateEmbeddingsBatch = action({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const batchSize = args.batchSize || 5;

    // Get tools without embeddings
    const tools = await ctx.runQuery(api.tools.getToolsWithoutEmbeddings);

    if (tools.length === 0) {
      return { message: "All tools have embeddings" };
    }

    const batch = tools.slice(0, batchSize);

    console.log(`Processing batch of ${batch.length} tools...`);

    let successCount = 0;
    let errorCount = 0;

    for (const tool of batch) {
      try {
        const textToEmbed = createEmbeddingText(tool);
        const embedding = await generateEmbedding(textToEmbed, apiKey);

        await ctx.runMutation(api.tools.updateToolEmbedding, {
          toolId: tool._id,
          embedding: embedding,
          embeddingVersion: "gemini-gemini-embedding-001",
        });

        successCount++;

        // Small delay between requests (4 seconds = 15/min)
        await new Promise((resolve) => setTimeout(resolve, 4000));
      } catch (error: any) {
        console.error(`Failed for tool ${tool._id}:`, error.message);
        errorCount++;

        // If rate limit, stop processing
        if (error.message?.includes("RESOURCE_EXHAUSTED")) {
          break;
        }
      }
    }

    const remaining = tools.length - batch.length;

    return {
      processed: successCount,
      failed: errorCount,
      remaining: remaining,
      message:
        remaining > 0
          ? `${remaining} tools remaining. Run again to continue.`
          : "All done!",
    };
  },
});
```

---

## 🎯 Phase 8: Enhance Results (Day 9-10)

### Step 8.1: Re-ranking with Multiple Signals

```typescript
// convex/lib/ranking.ts

interface RankingWeights {
  semantic: number;
  rating: number;
  popularity: number;
  recency: number;
}

export function calculateFinalScore(
  tool: any,
  semanticScore: number,
  weights: RankingWeights = {
    semantic: 0.6,
    rating: 0.2,
    popularity: 0.1,
    recency: 0.1,
  }
): number {
  // Normalize rating (0-5 to 0-1)
  const ratingScore = (tool.averageRating || 0) / 5;

  // Normalize popularity (cap at 100 favourites)
  const popularityScore = Math.min(tool.totalFavourites || 0, 100) / 100;

  // Recency score (newer tools get slight boost)
  const recencyScore = calculateRecencyScore(tool._creationTime);

  // Calculate weighted score
  const finalScore =
    semanticScore * weights.semantic +
    ratingScore * weights.rating +
    popularityScore * weights.popularity +
    recencyScore * weights.recency;

  return finalScore;
}

function calculateRecencyScore(creationTime: number): number {
  const now = Date.now();
  const ageInDays = (now - creationTime) / (1000 * 60 * 60 * 24);

  // Tools less than 30 days old get a boost
  if (ageInDays < 30) {
    return 1 - (ageInDays / 30) * 0.5; // Score from 1.0 to 0.5
  }

  // Older tools get lower score
  return Math.max(0.5 - (ageInDays - 30) / 365, 0);
}
```

```typescript
// convex/tools.ts - Update vector search with re-ranking

export const vectorSearchWithRanking = query({
  args: {
    vector: v.array(v.number()),
    limit: v.number(),
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get more results than needed for re-ranking
    const results = await ctx.db
      .query("aiTools")
      .withIndex("by_embedding")
      .filter((q) => {
        let query = q.eq("isApproved", true);

        if (args.language) {
          query = query.eq("language", args.language);
        }

        if (args.category) {
          query = query.eq("category", args.category);
        }

        return query;
      })
      .take(args.limit * 2); // Get 2x for re-ranking

    // Calculate scores
    const { calculateFinalScore } = await import("./lib/ranking");

    const scored = results
      .map((tool) => {
        if (!tool.embedding) {
          return { ...tool, _score: 0, _finalScore: 0 };
        }

        const semanticScore = cosineSimilarity(args.vector, tool.embedding);
        const finalScore = calculateFinalScore(tool, semanticScore);

        return {
          ...tool,
          _score: semanticScore,
          _finalScore: finalScore,
        };
      })
      .sort((a, b) => b._finalScore - a._finalScore)
      .slice(0, args.limit);

    return scored;
  },
});
```

### Step 8.2: Query Expansion for Better Results

```typescript
// convex/actions.ts

export const semanticSearchExpanded = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    let searchQuery = args.query;

    // If query is very short, expand it
    if (args.query.split(" ").length < 3) {
      // Use Gemini to expand the query
      const genAI = getGeminiClient(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Expand this short search query into a more detailed description for finding AI tools: "${args.query}"
      
      Keep it concise (1-2 sentences) and focus on what the user wants to accomplish.
      Only output the expanded query, nothing else.`;

      try {
        const result = await model.generateContent(prompt);
        const expandedQuery = result.response.text().trim();
        searchQuery = expandedQuery;
        console.log(`Expanded query: "${args.query}" -> "${searchQuery}"`);
      } catch (error) {
        console.error("Query expansion failed:", error);
        // Continue with original query
      }
    }

    // Generate embedding for the (possibly expanded) query
    const queryEmbedding = await generateEmbedding(searchQuery, apiKey);

    // Perform search
    return await ctx.runQuery(api.tools.vectorSearchWithRanking, {
      vector: queryEmbedding,
      limit: args.limit || 20,
    });
  },
});
```

### Step 8.3: Add Search Analytics

```typescript
// convex/schema.ts - Add analytics table

export default defineSchema({
  // ... existing tables

  searchAnalytics: defineTable({
    query: v.string(),
    userId: v.optional(v.string()),
    resultsCount: v.number(),
    clickedToolId: v.optional(v.id("aiTools")),
    clickedPosition: v.optional(v.number()),
    timestamp: v.number(),
    searchType: v.string(), // "semantic", "keyword", "hybrid"
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_query", ["query"]),
});
```

```typescript
// convex/analytics.ts

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const logSearch = mutation({
  args: {
    query: v.string(),
    resultsCount: v.number(),
    searchType: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    await ctx.db.insert("searchAnalytics", {
      query: args.query,
      userId: identity?.subject,
      resultsCount: args.resultsCount,
      timestamp: Date.now(),
      searchType: args.searchType,
    });
  },
});

export const logSearchClick = mutation({
  args: {
    query: v.string(),
    toolId: v.id("aiTools"),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    await ctx.db.insert("searchAnalytics", {
      query: args.query,
      userId: identity?.subject,
      resultsCount: 0,
      clickedToolId: args.toolId,
      clickedPosition: args.position,
      timestamp: Date.now(),
      searchType: "click",
    });
  },
});

// Get popular search queries
export const getPopularSearches = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const searches = await ctx.db
      .query("searchAnalytics")
      .filter((q) => q.neq("searchType", "click"))
      .collect();

    // Count query frequency
    const queryCounts = new Map<string, number>();

    searches.forEach((search) => {
      const count = queryCounts.get(search.query) || 0;
      queryCounts.set(search.query, count + 1);
    });

    // Sort by frequency
    const popular = Array.from(queryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));

    return popular;
  },
});

// Get zero-result queries (for improvement)
export const getZeroResultQueries = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("searchAnalytics")
      .filter((q) => q.eq("resultsCount", 0))
      .order("desc")
      .take(50);
  },
});
```

---

## 🧪 Phase 9: Testing (Day 11-12)

### Step 9.1: Create Test Suite

```typescript
// convex/tests/search.test.ts

// Test queries with expected categories
const testCases = [
  {
    query: "write better content",
    expectedCategories: ["Writing", "Content Creation", "Marketing"],
    minResults: 3,
  },
  {
    query: "tạo hình ảnh từ văn bản",
    expectedCategories: ["Image Generation", "AI Art"],
    language: "vi",
    minResults: 1,
  },
  {
    query: "automate email responses",
    expectedCategories: ["Productivity", "Automation", "Email"],
    minResults: 2,
  },
  {
    query: "code assistant",
    expectedCategories: ["Developer Tools", "Coding"],
    minResults: 5,
  },
  {
    query: "video editing AI",
    expectedCategories: ["Video", "Editing"],
    minResults: 2,
  },
];

// Run tests (manually or with a test runner)
export const runSearchTests = action({
  args: {},
  handler: async (ctx) => {
    const results = [];

    for (const test of testCases) {
      try {
        const searchResults = await ctx.runAction(api.actions.semanticSearch, {
          query: test.query,
          language: test.language,
          limit: 20,
        });

        const passed =
          searchResults.length >= test.minResults &&
          searchResults.some((r: any) =>
            test.expectedCategories.includes(r.category)
          );

        results.push({
          query: test.query,
          passed,
          resultsCount: searchResults.length,
          topCategory: searchResults[0]?.category,
        });
      } catch (error: any) {
        results.push({
          query: test.query,
          passed: false,
          error: error.message,
        });
      }
    }

    return results;
  },
});
```

### Step 9.2: Performance Testing

```typescript
// convex/tests/performance.test.ts

export const testSearchPerformance = action({
  args: {},
  handler: async (ctx) => {
    const queries = ["AI writing tool", "image generator", "productivity app"];

    const results = [];

    for (const query of queries) {
      const start = Date.now();

      await ctx.runAction(api.actions.semanticSearch, {
        query,
        limit: 20,
      });

      const duration = Date.now() - start;

      results.push({
        query,
        duration,
        acceptable: duration < 2000, // Should be under 2 seconds
      });
    }

    return results;
  },
});
```

### Step 9.3: Manual Testing Checklist

```markdown
## Search Quality Tests

### Basic Functionality

- [ ] Search returns relevant results
- [ ] Empty query shows example queries
- [ ] Loading state displays correctly
- [ ] Error handling works
- [ ] No results message appears when appropriate

### Semantic Understanding

- [ ] "help me write" finds writing tools
- [ ] "create images" finds image generators
- [ ] "translate" finds translation tools
- [ ] "automate tasks" finds automation tools
- [ ] Vietnamese queries work correctly

### Filters

- [ ] Language filter works (en/vi)
- [ ] Category filter works
- [ ] Pricing filter works
- [ ] Filters combine correctly

### Performance

- [ ] Search completes in < 2 seconds
- [ ] Cache hit is faster than cache miss
- [ ] Rate limiting prevents abuse
- [ ] Batch generation doesn't timeout

### Edge Cases

- [ ] Very long queries (500+ chars)
- [ ] Special characters in query
- [ ] Emoji in query
- [ ] Empty string query
- [ ] Query with only spaces
```

---

## 🚀 Phase 10: Deployment (Day 13-14)

### Step 10.1: Pre-Deployment Checklist

```bash
# 1. Verify environment variables
npx convex env list

# Should see:
# GEMINI_API_KEY: sk-...

# 2. Test in production environment
npx convex deploy

# 3. Generate embeddings for all tools
# Run from Convex dashboard or CLI:
npx convex run actions:generateAllEmbeddings

# 4. Verify embeddings generated
npx convex run tools:getEmbeddingStats

# Expected output:
# {
#   total: 100,
#   withEmbeddings: 100,
#   withoutEmbeddings: 0,
#   percentage: "100.0"
# }
```

### Step 10.2: Monitoring Setup

```typescript
// convex/monitoring.ts

import { v } from "convex/values";
import { query } from "./_generated/server";

// Monitor search health
export const getSearchHealth = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Get recent searches
    const recentSearches = await ctx.db
      .query("searchAnalytics")
      .withIndex("by_timestamp", (q) => q.gt("timestamp", oneDayAgo))
      .collect();

    // Calculate metrics
    const totalSearches = recentSearches.filter(
      (s) => s.searchType !== "click"
    ).length;

    const zeroResults = recentSearches.filter(
      (s) => s.resultsCount === 0
    ).length;

    const clicks = recentSearches.filter(
      (s) => s.searchType === "click"
    ).length;

    const clickThroughRate =
      totalSearches > 0 ? ((clicks / totalSearches) * 100).toFixed(1) : "0";

    const zeroResultRate =
      totalSearches > 0
        ? ((zeroResults / totalSearches) * 100).toFixed(1)
        : "0";

    return {
      period: "24h",
      totalSearches,
      uniqueSearches: new Set(recentSearches.map((s) => s.query)).size,
      zeroResults,
      zeroResultRate: `${zeroResultRate}%`,
      clicks,
      clickThroughRate: `${clickThroughRate}%`,
      healthy: zeroResults / totalSearches < 0.1, // < 10% zero results
    };
  },
});

// Monitor embedding coverage
export const getEmbeddingCoverage = query({
  args: {},
  handler: async (ctx) => {
    const allTools = await ctx.db.query("aiTools").collect();
    const approved = allTools.filter((t) => t.isApproved);
    const withEmbeddings = approved.filter((t) => t.embedding);

    return {
      total: allTools.length,
      approved: approved.length,
      withEmbeddings: withEmbeddings.length,
      coverage: `${((withEmbeddings.length / approved.length) * 100).toFixed(1)}%`,
      needsEmbedding: approved.length - withEmbeddings.length,
    };
  },
});
```

### Step 10.3: Create Admin Dashboard

```typescript
// app/admin/search/page.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SearchAdminPage() {
  const health = useQuery(api.monitoring.getSearchHealth);
  const coverage = useQuery(api.monitoring.getEmbeddingCoverage);
  const popular = useQuery(api.analytics.getPopularSearches, { limit: 10 });
  const zeroResults = useQuery(api.analytics.getZeroResultQueries);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Search Analytics</h1>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Searches (24h)"
          value={health?.totalSearches}
          status={health?.healthy ? "good" : "warning"}
        />
        <MetricCard
          title="Click-Through Rate"
          value={health?.clickThroughRate}
        />
        <MetricCard
          title="Zero Results Rate"
          value={health?.zeroResultRate}
          status={parseFloat(health?.zeroResultRate || "0") < 10 ? "good" : "warning"}
        />
        <MetricCard
          title="Embedding Coverage"
          value={coverage?.coverage}
        />
      </div>

      {/* Popular Searches */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Popular Searches</h2>
        <ul className="space-y-2">
          {popular?.map((item) => (
            <li key={item.query} className="flex justify-between">
              <span>{item.query}</span>
              <span className="text-gray-500">{item.count} searches</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Zero Result Queries */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Queries with No Results (Needs Attention)
        </h2>
        <ul className="space-y-1">
          {zeroResults?.slice(0, 20).map((item) => (
            <li key={item._id} className="text-sm text-gray-700">
              {item.query}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MetricCard({ title, value, status = "neutral" }) {
  const statusColors = {
    good: "border-green-500 bg-green-50",
    warning: "border-yellow-500 bg-yellow-50",
    neutral: "border-gray-300",
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${statusColors[status]}`}>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value ?? "..."}</p>
    </div>
  );
}
```

---

## 📊 Cost Analysis

### Gemini API Pricing (as of 2024)

**Free Tier:**

- 1,500 requests per day
- 15 requests per minute
- Perfect for small to medium apps

**Paid Tier:**

- $0.00001 per 1,000 characters (gemini-embedding-001)
- Much cheaper than OpenAI ($0.0001 per 1K tokens)

### Cost Examples

**Initial Setup (1,000 tools):**

- Average text per tool: 300 characters
- Total characters: 300,000
- Cost: $0.003 (less than 1 cent!)

**Monthly Usage (10,000 searches):**

- Average query: 50 characters
- Total characters: 500,000
- Cost with caching (50% hit rate): $0.0025
- **Monthly cost: ~$0.01** 🎉

**High Traffic (100,000 searches/month):**

- With 70% cache hit rate: 30,000 API calls
- Average 50 chars per query: 1.5M characters
- Cost: $0.015 per month
- **Monthly cost: ~$0.02** 🎉

### Comparison with OpenAI

| Metric                   | Gemini    | OpenAI |
| ------------------------ | --------- | ------ |
| Initial setup (1K tools) | $0.003    | $0.50  |
| 10K searches/month       | $0.01     | $0.50  |
| 100K searches/month      | $0.02     | $5.00  |
| Free tier                | 1,500/day | None   |

**Winner: Gemini is 100-250x cheaper!** 🏆

---

## 🎯 Phase 11: Advanced Features (Optional)

### Step 11.1: Multi-language Query Translation

```typescript
// convex/actions.ts

export const semanticSearchMultilingual = action({
  args: {
    query: v.string(),
    targetLanguage: v.optional(v.union(v.literal("en"), v.literal("vi"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    let searchQuery = args.query;
    let detectedLanguage = detectLanguage(args.query);

    // If Vietnamese query but searching in English tools, translate
    if (detectedLanguage === "vi" && args.targetLanguage === "en") {
      const genAI = getGeminiClient(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Translate this Vietnamese search query to English, keeping the intent: "${args.query}"
      
      Only output the English translation, nothing else.`;

      try {
        const result = await model.generateContent(prompt);
        searchQuery = result.response.text().trim();
        console.log(`Translated: "${args.query}" -> "${searchQuery}"`);
      } catch (error) {
        console.error("Translation failed:", error);
      }
    }

    // Generate embedding and search
    const queryEmbedding = await generateEmbedding(searchQuery, apiKey);

    return await ctx.runQuery(api.tools.vectorSearchWithRanking, {
      vector: queryEmbedding,
      limit: args.limit || 20,
      language: args.targetLanguage,
    });
  },
});

// Simple language detection
function detectLanguage(text: string): "en" | "vi" {
  // Check for Vietnamese characters
  const vietnamesePattern =
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  return vietnamesePattern.test(text) ? "vi" : "en";
}
```

### Step 11.2: Similar Tools Recommendation

```typescript
// convex/tools.ts

export const getSimilarTools = query({
  args: {
    toolId: v.id("aiTools"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get the source tool
    const tool = await ctx.db.get(args.toolId);

    if (!tool || !tool.embedding) {
      return [];
    }

    // Find similar tools using vector search
    const results = await ctx.db
      .query("aiTools")
      .withIndex("by_embedding")
      .filter((q) =>
        q.and(
          q.eq("isApproved", true),
          q.neq("_id", args.toolId) // Exclude the source tool
        )
      )
      .take((args.limit || 5) * 2);

    // Calculate similarity scores
    const scored = results
      .map((t) => {
        if (!t.embedding) return { ...t, _score: 0 };

        const score = cosineSimilarity(tool.embedding!, t.embedding);
        return { ...t, _score: score };
      })
      .sort((a, b) => b._score - a._score)
      .slice(0, args.limit || 5);

    return scored;
  },
});
```

```typescript
// components/SimilarTools.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface SimilarToolsProps {
  toolId: Id<"aiTools">;
}

export function SimilarTools({ toolId }: SimilarToolsProps) {
  const similar = useQuery(api.tools.getSimilarTools, {
    toolId,
    limit: 5
  });

  if (!similar || similar.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Similar Tools</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {similar.map((tool) => (
          <ToolCard key={tool._id} tool={tool} showScore />
        ))}
      </div>
    </div>
  );
}
```

### Step 11.3: Search Suggestions (Autocomplete)

```typescript
// convex/actions.ts

export const getSearchSuggestions = action({
  args: {
    partialQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.partialQuery.length < 2) {
      return [];
    }

    // Get popular searches that match
    const popular = await ctx.runQuery(api.analytics.getPopularSearches, {
      limit: 100,
    });

    // Filter and rank suggestions
    const suggestions = popular
      .filter((item) =>
        item.query.toLowerCase().includes(args.partialQuery.toLowerCase())
      )
      .slice(0, args.limit || 5)
      .map((item) => item.query);

    // Also add category-based suggestions
    const categories = await ctx.runQuery(api.tools.getAllCategories);
    const categorySuggestions = categories
      .filter((cat) =>
        cat.toLowerCase().includes(args.partialQuery.toLowerCase())
      )
      .map((cat) => `${cat} tools`);

    // Combine and deduplicate
    return [...new Set([...suggestions, ...categorySuggestions])].slice(
      0,
      args.limit || 5
    );
  },
});
```

```typescript
// components/SearchWithAutocomplete.tsx
"use client";

import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search } from "lucide-react";

export function SearchWithAutocomplete() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getSuggestions = useAction(api.actions.getSearchSuggestions);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      const results = await getSuggestions({
        partialQuery: query,
        limit: 5,
      });

      setSuggestions(results);
      setShowSuggestions(true);
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query, getSuggestions]);

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    // Trigger search
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search for AI tools..."
          className="w-full px-4 py-3 pl-12 rounded-lg border"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 11.4: Personalized Search Results

```typescript
// convex/schema.ts - Add user preferences

export default defineSchema({
  // ... existing tables

  userPreferences: defineTable({
    userId: v.string(),
    favoriteCategories: v.array(v.string()),
    searchHistory: v.array(v.string()),
    lastUpdated: v.number(),
  }).index("by_user", ["userId"]),
});
```

```typescript
// convex/actions.ts

export const personalizedSearch = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Fall back to regular search
      return await ctx.runAction(api.actions.semanticSearch, args);
    }

    const userId = identity.subject;

    // Get user preferences
    const prefs = await ctx.runQuery(api.users.getUserPreferences, { userId });

    // Get search results
    const apiKey = process.env.GEMINI_API_KEY!;
    const queryEmbedding = await generateEmbedding(args.query, apiKey);

    const results = await ctx.runQuery(api.tools.vectorSearchWithRanking, {
      vector: queryEmbedding,
      limit: (args.limit || 20) * 2, // Get more for personalization
    });

    // Boost results from user's favorite categories
    const personalized = results.map((tool: any) => {
      let boost = 1.0;

      if (prefs?.favoriteCategories.includes(tool.category)) {
        boost = 1.2; // 20% boost for favorite categories
      }

      return {
        ...tool,
        _finalScore: tool._finalScore * boost,
      };
    });

    // Re-sort and return
    return personalized
      .sort((a, b) => b._finalScore - a._finalScore)
      .slice(0, args.limit || 20);
  },
});
```

---

## 📖 Usage Documentation

### For Developers

#### Setup

```bash
# 1. Install dependencies
npm install @google/generative-ai

# 2. Get Gemini API key from Google AI Studio
# https://makersuite.google.com/app/apikey

# 3. Add to Convex environment
npx convex env set GEMINI_API_KEY your_key_here

# 4. Deploy schema
npx convex deploy

# 5. Generate embeddings for existing tools
npx convex run actions:generateAllEmbeddings
```

#### Basic Usage

```typescript
// In your component
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

function SearchComponent() {
  const search = useAction(api.actions.semanticSearch);

  const handleSearch = async (query: string) => {
    const results = await search({
      query,
      limit: 20,
      language: "en" // optional
    });

    console.log(results);
  };

  return <SearchBar onSearch={handleSearch} />;
}
```

#### Advanced Usage

```typescript
// Hybrid search (recommended for best results)
const results = await hybridSearch({
  query: "AI writing assistant",
  limit: 20,
  category: "Writing", // optional filter
  pricing: "free", // optional filter
});

// With caching (for better performance)
const results = await semanticSearchCached({
  query: "image generator",
  limit: 10,
});

// Get similar tools
const similar = await getSimilarTools({
  toolId: currentToolId,
  limit: 5,
});
```

### For End Users

#### Search Tips

1. **Be descriptive:** Instead of "writing tool", try "help me write blog posts faster"
2. **Natural language works:** "I need something to create videos" is better than "video tool"
3. **Try different phrasings:** If you don't find what you want, rephrase your query
4. **Use filters:** Narrow down by category, pricing, or language
5. **Check similar tools:** When you find one good tool, see "Similar Tools" section

#### Example Queries

**Good queries:**

- ✅ "I need to create professional images from text descriptions"
- ✅ "Help me automate my social media posting"
- ✅ "Tool for translating Vietnamese to English"
- ✅ "Write code faster with AI assistance"

**Less effective queries:**

- ❌ "tool" (too vague)
- ❌ "AI" (too broad)
- ❌ "best" (subjective)

---

## 🔧 Troubleshooting

### Common Issues

#### 1. "GEMINI_API_KEY not configured"

```bash
# Solution: Set the API key
npx convex env set GEMINI_API_KEY your_key_here
```

#### 2. "Rate limit exceeded"

```typescript
// Solution: Implement rate limiting or upgrade to paid tier
// Free tier: 15 requests/minute
// Add delays between requests in batch generation
```

#### 3. "Embedding is undefined"

```typescript
// Solution: Generate embeddings for tools
npx convex run actions:generateToolEmbedding '{"toolId": "xxx"}'

// Or generate for all:
npx convex run actions:generateAllEmbeddings
```

#### 4. "Search returns no results"

```typescript
// Check if embeddings exist:
npx convex run tools:getEmbeddingStats

// Check if tools are approved:
npx convex run tools:getToolById '{"id": "xxx"}'
// Verify isApproved: true
```

#### 5. "Vector index not found"

```typescript
// Solution: Ensure schema has vectorIndex
// Push schema again:
npx convex deploy
```

#### 6. "Slow search performance"

```typescript
// Solutions:
// 1. Enable caching (see Phase 7.1)
// 2. Reduce limit in queries
// 3. Use pagination
// 4. Optimize filters
```

### Performance Tips

1. **Use caching aggressively** - Cache popular queries for 1 hour
2. **Implement pagination** - Don't load all results at once
3. **Batch embedding generation** - Process multiple tools together
4. **Use filters** - Reduce search space with category/language filters
5. **Monitor Gemini quotas** - Track daily usage to avoid limits

### Debug Mode

```typescript
// Add debug logging to search
export const semanticSearchDebug = action({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    console.log("Query:", args.query);

    const start = Date.now();
    const embedding = await generateEmbedding(args.query, apiKey);
    console.log("Embedding generated in:", Date.now() - start, "ms");

    const searchStart = Date.now();
    const results = await ctx.runQuery(api.tools.vectorSearch, {
      vector: embedding,
      limit: 20,
    });
    console.log("Search completed in:", Date.now() - searchStart, "ms");
    console.log("Results count:", results.length);

    return results;
  },
});
```

---

## 📚 Resources

### Documentation

- [Convex Vector Search](https://docs.convex.dev/database/vector-search)
- [Google Gemini API](https://ai.google.dev/docs)
- [Gemini Embeddings Guide](https://ai.google.dev/docs/embeddings_guide)

### Tools

- [Google AI Studio](https://makersuite.google.com/) - Get API keys and test
- [Convex Dashboard](https://dashboard.convex.dev/) - Monitor your app

### Learning

- [Understanding Embeddings](https://developers.google.com/machine-learning/crash-course/embeddings/video-lecture)
- [Vector Search Explained](https://www.pinecone.io/learn/vector-search/)

---

## ✅ Launch Checklist

### Pre-Launch

- [ ] Schema deployed with vectorIndex
- [ ] GEMINI_API_KEY configured
- [ ] All tools have embeddings
- [ ] Search works for sample queries
- [ ] Filters work correctly
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] Caching enabled
- [ ] Analytics tracking setup
- [ ] Admin dashboard created

### Launch Day

- [ ] Monitor search health
- [ ] Watch for errors in logs
- [ ] Check Gemini API usage
- [ ] Verify cache hit rate
- [ ] Test with real users
- [ ] Collect feedback

### Post-Launch

- [ ] Review analytics weekly
- [ ] Fix zero-result queries
- [ ] Optimize slow queries
- [ ] Update embeddings for modified tools
- [ ] A/B test ranking algorithms
- [ ] Gather user feedback

---

## 🎯 Success Metrics

Track these KPIs to measure success:

### Search Quality

- **Relevance rate:** % of searches where user clicks top 3 results (target: >70%)
- **Zero results rate:** % of searches with no results (target: <5%)
- **Average position of clicked result** (target: <5)

### Performance

- **Average search time** (target: <1.5s)
- **Cache hit rate** (target: >50%)
- **API error rate** (target: <1%)

### Usage

- **Searches per user** (higher is better)
- **Repeat search rate** (lower is better - means they found it first time)
- **Similar tools click rate** (measures discovery)

### Cost

- **Cost per 1,000 searches** (target: <$0.02)
- **API calls per search** (target: <1.5 with caching)

---

## 🚀 Next Steps

After implementing semantic search, consider:

1. **Add voice search** - Use Gemini's speech-to-text API
2. **Image-based search** - Let users upload screenshots of tools
3. **AI-powered tool recommendations** - "Based on your favorites..."
4. **Trending searches dashboard** - Show what others are searching
5. **Advanced filters** - Pricing range, release date, rating
6. **Search history** - Let users revisit past searches
7. **Export search results** - CSV, PDF export
8. **API for developers** - Let others build on your search

---

## 🎉 Conclusion

You now have a complete plan to implement semantic search with Google Gemini embeddings in your Convex-based AI tool database!

### Key Benefits:

✅ **Free tier** - 1,500 searches/day at no cost  
✅ **Incredibly cheap** - 100x cheaper than OpenAI  
✅ **Natural language** - Users can search how they think  
✅ **Multilingual** - Works great with Vietnamese + English  
✅ **Fast** - With caching, searches complete in <1s  
✅ **Scalable** - Can handle millions of searches

### Timeline:

- **Week 1:** Setup, schema, embeddings generation
- **Week 2:** Search implementation, frontend
- **Week 3:** Optimization, analytics, testing
- **Week 4:** Launch and monitoring

**Total: 2-4 weeks from start to production** 🚀

Good luck with your implementation! If you have questions, refer to the Troubleshooting section or Convex/Gemini documentation.

---

_Last updated: 2024_
_Gemini API version: gemini-embedding-001_
_Convex version: Latest_

````

### Step 6.2: Regenerate on Tool Update

```typescript
// convex/tools.ts

export const updateTool = mutation({
  args: {
    toolId: v.id("aiTools"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    // ... other fields
  },
  handler: async (ctx, args) => {
    const { toolId, ...updates } = args;

    // Update tool
    await ctx.db.patch(toolId, updates);

    // If name/description/tags/category changed, regenerate embedding
    const shouldRegenerateEmbedding =
      updates.name ||
      updates.description ||
      updates.tags ||
      updates.category;

    if (shouldRegenerateEmbedding) {
      await ctx.scheduler.runAfter(0, api.actions.generateToolEmbedding, {
        toolId: toolId,
      });
    }

    return toolId;
  },
});
````
