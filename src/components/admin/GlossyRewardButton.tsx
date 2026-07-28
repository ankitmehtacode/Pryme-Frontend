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
// Intrinsic aspect ratio of the graphic above (1335x384). Because the image
// renders h-full w-auto, its *visible* width is height x this ratio -- narrower
// than the CTA column it sits in. A sibling CTA that must look the same size
// has to derive its width from the same ratio instead of stretching w-full.
export const GLOSSY_BUTTON_ASPECT = "1335 / 384";

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

      {overlay && (
        <div className="absolute inset-0 rounded-full bg-[#0a1530]/85 flex items-center justify-center z-10">
          {overlay}
        </div>
      )}
    </div>
  );
};
