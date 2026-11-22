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
export function maskReplayAttribute(name: string, value: string, element?: Element): string {
  if (name === "_cssText") {
    // rrweb inlines the public build stylesheet in this generated attribute.
    // Other elements/stylesheets may contain user content, so fail closed.
    if (element?.tagName !== "LINK" || element.getAttribute("rel") !== "stylesheet") return "";
    try {
      const url = new URL(element.getAttribute("href") || "", element.ownerDocument.URL);
      const page = new URL(element.ownerDocument.URL);
      return url.origin === page.origin &&
        /^\/assets\/[\w-]+\.css$/.test(url.pathname) &&
        !url.search &&
        !url.hash
        ? value
        : "";
    } catch {
      return "";
    }
  }
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
    "rr_width",
    "rr_height",
    "rr_left",
    "rr_top",
    "rr_position",
    "rr_transform",
    "rr_display",
    "rr_scrollLeft",
    "rr_scrollTop",
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
