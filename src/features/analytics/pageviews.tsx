import { useEffect } from "react";
import { useLocation } from "react-router";
import { analyticsClient } from "./analytics";

export function AnalyticsPageviews() {
  const { pathname } = useLocation();
  useEffect(() => {
    let active = true;
    void analyticsClient().then((posthog) => {
      if (active) posthog?.capture("$pageview");
    });
    return () => {
      active = false;
    };
  }, [pathname]);
  return null;
}
