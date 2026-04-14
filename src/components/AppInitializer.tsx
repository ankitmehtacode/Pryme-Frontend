import { useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDictionaries } from "@/hooks/useDictionaries";
import { Loader2 } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 APP INITIALIZER — THE HYDRATION GATE
// ═══════════════════════════════════════════════════════════════════════════════
// This component BLOCKS the entire render tree until:
// 1. GET /auth/me resolves (success OR 401)
// 2. The dictionary store is hydrated
//
// Only then does it release the children to render.
// This guarantees that no component ever reads stale/missing auth state.
// ═══════════════════════════════════════════════════════════════════════════════

interface Props {
  children: ReactNode;
}

export const AppInitializer = ({ children }: Props) => {
  const { isLoading: isAuthLoading } = useAuth();
  const hydrateDictionaries = useDictionaries((s) => s.hydrate);
  const isDictionaryHydrated = useDictionaries((s) => s.isHydrated);

  // Kick off dictionary hydration on mount
  useEffect(() => {
    hydrateDictionaries();
  }, [hydrateDictionaries]);

  // Gate: Block render until both auth and dictionaries are resolved
  if (isAuthLoading || !isDictionaryHydrated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#050508] z-[200]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-slate-500 font-medium tracking-wide">
            Initializing Secure Environment...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
