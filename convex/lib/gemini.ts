/**
 * Gemini API Integration
 * Handles embedding generation using Google's Generative AI API
 */

import {
    GoogleGenerativeAI,
    TaskType,
    EmbedContentRequest,
} from "@google/generative-ai";
import {
    GEMINI_EMBEDDING_DIMENSIONS,
    GEMINI_EMBEDDING_MODEL,
} from "./constants";

/**
 * Get configured Gemini client
 * @throws Error if GEMINI_API_KEY is not set
 */
export function getGeminiClient(): GoogleGenerativeAI {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error(
            "GEMINI_API_KEY not configured. Please set it in Convex environment variables."
        );
    }

    return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate embedding for a single text using Gemini gemini-embedding-001
 * Uses SEMANTIC_SIMILARITY task type for optimal semantic search results
 * Includes retry logic for rate limiting and network errors
 * @param text - Text to embed
 * @param retryCount - Current retry attempt (internal use)
 * @returns embedding vector from gemini-embedding-001
 * @throws Error if text is empty or API fails after retries
 */
type EmbedContentRequestWithOutput = EmbedContentRequest & {
    outputDimensionality?: number;
};

export async function generateEmbedding(
    text: string,
    retryCount = 0
): Promise<number[]> {
    // Validate input
    if (!text || text.trim().length === 0) {
        throw new Error("Cannot generate embedding for empty text");
    }

    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: GEMINI_EMBEDDING_MODEL });

    try {
        // Use SEMANTIC_SIMILARITY task type for better semantic search results
        const request: EmbedContentRequestWithOutput = {
            content: { role: "user", parts: [{ text }] },
            taskType: TaskType.SEMANTIC_SIMILARITY,
            outputDimensionality: GEMINI_EMBEDDING_DIMENSIONS,
        };

        const result = await model.embedContent(request);

        // Validate response
        if (
            !result.embedding?.values ||
            result.embedding.values.length !== GEMINI_EMBEDDING_DIMENSIONS
        ) {
            throw new Error(
                `Invalid embedding response: expected ${GEMINI_EMBEDDING_DIMENSIONS} dimensions, got ${result.embedding?.values?.length || 0}`
            );
        }

        return result.embedding.values;
    } catch (error: any) {
        // Handle rate limiting with exponential backoff
        if (error.message?.includes("RESOURCE_EXHAUSTED") || error.status === 429) {
            if (retryCount < 3) {
                const waitTime = Math.pow(2, retryCount) * 15000; // 15s, 30s, 60s
                console.warn(
                    `Rate limit hit, retrying in ${waitTime / 1000}s (attempt ${retryCount + 1}/3)`
                );
                await new Promise((resolve) => setTimeout(resolve, waitTime));
                return generateEmbedding(text, retryCount + 1);
            }
            throw new Error(
                "Gemini API rate limit exceeded. Please wait a moment and try again."
            );
        }

        // Handle network errors
        if (
            error.message?.includes("fetch") ||
            error.message?.includes("network") ||
            error.code === "ECONNREFUSED"
        ) {
            if (retryCount < 2) {
                const waitTime = 5000; // 5 seconds for network errors
                console.warn(
                    `Network error, retrying in ${waitTime / 1000}s (attempt ${retryCount + 1}/2)`
                );
                await new Promise((resolve) => setTimeout(resolve, waitTime));
                return generateEmbedding(text, retryCount + 1);
            }
            throw new Error(
                "Network error connecting to Gemini API. Please check your connection and try again."
            );
        }

        // Handle invalid API key
        if (error.status === 401 || error.message?.includes("API key")) {
            throw new Error(
                "Invalid GEMINI_API_KEY. Please check your API key configuration."
            );
        }

        // Log and rethrow other errors
        console.error("Gemini API error:", error);
        throw new Error(
            `Failed to generate embedding: ${error.message || "Unknown error"}`
        );
    }
}

/**
 * Generate embeddings for multiple texts in batch
 * Processes texts sequentially with rate limiting
 * @param texts - Array of texts to embed
 * @returns Array of embedding vectors (empty array for failed texts)
 */
export async function generateEmbeddingsBatch(
    texts: string[]
): Promise<number[][]> {
    if (!texts || texts.length === 0) {
        return [];
    }

    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: GEMINI_EMBEDDING_MODEL });

    const embeddings: number[][] = [];

    for (let i = 0; i < texts.length; i++) {
        const text = texts[i];

        // Skip empty texts
        if (!text || text.trim().length === 0) {
            console.warn(`Skipping empty text at index ${i}`);
            embeddings.push([]);
            continue;
        }

        try {
            // Use SEMANTIC_SIMILARITY task type for better semantic search results
            const request: EmbedContentRequestWithOutput = {
                content: { role: "user", parts: [{ text }] },
                taskType: TaskType.SEMANTIC_SIMILARITY,
                outputDimensionality: GEMINI_EMBEDDING_DIMENSIONS,
            };

            const result = await model.embedContent(request);

            // Validate response
            if (
                !result.embedding?.values ||
                result.embedding.values.length !== GEMINI_EMBEDDING_DIMENSIONS
            ) {
                console.error(
                    `Invalid embedding at index ${i}: expected ${GEMINI_EMBEDDING_DIMENSIONS} dimensions, got ${result.embedding?.values?.length || 0}`
                );
                embeddings.push([]);
            } else {
                embeddings.push(result.embedding.values);
            }

            // Add delay to respect rate limits (4 seconds between requests)
            // Free tier: 15 requests/minute = 1 request per 4 seconds
            if (i < texts.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 4000));
            }
        } catch (error: any) {
            console.error(
                `Failed to generate embedding at index ${i} for text: "${text.substring(0, 50)}..."`,
                error.message || error
            );

            // Handle rate limiting in batch - wait longer and continue
            if (error.message?.includes("RESOURCE_EXHAUSTED") || error.status === 429) {
                console.warn("Rate limit hit in batch processing, waiting 60s...");
                await new Promise((resolve) => setTimeout(resolve, 60000));
            }

            // Continue with other texts, push empty array for failed embedding
            embeddings.push([]);
        }
    }

    return embeddings;
}
