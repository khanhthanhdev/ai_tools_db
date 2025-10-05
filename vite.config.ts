import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

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
  ].filter(Boolean),

  // Optimize dependency pre-bundling
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "convex",
      "@convex-dev/auth",
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
    // Force optimization even if in node_modules
    force: mode === "development",
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

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Optimize source maps for production
    sourcemap: mode === "production" ? false : true,

    // Minification options
    minify: "esbuild",

    rollupOptions: {
      // Optimize tree-shaking
      treeshake: {
        preset: "recommended",
        moduleSideEffects: false,
      },

      output: {
        // Optimize chunk naming
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",

        // Improved manual chunks strategy
        manualChunks(id) {
          // Don't split app code
          if (!id.includes("node_modules")) {
            return undefined;
          }

          // Core React (keep together for better caching)
          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/")) {
            return "react-core";
          }

          // React Router
          if (id.includes("/react-router")) {
            return "router";
          }

          // Motion/animations (large library)
          if (id.includes("/motion/") || id.includes("/framer-motion/")) {
            return "motion";
          }

          // Convex (backend SDK)
          if (id.includes("/convex/") || id.includes("/@convex-dev/")) {
            return "convex";
          }

          // Radix UI (many small components, group together)
          if (id.includes("/@radix-ui/")) {
            return "radix";
          }

          // Form handling
          if (id.includes("/react-hook-form/") || id.includes("/zod/") || id.includes("/@hookform/")) {
            return "forms";
          }

          // Charts (large library)
          if (id.includes("/recharts/") || id.includes("/d3-")) {
            return "charts";
          }

          // Icons (frequently used)
          if (id.includes("/lucide-react/")) {
            return "icons";
          }

          // Small utilities (group together)
          if (
            id.includes("/sonner/") ||
            id.includes("/tailwind-merge/") ||
            id.includes("/clsx/") ||
            id.includes("/class-variance-authority/") ||
            id.includes("/date-fns/") ||
            id.includes("/embla-carousel/")
          ) {
            return "utils";
          }

          // Everything else goes to vendor
          return "vendor";
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
