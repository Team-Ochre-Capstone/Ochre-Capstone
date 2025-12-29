import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExportFormat } from "../types";
import { useDicomContext } from "../contexts/DicomContext";
import { exportToSTL, HU_THRESHOLDS } from "../utils";
import ExportProgressModal from "../components/ExportProgressModal";

const TISSUE_LABELS: Record<keyof typeof HU_THRESHOLDS, string> = {
  HIGH_DENSITY: "High Density (Bone)",
  MEDIUM_DENSITY: "Medium Density (Muscle/Organs/Brain)",
  LOW_DENSITY: "Low Density (Skin)",
};

const ExportPage = () => {
  const navigate = useNavigate();
  const { getVtkImage, hasData } = useDicomContext();
  const [exportFormat, setExportFormat] = useState<ExportFormat>("stl");
  const [filename, setFilename] = useState("ct_scan_bone_model");
  const [threshold, setThreshold] = useState<
    keyof typeof HU_THRESHOLDS | "custom"
  >("HIGH_DENSITY");
  const [customThreshold, setCustomThreshold] = useState(300);
  const [smoothing, setSmoothing] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStage, setExportStage] = useState<
    "marching-cubes" | "smoothing" | "writing" | "complete" | null
  >(null);
  const [exportMetrics, setExportMetrics] = useState<{
    marchingCubesTime?: number;
    smoothingTime?: number;
    writingTime?: number;
    totalTime?: number;
    polygonCount?: number;
  }>({});

  const handleExport = async () => {
    if (!filename.trim()) {
      alert("Please enter a filename");
      return;
    }

    const vtkImage = getVtkImage();
    if (!vtkImage) {
      alert("No DICOM data loaded. Please upload files first.");
      navigate("/");
      return;
    }

    setIsExporting(true);
    setExportStage(null);
    setExportMetrics({});

    try {
      if (exportFormat === "stl") {
        const thresholdValue =
          threshold === "custom" ? customThreshold : threshold;

        await exportToSTL(
          vtkImage,
          filename,
          thresholdValue,
          smoothing,
          (stage, metrics) => {
            setExportStage(stage);
            setExportMetrics((prev) => ({ ...prev, ...metrics }));
          }
        );
      } else {
        setIsExporting(false);
        alert("G-code export is not yet implemented");
      }
    } catch (error) {
      setIsExporting(false);
      setExportStage(null);
      setExportMetrics({});
      alert("Export failed. Please try again.");
      console.error("Export error:", error);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  const handleModalClose = () => {
    setIsExporting(false);
    setExportStage(null);
    setExportMetrics({});
  };

  if (!hasData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 max-w-xl mx-auto mt-10 text-center">
        <h2 className="text-2xl font-semibold mb-2">No file loaded</h2>
        <p className="text-gray-600 mb-4">
          Please upload a CT scan before exporting a 3D model.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ExportProgressModal
        isOpen={isExporting}
        stage={exportStage}
        metrics={exportMetrics}
        onClose={handleModalClose}
      />

      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-semibold mb-2 text-gray-800">
          Export 3D Model
        </h2>
        <p className="text-gray-600 mb-8">
          Choose output format and save location
        </p>

        {/* Output Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Output Format
          </label>
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="export-format"
                value="stl"
                checked={exportFormat === "stl"}
                onChange={() => setExportFormat("stl")}
                className="mt-1 w-4 h-4 text-blue-500"
              />
              <div>
                <div className="font-medium text-gray-800">STL File</div>
                <div className="text-sm text-gray-600">
                  Standard 3D mesh format for 3D printing and CAD software
                </div>
              </div>
            </label>
            <label className="bg-gray-300 flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-300 transition-colors">
              <input
                type="radio"
                name="export-format"
                value="gcode"
                checked={exportFormat === "gcode"}
                onChange={() => setExportFormat("gcode")}
                disabled
                className="mt-1 w-4 h-4 text-blue-500"
              />
              <div>
                <div className="font-medium text-gray-800">
                  G-code{" "}
                  <span className="text-xs inline-flex items-center px-2 py-0.5 rounded bg-gray-200 text-gray-700 ml-2">
                    Coming soon
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Direct 3D printer instructions with density information
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Filename Input */}
        <div className="mb-6">
          <label
            htmlFor="filename"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Output Filename
          </label>
          <input
            type="text"
            id="filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Enter filename"
          />
          <p className="mt-1 text-sm text-gray-500">
            Extension will be added automatically (.{exportFormat})
          </p>
        </div>

        {/* Threshold Selection (for STL only) */}
        {exportFormat === "stl" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tissue Threshold (HU)
            </label>
            <div className="space-y-2">
              {(
                Object.keys(HU_THRESHOLDS) as Array<keyof typeof HU_THRESHOLDS>
              ).map((key) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="threshold"
                    value={key}
                    checked={threshold === key}
                    onChange={() => setThreshold(key)}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="font-medium text-gray-800 flex-1">
                    {TISSUE_LABELS[key]}
                  </span>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {HU_THRESHOLDS[key]} HU
                  </span>
                </label>
              ))}
              <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="threshold"
                  value="custom"
                  checked={threshold === "custom"}
                  onChange={() => setThreshold("custom")}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="font-medium text-gray-800">Custom</span>
                <input
                  type="number"
                  value={customThreshold}
                  onChange={(e) =>
                    setCustomThreshold(
                      Math.max(-1000, Math.min(3000, Number(e.target.value)))
                    )
                  }
                  disabled={threshold !== "custom"}
                  min="-1000"
                  max="3000"
                  className="ml-auto w-24 px-2 py-1 border rounded disabled:bg-gray-100"
                  placeholder="HU"
                />
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Higher values = denser tissue. Common: Bone (300), Soft tissue
              (40)
            </p>
          </div>
        )}

        {/* Smoothing Option (for STL only) */}
        {exportFormat === "stl" && (
          <div className="mb-6">
            <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={smoothing}
                onChange={(e) => setSmoothing(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-500 rounded"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-800">Apply Smoothing</div>
                <div className="text-sm text-gray-600 mt-1">
                  Smooth the mesh surface for better 3D printing results. Uses
                  windowed sinc smoothing with 15 iterations.
                </div>
              </div>
            </label>
          </div>
        )}

        {/* Export Summary */}
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Export Summary
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            {exportFormat === "stl" && (
              <>
                <p>
                  <strong>Threshold:</strong>{" "}
                  {threshold === "custom"
                    ? `${customThreshold} HU (Custom)`
                    : `${
                        TISSUE_LABELS[threshold as keyof typeof HU_THRESHOLDS]
                      } (${
                        HU_THRESHOLDS[threshold as keyof typeof HU_THRESHOLDS]
                      } HU)`}
                </p>
                <p>
                  <strong>Smoothing:</strong>{" "}
                  {smoothing ? "Enabled" : "Disabled"}
                </p>
              </>
            )}
            <p>
              <strong>Format:</strong> {exportFormat.toUpperCase()}
            </p>
            <p>
              <strong>Filename:</strong> {filename}.{exportFormat}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isExporting ? "Processing..." : "Generate & Download"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
