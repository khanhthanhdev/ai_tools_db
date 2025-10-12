import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { criticalCssPlugin } from "./vite-plugin-critical-css";
import { preloadHintsPlugin } from "./vite-plugin-preload-hints";
import { cssPurgePlugin } from "./vite-plugin-css-purge";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Babel optimizations for production (optional - requires babel plugins)
      // babel: mode === "production" ? {
      //   plugins: [
      //     ["@babel/plugin-transform-react-constant-elements"],
      //     ["@babel/plugin-transform-react-inline-elements"]
      //   ]
      // } : undefined,
    }),
    // The code below enables dev tools like taking screenshots of your site
    // while it is being developed on chef.convex.dev.
    // Feel free to remove this code if you're no longer developing your app with Chef.
    mode === "development"
      ? {
        name: "inject-chef-dev",
        transform(code: string, id: string) {
          if (id.includes("main.tsx")) {
            return {
              code: `${code}

/* Added by Vite plugin inject-chef-dev */
window.addEventListener('message', async (message) => {
  if (message.source !== window.parent) return;
  if (message.data.type !== 'chefPreviewRequest') return;

  const worker = await import('https://chef.convex.dev/scripts/worker.bundled.mjs');
  await worker.respondToMessage(message);
});
            `,
              map: null,
            };
          }
          return null;
        },
      }
      : null,
    // End of code for taking screenshots on chef.convex.dev.
    
    // Add critical CSS plugin for production builds
    mode === "production" ? criticalCssPlugin() : null,
    
    // Add preload hints for critical resources
    mode === "production" ? preloadHintsPlugin() : null,
    
    // Add CSS purging for smaller CSS bundles
    mode === "production" ? cssPurgePlugin() : null,
  ].filter(Boolean),

  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      "react",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-dom",
      "react-dom/client",
      "react-is",
      "react-router-dom",
      "convex",
      "@convex-dev/auth/react",
      "@convex-dev/auth/server",
      "lucide-react",
      "motion",
      "sonner",
      "date-fns",
      "zod",
      "react-hook-form",
      "@hookform/resolvers",
      "clsx",
      "tailwind-merge",
      "class-variance-authority",
    ],
    exclude: ["@google/generative-ai"],
  },

  resolve: {
    alias: [
      {
        find: "react-router/dom",
        replacement: path.resolve(
          __dirname,
          "./node_modules/react-router/dist/production/dom-export.mjs"
        ),
      },
      {
        find: "react-router",
        replacement: path.resolve(
          __dirname,
          "./node_modules/react-router/dist/production/index.mjs"
        ),
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
    // Ensure only one copy of React is used
    dedupe: ["react", "react-dom", "react-is"],
  },

  // Server optimizations
  server: {
    warmup: {
      // Pre-transform frequently used files
      clientFiles: [
        "./src/main.tsx",
        "./src/App.tsx",
        "./src/pages/BrowsePage.tsx",
        "./src/components/Layout.tsx",
      ],
    },
    fs: {
      // Allow serving files from node_modules
      allow: [".."],
    },
  },

  build: {
    // Target modern browsers for smaller bundles
    target: "es2020",

    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,

    // Enable CSS code splitting but keep critical CSS inline
    cssCodeSplit: true,

    // Optimize source maps for production
    sourcemap: mode === "production" ? false : true,

    // Minification options
    minify: "esbuild",
    
    // Optimize for faster loading
    reportCompressedSize: false,
    
    // Reduce initial bundle size
    assetsInlineLimit: 2048, // Inline smaller assets

    rollupOptions: {
      // Optimize tree-shaking
      treeshake: {
        preset: "recommended",
        moduleSideEffects: "no-external",
      },

      output: {
        // Optimize chunk naming
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",

        // Optimized manual chunks for better loading performance
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          // Core React ecosystem - keep together for better caching
          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/react-router/")) {
            return "react-vendor";
          }

          // Convex and auth - frequently used together
          if (id.includes("/convex/") || id.includes("/@convex-dev/")) {
            return "convex";
          }

          // UI libraries - used across many components
          if (id.includes("/@radix-ui/") || id.includes("/lucide-react/")) {
            return "ui-vendor";
          }

          // Charts library (large and usually lazy loaded)
          // NOTE: Temporarily disable the dedicated charts chunk because it created a
          // circular dependency with the react-vendor chunk, leading to runtime errors
          // (React being undefined when loaded). Keep the logic here in case we want to
          // restore it once the chunking strategy is revisited.
          // if (id.includes("/recharts/") || id.includes("/d3-")) {
          //   return "charts";
          // }

          // Motion library (large animation library) - defer loading
          if (id.includes("/motion/") || id.includes("/framer-motion/")) {
            return "motion";
          }

          // Form libraries
          if (id.includes("/react-hook-form/") || id.includes("/zod/") || id.includes("/@hookform/")) {
            return "forms";
          }

          // Other utilities
          if (id.includes("/date-fns/") || id.includes("/clsx/") || id.includes("/tailwind-merge/")) {
            return "utils";
          }
        },
      },
    },
  },

  // Enable esbuild optimizations
  esbuild: {
    // Drop console and debugger in production
    drop: mode === "production" ? ["console", "debugger"] : [],
    // Optimize for speed
    legalComments: "none",
  },
}));
