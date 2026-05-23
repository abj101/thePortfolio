import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { EntryPage } from "./pages/EntryPage";
import { PortfolioPage } from "./pages/PortfolioPage";

const PlayPage = lazy(() =>
  import("./pages/PlayPage").then((m) => ({ default: m.PlayPage })),
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EntryPage />} />
      <Route
        path="/play"
        element={
          <Suspense fallback={null}>
            <PlayPage />
          </Suspense>
        }
      />
      <Route path="/portfolio" element={<PortfolioPage />} />
    </Routes>
  );
}
