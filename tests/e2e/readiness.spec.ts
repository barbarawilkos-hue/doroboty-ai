import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { STORAGE_KEY } from "../../src/features/prototype/storage";
const detail = "/#/app/kandydaci/application-example";
async function employer(page: Page) {
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Karolina Wiśniewska", exact: true }).click();
  await expect(page).toHaveURL(/#\/app\/oferty$/);
  await page.goto(detail);
}
async function clarify(page: Page, text: string) {
  await page.getByRole("button", { name: "Dopytaj", exact: true }).click();
  await page.getByLabel("Propozycja pytania", { exact: true }).fill(text);
}
test("a stale tab preserves the newer save and offers its attempted change as a separate copy", async ({
  page,
  context,
}) => {
  await employer(page);
  const second = await context.newPage();
  await second.goto(detail);
  await clarify(page, "Nowe pytanie z karty A — nie może zniknąć.");
  await page.getByRole("button", { name: "Zapisz dopytanie", exact: true }).click();
  await expect(page.getByText("Zapisano: Dopytaj.", { exact: true })).toBeAttached();
  const before = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
  await second.getByRole("button", { name: "Zaproś na rozmowę", exact: true }).click();
  await second.getByRole("button", { name: "Zapisz zaproszenie", exact: true }).click();
  await expect(
    second.getByText("W innej karcie zapisano nowsze dane.", { exact: false }),
  ).toBeVisible();
  expect(await second.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(before);
  await expect(second.getByText("Zapisano: Zaproś na rozmowę.", { exact: true })).toHaveCount(0);
  const downloadPromise = second.waitForEvent("download");
  await second.getByRole("button", { name: "Pobierz kopię tej karty", exact: true }).click();
  const recovery = JSON.parse(await readFile((await (await downloadPromise).path())!, "utf8"));
  expect(recovery.applications[0].stage).toBe("interview_invited");
  expect(JSON.parse(before!).applications[0].stage).toBe("reviewed");
  // Further blocked actions must not replace the first recoverable attempt.
  await second.goto("/#/app/settings");
  await second.getByRole("button", { name: "Resetuj scenariusz", exact: true }).click();
  await second.getByRole("button", { name: "Resetuj", exact: true }).click();
  await expect(second.getByRole("alertdialog")).toHaveCount(0);
  const retainedDownload = second.waitForEvent("download");
  await second.getByRole("button", { name: "Pobierz kopię tej karty", exact: true }).click();
  expect(JSON.parse(await readFile((await (await retainedDownload).path())!, "utf8"))).toEqual(
    recovery,
  );
  await second.goto(detail);
  await second.getByRole("button", { name: "Wczytaj nowszy zapis", exact: true }).click();
  await second.getByRole("button", { name: "Wczytaj zapis", exact: true }).click();
  await expect(second.getByRole("region", { name: "Historia procesu", exact: true })).toContainText(
    "Nowe pytanie z karty A",
  );
  await expect(
    second.getByRole("button", { name: "Wczytaj nowszy zapis", exact: true }),
  ).toHaveCount(0);
  await second.close();
});
test("simultaneous tab writes have exactly one winner instead of overwriting each other", async ({
  page,
  context,
}) => {
  await employer(page);
  const second = await context.newPage();
  await second.goto(detail);
  await clarify(page, "Pytanie równoczesne A — zachowaj zwycięski zapis.");
  await clarify(second, "Pytanie równoczesne B — zachowaj zwycięski zapis.");
  await Promise.all([
    page.getByRole("button", { name: "Zapisz dopytanie", exact: true }).click(),
    second.getByRole("button", { name: "Zapisz dopytanie", exact: true }).click(),
  ]);
  await expect
    .poll(async () => {
      const raw = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
      return JSON.parse(raw!).applications[0].events.length;
    })
    .toBe(2);
  const saved = JSON.parse((await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY))!);
  expect(saved.applications[0].events[1].note).toMatch(/Pytanie równoczesne [AB]/);
  await expect
    .poll(
      async () =>
        Number(
          await page
            .getByRole("button", { name: "Pobierz kopię tej karty", exact: true })
            .isVisible(),
        ) +
        Number(
          await second
            .getByRole("button", { name: "Pobierz kopię tej karty", exact: true })
            .isVisible(),
        ),
    )
    .toBe(1);
  await second.close();
});
test("a stale tab cannot reset or import over another tab's save", async ({ page, context }) => {
  await employer(page);
  const second = await context.newPage();
  await second.goto("/#/app/settings");
  await clarify(page, "Nowsza historia chroniona przed resetem i importem.");
  await page.getByRole("button", { name: "Zapisz dopytanie", exact: true }).click();
  await expect(page.getByText("Zapisano: Dopytaj.", { exact: true })).toBeAttached();
  const before = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
  await second.getByRole("button", { name: "Resetuj scenariusz", exact: true }).click();
  await second.getByRole("button", { name: "Resetuj", exact: true }).click();
  await expect(second.getByRole("alertdialog")).toHaveCount(0);
  await expect(
    second.getByRole("button", { name: "Wczytaj nowszy zapis", exact: true }),
  ).toBeVisible();
  expect(await second.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(before);
  await expect(second.getByText("Przywrócono scenariusz początkowy.", { exact: true })).toHaveCount(
    0,
  );
  await second.getByLabel("Importuj plik scenariusza").setInputFiles({
    name: "valid.json",
    mimeType: "application/json",
    buffer: Buffer.from(before!),
  });
  await second.getByRole("button", { name: "Importuj", exact: true }).click();
  await expect(second.getByRole("alertdialog")).toHaveCount(0);
  expect(await second.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(before);
  await expect(second.getByText("Dane zostały zaimportowane.", { exact: true })).toHaveCount(0);
  await second.close();
});
test("without Web Locks the demo remains usable in memory and never overwrites browser storage", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "locks", { value: undefined, configurable: true }),
  );
  await employer(page);
  await clarify(page, "Zmiana w pamięci wymaga eksportu przed zamknięciem.");
  await page.getByRole("button", { name: "Zapisz dopytanie", exact: true }).click();
  await expect(
    page.getByText("Zmiany w tej karcie pozostają tylko w pamięci.", { exact: false }),
  ).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBeNull();
  await expect(page.getByRole("region", { name: "Historia procesu", exact: true })).toContainText(
    "Zmiana w pamięci wymaga eksportu",
  );
});
test("technical reports contain only bounded metadata even when errors include private text", async ({
  page,
}) => {
  await page.goto("/#/pomoc");
  await page.evaluate(() => {
    for (let i = 0; i < 35; i++)
      window.dispatchEvent(
        new ErrorEvent("error", {
          message: "PRIVATE_CV_AND_TOKEN",
          error: new Error("PRIVATE_CV_AND_TOKEN"),
        }),
      );
  });
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Pobierz raport techniczny", exact: true }).click();
  const raw = await readFile((await (await downloadPromise).path())!, "utf8");
  expect(raw).not.toContain("PRIVATE_CV_AND_TOKEN");
  const report = JSON.parse(raw);
  expect(report.events).toHaveLength(20);
  expect(report.buildId).toMatch(/^[a-f0-9]{64}$/);
  for (const event of report.events) expect(Object.keys(event).sort()).toEqual(["at", "code"]);
});
test("a rendering failure shows recovery controls without clearing the scenario", async ({
  page,
}) => {
  await employer(page);
  const before = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
  await page.addInitScript(() =>
    Object.defineProperty(Intl.DateTimeFormat.prototype, "format", {
      configurable: true,
      get() {
        return () => {
          throw new Error("PRIVATE_RENDER_PAYLOAD");
        };
      },
    }),
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Nie udało się wyświetlić strony", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(before);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Pobierz raport techniczny", exact: true }).click();
  const raw = await readFile((await (await downloadPromise).path())!, "utf8");
  expect(raw).toContain("render-error");
  expect(raw).not.toContain("PRIVATE_RENDER_PAYLOAD");
});
test("demo entry, help and company information pass targeted accessibility and narrow-screen checks", async ({
  page,
}) => {
  for (const route of ["/", "/#/pomoc", "/#/firmy/northstar-health"]) {
    await page.goto(route);
    await expect(
      page.getByRole("complementary", { name: "Wersja demonstracyjna", exact: true }),
    ).toContainText("fikcyjnych danych");
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(result.violations).toEqual([]);
  }
  await page.goto("/");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: "artifacts/publication-demo-desktop.png", fullPage: true });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: `artifacts/publication-demo-${width}.png`, fullPage: true });
  }
});
