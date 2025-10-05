/**
 * Cache helper functions for search query caching
 * Provides consistent query hashing and expiration management
 */

/**
 * Generate a consistent hash for a query string
 * Uses a simple but effective hash function for cache key generation
 * 
 * @param query - The search query to hash
 * @returns A string hash of the query
 */
export function hashQuery(query: string): string {
  // Normalize the query: trim, lowercase, and remove extra whitespace
  const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ');
  
  // Simple hash function (djb2 algorithm)
  let hash = 5381;
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) + hash) + normalized.charCodeAt(i); // hash * 33 + c
  }
  
  // Convert to unsigned 32-bit integer and then to hex string
  return (hash >>> 0).toString(36);
}

/**
 * Calculate cache expiration timestamp
 * Returns a timestamp 1 hour from now
 * 
 * @returns Timestamp in milliseconds when the cache entry should expire
 */
export function getCacheExpiry(): number {
  const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour in milliseconds
  return Date.now() + ONE_HOUR_MS;
}
