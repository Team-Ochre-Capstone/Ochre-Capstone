declare module "@kitware/vtk.js/Filters/General/ImageMarchingCubes" {
  import { vtkAlgorithm } from "@kitware/vtk.js/interfaces";

  export interface vtkImageMarchingCubes extends vtkAlgorithm {
    setContourValue(value: number): boolean;
    getContourValue(): number;
    setComputeNormals(compute: boolean): boolean;
    getComputeNormals(): boolean;
    setMergePoints(merge: boolean): boolean;
    getMergePoints(): boolean;
  }

  export interface vtkImageMarchingCubesInitialValues {
    contourValue?: number;
    computeNormals?: boolean;
    mergePoints?: boolean;
  }

  export function newInstance(
    initialValues?: vtkImageMarchingCubesInitialValues
  ): vtkImageMarchingCubes;

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: vtkImageMarchingCubesInitialValues
  ): void;

  const vtkImageMarchingCubes: {
    newInstance: typeof newInstance;
    extend: typeof extend;
  };

  export default vtkImageMarchingCubes;
}

declare module "@kitware/vtk.js/IO/Geometry/STLWriter" {
  import { vtkAlgorithm } from "@kitware/vtk.js/interfaces";

  export interface vtkSTLWriter extends vtkAlgorithm {
    setBinary(binary: boolean): boolean;
    getBinary(): boolean;
    getOutputData(): Uint8Array;
    write(data?: any): void;
  }

  export interface vtkSTLWriterInitialValues {
    binary?: boolean;
  }

  export function newInstance(
    initialValues?: vtkSTLWriterInitialValues
  ): vtkSTLWriter;

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: vtkSTLWriterInitialValues
  ): void;

  const vtkSTLWriter: {
    newInstance: typeof newInstance;
    extend: typeof extend;
  };

  export default vtkSTLWriter;
}

declare module "@kitware/vtk.js/Filters/General/WindowedSincPolyDataFilter" {
  import { vtkAlgorithm } from "@kitware/vtk.js/interfaces";

  export interface vtkWindowedSincPolyDataFilter extends vtkAlgorithm {
    setNumberOfIterations(iterations: number): boolean;
    getNumberOfIterations(): number;
    setPassBand(band: number): boolean;
    getPassBand(): number;
    setNonManifoldSmoothing(smooth: number): boolean;
    getNonManifoldSmoothing(): number;
    setFeatureEdgeSmoothing(smooth: number): boolean;
    getFeatureEdgeSmoothing(): number;
    setBoundarySmoothing(smooth: number): boolean;
    getBoundarySmoothing(): number;
    setNormalizeCoordinates(normalize: boolean): boolean;
    getNormalizeCoordinates(): boolean;
  }

  export interface vtkWindowedSincPolyDataFilterInitialValues {
    numberOfIterations?: number;
    passBand?: number;
    nonManifoldSmoothing?: number;
    featureEdgeSmoothing?: number;
    boundarySmoothing?: number;
    normalizeCoordinates?: boolean;
  }

  export function newInstance(
    initialValues?: vtkWindowedSincPolyDataFilterInitialValues
  ): vtkWindowedSincPolyDataFilter;

  export function extend(
    publicAPI: object,
    model: object,
    initialValues?: vtkWindowedSincPolyDataFilterInitialValues
  ): void;

  const vtkWindowedSincPolyDataFilter: {
    newInstance: typeof newInstance;
    extend: typeof extend;
  };

  export default vtkWindowedSincPolyDataFilter;
}
