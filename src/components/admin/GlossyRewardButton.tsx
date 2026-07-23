import React from 'react';
import { ArrowRight, Gift } from 'lucide-react';
import { cn } from '../../lib/utils';
import prymeLogo from '../../assets/Pryme2.svg';

interface GlossyRewardButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  disabled?: boolean;
  // Optional state overlay (loading spinner, "Applied" checkmark, etc.)
  overlay?: React.ReactNode;
  // The gold "REWARDS" ribbon -- turn off for offers that have no matching
  // reward rather than implying one exists.
  showRewardsRibbon?: boolean;
}

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
        "relative inline-flex items-center h-[52px] md:h-[56px] w-full rounded-full shadow-lg shadow-blue-900/30 transition-transform duration-300 overflow-hidden select-none",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.03] active:scale-[0.98]",
        className
      )}
      style={{
        background: 'linear-gradient(170deg, #2850e8 0%, #1a3bcc 30%, #0f24a8 70%, #0a1a8a 100%)',
      }}
      {...props}
    >
      {/* ── Glossy specular highlight (top edge) ──────────────── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-t-full"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 60%, transparent 100%)',
        }}
      />

      {/* ── Diagonal gold REWARDS ribbon ─────────────────────── */}
      {showRewardsRibbon && (
        <div className="absolute top-0 left-0 z-10 pointer-events-none">
          {/* Ribbon body -- rotated strip */}
          <div
            className="absolute"
            style={{
              width: '120px',
              height: '26px',
              top: '6px',
              left: '-18px',
              transform: 'rotate(-38deg)',
              transformOrigin: 'center center',
              background: 'linear-gradient(180deg, #f5d76e 0%, #d4a22a 50%, #c4932a 100%)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Gift
              style={{
                width: '11px',
                height: '11px',
                color: '#fff',
                filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))',
              }}
            />
            <span
              style={{
                fontSize: '9px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                color: '#fff',
                textShadow: '0 1px 2px rgba(0,0,0,0.25)',
                textTransform: 'uppercase',
              }}
            >
              Rewards
            </span>
          </div>
        </div>
      )}

      {/* ── Content row ──────────────────────────────────────── */}
      <div className={cn(
        "flex items-center justify-between gap-2 w-full h-full pr-3 md:pr-4 relative z-[5]",
        showRewardsRibbon ? "pl-9 md:pl-10" : "pl-4 md:pl-5"
      )}>
        <div className="flex items-center gap-2 md:gap-2.5 min-w-0">
          <img
            src={prymeLogo}
            alt=""
            className="h-[18px] md:h-[22px] w-auto object-contain brightness-0 invert shrink-0"
          />
          <span className="text-white font-extrabold text-[15px] md:text-[17px] whitespace-nowrap truncate tracking-[-0.01em]"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
          >
            Apply with Pryme
          </span>
        </div>
        <span
          className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(255,255,255,0.18)' }}
        >
          <ArrowRight className="w-4 h-4 md:w-[18px] md:h-[18px] text-white" />
        </span>
      </div>

      {/* ── State overlay (loading / applied) ────────────────── */}
      {overlay && (
        <div className="absolute inset-0 rounded-full bg-[#0a1530]/85 flex items-center justify-center z-20">
          {overlay}
        </div>
      )}
    </div>
  );
};
