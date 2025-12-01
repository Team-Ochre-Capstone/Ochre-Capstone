import { createContext, useContext, useRef, useState, ReactNode, useCallback } from "react";
import type { DicomFileInfo } from "../utils/dicomUtils";

interface DicomContextType {
  getVtkImage: () => any | null;
  fileInfo: DicomFileInfo[];
  hasData: boolean;
  setDicomData: (vtkImage: any, fileInfo: DicomFileInfo[]) => void;
  clearDicomData: () => void;
}

const DicomContext = createContext<DicomContextType | undefined>(undefined);

export function DicomProvider({ children }: { children: ReactNode }) {
  // Use ref for VTK image to avoid serialization issues
  const vtkImageRef = useRef<any | null>(null);
  const [fileInfo, setFileInfo] = useState<DicomFileInfo[]>([]);
  const [hasData, setHasData] = useState(false);

  const getVtkImage = useCallback(() => vtkImageRef.current, []);

  const setDicomData = useCallback((newVtkImage: any, newFileInfo: DicomFileInfo[]) => {
    vtkImageRef.current = newVtkImage;
    setFileInfo(newFileInfo);
    setHasData(true);
  }, []);

  const clearDicomData = useCallback(() => {
    vtkImageRef.current = null;
    setFileInfo([]);
    setHasData(false);
  }, []);

  return (
    <DicomContext.Provider
      value={{ 
        getVtkImage, 
        fileInfo,
        hasData,
        setDicomData, 
        clearDicomData 
      }}
    >
      {children}
    </DicomContext.Provider>
  );
}


export function useDicomContext() {
  const context = useContext(DicomContext);
  if (context === undefined) {
    throw new Error("useDicomContext must be used within a DicomProvider");
  }
  return context;
}
