# Design Document

## Overview

This document outlines the technical design for implementing semantic search in the AI Tools Database using Google Gemini's gemini-embedding-001 model and Convex's vector search capabilities. The design focuses on providing users with natural language search while maintaining performance, cost-efficiency, and reliability.

The system will migrate from OpenAI embeddings (1536 dimensions) to Google Gemini embeddings (768 dimensions) to take advantage of the free tier (1,500 requests/day) and lower costs. The implementation will be backward-compatible and include automatic embedding generation, caching, and fallback mechanisms.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Search Page  │  │ Tool Detail  │  │ Browse Page  │         │
│  │              │  │ (Similar)    │  │ (Enhanced)   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Convex Backend Layer                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Actions (API Calls)                    │  │
│  │  • semanticSearch      • hybridSearch                     │  │
│  │  • generateEmbedding   • generateAllEmbeddings            │  │
│  └────────┬─────────────────────────────────┬────────────────┘  │
│           │                                  │                   │
│  ┌────────▼──────────┐            ┌─────────▼────────────┐     │
│  │  Queries/Mutations │            │   Cache Layer        │     │
│  │  • vectorSearch    │◄───────────┤  • getCachedSearch   │     │
│  │  • keywordSearch   │            │  • storeSearchCache  │     │
│  │  • getSimilarTools │            └──────────────────────┘     │
│  └────────┬───────────┘                                          │
│           │                                                      │
└───────────┼──────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Convex Database                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   aiTools    │  │ searchCache  │  │ searchAnalytics│        │
│  │ (embeddings) │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Google Gemini API                             │
│              gemini-embedding-001 (768 dimensions)                 │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

**Search Flow:**
1. User enters natural language query in search interface
2. Frontend calls `semanticSearch` or `hybridSearch` action
3. Action checks cache for existing embedding
4. If cache miss, generates embedding via Gemini API
5. Performs vector search in Convex database
6. Applies filters (language, category, pricing)
7. Calculates similarity scores and ranks results
8. Stores query in cache and analytics
9. Returns results to frontend

**Embedding Generation Flow:**
1. Tool is created or updated via mutation
2. Mutation schedules `generateToolEmbedding` action
3. Action retrieves tool data and constructs embedding text
4. Calls Gemini API to generate 768-dimensional vector
5. Stores embedding and version in database
6. Tool becomes searchable via semantic search

## Components and Interfaces

### Backend Components

#### 1. Gemini Integration Module (`convex/lib/gemini.ts`)

```typescript
interface GeminiClient {
  getGeminiClient(apiKey: string): GoogleGenerativeAI;
  generateEmbedding(text: string, apiKey: string): Promise<number[]>;
  generateEmbeddingsBatch(texts: string[], apiKey: string): Promise<number[][]>;
}
```

**Responsibilities:**
- Initialize Google Gemini client
- Generate single embeddings (768 dimensions)
- Generate batch embeddings for efficiency
- Handle API errors and rate limiting

**Key Functions:**
- `getGeminiClient()`: Creates and returns configured Gemini client
- `generateEmbedding()`: Generates embedding for single text string
- `generateEmbeddingsBatch()`: Generates embeddings for multiple texts in one call

#### 2. Embedding Helpers (`convex/lib/embeddingHelpers.ts`)

```typescript
interface EmbeddingHelpers {
  createEmbeddingText(tool: Tool): string;
  createEmbeddingTextShort(tool: Tool): string;
}

interface Tool {
  name: string;
  description: string;
  category: string;
  tags: string[];
  pricing: string;
}
```

**Responsibilities:**
- Construct optimal text representation for embeddings
- Combine multiple tool fields into coherent text
- Provide short and long versions for cost optimization

**Text Construction Strategy:**
```
Tool Name: [name]
Description: [description]
Category: [category]
Features: [tags joined]
Pricing Model: [pricing]
```

#### 3. Cache Management (`convex/lib/cache.ts`)

```typescript
interface CacheHelpers {
  hashQuery(query: string): string;
  getCacheExpiry(): number;
}
```

