import { test, expect } from "@playwright/test";
import { uploadDicomFiles } from "./helpers/upload-helper";

test.describe("Upload Page", () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the upload page", async ({ page }) => {
    await expect(page.locator("h2")).toContainText("Upload DICOM Files");
    await expect(page.getByText("Drop DICOM folder here")).toBeVisible();
  });

  test("should upload DICOM files and navigate to preview", async ({
    page,
    browserName,
  }) => {
    // Temporary skip Firefox
    test.skip(
      browserName === "firefox",
      "Temporary skip Firefox has issues with directory uploads in CI"
    );

    await uploadDicomFiles(page);

    // Wait for the upload to be processed
    await expect(page.getByText("Successfully loaded")).toBeVisible({
      timeout: 10000,
    });

    const continueButton = page.getByRole("button", {
      name: /Continue to 3D Preview/i,
    });
    await expect(continueButton).toBeEnabled();
    await continueButton.click();

    await expect(page).toHaveURL("/preview", { timeout: 10000 });
    await expect(page.locator("h2")).toContainText("3D Preview", {
      timeout: 10000,
    });
  });

  test("should show patient information after upload", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "firefox",
      "Firefox has issues with directory uploads in CI"
    );

    await uploadDicomFiles(page);

    await expect(page.getByText("Successfully loaded")).toBeVisible();
  });
});
