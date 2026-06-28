import { useLayoutEffect } from "react";

type ViewportMode = "scaled" | "native";

export const ViewportLayout = ({ mode, children }: { mode: ViewportMode, children: React.ReactNode }) => {
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-viewport", mode);
  }, [mode]);

  return <>{children}</>;
};
