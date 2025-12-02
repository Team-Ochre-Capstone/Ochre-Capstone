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
  const { isoValue, binary = true, smoothing = true } = options;

  // Create marching cubes filter to extract isosurface
  const marchingCubes = vtkImageMarchingCubes.newInstance({
    contourValue: isoValue,
    computeNormals: true,
    mergePoints: true,
  });

  // Connect input
  marchingCubes.setInputData(imageData);

  // Apply smoothing if requested
  let finalOutput = marchingCubes.getOutputPort();

  if (smoothing) {
    const smoother = vtkWindowedSincPolyDataFilter.newInstance({
      numberOfIterations: 15, // moderate smoothing
      passBand: 0.1, // VTK's recommended default
      nonManifoldSmoothing: 1,
      featureEdgeSmoothing: 1,
      boundarySmoothing: 0, // keep boundaries sharper
      normalizeCoordinates: true,
    });

    smoother.setInputConnection(marchingCubes.getOutputPort());
    finalOutput = smoother.getOutputPort();
  }

  // Create STL writer
  const writer = vtkSTLWriter.newInstance({
    binary,
  });

  // Connect final output to writer
  writer.setInputConnection(finalOutput);

  // Generate STL data
  const stlData = writer.getOutputData();

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
 */
export async function exportToSTL(
  imageData: vtkImageData,
  filename: string,
  tissueType: keyof typeof HU_THRESHOLDS | number = "HIGH_DENSITY",
  smoothing: boolean = false
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
        });

        downloadSTL(stlData, filename);
        resolve();
      }, 0);
    } catch (error) {
      reject(error);
    }
  });
}
