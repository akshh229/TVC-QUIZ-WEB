import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page) {
  await page.goto("/admin");
  await page.getByLabel("Password").fill("playwright-admin");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test("protects the admin area and handles invalid credentials", async ({ page }) => {
  await page.goto("/admin/dashboard");
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toHaveText(/isn't right/i);
  await signIn(page);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("manages questions in isolated mock mode", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Questions" }).click();
  await expect(page.getByRole("heading", { name: "Questions" })).toBeVisible();

  await page.getByRole("button", { name: "Add question" }).click();
  const prompt = "What makes a reliable Playwright verification?";
  await page.getByLabel("Question text").fill(prompt);
  await page.getByRole("textbox", { name: "Option A" }).fill("A clear assertion");
  await page.getByRole("textbox", { name: "Option B" }).fill("A lucky refresh");
  await page.getByRole("textbox", { name: "Option C" }).fill("A hidden dependency");
  await page.getByRole("textbox", { name: "Option D" }).fill("An empty result");
  await page.getByLabel("Mark option A as correct").click();
  await page.getByRole("button", { name: "Add question" }).last().click();
  await expect(page.getByRole("dialog")).not.toBeVisible();

  const originalRow = page.getByRole("row").filter({
    has: page.getByText(prompt, { exact: true }),
  });
  await expect(originalRow).toHaveCount(1);
  await originalRow.getByLabel("Duplicate question").click();
  const copyRow = page.getByRole("row").filter({
    has: page.getByText(`${prompt} (copy)`, { exact: true }),
  });
  await expect(copyRow).toHaveCount(1);
  await originalRow.getByLabel("Deactivate question").click();
  await expect(originalRow.getByLabel("Activate question")).toBeVisible();
  await originalRow.getByLabel("Delete question").click();
  await page.getByRole("button", { name: "Delete question" }).click();
  await expect(originalRow).toHaveCount(0);
  await expect(copyRow).toHaveCount(1);
});

test("uploads, previews, and deletes mock media", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Media" }).click();
  const fileName = "playwright-portrait.svg";
  await page.getByLabel("Upload images").setInputFiles({
    name: fileName,
    mimeType: "image/svg+xml",
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="50"/>'),
  });
  const mediaCard = page.locator("li").filter({
    has: page.locator(`p[title$="-${fileName}"]`),
  });
  await expect(mediaCard).toBeVisible();
  await mediaCard.getByRole("button", { name: /Preview/ }).click();
  await expect(page.getByRole("dialog")).toContainText(fileName);
  await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();
  await expect(mediaCard).toHaveCount(0);
});
