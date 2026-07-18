import React from 'react';
import { cn } from '../../lib/utils';
import premiumButtonImg from '../../assets/premium-reward-btn.png';

interface GlossyRewardButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  colorScheme?: 'ocean-blue' | 'sunset-gradient' | 'deep-navy' | 'teal-gradient' | 'emerald-glow' | 'neon-cyber' | 'midnight-purple' | 'minimal-mono' | 'golden-prestige' | 'crimson-red' | string;
  className?: string;
  disabled?: boolean;
}

const colorFilters: Record<string, string> = {
  "ocean-blue": "none",
  "sunset-gradient": "hue-rotate(190deg) saturate(1.2)", // blue to orange/red
  "deep-navy": "brightness(0.7) saturate(1.2)",
  "teal-gradient": "hue-rotate(-50deg) saturate(1.1)", // blue to teal
  "emerald-glow": "hue-rotate(-100deg) saturate(1.2)", // blue to green
  "neon-cyber": "hue-rotate(-30deg) saturate(1.5)", // blue to cyan
  "midnight-purple": "hue-rotate(50deg) saturate(1.1)", // blue to purple
  "minimal-mono": "saturate(0) brightness(1.2)", // grayscale
  "golden-prestige": "hue-rotate(210deg) saturate(1.5) brightness(1.1)", // blue to gold/amber
  "crimson-red": "hue-rotate(140deg) saturate(1.3)", // blue to red
};

// premium-reward-btn.png is a fixed 1227x503 (~2.44:1) graphic -- the gold
// "REWARDS" tag and pendant chain hang off the pill's own bounds, so the
// image can't be cropped (object-cover) or freely shrunk to fit an
// unrelated container size (object-contain) without either slicing the
// pill's text off or shrinking the whole button into a tiny island. The fix
// is to never let this component's box have a height independent of its
// width in the first place: aspect-[1227/503] derives height from width
// directly, so whatever width the caller gives it, the image renders at its
// real proportions -- full width, no cropping, no shrinking. This is why
// GlossyRewardButton intentionally does NOT accept a height utility from
// its one caller (BankComparisonCard.tsx) -- an explicit height there would
// silently override the aspect ratio and reintroduce the exact mismatch
// that broke this twice.
export const GlossyRewardButton: React.FC<GlossyRewardButtonProps> = ({
  colorScheme = "ocean-blue",
  className,
  disabled,
  ...props
}) => {
  const filterStyle = colorFilters[colorScheme] || colorFilters["ocean-blue"];

  return (
    <div
      className={cn(
        "relative inline-flex w-full aspect-[1227/503] transition-transform duration-300 rounded-xl",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105",
        className
      )}
      {...props}
    >
      <img
        src={premiumButtonImg}
        alt="Apply with Pryme"
        className="w-full h-full rounded-xl drop-shadow-md"
        style={{ filter: filterStyle }}
      />
    </div>
  );
};
