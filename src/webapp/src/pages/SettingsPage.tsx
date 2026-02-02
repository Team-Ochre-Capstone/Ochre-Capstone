import { useAppSettings } from "../hooks";

const SettingsPage = () => {
  const { settings, updateSettings } = useAppSettings();

  const handleSaveSettings = () => {
    // We will save them in local storage or cookie
    alert("Settings saved successfully!");
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
                {/* <option value="medium">Medium</option>
                <option value="low">Low</option> */}
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
                <option value="white">White (default)</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                // make it unchangeable
                type="checkbox"
                checked={settings.showGrid}
                onChange={(e) => updateSettings({ showGrid: e.target.checked })}
                className="w-4 h-4 text-blue-500 rounded"
                disabled
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
                disabled
                className="mt-1 w-4 h-4 text-blue-500 rounded"
              />
              <div>
                <div className="text-gray-700">Auto-optimize meshes</div>
                <div className="text-sm text-gray-500">
                  Reduce polygon count for better performance
                </div>
              </div>
            </label>
          </div>
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
            onClick={handleSaveSettings}
            className="px-6 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
