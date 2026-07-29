import React from 'react';
import { cn } from '../../lib/utils';
import fullButton from '../../assets/apply-with-pryme-full.png';

interface GlossyRewardButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  disabled?: boolean;
  // Optional state overlay (loading spinner, "Applied" checkmark, etc.)
  overlay?: React.ReactNode;
}

// Single un-sliced graphic (client-supplied, 2026-07-24), rendered at its own
// true aspect ratio (h-full w-auto, never stretched) so nothing distorts.
// An earlier version sliced this into left/right pieces with a flat CSS
// gradient filling the middle to reach arbitrary container widths, but that
// filler had no gloss highlight and read as an odd flat rectangle glued onto
// the pill -- rendering the whole graphic as one image removes that seam
// entirely, at the cost of the button no longer stretching edge-to-edge in
// wider containers (it stays centered at its natural width instead).
// Width for a sibling CTA that sits directly under this button.
//
// The graphic renders h-full w-auto, so its *visible* width is its intrinsic
// ratio (1335/384 = 3.477) x its height -- 167px at h-12, 181px at md:h-[52px]
// -- never the full width of whatever column it sits in. A sibling that
// stretches w-full therefore reads as much larger. These widths track the
// graphic at both heights, inset 5px per side so the bordered sibling sits
// just within it. Re-derive them if the asset is ever re-exported.
export const GLOSSY_BUTTON_SIBLING_WIDTH = "w-[157px] md:w-[171px]";

export const GlossyRewardButton: React.FC<GlossyRewardButtonProps> = ({
  className,
  disabled,
  overlay,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center h-12 md:h-[52px] w-full rounded-full overflow-hidden transition-transform duration-300 select-none",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.03] active:scale-[0.98]",
        className
      )}
      role="button"
      aria-label="Apply with Pryme"
      {...props}
    >
      <img src={fullButton} alt="" className="h-full w-auto max-w-full object-contain pointer-events-none" />

      {/* The graphic renders at its natural width, centered -- it does not fill
          this (w-full) container. An overlay spanning inset-0 with its own
          rounded-full radius therefore overhangs the pill on both sides and
          cuts across the gold ribbon, which pokes outside the pill's rounded
          rect in the asset. Masking the overlay with that same asset clips it
          to the graphic's exact alpha instead. mask-size:contain + center
          mirrors the img's object-contain, so the two stay aligned at any
          container width, and it needs no re-derivation if the asset changes.
          Opaque, not translucent: at 85% the graphic's own "Apply with Pryme"
          wordmark and arrow ghosted through behind the overlay's label. */}
      {overlay && (
        <div
          className="absolute inset-0 bg-[#0a1530] flex items-center justify-center z-10"
          style={{
            WebkitMaskImage: `url(${fullButton})`,
            maskImage: `url(${fullButton})`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskPosition: "center",
            maskPosition: "center",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        >
          {overlay}
        </div>
      )}
    </div>
  );
};
