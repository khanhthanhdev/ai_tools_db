# Implementation Plan

- [x] 1. Setup and Configuration

  - Install @google/generative-ai package via npm
  - Set GEMINI_API_KEY environment variable in Convex
  - Verify API key is accessible in Convex environment
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Update Database Schema

  - [x] 2.1 Update aiTools vector index to 768 dimensions
    - Modify vectorIndex configuration in convex/schema.ts
    - Add embeddingVersion field to track model used
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.2 Create searchCache table
    - Define searchCache table with query, queryHash, results, embedding, timestamps, hitCount fields
    - Add indexes for by_query_hash and by_expires
    - _Requirements: 6.1, 6.2_
  - [x] 2.3 Create searchAnalytics table
    - Define searchAnalytics table with query, userId, resultsCount, clickedToolId, clickedPosition, timestamp, searchType fields
    - Add indexes for by_timestamp, by_query, by_user
    - _Requirements: 8.1, 8.2_

- [x] 3. Implement Gemini Integration

  - [x] 3.1 Create Gemini client utilities
    - Create convex/lib/gemini.ts file
    - Implement getGeminiClient() function
    - Implement generateEmbedding() function for single text
    - Implement generateEmbeddingsBatch() function for multiple texts
    - Handle API errors and rate limiting
    - _Requirements: 1.3, 1.4, 1.6_
  - [x] 3.2 Create embedding helper functions
    - Create convex/lib/embeddingHelpers.ts file
    - Implement createEmbeddingText() to combine tool fields
    - Implement createEmbeddingTextShort() for cost optimization
    - _Requirements: 3.2_

- [x] 4. Implement Embedding Generation

  - [x] 4.1 Create single tool embedding action
    - Create generateToolEmbedding action in convex/actions.ts
    - Retrieve tool data and construct embedding text
    - Call Gemini API to generate embedding
    - Store embedding and version in database via mutation
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 4.2 Create batch embedding generation action
    - Create generateAllEmbeddings action for processing all tools
    - Implement rate limiting (4 seconds between requests)
    - Handle errors and continue processing remaining tools
    - Return statistics on success/failure counts
    - _Requirements: 3.4, 3.5, 3.6, 3.7_
  - [x] 4.3 Add embedding mutations and queries
    - Create updateToolEmbedding mutation in convex/aiTools.ts
    - Create getToolsWithoutEmbeddings query
    - Create getEmbeddingStats query for monitoring coverage
    - _Requirements: 3.6_
  - [x] 4.4 Auto-generate embeddings on tool creation
    - Update addTool mutation to schedule embedding generation
    - Use ctx.scheduler.runAfter to generate asynchronously
    - _Requirements: 3.1_
  - [x] 4.5 Regenerate embeddings on tool updates
    - Update updateTool mutation to detect relevant field changes
    - Schedule embedding regeneration when name, description, category, or tags change
    - _Requirements: 3.3_

- [x] 5. Implement Vector Search

  - [x] 5.1 Create cosine similarity helper
    - Implement cosineSimilarity() function in convex/aiTools.ts
    - Handle edge cases (zero vectors, different lengths)
    - _Requirements: 4.3_
  - [x] 5.2 Create vector search query
    - Create vectorSearch query in convex/aiTools.ts
    - Use by_embedding vector index with filters
    - Calculate similarity scores for results
    - Sort results by score descending
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  - [x] 5.3 Create semantic search action
    - Create semanticSearch action in convex/actions.ts
    - Generate query embedding via Gemini API
    - Call vectorSearch query with embedding and filters
    - Implement fallback to keyword search on error
    - _Requirements: 4.1, 4.2, 4.6, 4.7_

- [x] 6. Implement Hybrid Search

  - [x] 6.1 Create hybrid search action
    - Create hybridSearch action in convex/actions.ts
    - Execute both semantic and keyword searches
    - Merge results with semantic prioritized
    - Deduplicate tools appearing in both result sets
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Implement Search Caching

  - [x] 7.1 Create cache helper functions
    - Create convex/lib/cache.ts file
    - Implement hashQuery() for consistent query hashing
    - Implement getCacheExpiry() for 1-hour expiration
    - _Requirements: 6.1, 6.4_
  - [x] 7.2 Create cache queries and mutations
    - Create convex/cache.ts file
    - Implement getCachedSearch query
    - Implement storeSearchCache mutation
    - Implement incrementCacheHit mutation
    - Implement cleanupExpiredCache mutation
    - _Requirements: 6.2, 6.3, 6.5_
  - [x] 7.3 Integrate caching into semantic search
    - Update semanticSearch action to check cache first
    - Store results in cache after successful search
    - Increment hit count when cache is used
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 8. Implement Search Analytics

  - [x] 8.1 Create analytics mutations

    - Create convex/analytics.ts file
    - Implement logSearch mutation to track searches
    - Implement logSearchClick mutation to track result clicks
    - _Requirements: 8.1, 8.2_

  - [x] 8.2 Create analytics queries

    - Implement getPopularSearches query
    - Implement getZeroResultQueries query

    - _Requirements: 8.3, 8.4_

  - [x] 8.3 Integrate analytics into search flow


    - Add logSearch call to search actions
    - Track query, result count, and search type
    - _Requirements: 8.1_

