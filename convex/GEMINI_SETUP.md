# Gemini API Setup Instructions

## Setting the GEMINI_API_KEY Environment Variable

To enable semantic search functionality, you need to configure the Gemini API key in your Convex deployment.

### Steps:

1. **Get your Gemini API Key:**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated API key

2. **Set the environment variable in Convex:**

   **Option A: Using Convex Dashboard**
   - Go to your [Convex Dashboard](https://dashboard.convex.dev/)
   - Select your project: `industrious-snake-569`
   - Navigate to "Settings" → "Environment Variables"
   - Click "Add Environment Variable"
   - Name: `GEMINI_API_KEY`
   - Value: Paste your API key
   - Click "Save"

   **Option B: Using Convex CLI**
   ```bash
   npx convex env set GEMINI_API_KEY your_api_key_here
   ```

3. **Verify the configuration:**
   - After setting the environment variable, you can test it by running the verification action
   - Open your Convex Dashboard
   - Go to "Functions" → "actions" → "verifyGeminiConfig"
   - Click "Run" with no arguments
   - You should see a success message with embedding dimensions (768)

### Expected Response:

```json
{
  "success": true,
  "message": "Gemini API is configured correctly",
  "embeddingDimensions": 768,
  "expectedDimensions": 768,
  "isCorrectDimension": true
}
```

### Troubleshooting:

**Error: "GEMINI_API_KEY not configured"**
- Make sure you've set the environment variable in Convex
- Wait a few seconds for the deployment to pick up the new environment variable
- Try restarting your Convex dev server: `npx convex dev`

**Error: "RESOURCE_EXHAUSTED" or rate limit errors**
- You're hitting the free tier limit (1,500 requests/day or 15 requests/minute)
- Wait a few minutes before trying again
- Consider upgrading to a paid tier if needed

### API Limits (Free Tier):

- **Daily limit:** 1,500 requests per day
- **Rate limit:** 15 requests per minute
- **Model:** gemini-embedding-001
- **Dimensions:** 768
- **Cost:** Free

### Next Steps:

After verifying the API key is working:
1. Proceed to Task 2: Update Database Schema
2. Generate embeddings for existing tools
3. Enable semantic search in the frontend

