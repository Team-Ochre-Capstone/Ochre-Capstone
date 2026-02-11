// tests/helpers/upload-helper.ts
import { Page, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

/**
 * Upload a folder of DICOM files using the drop area
 */
export async function uploadDicomFiles(page: Page): Promise<void> {
  const dicomFolder = path.resolve(__dirname, "../fixtures/Test_CT_Dicom");
  console.log("Resolved DICOM folder path:", dicomFolder);

  // Verify folder exists and has files
  if (!fs.existsSync(dicomFolder)) throw new Error("DICOM folder not found!");
  const files = fs.readdirSync(dicomFolder);
  if (!files.length) throw new Error("DICOM folder is empty!");
  console.log("Files in folder:", files);

  // Wait for file chooser triggered by clicking drop area
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.locator("div").filter({ hasText: /Drop DICOM folder here/ }).first().click();

  const fileChooser = await fileChooserPromise;

  // Provide the folder (directory upload)
  await fileChooser.setFiles(dicomFolder);

  // Wait for confirmation
  await expect(
    page.getByText(/Successfully loaded \d+ DICOM files/)
  ).toBeVisible({ timeout: 45000 });

  console.log("DICOM upload successful!");
}
