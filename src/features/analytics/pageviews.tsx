import { useLayoutEffect } from "react";
import { useLocation } from "react-router";
import { analyticsClient, isPublicAnalyticsRoute } from "./analytics";

export function AnalyticsPageviews() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    let active = true;
    let stopRecording: (() => void) | undefined;
    void analyticsClient().then((posthog) => {
      if (!active || !posthog) return;
      if (isPublicAnalyticsRoute(pathname)) {
        posthog.startSessionRecording();
        stopRecording = () => posthog.stopSessionRecording();
        posthog.capture("$pageview");
      } else {
        posthog.stopSessionRecording();
      }
    });
    return () => {
      active = false;
      stopRecording?.();
    };
  }, [pathname]);
  return null;
}
