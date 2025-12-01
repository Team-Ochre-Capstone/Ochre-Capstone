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
  onReady,
}: Viewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fullScreenRendererRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const renderWindowRef = useRef<any>(null);
  const volumeActorRef = useRef<any>(null);
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
    ctfun.addRGBPoint(200.0, 0.4, 0.6, 0.8);
    ctfun.addRGBPoint(2000.0, 1.0, 1.0, 1.0);

    // Configure opacity transfer function
    const ofun = vtkPiecewiseFunction.newInstance();
    ofun.addPoint(300.0, 0.0);
    ofun.addPoint(500.0, 0.7);
    ofun.addPoint(2000.0, 1.0);

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
    };
  }, [vtkImage, onReady]);

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
