import React from 'react';
import { ArrowRight, Gift } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BUTTON_DESIGNS } from '../../lib/buttonDesigns';
import prymeLeaf from '../../assets/Pryme2.svg';

// Was previously a raster image (premium-reward-btn.png, 1227x503) scaled
// with CSS object-fit into whatever box the caller sized it to. The image's
// "useful" content (the pill + text) only occupies part of its frame -- a
// gold tag and pendant chain hang off the top-left/bottom-right, extending
// well past the pill's own bounds. That meant object-cover cropped the pill
// itself on narrow/short containers (the tag survived, the text didn't),
// and object-contain avoided cropping but shrank the whole button down to a
// tiny, oddly-padded island instead of filling its container like every
// sibling button (Apply Directly, the plain <Button> fallback) does. No
// object-fit value can make a fixed 2.44:1 image "fill width, look normal"
// inside an arbitrary button-shaped box -- the image and the box are
// fundamentally different shapes. Rendering this as a real button removes
// the mismatch entirely: it fills its container exactly like every other
// button here, at any screen size, with crisp real text.
interface GlossyRewardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  colorScheme?: keyof typeof BUTTON_DESIGNS | string;
  className?: string;
}

export const GlossyRewardButton: React.FC<GlossyRewardButtonProps> = ({
  colorScheme = "ocean-blue",
  className,
  disabled,
  ...props
}) => {
  const design = BUTTON_DESIGNS[colorScheme] ?? BUTTON_DESIGNS["ocean-blue"];

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-xl font-extrabold text-sm transition-all duration-300",
        design.className,
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      {...props}
    >
      {/* Rewards tag -- inset within the button's own box (never overhangs
          it), so it can never get clipped by an ancestor's overflow-hidden
          the way the old image's overhanging chain/pendant could be. */}
      <span className="absolute top-1 left-1.5 flex items-center gap-0.5 text-[7px] font-extrabold uppercase tracking-wider text-amber-300/90">
        <Gift className="w-2 h-2" />
        Rewards
      </span>
      <img src={prymeLeaf} alt="" className="w-4 h-4 shrink-0 brightness-0 invert" />
      <span>Apply with Pryme</span>
      <ArrowRight className="w-4 h-4 shrink-0" />
    </button>
  );
};
