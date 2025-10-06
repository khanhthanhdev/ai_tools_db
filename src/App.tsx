import { Suspense, lazy, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Layout } from "./components/Layout";
import { BrowsePage } from "./pages/BrowsePage";
import { Analytics } from "@vercel/analytics/react";
import { useRoutePrefetch } from "./hooks/useRoutePrefetch";
const AddToolPage = lazy(() =>
  import("./pages/AddToolPage").then((module) => ({
    default: module.AddToolPage,
  }))
);

const FavouritesPage = lazy(() =>
  import("./pages/FavouritesPage").then((module) => ({
    default: module.FavouritesPage,
  }))
);

const StatsPage = lazy(() =>
  import("./pages/StatsPage").then((module) => ({ default: module.StatsPage }))
);

const AboutUsPage = lazy(() =>
  import("./pages/AboutUsPage").then((module) => ({
    default: module.AboutUsPage,
  }))
);

type Language = "en" | "vi";

function AppContent() {
  const [language, setLanguage] = useState<Language>("en");
  
  // Enable route-based prefetching for authenticated users
  useRoutePrefetch();

  return (
    <Layout language={language} setLanguage={setLanguage}>
          <Routes>
            <Route path="/" element={<BrowsePage language={language} />} />
            <Route
              path="/add-tool"
              element={
                <Suspense
                  fallback={<div className="py-10 text-center">Loading...</div>}
                >
                  <AddToolPage language={language} />
                </Suspense>
              }
            />
            <Route
              path="/favourites"
              element={
                <Suspense
                  fallback={<div className="py-10 text-center">Loading...</div>}
                >
                  <FavouritesPage language={language} />
                </Suspense>
              }
            />
            <Route
              path="/stats"
              element={
                <Suspense
                  fallback={<div className="py-10 text-center">Loading...</div>}
                >
                  <StatsPage language={language} />
                </Suspense>
              }
            />
            <Route
              path="/about-us"
              element={
                <Suspense
                  fallback={<div className="py-10 text-center">Loading...</div>}
                >
                  <AboutUsPage language={language} />
                </Suspense>
              }
            />
          </Routes>
        </Layout>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
      <Analytics />
    </HelmetProvider>
  );
}
