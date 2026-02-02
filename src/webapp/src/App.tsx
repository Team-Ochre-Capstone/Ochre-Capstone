import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DicomProvider } from "./contexts/DicomContext";
import Layout from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import LoadingSpinner from "./components/LoadingSpinner";
import NotFoundPage from "./pages/NotFoundPage";

const UploadPage = lazy(() => import("./pages/UploadPage"));
const PreviewPage = lazy(() => import("./pages/PreviewPage"));
const ExportPage = lazy(() => import("./pages/ExportPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <DicomProvider>
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<UploadPage />} />
                <Route path="/preview" element={<PreviewPage />} />
                <Route path="/export" element={<ExportPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </Layout>
        </DicomProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
