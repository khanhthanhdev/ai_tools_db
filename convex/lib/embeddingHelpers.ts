/**
 * Embedding Helper Functions
 * 
 * Utilities for creating text representations of tools for embedding generation.
 * Provides both full and short versions for cost optimization.
 */

interface Tool {
  name: string;
  description: string;
  category: string;
  tags: string[];
  pricing: "free" | "freemium" | "paid";
  detail?: string;
}

/**
 * Creates a comprehensive text representation of a tool for embedding generation.
 * Combines all relevant fields into a coherent text that captures the tool's semantics.
 * 
 * @param tool - The tool object to create embedding text from
 * @returns A formatted string combining tool name, description, category, tags, and pricing
 * 
 * @example
 * const text = createEmbeddingText({
 *   name: "ChatGPT",
 *   description: "AI chatbot for conversations",
 *   category: "Chatbots",
 *   tags: ["AI", "NLP", "Conversation"],
 *   pricing: "freemium"
 * });
 * // Returns: "Tool Name: ChatGPT\nDescription: AI chatbot for conversations\n..."
 */
export function createEmbeddingText(tool: Tool): string {
  const parts: string[] = [];

  // Tool name - most important identifier
  parts.push(`Tool Name: ${tool.name}`);

  // Description - core functionality explanation
  parts.push(`Description: ${tool.description}`);

  // Detailed description if available
  if (tool.detail) {
    parts.push(`Details: ${tool.detail}`);
  }

  // Category - helps with classification
  parts.push(`Category: ${tool.category}`);

  // Tags/Features - additional context
  if (tool.tags && tool.tags.length > 0) {
    parts.push(`Features: ${tool.tags.join(", ")}`);
  }

  // Pricing model - important for user filtering
  parts.push(`Pricing Model: ${tool.pricing}`);

  return parts.join("\n");
}

/**
 * Creates a shorter text representation of a tool for cost-optimized embedding generation.
 * Uses only the most essential fields to reduce token usage while maintaining semantic quality.
 * 
 * @param tool - The tool object to create embedding text from
 * @returns A concise formatted string with essential tool information
 * 
 * @example
 * const text = createEmbeddingTextShort({
 *   name: "ChatGPT",
 *   description: "AI chatbot for conversations",
 *   category: "Chatbots",
 *   tags: ["AI", "NLP"],
 *   pricing: "freemium"
 * });
 * // Returns: "ChatGPT: AI chatbot for conversations. Category: Chatbots. Tags: AI, NLP"
 */
export function createEmbeddingTextShort(tool: Tool): string {
  const parts: string[] = [];

  // Combine name and description in a natural way
  parts.push(`${tool.name}: ${tool.description}`);

  // Add category for classification
  parts.push(`Category: ${tool.category}`);

  // Add tags if available
  if (tool.tags && tool.tags.length > 0) {
    parts.push(`Tags: ${tool.tags.join(", ")}`);
  }

  return parts.join(". ");
}
