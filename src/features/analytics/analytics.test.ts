import { afterEach, expect, test, vi } from "vitest";
import type { CaptureResult } from "posthog-js";
import {
  analyticsClient,
  analyticsRoute,
  analyticsUrl,
  isPublicAnalyticsRoute,
  sanitizeAnalyticsEvent,
} from "./analytics";
import { maskReplayAttribute, maskReplayRequest, structuralElements } from "./privacy";

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

test("private and unknown routes drop clicks, pageviews and buffered replay payloads", () => {
  for (const hash of [
    "#/app",
    "#/app/profil",
    "#/app/kandydaci/private-id",
    "#/auth/sign-in",
    "#/aplikuj/private-job",
    "#/unknown/private-data",
  ]) {
    expect(isPublicAnalyticsRoute(hash)).toBe(false);
    for (const event of ["$pageview", "$autocapture", "$snapshot"]) {
      expect(
        sanitizeAnalyticsEvent(
          { uuid: "test", event, properties: { $event_type: "click" } },
          `https://example.com/${hash}`,
        ),
      ).toBeNull();
    }
  }
  expect(isPublicAnalyticsRoute("#/oferty?query=private")).toBe(true);
});

test("replay URLs remove queries and dynamic values; network content is rejected", () => {
  expect(analyticsUrl("https://example.com/?email=private#/oferty/private-job?query=private")).toBe(
    "https://example.com/#/oferty/:slug",
  );
  expect(analyticsUrl("https://example.com/#/app/profil?name=private")).toBe(
    "https://example.com/#/private",
  );
  expect(
    maskReplayRequest(
      {
        name: "https://example.com/?private=value#/oferty",
        duration: 0,
        entryType: "navigation",
        startTime: 0,
      },
      analyticsUrl,
    )?.name,
  ).toBe("https://example.com/#/oferty");
  expect(
    maskReplayRequest(
      {
        name: "https://example.com/api",
        method: "POST",
        requestBody: "private",
        duration: 0,
        entryType: "resource",
        startTime: 0,
      },
      analyticsUrl,
    ),
  ).toBeNull();
});

test("replay DOM attributes retain layout but exclude private labels, links and CSS content", () => {
  for (const name of ["title", "aria-label", "value", "id", "src", "href", "data-private"]) {
    expect(maskReplayAttribute(name, "private@example.com")).toBe("");
  }
  expect(maskReplayAttribute("style", "background-image:url(private.png)")).toBe("");
  expect(maskReplayAttribute("style", "content: 'private' ")).toBe("");
  expect(maskReplayAttribute("class", "pp-category-tab")).toBe("pp-category-tab");
});

test("masked replay data survives before-send while unrelated properties do not", () => {
  const payload = [{ type: 2, data: { masked: true } }];
  const result = sanitizeAnalyticsEvent(
    {
      uuid: "test",
      event: "$snapshot",
      properties: {
        $snapshot_data: payload,
        $snapshot_bytes: 50,
        $session_id: "random-session",
        private: "private",
      },
    },
    "https://example.com/#/oferty",
  );
  expect(result?.properties.$snapshot_data).toBe(payload);
  expect(result?.properties.$session_id).toBe("random-session");
  expect(result?.properties.private).toBeUndefined();
});

test("Autocapture keeps only predefined public action names", () => {
  const event = {
    uuid: "test",
    event: "$autocapture",
    properties: { $event_type: "click", action: "category_build" },
  };
  expect(sanitizeAnalyticsEvent(event, "https://example.com/#/oferty")?.properties.action).toBe(
    "category_build",
  );
  event.properties.action = "private@example.com";
  expect(
    sanitizeAnalyticsEvent(event, "https://example.com/#/oferty")?.properties.action,
  ).toBeUndefined();
});

test("compact Autocapture chains retain positions but reject text and attributes", () => {
  expect(
    structuralElements(
      undefined,
      'button:nth-child="2"nth-of-type="1";div:nth-child="1"nth-of-type="1"',
    ),
  ).toEqual([
    { tag_name: "button", nth_child: 2, nth_of_type: 1 },
    { tag_name: "div", nth_child: 1, nth_of_type: 1 },
  ]);
  expect(
    structuralElements(undefined, 'button:nth-child="2"nth-of-type="1"text="private"'),
  ).toEqual([]);
});