**Responsibilities:**
- Generate consistent hash for query strings
- Calculate cache expiration timestamps
- Normalize queries for better cache hits

**Cache Strategy:**
- Hash queries using simple hash function
- 1-hour expiration for cached results
- Track hit counts for analytics

#### 4. Search Actions (`convex/actions.ts`)

```typescript
// Semantic search with Gemini embeddings
export const semanticSearch = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
    category: v.optional(v.string()),
    pricing: v.optional(v.union(v.literal("free"), v.literal("freemium"), v.literal("paid"))),
  },
  handler: async (ctx, args) => { /* implementation */ }
});

// Hybrid search combining semantic + keyword
export const hybridSearch = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => { /* implementation */ }
});

// Generate embedding for single tool
export const generateToolEmbedding = action({
  args: { toolId: v.id("aiTools") },
  handler: async (ctx, args) => { /* implementation */ }
});

// Batch generate embeddings for all tools
export const generateAllEmbeddings = action({
  args: {},
  handler: async (ctx, args) => { /* implementation */ }
});
```

#### 5. Search Queries (`convex/aiTools.ts` extensions)

```typescript
// Vector search with similarity scoring
export const vectorSearch = query({
  args: {
    vector: v.array(v.number()),
    limit: v.number(),
    language: v.optional(v.union(v.literal("en"), v.literal("vi"))),
    category: v.optional(v.string()),
    pricing: v.optional(v.union(v.literal("free"), v.literal("freemium"), v.literal("paid"))),
  },
  handler: async (ctx, args) => { /* implementation */ }
});

// Get similar tools based on embeddings
export const getSimilarTools = query({
  args: {
    toolId: v.id("aiTools"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => { /* implementation */ }
});

// Get tools without embeddings (for migration)
export const getToolsWithoutEmbeddings = query({
  args: {},
  handler: async (ctx, args) => { /* implementation */ }
});

// Get embedding statistics
export const getEmbeddingStats = query({
  args: {},
  handler: async (ctx, args) => { /* implementation */ }
});
```

#### 6. Cache Queries and Mutations (`convex/cache.ts`)

```typescript
export const getCachedSearch = query({
  args: { queryHash: v.string() },
  handler: async (ctx, args) => { /* implementation */ }
});

export const storeSearchCache = mutation({
  args: {
    query: v.string(),
    queryHash: v.string(),
    results: v.array(v.id("aiTools")),
    embedding: v.array(v.number()),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => { /* implementation */ }
});

export const incrementCacheHit = mutation({
  args: { cacheId: v.id("searchCache") },
  handler: async (ctx, args) => { /* implementation */ }
});

export const cleanupExpiredCache = mutation({
  args: {},
  handler: async (ctx, args) => { /* implementation */ }
});
```

#### 7. Analytics (`convex/analytics.ts`)

```typescript
export const logSearch = mutation({
  args: {
    query: v.string(),
    resultsCount: v.number(),
    searchType: v.string(),
  },
  handler: async (ctx, args) => { /* implementation */ }
});

export const logSearchClick = mutation({
  args: {
    query: v.string(),
    toolId: v.id("aiTools"),
    position: v.number(),
  },
  handler: async (ctx, args) => { /* implementation */ }
});

export const getPopularSearches = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => { /* implementation */ }
});

export const getZeroResultQueries = query({
  args: {},
  handler: async (ctx, args) => { /* implementation */ }
});
```

### Frontend Components

#### 1. Enhanced Search Bar (`src/components/SemanticSearchBar.tsx`)

```typescript
interface SemanticSearchBarProps {
  language: "en" | "vi";
  onResultsChange?: (results: Tool[]) => void;
}

export function SemanticSearchBar({ language, onResultsChange }: SemanticSearchBarProps) {
  // State management
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"semantic" | "hybrid">("hybrid");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Tool[]>([]);
  
  // Convex hooks
  const semanticSearch = useAction(api.actions.semanticSearch);
  const hybridSearch = useAction(api.actions.hybridSearch);
  
  // Search handler
  const handleSearch = async () => { /* implementation */ };
  
  return (
    <div>
      {/* Search input with example queries */}
      {/* Search type toggle (semantic/hybrid) */}
      {/* Results display */}
    </div>
  );
}
```

