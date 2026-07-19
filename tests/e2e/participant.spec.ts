import { expect, test, type Page } from "@playwright/test";

type Category = "quiz" | "guess_leader" | "match_pair" | "leadership_scenario";

const categoryRandomValue: Record<Category, number> = {
  quiz: 0.01,
  guess_leader: 0.26,
  match_pair: 0.51,
  leadership_scenario: 0.76,
};

async function startChallenge(page: Page, category: Category) {
  await page.addInitScript(
    ({ values }) => {
      let cursor = 0;
      Math.random = () => values[cursor++] ?? 0.01;
    },
    // pick a wheel segment, then provide stable jitter/turn/question values
    { values: [categoryRandomValue[category], 0.5, 0.5, 0.01] }
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Start the game" }).click();
  await page.getByLabel("Full name *").fill("Playwright Student");
  await page.getByLabel("Course / Department (optional)").fill("B.Tech CSE");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/spin$/);
  await page.getByRole("button", { name: "Spin the wheel" }).click();
  await expect(page).toHaveURL(/\/challenge$/, { timeout: 5_000 });
}

async function openChallenge(page: Page, category: Category) {
  await page.addInitScript(({ selectedCategory }) => {
    localStorage.setItem(
      "spin-to-lead-session",
      JSON.stringify({
        state: {
          participantName: "Playwright Student",
          department: "B.Tech CSE",
          selectedCategory,
          currentQuestion: null,
          isCorrect: null,
          score: 0,
          phase: "challenge",
        },
        version: 0,
      })
    );
    Math.random = () => 0.01;
  }, { selectedCategory: category });
  await page.goto("/challenge");
  await expect(page).toHaveURL(/\/challenge$/);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test("validates participant details and guards incomplete sessions", async ({ page }) => {
  await page.goto("/challenge");
  await expect(page).toHaveURL(/\/participant$/);

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("alert")).toHaveText(/at least 2 characters/i);
});

test("completes a quiz and starts a fresh game", async ({ page }) => {
  await startChallenge(page, "quiz");
  await expect(page.getByText("Who is known as the chief architect")).toBeVisible();
  await page.getByRole("radio").nth(1).click();
  await page.getByRole("button", { name: "Submit answer" }).click();
  await expect(page.getByRole("heading", { name: "That was a strong call." })).toBeVisible();
  await page.getByRole("button", { name: "Finish" }).click();
  await expect(page.getByRole("heading", { name: "Thank you for taking the lead." })).toBeVisible();
  await page.getByRole("button", { name: "Start a new game" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("renders and submits the Guess the Leader challenge", async ({ page }) => {
  await openChallenge(page, "guess_leader");
  await expect(page.getByText("Portrait coming soon")).toBeVisible();
  await page.getByRole("radio").first().click();
  await page.getByRole("button", { name: "Submit answer" }).click();
  await expect(page.getByRole("heading", { name: "That was a strong call." })).toBeVisible();
});

test("requires every Match the Pair selection before submission", async ({ page }) => {
  await openChallenge(page, "match_pair");
  const matches = [
    ["Dr. B. R. Ambedkar", "Chief architect of the Indian Constitution"],
    ["Mother Teresa", "Founded the Missionaries of Charity"],
    ["Dr. APJ Abdul Kalam", "Led India's missile development programme"],
    ["Sardar Patel", "Unified the princely states of India"],
  ];
  const submit = page.getByRole("button", { name: "Submit answer" });
  await expect(submit).toBeDisabled();
  for (const [leader, achievement] of matches) {
    await page.getByLabel(`Match for ${leader}`).click();
    await page.getByRole("option", { name: achievement, exact: true }).click();
  }
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByRole("heading", { name: "That was a strong call." })).toBeVisible();
});

test("renders an incorrect Leadership Scenario result with the correct answer", async ({ page }) => {
  await openChallenge(page, "leadership_scenario");
  await expect(page.getByText("Your project team's presentation is tomorrow")).toBeVisible();
  await page.getByRole("radio").first().click();
  await page.getByRole("button", { name: "Submit answer" }).click();
  await expect(page.getByRole("heading", { name: "Good attempt." })).toBeVisible();
  await expect(page.getByText("Sit with them tonight, split the section, and help them finish it")).toBeVisible();
});
