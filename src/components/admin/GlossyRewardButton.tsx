import React from 'react';
import { cn } from '../../lib/utils';
import premiumButtonImg from '../../assets/premium-reward-btn.png';

interface GlossyRewardButtonProps {
  colorScheme?: 'ocean-blue' | 'sunset-gradient' | 'deep-navy' | 'teal-gradient' | 'emerald-glow' | 'neon-cyber' | 'midnight-purple' | 'minimal-mono' | 'golden-prestige' | 'crimson-red';
  className?: string;
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
  className
}) => {
  const filterStyle = colorFilters[colorScheme] || colorFilters["ocean-blue"];

  return (
    <div className={cn("relative inline-flex group cursor-pointer hover:scale-105 transition-transform duration-300", className)}>
      <img 
        src={premiumButtonImg} 
        alt="Apply with Pryme" 
        className="w-32 md:w-40 lg:w-48 h-auto drop-shadow-md object-contain"
        style={{ filter: filterStyle }}
      />
    </div>
  );
};
