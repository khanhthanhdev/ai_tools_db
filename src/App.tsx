import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { BrowsePage } from "./pages/BrowsePage";
import { AddToolPage } from "./pages/AddToolPage";
import { MyToolsPage } from "./pages/MyToolsPage";
import { StatsPage } from "./pages/StatsPage";
import { AboutUsPage } from "./pages/AboutUsPage";
import { ToolDetailPage } from "./pages/ToolDetailPage";

type Language = "en" | "vi";

export default function App() {
  const [language, setLanguage] = useState<Language>("en");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/about-us" element={<AboutUsPage />} />
        <Route path="/tool/:toolId" element={<ToolDetailPage />} />
      </Routes>
      <Layout language={language} setLanguage={setLanguage}>
        <Routes>
          <Route path="/" element={<BrowsePage language={language} />} />
          <Route path="/add-tool" element={<AddToolPage language={language} />} />
          <Route path="/my-tools" element={<MyToolsPage language={language} />} />
          <Route path="/stats" element={<StatsPage language={language} />} />
          <Route path="/about-us" element={<AboutUsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}