import type { CapturedNetworkRequest } from "posthog-js";

export const privateElements = [
  ".ph-no-capture",
  "[data-analytics-private]",
  "form",
  "input",
  "textarea",
  "select",
  "[contenteditable]",
  '[role="dialog"]',
  '[role="alertdialog"]',
  "iframe",
  "object",
  "embed",
  "canvas",
  "img",
  "video",
  "audio",
].join(", ");

export function structuralElements(elements: unknown, chain: unknown) {
  if (Array.isArray(elements))
    return elements.map((element) => ({
      tag_name: element.tag_name,
      nth_child: element.nth_child,
      nth_of_type: element.nth_of_type,
    }));
  // Newer project configs may send only the compact chain. Accept structure, never text/attributes.
  if (typeof chain !== "string") return [];
  return chain.split(";").flatMap((element) => {
    const match = /^([a-z][a-z0-9-]*):nth-child="(\d+)"nth-of-type="(\d+)"$/.exec(element);
    return match
      ? [{ tag_name: match[1], nth_child: Number(match[2]), nth_of_type: Number(match[3]) }]
      : [];
  });
}

// Keep styling and icon geometry, but never record DOM labels, values, IDs or destinations.
export function maskReplayAttribute(name: string, value: string): string {
  if (name === "style") return /url\s*\(|content\s*:/i.test(value) ? "" : value;
  return [
    "class",
    "width",
    "height",
    "viewBox",
    "viewbox",
    "d",
    "fill",
    "stroke",
    "stroke-width",
    "type",
    "role",
  ].includes(name)
    ? value
    : "";
}

// The SDK also invokes this callback for replay's page URL, without an HTTP method.
export function maskReplayRequest(
  request: CapturedNetworkRequest,
  redactUrl: (href: string) => string,
): CapturedNetworkRequest | null {
  if (request.method || !request.name) return null;
  try {
    return { ...request, name: redactUrl(request.name) };
  } catch {
    return null;
  }
}
