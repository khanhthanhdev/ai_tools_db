# Requirements Document

## Introduction

This feature will implement semantic search functionality for the AI Knowledge Cloud, allowing users to search for tools using natural language descriptions instead of just keyword matching. The implementation will use Google Gemini's gemini-embedding-001 model for generating vector embeddings and Convex's vector search capabilities for finding relevant tools. This will significantly improve the user experience by understanding the intent behind search queries like "I need something to help me write blog posts faster" rather than requiring exact keyword matches.

## Requirements

### Requirement 1: Google Gemini API Integration

**User Story:** As a developer, I want to integrate Google Gemini API for generating embeddings, so that the system can convert text into vector representations for semantic search.

#### Acceptance Criteria

1. WHEN the system is configured THEN it SHALL have the GEMINI_API_KEY environment variable set in Convex
2. WHEN the application starts THEN it SHALL have the @google/generative-ai package installed and available
3. WHEN a text needs to be embedded THEN the system SHALL use the gemini-embedding-001 model
4. WHEN an embedding is generated THEN it SHALL return a 768-dimensional vector array
5. IF the API key is missing THEN the system SHALL throw a clear error message indicating configuration is required
6. WHEN API rate limits are exceeded THEN the system SHALL handle the error gracefully and provide appropriate feedback

### Requirement 2: Database Schema Updates

**User Story:** As a developer, I want to update the database schema to support vector embeddings, so that tools can be searched semantically.

#### Acceptance Criteria

1. WHEN the schema is updated THEN the aiTools table SHALL include an embeddingVersion field to track which model generated the embedding
2. WHEN the schema is deployed THEN the vector index SHALL be configured for 768 dimensions (Gemini) instead of 1536 (OpenAI)
3. WHEN the vector index is created THEN it SHALL support filtering by isApproved, language, category, and pricing fields
4. WHEN a tool is stored THEN the embedding field SHALL be optional to allow gradual migration
5. WHEN the schema is deployed THEN existing data SHALL remain intact and functional

### Requirement 3: Embedding Generation for Tools

**User Story:** As a system administrator, I want embeddings to be automatically generated for all tools, so that they can be found through semantic search.

#### Acceptance Criteria

1. WHEN a new tool is created THEN the system SHALL automatically schedule embedding generation asynchronously
2. WHEN an embedding is generated THEN it SHALL combine the tool's name, description, category, tags, and pricing into a single text representation
3. WHEN a tool is updated with changes to name, description, category, or tags THEN the system SHALL regenerate its embedding
4. WHEN generating embeddings in batch THEN the system SHALL respect API rate limits (15 requests per minute for free tier)
5. WHEN batch generation encounters an error THEN it SHALL continue processing remaining tools and report the failure
6. WHEN all embeddings are generated THEN the system SHALL provide statistics showing coverage percentage
7. IF rate limits are hit THEN the system SHALL wait appropriately before retrying

### Requirement 4: Semantic Search Implementation

**User Story:** As a user, I want to search for tools using natural language descriptions, so that I can find relevant tools even if I don't know the exact names or keywords.

#### Acceptance Criteria

1. WHEN a user enters a search query THEN the system SHALL generate an embedding for the query using Gemini API
2. WHEN the query embedding is generated THEN the system SHALL perform vector search against tool embeddings
3. WHEN vector search is performed THEN results SHALL be ranked by cosine similarity score
4. WHEN search results are returned THEN they SHALL include only approved tools (isApproved: true)
5. WHEN a user applies filters THEN the system SHALL combine semantic search with category, language, and pricing filters
6. IF embedding generation fails THEN the system SHALL fall back to keyword search automatically
7. WHEN search completes THEN results SHALL be returned within 2 seconds for optimal user experience

### Requirement 5: Hybrid Search Capability

**User Story:** As a user, I want the best possible search results, so that I can find tools whether I use natural language or specific keywords.

#### Acceptance Criteria

1. WHEN hybrid search is enabled THEN the system SHALL combine semantic and keyword search results
2. WHEN merging results THEN semantic search results SHALL be prioritized over keyword matches
3. WHEN duplicate tools appear in both result sets THEN the system SHALL deduplicate and show each tool only once
4. WHEN results are merged THEN the system SHALL maintain relevance ranking
5. WHEN hybrid search fails THEN the system SHALL fall back to keyword-only search

### Requirement 6: Search Performance Optimization

**User Story:** As a user, I want fast search results, so that I can quickly find the tools I need without waiting.

#### Acceptance Criteria

