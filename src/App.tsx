import { Suspense, lazy, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { BrowsePage } from "./pages/BrowsePage";

const AddToolPage = lazy(() =>
  import("./pages/AddToolPage").then((module) => ({ default: module.AddToolPage }))
);

const MyToolsPage = lazy(() =>
  import("./pages/MyToolsPage").then((module) => ({ default: module.MyToolsPage }))
);

const StatsPage = lazy(() =>
  import("./pages/StatsPage").then((module) => ({ default: module.StatsPage }))
);

const AboutUsPage = lazy(() =>
  import("./pages/AboutUsPage").then((module) => ({ default: module.AboutUsPage }))
);

type Language = "en" | "vi";

export default function App() {
  const [language, setLanguage] = useState<Language>("en");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/about-us" element={<AboutUsPage />} />

      </Routes>
      <Layout language={language} setLanguage={setLanguage}>
        <Routes>
          <Route path="/" element={<BrowsePage language={language} />} />
          <Route
            path="/add-tool"
            element={
              <Suspense fallback={<div className="py-10 text-center">Loading...</div>}>
                <AddToolPage language={language} />
              </Suspense>
            }
          />
          <Route
            path="/my-tools"
            element={
              <Suspense fallback={<div className="py-10 text-center">Loading...</div>}>
                <MyToolsPage language={language} />
              </Suspense>
            }
          />
          <Route
            path="/stats"
            element={
              <Suspense fallback={<div className="py-10 text-center">Loading...</div>}>
                <StatsPage language={language} />
              </Suspense>
            }
          />
          <Route
            path="/about-us"
            element={
              <Suspense fallback={<div className="py-10 text-center">Loading...</div>}>
                <AboutUsPage />
              </Suspense>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
