// Shared button color-scheme catalog: admin-selectable per lender reward
// (ProductRewardTab.tsx's "Button Design" picker) and consumed by the actual
// customer-facing button (GlossyRewardButton.tsx). Single source of truth --
// previously duplicated as raster-image CSS filters in GlossyRewardButton,
// which drifted from this real CSS palette and couldn't render crisply at
// arbitrary sizes (see GlossyRewardButton.tsx for the full story).
export const BUTTON_DESIGNS: Record<string, { label: string; className: string }> = {
  "ocean-blue": { label: "Ocean Blue", className: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30" },
  "sunset-gradient": { label: "Sunset Gradient", className: "bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white shadow-lg shadow-orange-500/30" },
  "deep-navy": { label: "Deep Navy", className: "bg-blue-900 hover:bg-blue-950 text-white shadow-lg shadow-blue-900/30" },
  "teal-gradient": { label: "Teal Gradient", className: "bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white shadow-lg shadow-teal-500/30" },
  "emerald-glow": { label: "Emerald Glow", className: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]" },
  "neon-cyber": { label: "Neon Cyber", className: "bg-[#12121a] hover:bg-[#1a1a24] text-cyan-400 border border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" },
  "midnight-purple": { label: "Midnight Purple", className: "bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white shadow-lg shadow-purple-600/30" },
  "minimal-mono": { label: "Minimal Mono", className: "bg-black hover:bg-zinc-800 text-white border border-white/10 shadow-xl" },
  "golden-prestige": { label: "Golden Prestige", className: "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white shadow-lg shadow-amber-500/30" },
  "crimson-red": { label: "Crimson Red", className: "bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white shadow-lg shadow-red-500/30" },
};
