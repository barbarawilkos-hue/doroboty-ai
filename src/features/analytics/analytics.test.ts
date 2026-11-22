import { afterEach, expect, test, vi } from "vitest";
import type { CaptureResult } from "posthog-js";
import { analyticsClient, analyticsRoute, sanitizeAnalyticsEvent } from "./analytics";

afterEach(() => vi.unstubAllEnvs());

test("an unconfigured checkout does not initialize analytics", async () => {
  vi.stubEnv("VITE_POSTHOG_PROJECT_TOKEN", "");
  expect(await analyticsClient()).toBeNull();
});

test("hash routes remove queries, section anchors and dynamic user content", () => {
  expect(analyticsRoute("#/oferty?query=private+search")).toBe("/oferty");
  expect(analyticsRoute("#/oferty/private-job-title#employer")).toBe("/oferty/:slug");
  expect(analyticsRoute("#/app/kandydaci/private-id")).toBe("/app/kandydaci/:id");
  expect(analyticsRoute("#/app/aplikacje/private-id/wyslano")).toBe("/app/aplikacje/:id/wyslano");
  expect(analyticsRoute("#/private-unrecognized-route")).toBe("/unknown");
});

test("outgoing click payloads exclude form, DOM, URL and person data", () => {
  const event: CaptureResult = {
    uuid: "test-event",
    event: "$autocapture",
    $set: { email: "private@example.com" },
    $set_once: { name: "private name" },
    properties: {
      token: "public-project-token",
      distinct_id: "random-anonymous-id",
      $session_id: "random-session-id",
      $event_type: "click",
      $current_url: "https://example.com/?private=query#/oferty/private-slug?query=private",
      $referrer: "https://private.example.com/",
      $elements_chain: 'a.private-selector:text("private text")',
      $set: { name: "private name" },
      cv: "private CV",
      $elements: [
        {
          tag_name: "a",
          nth_child: 2,
          nth_of_type: 1,
          $el_text: "private text",
          attr__href: "private URL",
        },
      ],
    },
  };
  const result = sanitizeAnalyticsEvent(event, event.properties.$current_url);
  expect(result?.properties.$current_url).toBe("https://example.com/#/oferty/:slug");
  expect(result?.properties.$elements).toEqual([{ tag_name: "a", nth_child: 2, nth_of_type: 1 }]);
  expect(result?.properties.distinct_id).toBe("random-anonymous-id");
  expect(result?.properties.$process_person_profile).toBe(false);
  expect(JSON.stringify(result)).not.toContain("private");
  expect(event.$set?.email).toBe("private@example.com");
});

test("pageviews survive while non-click and unrelated event types are dropped", () => {
  const event: CaptureResult = { uuid: "test-event", event: "$pageview", properties: {} };
  expect(sanitizeAnalyticsEvent(event, "https://example.com/#/pomoc")?.properties.$pathname).toBe(
    "/pomoc",
  );
  expect(
    sanitizeAnalyticsEvent({ ...event, event: "$exception" }, "https://example.com"),
  ).toBeNull();
  expect(
    sanitizeAnalyticsEvent(
      { ...event, event: "$autocapture", properties: { $event_type: "change" } },
      "https://example.com",
    ),
  ).toBeNull();
});
