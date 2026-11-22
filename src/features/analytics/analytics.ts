import { matchPath } from "react-router";
import type { CaptureResult, PostHog, PostHogConfig } from "posthog-js";
import {
  maskReplayAttribute,
  maskReplayRequest,
  privateElements,
  structuralElements,
} from "./privacy";

const routes = [
  "/",
  "/oferty",
  "/oferty/:slug",
  "/firmy/:slug",
  "/metodologia",
  "/polityka-prywatnosci",
  "/pomoc",
  "/auth/:mode",
  "/aplikuj/:slug",
  "/app",
  "/app/onboarding",
  "/app/profil",
  "/app/profil/podglad",
  "/app/zapisane",
  "/app/aplikacje",
  "/app/aplikacje/:id",
  "/app/aplikacje/:id/wyslano",
  "/app/oferty",
  "/app/oferty/:id",
  "/app/organizacja",
  "/app/kandydaci",
  "/app/kandydaci/:id",
  "/app/case",
  "/app/podglad-macierzy",
  "/app/settings",
  "/app/podglad-karty",
];

export function analyticsRoute(hash: string): string {
  const pathname = hash.replace(/^#/, "").split(/[?#]/)[0] || "/";
  return routes.find((route) => matchPath({ path: route, end: true }, pathname)) ?? "/unknown";
}

export function isPublicAnalyticsRoute(hash: string): boolean {
  return [
    "/",
    "/oferty",
    "/oferty/:slug",
    "/firmy/:slug",
    "/metodologia",
    "/polityka-prywatnosci",
    "/pomoc",
  ].includes(analyticsRoute(hash));
}

export function analyticsUrl(href: string): string {
  const url = new URL(href);
  const route = isPublicAnalyticsRoute(url.hash) ? analyticsRoute(url.hash) : "/private";
  return `${url.origin}/#${route}`;
}

// Rebuild the payload from a small allowlist, even if SDK defaults change later.
export function sanitizeAnalyticsEvent(event: CaptureResult, href: string): CaptureResult | null {
  if (!["$pageview", "$autocapture"].includes(event.event)) return null;
  const url = new URL(href);
  if (!isPublicAnalyticsRoute(url.hash)) return null;
  const route = analyticsRoute(url.hash);
  const properties: CaptureResult["properties"] = {};
  for (const key of [
    "token",
    "distinct_id",
    "$device_id",
    "$session_id",
    "$window_id",
    "$lib",
    "$lib_version",
    "$browser",
    "$browser_version",
    "$os",
    "$os_version",
    "$device_type",
    "$screen_height",
    "$screen_width",
    "$viewport_height",
    "$viewport_width",
  ]) {
    if (event.properties[key] !== undefined) properties[key] = event.properties[key];
  }
  Object.assign(properties, {
    $current_url: `${url.origin}/#${route}`,
    $pathname: route,
    $host: url.host,
    $process_person_profile: false,
    $geoip_disable: true,
    app: "doroboty-ai-prototype",
  });
  if (event.event === "$autocapture") {
    if (event.properties.$event_type !== "click") return null;
    properties.$event_type = "click";
    if (
      ["category_all", "category_build", "category_apply", "category_lead"].includes(
        event.properties.action,
      )
    ) {
      properties.action = event.properties.action;
    }
    properties.$elements = structuralElements(
      event.properties.$elements,
      event.properties.$elements_chain,
    );
  }
  return { uuid: event.uuid, event: event.event, timestamp: event.timestamp, properties };
}

export const analyticsOptions: Partial<PostHogConfig> = {
  api_host: "https://eu.i.posthog.com",
  ui_host: "https://eu.posthog.com",
  defaults: "2026-08-30",
  autocapture: {
    dom_event_allowlist: ["click"],
    element_allowlist: ["a", "button"],
    css_selector_ignorelist: [privateElements, ".ph-no-autocapture", "[data-ph-no-autocapture]"],
  },
  capture_pageview: false,
  capture_pageleave: false,
  capture_dead_clicks: false,
  capture_exceptions: false,
  capture_heatmaps: false,
  capture_performance: false,
  rageclick: false,
  disable_session_recording: true,
  disable_external_dependency_loading: true,
  // Defensive privacy settings; the recorder is never started by this application.
  session_recording: {
    blockSelector: privateElements,
    maskAllInputs: true,
    maskTextSelector: "*",
    maskAttributeFn: maskReplayAttribute,
    maskCapturedNetworkRequestFn: (request) => maskReplayRequest(request, analyticsUrl),
    recordHeaders: false,
    recordBody: false,
    recordCrossOriginIframes: false,
    captureJsonLd: false,
  },
  enable_recording_console_log: false,
  disable_surveys: true,
  advanced_disable_feature_flags: true,
  person_profiles: "never",
  persistence: "memory",
  disable_persistence: true,
  save_referrer: false,
  save_campaign_params: false,
  mask_all_text: true,
  mask_all_element_attributes: true,
  // The replay URL callback redacts queries and IDs while preserving hash-route context.
  disable_capture_url_hashes: false,
  ip: false,
  before_send: (event) => sanitizeAnalyticsEvent(event, window.location.href),
};

let client: Promise<PostHog | null> | undefined;
export function analyticsClient(): Promise<PostHog | null> {
  const token = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN?.trim();
  if (!token) return Promise.resolve(null);
  client ??= import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(token, analyticsOptions);
      return posthog;
    })
    .catch(() => null);
  return client;
}
