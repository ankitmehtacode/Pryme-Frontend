import React from 'react';
import { cn } from '../../lib/utils';
import fullButton from '../../assets/apply-with-pryme-full.png';

interface GlossyRewardButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  disabled?: boolean;
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
// Below sm the glossy button spans the full card width (see the wrapper below),
// so its sibling must too, or the two stop lining up. From sm up the graphic
// returns to its fixed height and intrinsic width, and these pinned values match
// it again.
export const GLOSSY_BUTTON_SIBLING_WIDTH = "w-full sm:w-[157px] md:w-[171px]";

export const GlossyRewardButton: React.FC<GlossyRewardButtonProps> = ({
  className,
  disabled,
  ...props
}) => {
  return (
    <div
      // Height is driven by the image below sm, and fixed from sm up.
      //
      // The graphic is a single PNG at a 3.48:1 ratio, so at a fixed 48px height
      // its visible width is locked to ~167px no matter how wide this wrapper is
      // -- which is why the button sat as a narrow pill in the middle of a
      // full-width card on phones. Letting the image drive the height lets it
      // span the card edge to edge without stretching; the trade is a taller
      // button, roughly 90px on a typical phone.
      //
      // The switch is at sm rather than md because by ~640px the proportional
      // height would exceed 180px, which is no longer a button.
      className={cn(
        "relative flex items-center justify-center w-full rounded-full overflow-hidden transition-transform duration-300 select-none",
        // aspect-ratio, not h-auto on the image. In a flex container with
        // align-items:center, a replaced element sized width:100% has no
        // resolvable cross-size -- the browser computes height:0 and the button
        // vanishes. Measured, not guessed: h-auto rendered 318x0. Giving the
        // wrapper a definite ratio breaks the circularity.
        "aspect-[1335/384] sm:aspect-auto sm:h-12 md:h-[52px]",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.03] active:scale-[0.98]",
        className
      )}
      role="button"
      aria-label="Apply with Pryme"
      {...props}
    >
      {/* No state overlay: this button renders the graphic and nothing else.
          A previous version stacked an "Applied"/spinner layer on top, which
          had to be masked to the graphic's alpha to avoid overhanging the
          pill and slicing the gold ribbon -- see git history if a state
          layer is ever wanted back. */}
      {/* w-full h-auto below sm so the graphic fills the card; h-full w-auto from
          sm up so it keeps its intrinsic width inside a fixed-height pill. Never
          object-fill or object-cover: the first stretches the gold ribbon and the
          wordmark, the second crops the ribbon off the corner. */}
      <img
        src={fullButton}
        alt=""
        className="w-full h-full sm:h-full sm:w-auto max-w-full object-contain pointer-events-none"
      />
    </div>
  );
};
