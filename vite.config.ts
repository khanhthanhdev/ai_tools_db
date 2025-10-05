import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          // React core libraries
          if (id.includes("react") || id.includes("react-dom") || id.includes("scheduler")) {
            return "react-vendor";
          }

          // React Router
          if (id.includes("react-router")) {
            return "router-vendor";
          }

          // Motion/animations
          if (id.includes("framer-motion") || id.includes(`${path.sep}motion${path.sep}`)) {
            return "motion-vendor";
          }

          // Convex
          if (id.includes(`${path.sep}convex${path.sep}`) || id.includes("@convex-dev")) {
            return "convex-vendor";
          }

          // Radix UI components
          if (id.includes("@radix-ui")) {
            return "radix-vendor";
          }

          // Form libraries
          if (id.includes("react-hook-form") || id.includes("zod") || id.includes("@hookform")) {
            return "form-vendor";
          }

          // Charts
          if (id.includes("recharts") || id.includes("d3-")) {
            return "chart-vendor";
          }

          // Icons
          if (id.includes("lucide-react")) {
            return "icon-vendor";
          }

          // Toast notifications
          if (id.includes("sonner")) {
            return "toast-vendor";
          }

          // Utility libraries
          if (id.includes("tailwind-merge") || id.includes("clsx") || id.includes("class-variance-authority")) {
            return "utils-vendor";
          }

          // Date utilities
          if (id.includes("date-fns")) {
            return "date-vendor";
          }

          // Carousel
          if (id.includes("embla-carousel")) {
            return "carousel-vendor";
          }

          // Everything else
          return "vendor";
        },
      },
    },
  },
}));
