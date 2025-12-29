import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DicomProvider } from "./contexts/DicomContext";
import Layout from "./components/Layout";
import UploadPage from "./pages/UploadPage";
import PreviewPage from "./pages/PreviewPage";
import ExportPage from "./pages/ExportPage";
import SettingsPage from "./pages/SettingsPage";
import AboutPage from "./pages/AboutPage";

function App() {
  return (
    <Router>
      <DicomProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/preview" element={<PreviewPage />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path = "/about" element={<AboutPage />}/>
          </Routes>
        </Layout>
      </DicomProvider>
    </Router>
  );
}

export default App;
