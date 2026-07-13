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
        "relative inline-flex group transition-transform duration-300 overflow-visible", 
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105",
        className
      )}
      {...props}
    >
      <img 
        src={premiumButtonImg} 
        alt="Apply with Pryme" 
        className="w-full xl:w-[215px] xl:max-w-none h-auto xl:h-[54px] xl:absolute xl:left-1/2 xl:top-1/2 xl:-translate-x-1/2 xl:-translate-y-1/2 object-contain drop-shadow-md"
        style={{ filter: filterStyle }}
      />
    </div>
  );
};
