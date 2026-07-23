import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import prymeLogo from '../../assets/Pryme2.svg';
import pillArt from '../../assets/apply-with-pryme-pill.png';

interface GlossyRewardButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  disabled?: boolean;
  // Optional state overlay (loading spinner, "Applied" checkmark, etc.)
  overlay?: React.ReactNode;
  // The gold "REWARDS" ribbon is baked into pillArt (left cap art) -- turn
  // this off for an offer that genuinely has no matching reward rather than
  // imply one exists. Falls back to a plain gradient pill with no art.
  showRewardsRibbon?: boolean;
}

// Vertical gradient sampled from pillArt's own pill body so the CSS-filled
// remainder of the pill (right of the fixed-width left-cap art) blends
// seamlessly into it at any button width.
const pillGradient = 'linear-gradient(to bottom, #002ee2 0%, #00129f 100%)';

export const GlossyRewardButton: React.FC<GlossyRewardButtonProps> = ({
  className,
  disabled,
  overlay,
  showRewardsRibbon = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative inline-flex items-center h-12 md:h-[52px] w-full rounded-full shadow-lg shadow-black/10 transition-transform duration-300",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.03]",
        className
      )}
      style={{
        backgroundImage: showRewardsRibbon ? `url(${pillArt}), ${pillGradient}` : pillGradient,
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundPosition: 'left center, left center',
        backgroundSize: 'auto 100%, 100% 100%',
      }}
      {...props}
    >
      <div className={cn(
        "flex items-center justify-between gap-2 w-full h-full pr-4 md:pr-5",
        // Left padding clears the ribbon -- despite the ribbon art's own
        // bounding box being much wider, its diagonal has already swept
        // left of this vertical band by the time it reaches the logo/text's
        // height, so a small offset (matching the pre-image CSS ribbon) is
        // enough; measured directly off the source design.
        showRewardsRibbon ? "pl-8 md:pl-9" : "pl-4 md:pl-5"
      )}>
        <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
          <img src={prymeLogo} alt="" className="h-4 md:h-[18px] w-auto object-contain brightness-0 invert shrink-0" />
          <span className="text-white font-extrabold text-sm md:text-base whitespace-nowrap truncate">
            Apply with Pryme
          </span>
        </div>
        <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <ArrowRight className="w-4 h-4 text-white" />
        </span>
      </div>

      {overlay && (
        <div className="absolute inset-0 rounded-full bg-[#0a1530]/85 flex items-center justify-center">
          {overlay}
        </div>
      )}
    </div>
  );
};
