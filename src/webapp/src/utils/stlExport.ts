import vtkImageMarchingCubes from "@kitware/vtk.js/Filters/General/ImageMarchingCubes";
import vtkWindowedSincPolyDataFilter from "@kitware/vtk.js/Filters/General/WindowedSincPolyDataFilter";
import vtkSTLWriter from "@kitware/vtk.js/IO/Geometry/STLWriter";
import type { vtkImageData } from "@kitware/vtk.js/Common/DataModel/ImageData";

export interface STLExportOptions {
  /** Threshold value for surface extraction (HU units for CT) */
  isoValue: number;
  /** Whether to generate binary STL (smaller) vs ASCII */
  binary?: boolean;
  /** Optional: Smooth the mesh */
  smoothing?: boolean;
  /** Optional: Progress callback */
  onProgress?: (
    stage: "marching-cubes" | "smoothing" | "writing" | "complete",
    metrics: ExportMetrics
  ) => void;
}

export interface ExportMetrics {
  marchingCubesTime?: number;
  smoothingTime?: number;
  writingTime?: number;
  totalTime?: number;
  polygonCount?: number;
}

/**
 * Extract a 3D surface from volume data and export as STL
 * @param imageData - VTK image data from DICOM series
 * @param options - Export configuration
 * @returns STL file as Uint8Array
 */
export function generateSTL(
  imageData: vtkImageData,
  options: STLExportOptions
): Uint8Array {
  const { isoValue, binary = true, smoothing = true, onProgress } = options;
  const metrics: ExportMetrics = {};
  const startTime = performance.now();

  // Create marching cubes filter to extract isosurface
  const mcStart = performance.now();
  const marchingCubes = vtkImageMarchingCubes.newInstance({
    contourValue: isoValue,
    computeNormals: true,
    mergePoints: true,
  });

  // Connect input
  marchingCubes.setInputData(imageData);
  marchingCubes.update();

  const mcEnd = performance.now();
  metrics.marchingCubesTime = mcEnd - mcStart;

  // Get polygon count
  const mcOutput = marchingCubes.getOutputData();
  metrics.polygonCount = mcOutput.getNumberOfPolys();

  onProgress?.("marching-cubes", { ...metrics });

  // Apply smoothing if requested
  let finalOutput = marchingCubes.getOutputPort();

  if (smoothing) {
    const smoothStart = performance.now();
    const smoother = vtkWindowedSincPolyDataFilter.newInstance({
      numberOfIterations: 15, // moderate smoothing
      passBand: 0.1, // VTK's recommended default
      nonManifoldSmoothing: 1,
      featureEdgeSmoothing: 1,
      boundarySmoothing: 0, // keep boundaries sharper
      normalizeCoordinates: true,
    });

    smoother.setInputConnection(marchingCubes.getOutputPort());
    smoother.update();
    finalOutput = smoother.getOutputPort();

    const smoothEnd = performance.now();
    metrics.smoothingTime = smoothEnd - smoothStart;

    onProgress?.("smoothing", { ...metrics });
  }

  // Create STL writer
  const writeStart = performance.now();
  const writer = vtkSTLWriter.newInstance({
    binary,
  });

  // Connect final output to writer
  writer.setInputConnection(finalOutput);

  // Generate STL data
  const stlData = writer.getOutputData();

  const writeEnd = performance.now();
  metrics.writingTime = writeEnd - writeStart;
  metrics.totalTime = writeEnd - startTime;

  onProgress?.("writing", { ...metrics });

  return stlData;
}

/**
 * Download STL file to user's computer
 * @param stlData - STL file data
 * @param filename - Output filename (without extension)
 */
export function downloadSTL(
  stlData: Uint8Array | string,
  filename: string
): void {
  const blob = new Blob([stlData as BlobPart], {
    type: "application/octet-stream",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.stl`;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Common HU (Hounsfield Unit) threshold values for CT scans
 */
export const HU_THRESHOLDS = {
  HIGH_DENSITY: 300, // Bone
  MEDIUM_DENSITY: 40, // Muscle/organs/brain
  LOW_DENSITY: -50, // Skin/fat
} as const;

/**
 * Generate and download STL file from DICOM volume
 * @param imageData - VTK image data
 * @param filename - Output filename
 * @param tissueType - Preset tissue type or custom threshold
 * @param smoothing - Whether to apply smoothing
 * @param onProgress - Optional progress callback
 */
export async function exportToSTL(
  imageData: vtkImageData,
  filename: string,
  tissueType: keyof typeof HU_THRESHOLDS | number = "HIGH_DENSITY",
  smoothing: boolean = false,
  onProgress?: (
    stage: "marching-cubes" | "smoothing" | "writing" | "complete",
    metrics: ExportMetrics
  ) => void
): Promise<void> {
  const isoValue =
    typeof tissueType === "number" ? tissueType : HU_THRESHOLDS[tissueType];

  // Generate STL in a non-blocking way
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        const stlData = generateSTL(imageData, {
          isoValue,
          binary: true,
          smoothing,
          onProgress,
        });

        downloadSTL(stlData, filename);

        // Call onProgress with complete stage
        if (onProgress) {
          onProgress("complete", {});
        }

        resolve();
      }, 0);
    } catch (error) {
      reject(error);
    }
  });
}
