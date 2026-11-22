import { useLayoutEffect } from "react";
import { useLocation } from "react-router";
import { analyticsClient, isPublicAnalyticsRoute } from "./analytics";

export function AnalyticsPageviews() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    let active = true;
    void analyticsClient().then((posthog) => {
      if (!active || !posthog || !isPublicAnalyticsRoute(pathname)) return;
      posthog.capture("$pageview");
    });
    return () => {
      active = false;
    };
  }, [pathname]);
  return null;
}
