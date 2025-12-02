import { useEffect, useRef, useState } from "react";
import "@kitware/vtk.js/Rendering/OpenGL/Profiles/Volume";
import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import vtkVolume from "@kitware/vtk.js/Rendering/Core/Volume";
import vtkVolumeMapper from "@kitware/vtk.js/Rendering/Core/VolumeMapper";
import vtkColorTransferFunction from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";
import vtkPiecewiseFunction from "@kitware/vtk.js/Common/DataModel/PiecewiseFunction";

interface Viewer3DProps {
  vtkImage: any;
  className?: string;
  window?: number;
  level?: number;
  onReady?: () => void;
}

export default function Viewer3D({
  vtkImage,
  className = "",
  window = 4000,
  level = 300,
  onReady,
}: Viewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fullScreenRendererRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const renderWindowRef = useRef<any>(null);
  const volumeActorRef = useRef<any>(null);
  const ctfunRef = useRef<any>(null);
  const ofunRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !vtkImage) return;

    // Create full screen render window
    const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
      container: containerRef.current,
      background: [0.1, 0.1, 0.1],
    });

    const renderer = fullScreenRenderer.getRenderer();
    const renderWindow = fullScreenRenderer.getRenderWindow();

    // Create volume mapper
    const mapper = vtkVolumeMapper.newInstance();
    mapper.setInputData(vtkImage);
    mapper.setSampleDistance(1.0);

    // Create volume actor
    const actor = vtkVolume.newInstance();
    actor.setMapper(mapper);

    // Configure color transfer function
    const ctfun = vtkColorTransferFunction.newInstance();
    // Set initial points
    ctfun.addRGBPoint(level - 200, 0.0, 0.0, 0.0);
    ctfun.addRGBPoint(level, 0.6, 0.5, 0.4);
    ctfun.addRGBPoint(level + 500, 0.9, 0.8, 0.7);
    ctfun.addRGBPoint(level + 1500, 1.0, 1.0, 1.0);

    // Configure opacity transfer function
    const ofun = vtkPiecewiseFunction.newInstance();
    // Set initial points
    ofun.addPoint(level - 200, 0.0);
    ofun.addPoint(level - 50, 0.0);
    ofun.addPoint(level, 0.3);
    ofun.addPoint(level + 200, 0.8);
    ofun.addPoint(level + 1000, 1.0);

    actor.getProperty().setRGBTransferFunction(0, ctfun);
    actor.getProperty().setScalarOpacity(0, ofun);
    actor.getProperty().setInterpolationTypeToLinear();
    actor.getProperty().setShade(true);
    actor.getProperty().setAmbient(0.2);
    actor.getProperty().setDiffuse(0.7);
    actor.getProperty().setSpecular(0.3);
    actor.getProperty().setSpecularPower(8.0);

    // Add actor to renderer
    renderer.addVolume(actor);
    renderer.resetCamera();

    // Store references
    fullScreenRendererRef.current = fullScreenRenderer;
    rendererRef.current = renderer;
    renderWindowRef.current = renderWindow;
    volumeActorRef.current = actor;
    ctfunRef.current = ctfun;
    ofunRef.current = ofun;

    // Initial render
    renderWindow.render();

    setIsReady(true);
    if (onReady) {
      onReady();
    }

    // Cleanup
    return () => {
      if (fullScreenRendererRef.current) {
        fullScreenRendererRef.current.delete();
        fullScreenRendererRef.current = null;
      }
      rendererRef.current = null;
      renderWindowRef.current = null;
      volumeActorRef.current = null;
      ctfunRef.current = null;
      ofunRef.current = null;
    };
  }, [vtkImage, onReady, level]);

  // Update transfer functions when window/level changes
  useEffect(() => {
    if (!ctfunRef.current || !ofunRef.current || !renderWindowRef.current) return;

    const ctfun = ctfunRef.current;
    const ofun = ofunRef.current;

    // Clear existing points
    ctfun.removeAllPoints();
    ofun.removeAllPoints();

    // For bone/tissue visualization, level is the threshold
    // Show opacity from threshold upward
    const threshold = level;
    
    // Set color transfer function
    // Dark for low values, bright for high values
    ctfun.addRGBPoint(threshold - 200, 0.0, 0.0, 0.0);
    ctfun.addRGBPoint(threshold, 0.6, 0.5, 0.4);
    ctfun.addRGBPoint(threshold + 500, 0.9, 0.8, 0.7);
    ctfun.addRGBPoint(threshold + 1500, 1.0, 1.0, 1.0);

    // Set opacity transfer function
    // Transparent below threshold, opaque above
    ofun.addPoint(threshold - 200, 0.0);
    ofun.addPoint(threshold - 50, 0.0);
    ofun.addPoint(threshold, 0.3);
    ofun.addPoint(threshold + 200, 0.8);
    ofun.addPoint(threshold + 1000, 1.0);

    // Trigger re-render
    renderWindowRef.current.render();
  }, [window, level]);

  const handleReset = () => {
    if (rendererRef.current && renderWindowRef.current) {
      rendererRef.current.resetCamera();
      renderWindowRef.current.render();
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div ref={containerRef} className="w-full h-full" />
      {isReady && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white text-gray-700 rounded-md shadow-md hover:bg-gray-100 transition-colors"
            title="Reset camera"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}