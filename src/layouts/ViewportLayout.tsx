import { useEffect } from "react";
import { Outlet } from "react-router-dom";

/**
 * ViewportLayout — Route-level viewport mode controller.
 *
 * Sets `data-viewport` on `<html>` to either "scaled" or "native".
 * CSS responds to this attribute to apply or remove desktop zoom.
 *
 * Usage: Wrap route groups in AppRoutes.tsx.
 *   <Route element={<ViewportLayout mode="scaled" />}>  → marketing pages
 *   <Route element={<ViewportLayout mode="native" />}>  → application pages
 *
 * The route tree is the single source of truth for viewport behavior.
 * Adding a new route = placing it under the correct ViewportLayout parent.
 * No hardcoded arrays. No pathname matching. No hooks to update.
 */
type ViewportMode = "scaled" | "native";

export const ViewportLayout = ({ mode }: { mode: ViewportMode }) => {
  useEffect(() => {
    document.documentElement.setAttribute("data-viewport", mode);
  }, [mode]);

  return <Outlet />;
};
