/**
 * Rate limiting utilities for search operations
 * Tracks requests per user per time window to prevent abuse and stay within API limits
 * 
 * Requirements:
 * - Limit users to 15 searches per minute (matching Gemini free tier)
 * - Track requests per user per time window
 * - Provide clear error messages when limits are exceeded
 */

/**
 * Rate limit configuration
 */
const RATE_LIMIT_CONFIG = {
  SEARCHES_PER_MINUTE: 15,
  WINDOW_MS: 60 * 1000, // 1 minute in milliseconds
};

/**
 * In-memory storage for rate limit tracking
 * Maps userId to array of request timestamps
 * Note: In production, consider using a database table for persistence across deployments
 */
const rateLimitStore = new Map<string, number[]>();

/**
 * Check if a user has exceeded their rate limit
 * 
 * @param userId - The user ID to check (use "anonymous" for unauthenticated users)
 * @param action - The action being rate limited (e.g., "search")
 * @returns Object with allowed status and optional error message
 */
export function checkRateLimit(
  userId: string,
  action: string = "search"
): { allowed: boolean; message?: string; remainingRequests?: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_CONFIG.WINDOW_MS;
  
  // Get or initialize user's request history
  let userRequests = rateLimitStore.get(userId) || [];
  
  // Remove requests outside the current time window
  userRequests = userRequests.filter(timestamp => timestamp > windowStart);
  
  // Check if user has exceeded the limit
  if (userRequests.length >= RATE_LIMIT_CONFIG.SEARCHES_PER_MINUTE) {
    const oldestRequest = userRequests[0];
    const resetTime = Math.ceil((oldestRequest + RATE_LIMIT_CONFIG.WINDOW_MS - now) / 1000);
    
    return {
      allowed: false,
      message: `Rate limit exceeded. You can make ${RATE_LIMIT_CONFIG.SEARCHES_PER_MINUTE} ${action}s per minute. Please try again in ${resetTime} seconds.`,
      remainingRequests: 0,
    };
  }
  
  // Add current request to history
  userRequests.push(now);
  rateLimitStore.set(userId, userRequests);
  
  // Calculate remaining requests
  const remainingRequests = RATE_LIMIT_CONFIG.SEARCHES_PER_MINUTE - userRequests.length;
  
  return {
    allowed: true,
    remainingRequests,
  };
}

/**
 * Clean up old rate limit entries to prevent memory leaks
 * Should be called periodically (e.g., every hour)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_CONFIG.WINDOW_MS;
  
  for (const [userId, timestamps] of rateLimitStore.entries()) {
    // Filter out old timestamps
    const recentTimestamps = timestamps.filter(ts => ts > windowStart);
    
    if (recentTimestamps.length === 0) {
      // Remove user entry if no recent requests
      rateLimitStore.delete(userId);
    } else {
      // Update with filtered timestamps
      rateLimitStore.set(userId, recentTimestamps);
    }
  }
}

/**
 * Get rate limit statistics for monitoring
 * 
 * @returns Object with current rate limit statistics
 */
export function getRateLimitStats(): {
  totalUsers: number;
  totalRequests: number;
  limit: number;
  windowMs: number;
} {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_CONFIG.WINDOW_MS;
  
  let totalRequests = 0;
  
  for (const timestamps of rateLimitStore.values()) {
    const recentRequests = timestamps.filter(ts => ts > windowStart);
    totalRequests += recentRequests.length;
  }
  
  return {
    totalUsers: rateLimitStore.size,
    totalRequests,
    limit: RATE_LIMIT_CONFIG.SEARCHES_PER_MINUTE,
    windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  };
}

/**
 * Reset rate limit for a specific user (admin function)
 * 
 * @param userId - The user ID to reset
 */
export function resetUserRateLimit(userId: string): void {
  rateLimitStore.delete(userId);
}
