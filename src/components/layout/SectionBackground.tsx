import React from "react";

interface SectionBackgroundProps {
  variant?: "hero" | "pricing" | "partners" | "default";
}

export const SectionBackground: React.FC<SectionBackgroundProps> = ({ variant = "default" }) => {
  if (variant === "hero") {
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f4ff] via-white to-[#fafafa]" />
        
        {/* ────────────── SUBTLE BACKGROUND DECORATION ────────────── */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#103783]/[0.03] rounded-full pointer-events-none" style={{ transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#103783]/[0.02] rounded-full pointer-events-none" style={{ transform: 'translate(-30%, 30%)' }} />

        {/* ────────────── TECH GRID PATTERN ────────────── */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(16, 55, 131, 0.035) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(16, 55, 131, 0.035) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(circle 600px at 50% 50%, black 20%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle 600px at 50% 50%, black 20%, transparent 80%)',
          }}
        />

        {/* ────────────── PREMIUM SVG ABSTRACT CONNECTIVITY PATHS ────────────── */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="glow-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#103783" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#103783" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="glow-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#103783" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#103783" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <path 
            d="M-100 150 C 300 50, 700 350, 1500 200" 
            fill="none" 
            stroke="url(#glow-grad-1)" 
            strokeWidth="1.5" 
            strokeDasharray="4 4"
          />
          <path 
            d="M-50 250 C 400 120, 800 480, 1600 300" 
            fill="none" 
            stroke="url(#glow-grad-2)" 
            strokeWidth="2" 
          />
          <path 
            d="M200 400 C 600 250, 900 500, 1300 200" 
            fill="none" 
            stroke="url(#glow-grad-1)" 
            strokeWidth="1" 
            opacity="0.5"
          />
        </svg>
      </div>
    );
  }

  // Future variants like pricing, partners, default
  return null;
};