**Features:**
- Natural language search input
- Example query suggestions
- Search type toggle (semantic/hybrid)
- Loading states
- Results grid with tool cards
- Empty state handling

#### 2. Tool Card with Score (`src/components/ToolCardWithScore.tsx`)

```typescript
interface ToolCardWithScoreProps {
  tool: Tool & { _score?: number };
  showScore?: boolean;
  onClick?: () => void;
}

export function ToolCardWithScore({ tool, showScore, onClick }: ToolCardWithScoreProps) {
  return (
    <div>
      {/* Tool information */}
      {/* Similarity score badge (if showScore) */}
      {/* Click handler for analytics */}
    </div>
  );
}
```

#### 3. Similar Tools Section (`src/components/SimilarTools.tsx`)

```typescript
interface SimilarToolsProps {
  toolId: Id<"aiTools">;
  language: "en" | "vi";
}

export function SimilarTools({ toolId, language }: SimilarToolsProps) {
  const similarTools = useQuery(api.aiTools.getSimilarTools, { toolId, limit: 5 });
  
  if (!similarTools || similarTools.length === 0) return null;
  
  return (
    <section>
      <h2>Similar Tools</h2>
      <div className="grid">
        {similarTools.map(tool => (
          <ToolCardWithScore key={tool._id} tool={tool} showScore />
        ))}
      </div>
    </section>
  );
}
```

#### 4. Search Analytics Dashboard (`src/pages/SearchAnalyticsPage.tsx`)

```typescript
export function SearchAnalyticsPage() {
  const health = useQuery(api.monitoring.getSearchHealth);
  const coverage = useQuery(api.monitoring.getEmbeddingCoverage);
  const popular = useQuery(api.analytics.getPopularSearches, { limit: 10 });
  const zeroResults = useQuery(api.analytics.getZeroResultQueries);
  
  return (
    <div>
      {/* Health metrics cards */}
      {/* Popular searches list */}
      {/* Zero-result queries for improvement */}
      {/* Embedding coverage stats */}
    </div>
  );
}
```

## Data Models

### Updated aiTools Schema

```typescript
aiTools: defineTable({
  // Existing fields
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
  normalizedName: v.optional(v.string()),
  averageRating: v.optional(v.number()),
  totalReviews: v.optional(v.number()),
  totalFavourites: v.optional(v.number()),
  ratingSum: v.optional(v.number()),
  
  // Updated for Gemini
  embedding: v.optional(v.array(v.number())), // 768 dimensions
  embeddingVersion: v.optional(v.string()), // "gemini-embedding-001"
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
  // Updated vector index for Gemini (768 dimensions)
  .vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 768, // Changed from 1536 (OpenAI) to 768 (Gemini)
    filterFields: ["isApproved", "language", "category", "pricing"],
  })
  .searchIndex("search_tools", {
    searchField: "name",
    filterFields: ["category", "pricing", "language", "isApproved"],
  })
```

### New searchCache Table

```typescript
searchCache: defineTable({
  query: v.string(),              // Original query text
  queryHash: v.string(),          // Hash for fast lookup
  results: v.array(v.id("aiTools")), // Tool IDs in result set
  embedding: v.array(v.number()), // Query embedding (768 dims)
  createdAt: v.number(),          // Timestamp
  expiresAt: v.number(),          // Expiration timestamp
  hitCount: v.number(),           // Number of cache hits
})
  .index("by_query_hash", ["queryHash"])
  .index("by_expires", ["expiresAt"])
```

### New searchAnalytics Table

