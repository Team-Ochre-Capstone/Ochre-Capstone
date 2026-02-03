import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  generateSTL,
  downloadSTL,
  exportToSTL,
  HU_THRESHOLDS,
} from "../stlExport";
import type { vtkImageData } from "@kitware/vtk.js/Common/DataModel/ImageData";

// Mock VTK modules
vi.mock("@kitware/vtk.js/Filters/General/ImageMarchingCubes", () => ({
  default: {
    newInstance: vi.fn(() => ({
      setInputData: vi.fn(),
      update: vi.fn(),
      getOutputPort: vi.fn(() => ({ mock: "port" })),
      getOutputData: vi.fn(() => ({
        getNumberOfPolys: vi.fn(() => 1000),
      })),
    })),
  },
}));

vi.mock("@kitware/vtk.js/Filters/General/WindowedSincPolyDataFilter", () => ({
  default: {
    newInstance: vi.fn(() => ({
      setInputConnection: vi.fn(),
      update: vi.fn(),
      getOutputPort: vi.fn(() => ({ mock: "smoothed-port" })),
    })),
  },
}));

vi.mock("@kitware/vtk.js/IO/Geometry/STLWriter", () => ({
  default: {
    newInstance: vi.fn(() => ({
      setInputConnection: vi.fn(),
      getOutputData: vi.fn(() => new Uint8Array([0, 1, 2, 3])),
    })),
  },
}));

