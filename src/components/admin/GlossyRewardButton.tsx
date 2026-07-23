import React from 'react';
import { ArrowRight, Gift } from 'lucide-react';
import { cn } from '../../lib/utils';
import prymeLogo from '../../assets/pryme-logo.png';

interface GlossyRewardButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  colorScheme?: 'ocean-blue' | 'sunset-gradient' | 'deep-navy' | 'teal-gradient' | 'emerald-glow' | 'neon-cyber' | 'midnight-purple' | 'minimal-mono' | 'golden-prestige' | 'crimson-red' | string;
  className?: string;
  disabled?: boolean;
  // Optional state overlay (loading spinner, "Applied" checkmark, etc.)
  overlay?: React.ReactNode;
  // The gold "REWARDS" corner ribbon -- on by default to match the
  // always-premium button decision, but callers can turn it off for an
  // offer that genuinely has no matching reward rather than imply one exists.
  showRewardsRibbon?: boolean;
}

// Real background gradients per scheme (was a hue-rotate filter over a
// baked PNG before -- replaced because that image's canvas was mostly empty
// padding around a small pill, plus a dangling pendant/chain the design
// reference never had, so it rendered as a tiny cramped graphic at any
// container width the two callers actually use). Names kept for
// compatibility with existing colorScheme values passed from reward data.
const gradients: Record<string, string> = {
  "ocean-blue": "linear-gradient(135deg, #0a1f4d 0%, #123a8a 55%, #1e56c7 100%)",
  "sunset-gradient": "linear-gradient(135deg, #7c2d12 0%, #c2410c 55%, #f97316 100%)",
  "deep-navy": "linear-gradient(135deg, #050b1f 0%, #0a1530 55%, #103783 100%)",
  "teal-gradient": "linear-gradient(135deg, #063a3a 0%, #0f6b66 55%, #14b8a6 100%)",
  "emerald-glow": "linear-gradient(135deg, #052e1f 0%, #0d6b3f 55%, #10b981 100%)",
  "neon-cyber": "linear-gradient(135deg, #052a3a 0%, #0891b2 55%, #22d3ee 100%)",
  "midnight-purple": "linear-gradient(135deg, #1e1147 0%, #4c1d95 55%, #7c3aed 100%)",
  "minimal-mono": "linear-gradient(135deg, #1e293b 0%, #334155 55%, #64748b 100%)",
  "golden-prestige": "linear-gradient(135deg, #78350f 0%, #b45309 55%, #eab308 100%)",
  "crimson-red": "linear-gradient(135deg, #450a0a 0%, #991b1b 55%, #dc2626 100%)",
};

export const GlossyRewardButton: React.FC<GlossyRewardButtonProps> = ({
  colorScheme = "ocean-blue",
  className,
  disabled,
  overlay,
  showRewardsRibbon = true,
  ...props
}) => {
  const background = gradients[colorScheme] || gradients["ocean-blue"];

  return (
    <div
      className={cn(
        "relative inline-flex items-center h-12 md:h-[52px] w-full rounded-full shadow-lg shadow-black/10 transition-transform duration-300",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.03]",
        className
      )}
      style={{ background }}
      {...props}
    >
      <div className="flex items-center justify-between gap-2 w-full h-full px-4 md:px-5">
        <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
          <img src={prymeLogo} alt="" className="h-5 md:h-6 w-auto object-contain brightness-0 invert shrink-0" />
          <span className="text-white font-extrabold text-sm md:text-base whitespace-nowrap truncate">
            Apply with Pryme
          </span>
        </div>
        <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <ArrowRight className="w-4 h-4 text-white" />
        </span>
      </div>

      {showRewardsRibbon && (
        <div className="absolute -top-1 -left-1 w-16 h-16 overflow-hidden rounded-tl-full pointer-events-none">
          <div className="absolute top-[14px] left-[-22px] w-[100px] rotate-[-45deg] bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-amber-900 text-[8px] font-extrabold text-center py-[3px] shadow-md flex items-center justify-center gap-1 tracking-wide">
            <Gift className="w-2.5 h-2.5 shrink-0" /> REWARDS
          </div>
        </div>
      )}

      {overlay && (
        <div className="absolute inset-0 rounded-full bg-[#0a1530]/85 flex items-center justify-center">
          {overlay}
        </div>
      )}
    </div>
  );
};