```typescript
searchAnalytics: defineTable({
  query: v.string(),                    // Search query
  userId: v.optional(v.string()),       // User who searched
  resultsCount: v.number(),             // Number of results
  clickedToolId: v.optional(v.id("aiTools")), // Tool clicked (if any)
  clickedPosition: v.optional(v.number()),    // Position in results
  timestamp: v.number(),                // When search occurred
  searchType: v.string(),               // "semantic", "keyword", "hybrid", "click"
})
  .index("by_timestamp", ["timestamp"])
  .index("by_query", ["query"])
  .index("by_user", ["userId"])
```

## Error Handling

### Error Handling Strategy

**1. API Key Missing:**
```typescript
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY not configured. Please set it in Convex environment.");
}
```

**2. Rate Limit Exceeded:**
```typescript
try {
  const embedding = await generateEmbedding(text, apiKey);
} catch (error: any) {
  if (error.message?.includes("RESOURCE_EXHAUSTED")) {
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, 60000));
    return await generateEmbedding(text, apiKey);
  }
  throw error;
}
```

**3. Embedding Generation Failure:**
```typescript
try {
  const queryEmbedding = await generateEmbedding(query, apiKey);
  return await vectorSearch(queryEmbedding, filters);
} catch (error) {
  console.error("Semantic search failed, falling back to keyword:", error);
  return await keywordSearch(query, filters);
}
```

**4. Vector Search Failure:**
```typescript
try {
  return await ctx.db.query("aiTools").withIndex("by_embedding", ...).take(limit);
} catch (error) {
  console.error("Vector search failed:", error);
  // Fall back to regular query
  return await ctx.db.query("aiTools").filter(...).take(limit);
}
```

**5. Cache Errors:**
```typescript
try {
  const cached = await getCachedSearch(queryHash);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.results;
  }
} catch (error) {
  console.error("Cache lookup failed, proceeding with fresh search:", error);
  // Continue with normal search flow
}
```

### Error Messages for Users

```typescript
const errorMessages = {
  en: {
    rateLimitExceeded: "Too many searches. Please wait a moment and try again.",
    searchFailed: "Search failed. Please try again or use different keywords.",
    noResults: "No tools found for your query. Try different keywords or check filters.",
    apiError: "Service temporarily unavailable. Please try again later.",
  },
  vi: {
    rateLimitExceeded: "Quá nhiều tìm kiếm. Vui lòng đợi một chút và thử lại.",
    searchFailed: "Tìm kiếm thất bại. Vui lòng thử lại hoặc sử dụng từ khóa khác.",
    noResults: "Không tìm thấy công cụ nào. Thử từ khóa khác hoặc kiểm tra bộ lọc.",
    apiError: "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.",
  },
};
```

## Testing Strategy

### Unit Tests

**1. Embedding Generation:**
- Test single embedding generation
- Test batch embedding generation
- Test error handling for invalid API keys
- Test rate limit handling

**2. Cache Functions:**
- Test query hashing consistency
- Test cache expiration logic
- Test cache hit/miss scenarios

**3. Similarity Calculation:**
- Test cosine similarity with known vectors
- Test edge cases (zero vectors, identical vectors)

### Integration Tests

**1. Search Flow:**
- Test semantic search end-to-end
- Test hybrid search merging logic
- Test filter application
- Test fallback to keyword search

**2. Embedding Generation Flow:**
- Test automatic embedding on tool creation
- Test embedding regeneration on updates
- Test batch generation with rate limiting

**3. Cache Integration:**
- Test cache storage and retrieval
- Test cache expiration cleanup
- Test cache hit rate tracking

### Performance Tests

**1. Search Performance:**
- Measure search latency (target: <2s)
- Test with various query lengths
- Test with different filter combinations

**2. Embedding Generation:**
- Measure time per embedding
- Test batch processing efficiency
- Verify rate limit compliance

**3. Cache Performance:**
- Measure cache hit rate (target: >50%)
- Test cache lookup speed
- Monitor cache size growth

### Manual Testing Checklist

**Search Quality:**
- [ ] Natural language queries return relevant results
- [ ] Vietnamese queries work correctly
- [ ] Filters combine properly with semantic search
- [ ] Similar tools are actually similar
- [ ] Score percentages make sense

