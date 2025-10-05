// Configuration for prerendering static pages
// This helps with SEO by generating static HTML for crawlers

export const prerenderRoutes = [
  "/",
  "/about-us",
  "/stats",
  "/add-tool",
  // Add more static routes as needed
];

// For dynamic routes (like individual tool pages), you would need to:
// 1. Fetch all tool IDs from your Convex database
// 2. Generate routes like `/tool/${toolId}`
// 3. Use a prerendering plugin like vite-plugin-ssr or similar
