import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./index.css";
import App from "./App";
import { queryClient } from "./lib/queryClient";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ConvexAuthProvider client={convex}>
      <App />
    </ConvexAuthProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
);
