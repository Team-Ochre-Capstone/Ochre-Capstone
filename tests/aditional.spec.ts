import { test, expect } from "@playwright/test";
import path from "path";

test.describe("DICOM Upload Navigation", () => {
  test.setTimeout(60000);

  test("should navigate to 3D Preview after upload", async ({ page }) => {
    await page.goto("/");

    // Select the file input and upload folder
    const fileInput = page.locator('input[type="file"]');
    const dicomFolder = path.join(__dirname, "fixtures/Test_CT_Dicom");

    await fileInput.setInputFiles(dicomFolder);

    // Wait for success message
    await expect(page.getByText(/Successfully loaded \d+ DICOM files/)).toBeVisible({ timeout: 20000 });

    // Click Continue to 3D Preview
    const previewButton = page.getByRole("button", { name: /Continue to 3D Preview/i });
    await expect(previewButton).toBeVisible({ timeout: 10000 });
    await previewButton.click();

    // Verify navigation
    await expect(page).toHaveURL("/preview");

    // Check heading text (partial match)
    await expect(page.getByText(/3D Preview/i)).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to Export page after upload", async ({ page }) => {
    await page.goto("/");

    // Upload DICOM files
    const fileInput = page.locator('input[type="file"]');
    const dicomFolder = path.join(__dirname, "fixtures/Test_CT_Dicom");
    await fileInput.setInputFiles(dicomFolder);

    await expect(page.getByText(/Successfully loaded \d+ DICOM files/)).toBeVisible({ timeout: 20000 });

    // Click Skip to Export
    const exportButton = page.getByRole("button", { name: /Skip to Export/i });
    await expect(exportButton).toBeVisible({ timeout: 10000 });
    await exportButton.click();

    // Verify navigation
    await expect(page).toHaveURL("/export");

    // Check export heading
    await expect(page.getByText(/Export 3D Model/i)).toBeVisible({ timeout: 10000 });
  });
  
});
