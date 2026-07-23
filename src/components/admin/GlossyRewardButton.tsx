import React from 'react';
import { cn } from '../../lib/utils';
import leftPiece from '../../assets/apply-with-pryme-left.png';
import rightPiece from '../../assets/apply-with-pryme-right.png';

interface GlossyRewardButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  disabled?: boolean;
  // Optional state overlay (loading spinner, "Applied" checkmark, etc.)
  overlay?: React.ReactNode;
}

// The designed graphic (client-supplied, 2026-07-24) is a fixed ~3.3:1 image --
// stretching it to fill an arbitrary-width container (object-fill) visibly
// elongated the ribbon/logo/text/arrow. Sliced instead into a left piece
// (ribbon + logo + text + left cap) and a right piece (arrow + right cap),
// each rendered at its own true aspect ratio (h-full w-auto, never stretched),
// with a flexible middle strip filling any remaining width using the exact
// gradient sampled from the source image at the cut line.
//
// Both pieces are cropped to the SAME row range (including the ribbon's
// overshoot above the pill's own top edge on the left piece) so they share
// one scale reference -- cropping each to its own tight bounding box left
// them at different effective scales when both stretched to h-full,
// producing a visible rectangular seam where the middle strip met them.
// The gradient below carries the same transparent margin (~3% top, ~1%
// bottom) the pieces have from that shared crop, so all three line up.
const MIDDLE_GRADIENT = 'linear-gradient(to bottom, transparent 0%, transparent 3%, #0026d2 4%, #00119a 97%, transparent 99%, transparent 100%)';

export const GlossyRewardButton: React.FC<GlossyRewardButtonProps> = ({
  className,
  disabled,
  overlay,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative flex items-stretch h-12 md:h-[52px] w-full rounded-full overflow-hidden transition-transform duration-300 select-none",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.03] active:scale-[0.98]",
        className
      )}
      role="button"
      aria-label="Apply with Pryme"
      {...props}
    >
      <img src={leftPiece} alt="" className="h-full w-auto shrink-0 pointer-events-none" />
      <div className="flex-1 h-full" style={{ background: MIDDLE_GRADIENT }} />
      <img src={rightPiece} alt="" className="h-full w-auto shrink-0 pointer-events-none" />

      {overlay && (
        <div className="absolute inset-0 rounded-full bg-[#0a1530]/85 flex items-center justify-center z-10">
          {overlay}
        </div>
      )}
    </div>
  );
};