- [x] 9. Implement Similar Tools Feature

  - [x] 9.1 Create similar tools query
    - Create getSimilarTools query in convex/aiTools.ts
    - Use vector search to find tools with similar embeddings
    - Exclude the source tool from results
    - Limit to 5 most similar tools
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 10. Create Frontend Search Components

  - [x] 10.1 Create semantic search bar component
    - Create src/components/SemanticSearchBar.tsx
    - Add search input with natural language placeholder
    - Add example query suggestions when empty
    - Add search type toggle (semantic/hybrid)
    - Add loading indicator during search
    - Display results in grid layout
    - Handle empty results with helpful message
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.7, 7.8_
  - [x] 10.2 Integrate semantic search into BrowsePage

    - Add search mode toggle to BrowsePage (keyword/semantic)

    - When semantic mode is active, replace SearchBar with SemanticSearchBar
    - Pass existing filters (category, pricing, language) to SemanticSearchBar
    - Maintain existing UI layout and animations
    - Add smooth transition between search modes
    - _Requirements: 7.8, 4.4, 4.5_

  - [x] 10.3 Update ToolsList to support semantic results

    - Modify ToolsList component to accept optional semantic results prop
    - Display similarity scores when available (from \_score field)
    - Maintain existing pagination and category grouping logic
    - Add visual indicator for semantic vs keyword results
    - _Requirements: 7.6, 7.8_

  - [x] 10.4 Create similar tools section component

    - Create src/components/SimilarTools.tsx
    - Fetch similar tools using getSimilarTools query
    - Display up to 5 similar tools in horizontal carousel or grid
    - Show similarity scores as percentage badges
    - Hide section if no similar tools found or no embeddings
    - Add to ToolDetailPage below main tool information
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 10.5 Add navigation to semantic search
    - Add "Semantic Search" link to main navigation menu
    - Create route in App.tsx pointing to BrowsePage with semantic mode enabled
    - Or create dedicated SearchPage.tsx with only semantic search
    - Update Layout component to highlight active search mode
    - _Requirements: 7.1, 7.2_

- [ ] 11. Implement Rate Limiting

  - [x] 11.1 Create rate limiting utilities

    - Create convex/lib/rateLimit.ts file
    - Implement checkRateLimit() function
    - Track requests per user per time window
    - _Requirements: 6.6, 11.1_

  - [x] 11.2 Apply rate limiting to search actions

    - Add rate limit check to semanticSearch action
    - Limit to 15 searches per minute per user
    - Return user-friendly error message when exceeded
    - _Requirements: 6.6, 11.1_

- [ ] 12. Implement Monitoring Dashboard

  - [ ] 12.1 Create monitoring queries
    - Create convex/monitoring.ts file
    - Implement getSearchHealth query for 24h metrics
    - Implement getEmbeddingCoverage query
    - _Requirements: 8.5, 8.6, 8.7_
  - [ ] 12.2 Create analytics dashboard page
    - Create src/pages/SearchAnalyticsPage.tsx
    - Display health metrics cards (searches, CTR, zero-result rate, coverage)
    - Show popular searches list
    - Show zero-result queries for improvement
    - Add route for admin access
    - _Requirements: 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 13. Add Multilingual Support

  - [x] 13.1 Add translations for search UI
    - Search-related translations already exist in SemanticSearchBar component
    - Includes placeholders, labels, error messages in both languages
    - _Requirements: 7.1, 7.7, 10.5_
  - [ ] 13.2 Test multilingual embeddings
    - Test embedding generation with Vietnamese text
    - Verify search works across languages
    - Test Vietnamese queries return relevant results
    - _Requirements: 10.1, 10.2, 10.4_

- [x] 14. Implement Error Handling

  - [x] 14.1 Add API error handling
    - Handle missing GEMINI_API_KEY with clear error
    - Handle rate limit errors with retry logic
    - Handle network errors gracefully
    - _Requirements: 1.5, 1.6, 12.1, 12.2_
  - [x] 14.2 Add search fallback mechanisms
    - Implement automatic fallback to keyword search
    - Log errors for debugging
    - Display user-friendly error messages
    - _Requirements: 4.6, 12.3, 12.4, 12.5, 12.6_
  - [x] 14.3 Add embedding generation error handling
    - Allow tool creation even if embedding fails
    - Log embedding failures for retry
    - Continue batch processing on individual failures
    - _Requirements: 3.5, 12.3_

- [ ] 15. Run Initial Embedding Generation
  - [ ] 15.1 Generate embeddings for existing tools
    - Run generateAllEmbeddings action via Convex dashboard
    - Monitor progress using getEmbeddingStats query
    - Handle rate limiting appropriately
    - Verify all tools have embeddings
    - _Requirements: 3.4, 3.5, 3.6, 11.1, 11.5_
