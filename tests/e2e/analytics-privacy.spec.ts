import { test, expect } from "@playwright/test";
import { privateElements } from "../../src/features/analytics/privacy";

test("private content and search forms are blocked while the public Build button remains capturable", async ({
  page,
}) => {
  await page.goto("/#/auth/sign-in");
  expect(
    await page
      .locator("#main")
      .evaluate((element, selector) => !!element.closest(selector), privateElements),
  ).toBe(true);
  await page.getByRole("button", { name: "Wejdź jako Anna Kowalska", exact: true }).click();
  await page.goto("/#/app/profil");
  const name = page.getByLabel("Imię i nazwisko");
  await name.fill("PRIVACY-SENTINEL");
  expect(
    await name.evaluate((element, selector) => !!element.closest(selector), privateElements),
  ).toBe(true);
  expect(
    await page
      .locator("#main")
      .evaluate((element) => !!element.closest("[data-analytics-private]")),
  ).toBe(true);
  await page.goto("/#/aplikuj/ai-product-manager");
  expect(
    await page
      .locator("#main")
      .evaluate((element) => !!element.closest("[data-analytics-private]")),
  ).toBe(true);
  await page.goto("/#/oferty");
  const build = page.locator('[data-ph-capture-attribute-action="category_build"]');
  expect(
    await build.evaluate((element, selector) => !!element.closest(selector), privateElements),
  ).toBe(false);
  expect(
    await page
      .getByLabel("Szukaj ofert", { exact: true })
      .evaluate((element, selector) => !!element.closest(selector), privateElements),
  ).toBe(true);
  await build.focus();
  await page.keyboard.press("Enter");
  await expect(build).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/category=build/);
});
