import { useState, useCallback } from "react";
import { convertItkToVtkImage } from "@kitware/vtk.js/Common/DataModel/ITKHelper";
import {
  parseDicomFiles,
  loadDicomImageSeries,
  groupDicomFiles,
  type DicomFileInfo,
  type ProgressCallback,
} from "../utils/dicomUtils";

export interface DicomUploadState {
  isLoading: boolean;
  isComplete: boolean;
  error: string | null;
  progress: number;
  statusMessage: string;
  vtkImage: any | null;
  fileInfo: DicomFileInfo[];
}

export function useDicomUpload() {
  const [state, setState] = useState<DicomUploadState>({
    isLoading: false,
    isComplete: false,
    error: null,
    progress: 0,
    statusMessage: "",
    vtkImage: null,
    fileInfo: [],
  });

  const progressCallback: ProgressCallback = useCallback((event) => {
    const progress = event.lengthComputable
      ? (event.loaded / event.total) * 100
      : 0;

    setState((prev) => ({
      ...prev,
      progress,
    }));
  }, []);

  const uploadDicomFiles = useCallback(
    async (files: FileList | File[]) => {
      setState({
        isLoading: true,
        isComplete: false,
        error: null,
        progress: 0,
        statusMessage: "Loading DICOM files...",
        vtkImage: null,
        fileInfo: [],
      });

      try {
        // Parse DICOM files
        setState((prev) => ({
          ...prev,
          statusMessage: "Parsing DICOM files...",
        }));
        const parsedFiles = await parseDicomFiles(files, progressCallback);

        const dicomFiles = parsedFiles.filter((f) => f.isDICOM);

        if (dicomFiles.length === 0) {
          throw new Error("No valid DICOM files found");
        }

        setState((prev) => ({
          ...prev,
          statusMessage: `Found ${dicomFiles.length} DICOM files`,
          fileInfo: dicomFiles,
        }));

        // Group files by series
        const groupedFiles = groupDicomFiles(dicomFiles);

        // Get the first series (simplified - in production you'd want to let user choose)
        const firstPatient = Array.from(groupedFiles.values())[0];
        const firstStudy = Array.from(firstPatient.values())[0];
        const firstSeries = Array.from(firstStudy.values())[0];

        if (!firstSeries || firstSeries.length === 0) {
          throw new Error("No image series found");
        }

        // Load image series
        setState((prev) => ({
          ...prev,
          statusMessage: `Loading image series (${firstSeries.length} slices)...`,
        }));

        const itkImage = await loadDicomImageSeries(
          firstSeries.map((f) => f.file),
          progressCallback
        );

        // Convert to VTK image
        setState((prev) => ({
          ...prev,
          statusMessage: "Converting to 3D image...",
        }));

        const vtkImage = convertItkToVtkImage(itkImage);

        setState({
          isLoading: false,
          isComplete: true,
          error: null,
          progress: 100,
          statusMessage: "Upload complete",
          vtkImage,
          fileInfo: dicomFiles,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load DICOM files";

        setState({
          isLoading: false,
          isComplete: false,
          error: errorMessage,
          progress: 0,
          statusMessage: "",
          vtkImage: null,
          fileInfo: [],
        });
      }
    },
    [progressCallback]
  );

  const clearUpload = useCallback(() => {
    setState({
      isLoading: false,
      isComplete: false,
      error: null,
      progress: 0,
      statusMessage: "",
      vtkImage: null,
      fileInfo: [],
    });
  }, []);

  return {
    ...state,
    uploadDicomFiles,
    clearUpload,
  };
}
