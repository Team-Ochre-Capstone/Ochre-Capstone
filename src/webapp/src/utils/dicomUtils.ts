import {
  setPipelinesBaseUrl,
  readDicomTags,
  readImageDicomFileSeries,
} from "@itk-wasm/dicom";

// Set the base URL for ITK-Wasm pipelines
setPipelinesBaseUrl("/pipelines");

export interface DicomFileInfo {
  file: File;
  isDICOM: boolean;
  patientID?: string;
  patientName?: string;
  patientDateOfBirth?: string;
  patientSex?: string;
  studyDate?: string;
  studyTime?: string;
  seriesDescription?: string;
  studyInstanceID?: string;
  seriesInstanceID?: string;
}

export interface ProgressEvent {
  lengthComputable: boolean;
  loaded: number;
  total: number;
}

export type ProgressCallback = (event: ProgressEvent) => void;

/**
 * Parse DICOM files and extract metadata tags
 */
export async function parseDicomFiles(
  fileList: FileList | File[],
  progressCallback?: ProgressCallback
): Promise<DicomFileInfo[]> {
  const files = Array.from(fileList);
  let loaded = 0;

  if (progressCallback) {
    progressCallback({
      lengthComputable: true,
      loaded: 0,
      total: files.length,
    });
  }

  const fetchInfo = async (file: File, worker: Worker | null) => {
    try {
      const { webWorker, tags } = await readDicomTags(file, {
        tagsToRead: {
          tags: [
            "0010|0020",
            "0010|0010",
            "0010|0030",
            "0010|0040", // patient ID, name, DoB, sex
            "0008|0021",
            "0008|0031", // study date and time
            "0008|103e", // series description
            "0020|000d",
            "0020|000e", // study instance ID, series instance ID
          ],
        },
        webWorker: worker || undefined,
      });

      if (progressCallback) {
        progressCallback({
          lengthComputable: true,
          loaded: ++loaded,
          total: files.length,
        });
      }

      const tagMap = new Map(tags);
      return [
        {
          file,
          isDICOM: true,
          patientID: tagMap.get("0010|0020"),
          patientName: tagMap.get("0010|0010"),
          patientDateOfBirth: tagMap.get("0010|0030"),
          patientSex: tagMap.get("0010|0040"),
          studyDate: tagMap.get("0008|0021"),
          studyTime: tagMap.get("0008|0031"),
          seriesDescription: tagMap.get("0008|103e"),
          studyInstanceID: tagMap.get("0020|000d"),
          seriesInstanceID: tagMap.get("0020|000e"),
        } as DicomFileInfo,
        webWorker,
      ] as const;
    } catch (error) {
      console.error("Error parsing DICOM file:", error);

      if (progressCallback) {
        progressCallback({
          lengthComputable: true,
          loaded: ++loaded,
          total: files.length,
        });
      }

      return [
        {
          file,
          isDICOM: false,
        } as DicomFileInfo,
        null,
      ] as const;
    }
  };

  // Process files in chunks to avoid overwhelming the system
  const results: DicomFileInfo[] = [];
  const chunkSize = 200;

  for (let i = 0; i < files.length; i += chunkSize) {
    const fileChunk = files.slice(i, i + chunkSize);
    let worker: Worker | null = null;

    for (const file of fileChunk) {
      const [fileInfo, newWorker] = await fetchInfo(file, worker);
      results.push(fileInfo);
      worker = newWorker;
    }

    if (worker !== null) {
      worker.terminate();
    }
  }

  return results;
}

/**
 * Load DICOM image series from files
 */
export async function loadDicomImageSeries(
  files: File[],
  progressCallback?: ProgressCallback
) {
  if (progressCallback) {
    progressCallback({
      lengthComputable: false,
      loaded: 0,
      total: 0,
    });
  }

  const { outputImage, webWorkerPool } = await readImageDicomFileSeries({
    inputImages: files,
  });

  if (webWorkerPool) {
    webWorkerPool.terminateWorkers();
  }

  if (progressCallback) {
    progressCallback({
      lengthComputable: true,
      loaded: 100,
      total: 100,
    });
  }

  return outputImage;
}

/**
 * Group DICOM files by patient, study, and series
 */
export function groupDicomFiles(fileInfoList: DicomFileInfo[]) {
  const groupedMap = new Map<
    string,
    Map<string, Map<string, DicomFileInfo[]>>
  >();

  fileInfoList.forEach((fileInfo) => {
    if (!fileInfo.isDICOM) return;

    const patientID = fileInfo.patientID || "unknown";
    const studyID = fileInfo.studyInstanceID || "unknown";
    const seriesID = fileInfo.seriesInstanceID || "unknown";

    if (!groupedMap.has(patientID)) {
      groupedMap.set(
        patientID,
        new Map([[studyID, new Map([[seriesID, [fileInfo]]])]])
      );
    } else {
      const studies = groupedMap.get(patientID)!;

      if (!studies.has(studyID)) {
        studies.set(studyID, new Map([[seriesID, [fileInfo]]]));
      } else {
        const series = studies.get(studyID)!;

        if (!series.has(seriesID)) {
          series.set(seriesID, [fileInfo]);
        } else {
          series.get(seriesID)!.push(fileInfo);
        }
      }
    }
  });

  return groupedMap;
}