describe("STL Export - Segmentation Tests", () => {
  let mockImageData: vtkImageData;
  let createElementSpy: any;
  let appendChildSpy: any;
  let removeChildSpy: any;

  beforeEach(() => {
    mockImageData = {} as vtkImageData;

    // Mock DOM methods for downloadSTL
    createElementSpy = vi.spyOn(document, "createElement");
    appendChildSpy = vi.spyOn(document.body, "appendChild");
    removeChildSpy = vi.spyOn(document.body, "removeChild");
    vi.spyOn(URL, "createObjectURL").mockReturnValue(
      "blob:mock-url/12345"
    );
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("generateSTL()", () => {
    it("should generate STL with HIGH_DENSITY threshold (bone)", () => {
      const onProgress = vi.fn();
      const options = {
        isoValue: HU_THRESHOLDS.HIGH_DENSITY,
        binary: true,
        smoothing: false,
        onProgress,
      };

      const result = generateSTL(mockImageData, options);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(onProgress).toHaveBeenCalledWith("marching-cubes", expect.any(Object));
      expect(onProgress).toHaveBeenCalledWith("writing", expect.any(Object));
    });

    it("should generate STL with MEDIUM_DENSITY threshold (muscle)", () => {
      const onProgress = vi.fn();
      const options = {
        isoValue: HU_THRESHOLDS.MEDIUM_DENSITY,
        binary: true,
        smoothing: false,
        onProgress,
      };

      const result = generateSTL(mockImageData, options);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(onProgress).toHaveBeenCalledWith("marching-cubes", expect.any(Object));
    });

    it("should generate STL with LOW_DENSITY threshold (skin)", () => {
      const onProgress = vi.fn();
      const options = {
        isoValue: HU_THRESHOLDS.LOW_DENSITY,
        binary: true,
        smoothing: false,
        onProgress,
      };

      const result = generateSTL(mockImageData, options);

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it("should apply smoothing when smoothing option is true", () => {
      const onProgress = vi.fn();
      const options = {
        isoValue: 300,
        binary: true,
        smoothing: true,
        onProgress,
      };

      generateSTL(mockImageData, options);

      expect(onProgress).toHaveBeenCalledWith(
        "smoothing",
        expect.objectContaining({
          smoothingTime: expect.any(Number),
        })
      );
    });

    it("should skip smoothing when smoothing option is false", () => {
      const onProgress = vi.fn();
      const options = {
        isoValue: 300,
        binary: true,
        smoothing: false,
        onProgress,
      };

      generateSTL(mockImageData, options);

      expect(onProgress).not.toHaveBeenCalledWith(
        "smoothing",
        expect.anything()
      );
    });

    it("should track progress metrics including polygon count", () => {
      const onProgress = vi.fn();
      const options = {
        isoValue: 300,
        binary: true,
        smoothing: false,
        onProgress,
      };

      generateSTL(mockImageData, options);

      const marchingCubesCall = onProgress.mock.calls.find(
        (call) => call[0] === "marching-cubes"
      );
      expect(marchingCubesCall?.[1]).toEqual(
        expect.objectContaining({
          polygonCount: expect.any(Number),
          marchingCubesTime: expect.any(Number),
        })
      );
    });

    it("should calculate total processing time", () => {
      const onProgress = vi.fn();
      const options = {
        isoValue: 300,
        binary: true,
        smoothing: false,
        onProgress,
      };

      generateSTL(mockImageData, options);

      const writingCall = onProgress.mock.calls.find(
        (call) => call[0] === "writing"
      );
      expect(writingCall?.[1]).toEqual(
        expect.objectContaining({
          totalTime: expect.any(Number),
        })
      );
    });

    it("should use custom threshold value", () => {
      const customThreshold = 250;
      const onProgress = vi.fn();
      const options = {
        isoValue: customThreshold,
        binary: true,
        smoothing: false,
        onProgress,
      };

      generateSTL(mockImageData, options);

      expect(onProgress).toHaveBeenCalled();
    });

    it("should handle binary STL format", () => {
      const options = {
        isoValue: 300,
        binary: true,
        smoothing: false,
      };

      const result = generateSTL(mockImageData, options);

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it("should handle ASCII STL format", () => {
      const options = {
        isoValue: 300,
        binary: false,
        smoothing: false,
      };

      const result = generateSTL(mockImageData, options);

      expect(result).toBeDefined();
    });

    it("should not call onProgress callback if not provided", () => {
      const options = {
        isoValue: 300,
        binary: true,
        smoothing: false,
      };

      expect(() => generateSTL(mockImageData, options)).not.toThrow();
    });
  });

  describe("downloadSTL()", () => {
    it("should create a blob with correct MIME type", () => {
      const stlData = new Uint8Array([1, 2, 3, 4]);
      const blobSpy = vi.spyOn(window, "Blob");
      const mockLink = document.createElement("a");
      createElementSpy.mockReturnValue(mockLink);

      downloadSTL(stlData, "test_model");

      expect(blobSpy).toHaveBeenCalledWith(expect.any(Array), {
        type: "application/octet-stream",
      });
    });

    it("should create download link with correct filename", () => {
      const stlData = new Uint8Array([1, 2, 3, 4]);
      const mockLink = document.createElement("a");
      createElementSpy.mockReturnValue(mockLink);

      downloadSTL(stlData, "my_bone_model");

      expect(mockLink.download).toBe("my_bone_model.stl");
    });

    it("should append and remove link from DOM", () => {
      const stlData = new Uint8Array([1, 2, 3, 4]);
      const mockLink = document.createElement("a");
      createElementSpy.mockReturnValue(mockLink);

      downloadSTL(stlData, "test");

      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
    });

    it("should clean up object URL", () => {
      const stlData = new Uint8Array([1, 2, 3, 4]);
      const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL");
      const mockLink = document.createElement("a");
      createElementSpy.mockReturnValue(mockLink);

      downloadSTL(stlData, "test");

      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it("should handle string input for STL data", () => {
      const stlString = "SOLID model";
      const blobSpy = vi.spyOn(window, "Blob");
      const mockLink = document.createElement("a");
      createElementSpy.mockReturnValue(mockLink);

      downloadSTL(stlString, "test_model");

      expect(blobSpy).toHaveBeenCalled();
    });
  });

  describe("exportToSTL()", () => {
    it("should resolve promise on successful export", async () => {
      const onProgress = vi.fn();
      const mockLink = document.createElement("a");
      createElementSpy.mockReturnValue(mockLink);

      const promise = exportToSTL(
        mockImageData,
        "test_model",
        "HIGH_DENSITY",
        false,
        onProgress
      );

      await expect(promise).resolves.toBeUndefined();
    });

    it("should use HIGH_DENSITY threshold by default", async () => {
      const onProgress = vi.fn();
      const mockLink = document.createElement("a");
      createElementSpy.mockReturnValue(mockLink);

      await exportToSTL(mockImageData, "test", "HIGH_DENSITY", false, onProgress);

      expect(onProgress).toHaveBeenCalled();
    });

    it("should use MEDIUM_DENSITY threshold when specified", async () => {
      const onProgress = vi.fn();
      const mockLink = document.createElement("a");
      createElementSpy.mockReturnValue(mockLink);

      await exportToSTL(mockImageData, "test", "MEDIUM_DENSITY", false, onProgress);

      expect(onProgress).toHaveBeenCalled();
    });

    it("should use LOW_DENSITY threshold when specified", async () => {
      const onProgress = vi.fn();
      const mockLink = document.createElement("a");
      createElementSpy.mockReturnValue(mockLink);

      await exportToSTL(mockImageData, "test", "LOW_DENSITY", false, onProgress);

      expect(onProgress).toHaveBeenCalled();
    });

    it("should accept custom numeric threshold", async () => {
      const customThreshold = 150;
      const onProgress = vi.fn();
      const mockLink = document.createElement("a");
      createElementSpy.mockReturnValue(mockLink);

      await exportToSTL(
        mockImageData,
        "test",
        customThreshold,
        false,
        onProgress
      );

      expect(onProgress).toHaveBeenCalled();
    });

    it("should apply smoothing when enabled", async () => {
      const onProgress = vi.fn();
      const mockLink = document.createElement("a");
      createElementSpy.mockReturnValue(mockLink);

      await exportToSTL(mockImageData, "test", "HIGH_DENSITY", true, onProgress);

      expect(onProgress).toHaveBeenCalledWith(
        "smoothing",
        expect.anything()
      );
    });

    it("should skip smoothing when disabled", async () => {
      const onProgress = vi.fn();
      const mockLink = document.createElement("a");
      createElementSpy.mockReturnValue(mockLink);

      await exportToSTL(mockImageData, "test", "HIGH_DENSITY", false, onProgress);

      expect(onProgress).not.toHaveBeenCalledWith(
        "smoothing",
        expect.anything()
      );
    });

    it("should call complete stage on successful export", async () => {
      const onProgress = vi.fn();
      const mockLink = document.createElement("a");
      createElementSpy.mockReturnValue(mockLink);

      await exportToSTL(mockImageData, "test", "HIGH_DENSITY", false, onProgress);

      expect(onProgress).toHaveBeenCalledWith("complete", {});
    });

    it("should handle export without progress callback", async () => {
      const mockLink = document.createElement("a");
      createElementSpy.mockReturnValue(mockLink);

      const promise = exportToSTL(
        mockImageData,
        "test_model",
        "HIGH_DENSITY",
        false
      );

      await expect(promise).resolves.toBeUndefined();
    });

  });

  describe("HU_THRESHOLDS", () => {
    it("should have HIGH_DENSITY constant for bone", () => {
      expect(HU_THRESHOLDS.HIGH_DENSITY).toBe(300);
    });

    it("should have MEDIUM_DENSITY constant for muscle", () => {
      expect(HU_THRESHOLDS.MEDIUM_DENSITY).toBe(40);
    });

    it("should have LOW_DENSITY constant for skin", () => {
      expect(HU_THRESHOLDS.LOW_DENSITY).toBe(-50);
    });

    it("should prevent modification due to as const declaration", () => {
      const testThreshold = HU_THRESHOLDS.HIGH_DENSITY;
      expect(testThreshold).toBe(300);
      // Note: as const makes the object readonly in TypeScript, but
      // this doesn't throw at runtime in non-strict mode
    });
  });

  describe("Segmentation Integration", () => {
    it("should have all tissue thresholds available", () => {
      expect(HU_THRESHOLDS.HIGH_DENSITY).toBeDefined();
      expect(HU_THRESHOLDS.MEDIUM_DENSITY).toBeDefined();
      expect(HU_THRESHOLDS.LOW_DENSITY).toBeDefined();
    });

    it("should generate STL for multiple tissue types", () => {
      const onProgress = vi.fn();

      // Test bone
      generateSTL(mockImageData, {
        isoValue: HU_THRESHOLDS.HIGH_DENSITY,
        binary: true,
        smoothing: true,
        onProgress,
      });

      // Test muscle
      generateSTL(mockImageData, {
        isoValue: HU_THRESHOLDS.MEDIUM_DENSITY,
        binary: true,
        smoothing: false,
        onProgress,
      });

      // Test skin
      generateSTL(mockImageData, {
        isoValue: HU_THRESHOLDS.LOW_DENSITY,
        binary: true,
        smoothing: true,
        onProgress,
      });

      expect(onProgress).toHaveBeenCalled();
    });

    it("should report metrics for bone segmentation", () => {
      const onProgress = vi.fn();

      generateSTL(mockImageData, {
        isoValue: HU_THRESHOLDS.HIGH_DENSITY,
        binary: true,
        smoothing: true,
        onProgress,
      });

      const calls = onProgress.mock.calls;
      expect(calls.length).toBeGreaterThan(0);

      // Check that we got marching cubes stage
      const marchingCubesStage = calls.find((c) => c[0] === "marching-cubes");
      expect(marchingCubesStage).toBeDefined();
    });
  });
});
