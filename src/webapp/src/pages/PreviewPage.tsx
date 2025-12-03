import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Viewer3D from "../components/Viewer3D";
import { TissueType } from "../types";
import { useDicomContext } from "../contexts/DicomContext";

const PreviewPage = () => {
  const navigate = useNavigate();
  const { getVtkImage, fileInfo, hasData } = useDicomContext();

  const [tissueType, setTissueType] = useState<TissueType>("bone");
  const [huThreshold, setHuThreshold] = useState(300);
  const [isViewerReady, setIsViewerReady] = useState(false);

  const handleViewerReady = useCallback(() => {
    setIsViewerReady(true);
  }, []);

  //Redirect if no data
  if (!hasData) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-center">
        <h2 className="text-2xl font-semibold mb-2">No file loaded</h2>
        <p className="text-gray-600 mb-4">
          Please upload a CT scan before previewing a 3D model.
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

  const vtkImage = getVtkImage();


  const handleTissueChange = (type: TissueType) => {
    setTissueType(type);

    // Set appropriate HU threshold for tissue type
    const thresholds: Record<TissueType, number> = {
      bone: 300,
      skin: -200,
      muscle: 40,
    };
    setHuThreshold(thresholds[type]);
  };

  const handleNextClick = () => {
    navigate("/export");
  };

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <div className="flex gap-8">
      {/* Main Content */}
      <div className="flex-1 bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-semibold mb-2 text-gray-800">
          3D Preview & Tissue Selection
        </h2>
        <p className="text-gray-600 mb-6">
          Visualize and select anatomical tissue type
        </p>

        {/* 3D Preview Area */}
        <div
          className="relative bg-gray-900 rounded-lg mb-6 overflow-hidden"
          style={{ height: "500px" }}
        >
          <Viewer3D
            vtkImage={vtkImage}
            window={4000}
            level={huThreshold}
            onReady={handleViewerReady}
          />
        </div>

        {/* Status Bar */}
        <div className="flex justify-between text-sm text-gray-600 bg-gray-50 p-4 rounded-md mb-6">
          <div>
            Viewer:{" "}
            <span className="font-medium">
              {isViewerReady ? "Ready" : "Loading..."}
            </span>
          </div>
          <div>
            Files:{" "}
            <span className="font-medium">
              {fileInfo?.length || 0} DICOM files
            </span>
          </div>
          <div>
            Status:{" "}
            <span
              className={`font-medium ${
                isViewerReady ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {isViewerReady ? "Interactive" : "Initializing"}
            </span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleBackClick}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleNextClick}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Next: Export →
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 space-y-6">
        {/* Tissue Type Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Tissue Type
          </h3>
          <div className="space-y-3">
            {(["bone", "skin", "muscle"] as TissueType[]).map((type) => (
              <label
                key={type}
                className="flex items-center gap-3 cursor-pointer p-3 rounded-md hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="tissue-type"
                  value={type}
                  checked={tissueType === type}
                  onChange={() => handleTissueChange(type)}
                  className="w-4 h-4 text-blue-500"
                />
                <span className="capitalize text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* File Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            File Info
          </h3>
          {fileInfo && fileInfo.length > 0 ? (
            <div className="space-y-2 text-sm text-gray-600">
              {fileInfo[0].patientName && (
                <p>
                  <strong>Patient:</strong> {fileInfo[0].patientName}
                </p>
              )}
              {fileInfo[0].seriesDescription && (
                <p>
                  <strong>Series:</strong> {fileInfo[0].seriesDescription}
                </p>
              )}
              {fileInfo[0].studyDate && (
                <p>
                  <strong>Date:</strong> {fileInfo[0].studyDate}
                </p>
              )}
              <p>
                <strong>Files:</strong> {fileInfo.length} DICOM files
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No file information available
            </p>
          )}
        </div>

        {/* HU Threshold Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            HU Threshold Settings
          </h3>
          <label
            htmlFor="hu-threshold"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            HU Threshold
          </label>
          <input
            type="range"
            id="hu-threshold"
            min="-1024"
            max="3071"
            value={huThreshold}
            onChange={(e) => setHuThreshold(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="text-center mt-2 text-lg font-medium text-blue-600">
            {huThreshold} HU
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;
