import { writeFileSync, readFileSync } from "fs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";


// Load environment variables from .env.local
function loadEnvFile() {
  try {
    const envContent = readFileSync(".env.local", "utf-8");
    const lines = envContent.split("\n");
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").trim();
          process.env[key.trim()] = value;
        }
      }
    }
  } catch (error) {
    console.warn("Warning: Could not load .env.local file");
  }
}

// Load environment variables
loadEnvFile();

const DOMAIN = process.env.VITE_WEBSITE_URL;
// Initialize Convex client
const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
if (!convexUrl) {
  console.error("Error: CONVEX_URL or VITE_CONVEX_URL environment variable is not set");
  console.error("Please ensure .env.local exists with VITE_CONVEX_URL defined");
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

function formatDate(timestamp) {
  return new Date(timestamp).toISOString().split("T")[0];
}

function generateSitemapXML(urls) {
  const urlEntries = urls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;
}

async function generateSitemap() {
  console.log("Generating sitemap...");

  const urls = [];
  const today = formatDate(Date.now());

  // Static pages
  const staticPages = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/add-tool", changefreq: "weekly", priority: "0.8" },
    { path: "/stats", changefreq: "weekly", priority: "0.7" },
    { path: "/about-us", changefreq: "monthly", priority: "0.6" },
    { path: "/favourites", changefreq: "weekly", priority: "0.5" },
  ];

  staticPages.forEach((page) => {
    urls.push({
      loc: `${DOMAIN}${page.path}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  });

  try {
    // Fetch all approved tools for dynamic pages
    console.log("Fetching tools from Convex...");
    
    // Note: Uncomment this when you add tool detail pages
    // const tools = await client.query(api.seo.getAllApprovedTools);
    // tools.forEach((tool) => {
    //   urls.push({
    //     loc: `${DOMAIN}/tool/${tool._id}`,
    //     lastmod: formatDate(tool._creationTime),
    //     changefreq: "weekly",
    //     priority: "0.8",
    //   });
    // });

    console.log(`Generated ${urls.length} URLs`);
  } catch (error) {
    console.error("Error fetching tools:", error);
    console.log("Continuing with static pages only...");
  }

  const sitemapXML = generateSitemapXML(urls);
  writeFileSync("public/sitemap.xml", sitemapXML);
  console.log("✅ Sitemap generated successfully at public/sitemap.xml");
  console.log(`Total URLs: ${urls.length}`);
}

generateSitemap().catch((error) => {
  console.error("Failed to generate sitemap:", error);
  process.exit(1);
});
