import { useEffect, useState } from "react";

interface ExportProgressModalProps {
  isOpen: boolean;
  stage: "marching-cubes" | "smoothing" | "writing" | "complete" | null;
  metrics: {
    marchingCubesTime?: number;
    smoothingTime?: number;
    writingTime?: number;
    totalTime?: number;
    polygonCount?: number;
  };
  onClose: () => void;
}

const ExportProgressModal = ({
  isOpen,
  stage,
  metrics,
  onClose,
}: ExportProgressModalProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    // Update progress based on stage
    switch (stage) {
      case "marching-cubes":
        setProgress(30);
        break;
      case "smoothing":
        setProgress(60);
        break;
      case "writing":
        setProgress(85);
        break;
      case "complete":
        setProgress(100);
        break;
      default:
        setProgress(10);
    }
  }, [isOpen, stage]);

  if (!isOpen) return null;

  const getStageLabel = () => {
    switch (stage) {
      case "marching-cubes":
        return "Extracting surface mesh...";
      case "smoothing":
        return "Applying smoothing filter...";
      case "writing":
        return "Generating STL file...";
      case "complete":
        return "Export complete!";
      default:
        return "Preparing export...";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">
          Processing 3D Model
        </h3>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {getStageLabel()}
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Performance Metrics
          </h4>

          {metrics.marchingCubesTime !== undefined && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Marching Cubes:</span>
              <span className="font-mono text-gray-800">
                {metrics.marchingCubesTime.toFixed(2)} ms
              </span>
            </div>
          )}

          {metrics.smoothingTime !== undefined && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Smoothing:</span>
              <span className="font-mono text-gray-800">
                {metrics.smoothingTime.toFixed(2)} ms
              </span>
            </div>
          )}

          {metrics.writingTime !== undefined && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">STL Writing:</span>
              <span className="font-mono text-gray-800">
                {metrics.writingTime.toFixed(2)} ms
              </span>
            </div>
          )}

          {metrics.totalTime !== undefined && (
            <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-300">
              <span className="text-gray-700 font-medium">Total Time:</span>
              <span className="font-mono text-gray-900 font-semibold">
                {metrics.totalTime.toFixed(2)} ms
              </span>
            </div>
          )}

          {metrics.polygonCount !== undefined && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Polygon Count:</span>
              <span className="font-mono text-gray-800">
                {metrics.polygonCount.toLocaleString()}
              </span>
            </div>
          )}

          {stage === null && (
            <p className="text-sm text-gray-500 text-center py-2">
              Initializing...
            </p>
          )}
        </div>

        {/* Completion Message */}
        {stage === "complete" && (
          <div className="mt-4 flex items-center gap-2 text-green-600">
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="font-medium">File downloaded successfully!</span>
          </div>
        )}

        {/* OK Button - only show when complete */}
        {stage === "complete" && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportProgressModal;