**User Experience:**
- [ ] Search completes within 2 seconds
- [ ] Loading states display correctly
- [ ] Error messages are helpful
- [ ] Example queries guide users
- [ ] Results display properly on mobile

**Edge Cases:**
- [ ] Empty query handling
- [ ] Very long queries (500+ chars)
- [ ] Special characters in queries
- [ ] No results scenario
- [ ] API unavailable scenario

## Migration Strategy

### Phase 1: Schema Update (No Breaking Changes)

1. Update vector index dimensions from 1536 to 768
2. Add `embeddingVersion` field
3. Deploy schema changes
4. Existing embeddings remain but won't be used

### Phase 2: Parallel Embedding Generation

1. Install `@google/generative-ai` package
2. Set `GEMINI_API_KEY` environment variable
3. Deploy embedding generation code
4. Run batch generation for all tools (respecting rate limits)
5. Monitor progress via `getEmbeddingStats` query

### Phase 3: Enable Semantic Search

1. Deploy search actions and queries
2. Test with small user group
3. Monitor performance and quality
4. Gradually roll out to all users

### Phase 4: Frontend Integration

1. Create semantic search components
2. Add to existing browse page
3. Create dedicated search page
4. Add similar tools to detail pages

### Phase 5: Optimization

1. Enable caching
2. Implement analytics
3. Monitor and tune performance
4. Optimize based on usage patterns

## Performance Considerations

### Optimization Strategies

**1. Caching:**
- Cache query embeddings for 1 hour
- Target 50%+ cache hit rate
- Reduce API calls by 50%

**2. Batch Processing:**
- Generate embeddings in batches of 5-10
- Respect rate limits (4s between requests)
- Process during off-peak hours

**3. Query Optimization:**
- Use vector index filters efficiently
- Limit result sets appropriately
- Paginate large result sets

**4. Frontend Optimization:**
- Debounce search input (300ms)
- Show loading states immediately
- Cache results in component state
- Lazy load tool cards

### Performance Targets

- **Search Latency:** <2 seconds (p95)
- **Cache Hit Rate:** >50%
- **Embedding Generation:** <1 second per tool
- **API Cost:** <$0.02 per 1000 searches
- **Uptime:** >99.5%

## Security Considerations

**1. API Key Protection:**
- Store GEMINI_API_KEY in Convex environment (server-side only)
- Never expose API key to frontend
- Rotate keys periodically

**2. Rate Limiting:**
- Implement per-user rate limits (15 searches/minute)
- Track usage to prevent abuse
- Throttle batch operations

**3. Input Validation:**
- Sanitize search queries
- Limit query length (max 500 chars)
- Validate filter parameters

**4. Data Privacy:**
- Log queries without PII
- Anonymize analytics data
- Respect user privacy preferences

## Monitoring and Observability

### Key Metrics to Track

**Search Quality:**
- Click-through rate (CTR)
- Zero-result rate
- Average result position clicked
- Search-to-click time

**Performance:**
- Search latency (p50, p95, p99)
- Cache hit rate
- API response time
- Error rate

**Cost:**
- API calls per day
- Cache efficiency
- Cost per search
- Total monthly cost

**Usage:**
- Searches per day
- Unique users searching
- Popular queries
- Failed searches

### Monitoring Dashboard

Create admin dashboard showing:
- Real-time search health
- Embedding coverage percentage
- Popular search queries
- Zero-result queries (for improvement)
- API usage and costs
- Cache performance

## Future Enhancements

**Phase 2 Features:**
1. Query expansion for short queries
2. Personalized search based on user history
3. Search suggestions/autocomplete
4. Multi-language query translation
5. Image-based search (upload tool screenshot)
6. Voice search integration
7. Advanced ranking with multiple signals
8. A/B testing framework for ranking algorithms

**Potential Improvements:**
- Implement re-ranking with user engagement signals
- Add query understanding (intent detection)
- Support for complex queries with operators
- Semantic filters (e.g., "tools similar to X")
- Export search results
- Search API for developers
