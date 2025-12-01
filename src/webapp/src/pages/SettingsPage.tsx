import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSettings } from "../hooks/useAppSettings";
import { clearSession } from "../utils/storage";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useAppSettings();
  const [saveRecent, setSaveRecent] = useState(true);

  const handleSaveSettings = () => {
    // We will save them in local storage or cookie
    alert("Settings saved successfully!");
  };

  const handleClearHistory = () => {
    if (
      confirm("Are you sure you want to clear all history and session data?")
    ) {
      clearSession();
      setSaveRecent(false);
      alert("History cleared successfully!");
    }
  };

  const handleBackHome = () => {
    navigate("/");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-semibold mb-2 text-gray-800">
          Help & Settings
        </h2>
        <p className="text-gray-600 mb-8">
          User guidance and application settings
        </p>

        {/* Quick Start Guide */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Quick Start Guide
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>
              <strong>Upload DICOM</strong> - Select your CT scan file from your
              computer
            </li>
            <li>
              <strong>Select Tissue</strong> - Choose bone, skin, or muscle for
              visualization
            </li>
            <li>
              <strong>Preview Model</strong> - Rotate and inspect the 3D
              reconstruction
            </li>
            <li>
              <strong>Export File</strong> - Choose STL or G-code and download
            </li>
          </ol>
        </div>

        {/* Display Settings */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Display Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="render-quality"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Render Quality
              </label>
              <select
                id="render-quality"
                value={settings.renderQuality}
                onChange={(e) =>
                  updateSettings({ renderQuality: e.target.value as any })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="high">High (recommended)</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="background-color"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Background Color
              </label>
              <select
                id="background-color"
                value={settings.backgroundColor}
                onChange={(e) =>
                  updateSettings({ backgroundColor: e.target.value as any })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="light-gray">Light Gray (default)</option>
                <option value="white">White</option>
                <option value="black">Black</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showGrid}
                onChange={(e) => updateSettings({ showGrid: e.target.checked })}
                className="w-4 h-4 text-blue-500 rounded"
              />
              <span className="text-gray-700">Show Grid</span>
            </label>
          </div>
        </div>

        {/* Supported Formats */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Supported Formats
          </h3>
          <div className="text-gray-700">
            <p>
              <strong>Input:</strong> DICOM files (.dcm) and DICOM folders
            </p>
            <p>
              <strong>Output:</strong> STL (.stl) and G-code (.gcode)
            </p>
          </div>
        </div>

        {/* Processing Settings */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Processing Settings
          </h3>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoOptimize}
                onChange={(e) =>
                  updateSettings({ autoOptimize: e.target.checked })
                }
                className="mt-1 w-4 h-4 text-blue-500 rounded"
              />
              <div>
                <div className="text-gray-700">Auto-optimize meshes</div>
                <div className="text-sm text-gray-500">
                  Reduce polygon count for better performance
                </div>
              </div>
            </label>

            <div>
              <label
                htmlFor="default-export"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Default Export Format
              </label>
              <select
                id="default-export"
                value={settings.defaultExport}
                onChange={(e) =>
                  updateSettings({ defaultExport: e.target.value as any })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="stl">STL</option>
                <option value="gcode">G-code</option>
              </select>
            </div>
          </div>
        </div>

        {/* Browser Compatibility */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Browser Compatibility
          </h3>
          <p className="text-gray-700">Chrome (recommended), Firefox, Safari</p>
        </div>

        {/* Privacy & Data */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">
            Privacy & Data
          </h3>

          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={saveRecent}
              onChange={(e) => setSaveRecent(e.target.checked)}
              className="w-4 h-4 text-blue-500 rounded"
            />
            <span className="text-gray-700">
              Save recent files (session storage)
            </span>
          </label>

          <button
            onClick={handleClearHistory}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Clear History
          </button>
        </div>

        {/* About */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">About</h3>
          <div className="space-y-1 text-gray-700">
            <p>Medical CT Scan 3D Modeling Application</p>
            <p>Laboratory for Convergent Science</p>
            <p>University of Maine</p>
            <p className="text-sm text-gray-600">Version 1.0</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleBackHome}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
