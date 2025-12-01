import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDicomUpload } from "../hooks/useDicomUpload";
import { useDicomContext } from "../contexts/DicomContext";

const UploadPage = () => {
  const navigate = useNavigate();
  const {
    setDicomData,
    hasData,
    getVtkImage,
    fileInfo: contextFileInfo,
  } = useDicomContext();
  const {
    uploadDicomFiles,
    clearUpload,
    isLoading,
    isComplete,
    error,
    progress,
    statusMessage,
    vtkImage,
    fileInfo,
  } = useDicomUpload();

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Automatically sync new upload data to context when complete
  useEffect(() => {
    if (isComplete && vtkImage && fileInfo.length > 0 && !hasData) {
      setDicomData(vtkImage, fileInfo);
    }
  }, [isComplete, vtkImage, fileInfo, hasData, setDicomData]);

  // Use context data if available, otherwise use hook data
  const displayFileInfo = hasData ? contextFileInfo : fileInfo;
  const displayVtkImage = hasData ? getVtkImage() : vtkImage;
  const displayIsComplete = hasData || isComplete;

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      uploadDicomFiles(files);
    },
    [uploadDicomFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    const files: File[] = [];

    // Process all dropped items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file") {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          await traverseFileTree(entry, files);
        }
      }
    }

    if (files.length > 0) {
      const fileList = createFileList(files);
      handleFileSelect(fileList);
    }
  };

  // Helper to traverse folder structure
  const traverseFileTree = async (entry: any, files: File[]): Promise<void> => {
    if (entry.isFile) {
      const file = await new Promise<File>((resolve) => {
        entry.file((f: File) => resolve(f));
      });
      files.push(file);
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const entries = await new Promise<any[]>((resolve) => {
        dirReader.readEntries((results: any[]) => resolve(results));
      });

      for (const childEntry of entries) {
        await traverseFileTree(childEntry, files);
      }
    }
  };

  // Helper to create FileList from File array
  const createFileList = (files: File[]): FileList => {
    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    return dataTransfer.files;
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearFiles = () => {
    clearUpload();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleNextClick = () => {
    if (displayVtkImage) {
      setDicomData(displayVtkImage, displayFileInfo);
      navigate("/preview");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-semibold mb-2 text-gray-800">
          Upload DICOM Files
        </h2>
        <p className="text-gray-600 mb-6">
          Select a DICOM folder from your local machine
        </p>

        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          {!isLoading && !displayIsComplete && (
            <div className="cursor-pointer">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-lg text-gray-600 mb-2">
                Drop DICOM folder here
              </p>
              <p className="text-sm text-gray-500">or click to browse</p>
            </div>
          )}

          {isLoading && (
            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-5">
                <div
                  className="bg-blue-500 h-5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-gray-700 font-medium">{statusMessage}</p>
              <p className="text-sm text-gray-500">
                {progress.toFixed(0)}% complete
              </p>
            </div>
          )}

          {displayIsComplete && displayFileInfo.length > 0 && (
            <div className="text-left">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="font-semibold text-green-700">
                  Successfully loaded {displayFileInfo.length} DICOM files
                </p>
              </div>
              {displayFileInfo[0] && (
                <div className="text-sm text-gray-600 space-y-1">
                  {displayFileInfo[0].patientName && (
                    <p>
                      <strong>Patient:</strong> {displayFileInfo[0].patientName}
                    </p>
                  )}
                  {displayFileInfo[0].seriesDescription && (
                    <p>
                      <strong>Series:</strong>{" "}
                      {displayFileInfo[0].seriesDescription}
                    </p>
                  )}
                  {displayFileInfo[0].studyDate && (
                    <p>
                      <strong>Study Date:</strong>{" "}
                      {displayFileInfo[0].studyDate}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          // @ts-ignore - webkitdirectory is not in TypeScript definitions
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />

        <div className="mt-6 flex gap-3">
          {displayIsComplete && (
            <button
              onClick={handleBrowseClick}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select Different Folder
            </button>
          )}

          {displayIsComplete && (
            <button
              onClick={handleClearFiles}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {displayIsComplete && displayVtkImage && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleNextClick}
              className="flex-1 px-6 py-3 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors font-medium"
            >
              Continue to 3D Preview →
            </button>
            <button
              onClick={() => {
                setDicomData(displayVtkImage, displayFileInfo);
                navigate("/export");
              }}
              className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors font-medium"
            >
              Skip to Export →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