1. WHEN a search query is executed THEN the system SHALL check the cache before generating new embeddings
2. WHEN a cached result is found and not expired THEN the system SHALL return it without calling the Gemini API
3. WHEN a cache entry is used THEN the system SHALL increment its hit count for analytics
4. WHEN storing cache entries THEN they SHALL expire after 1 hour
5. WHEN cache is full or expired THEN the system SHALL clean up old entries automatically
6. WHEN rate limiting is needed THEN the system SHALL limit users to 15 searches per minute (matching Gemini free tier)

### Requirement 7: Search User Interface

**User Story:** As a user, I want an intuitive search interface, so that I can easily search for tools using natural language.

#### Acceptance Criteria

1. WHEN the search page loads THEN it SHALL display a prominent search input field with placeholder text suggesting natural language queries
2. WHEN the search field is empty THEN the system SHALL show example queries to guide users
3. WHEN a user types a query THEN they SHALL be able to submit by pressing Enter or clicking a search button
4. WHEN search is in progress THEN the system SHALL display a loading indicator
5. WHEN results are returned THEN they SHALL be displayed in a grid layout with tool cards
6. WHEN using semantic search THEN each result SHALL optionally show a similarity score percentage
7. WHEN no results are found THEN the system SHALL display a helpful message suggesting alternative searches
8. WHEN a user wants to switch search modes THEN they SHALL be able to toggle between semantic, keyword, and hybrid search

### Requirement 8: Search Analytics and Monitoring

**User Story:** As a product manager, I want to track search usage and quality, so that I can improve the search experience over time.

#### Acceptance Criteria

1. WHEN a search is performed THEN the system SHALL log the query, result count, and search type
2. WHEN a user clicks on a search result THEN the system SHALL log which tool was clicked and its position
3. WHEN viewing analytics THEN the system SHALL show popular search queries
4. WHEN viewing analytics THEN the system SHALL identify queries that returned zero results
5. WHEN viewing analytics THEN the system SHALL display search health metrics including click-through rate
6. WHEN viewing analytics THEN the system SHALL show embedding coverage statistics
7. WHEN monitoring the system THEN administrators SHALL be able to see cache hit rates and API usage

### Requirement 9: Similar Tools Recommendation

**User Story:** As a user viewing a tool, I want to see similar tools, so that I can discover alternatives and related options.

#### Acceptance Criteria

1. WHEN viewing a tool detail page THEN the system SHALL display up to 5 similar tools
2. WHEN finding similar tools THEN the system SHALL use vector similarity based on embeddings
3. WHEN displaying similar tools THEN they SHALL be ranked by similarity score
4. WHEN displaying similar tools THEN the current tool SHALL be excluded from results
5. IF a tool has no embedding THEN the similar tools section SHALL not be displayed

### Requirement 10: Multilingual Search Support

**User Story:** As a Vietnamese-speaking user, I want to search in Vietnamese and find relevant tools, so that I can use the platform in my native language.

#### Acceptance Criteria

1. WHEN a user searches in Vietnamese THEN the system SHALL generate embeddings that understand Vietnamese semantics
2. WHEN searching in Vietnamese THEN results SHALL include both Vietnamese and relevant English tools
3. WHEN the system detects Vietnamese characters THEN it SHALL automatically apply appropriate language handling
4. WHEN embeddings are generated THEN they SHALL preserve multilingual semantic meaning
5. WHEN displaying results THEN the system SHALL respect language filter preferences if specified

### Requirement 11: Cost Management and Efficiency

**User Story:** As a system administrator, I want to minimize API costs while maintaining good search quality, so that the feature is sustainable long-term.

#### Acceptance Criteria

1. WHEN using the free tier THEN the system SHALL stay within 1,500 requests per day limit
2. WHEN generating embeddings THEN the system SHALL use batch processing where possible to reduce API calls
3. WHEN caching is enabled THEN the system SHALL achieve at least 50% cache hit rate for common queries
4. WHEN monitoring costs THEN the system SHALL track API usage and provide cost estimates
5. WHEN approaching rate limits THEN the system SHALL implement appropriate throttling
6. WHEN processing batch operations THEN the system SHALL include delays to respect rate limits (4 seconds between requests)

### Requirement 12: Error Handling and Resilience

**User Story:** As a user, I want the search to work reliably even when issues occur, so that I can always find tools.

#### Acceptance Criteria

1. WHEN the Gemini API is unavailable THEN the system SHALL fall back to keyword search
2. WHEN rate limits are exceeded THEN the system SHALL display a user-friendly message asking to try again later
3. WHEN embedding generation fails for a tool THEN it SHALL not block the tool from being created
4. WHEN vector search fails THEN the system SHALL automatically retry with keyword search
5. WHEN errors occur THEN they SHALL be logged with sufficient detail for debugging
6. WHEN the system recovers from errors THEN users SHALL be able to continue searching without manual intervention
