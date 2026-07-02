import React from "react";

interface SectionBackgroundProps {
  variant?: "hero" | "pricing" | "partners" | "default";
}

export const SectionBackground: React.FC<SectionBackgroundProps> = ({ variant = "default" }) => {
  if (variant === "hero") {
    return (
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{
          maskImage: "linear-gradient(to bottom, black 75%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 75%, transparent 100%)"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#f0f4ff] via-white to-[#fafafa]" />

        {/* 🧠 Premium Dynamic Right-Side Glowing Orbs (Intensified Right Side) */}
        <div className="absolute right-0 inset-y-0 w-[50%] pointer-events-none z-0 opacity-80 dark:opacity-60">
          {/* Neon Purple/Indigo Orb */}
          <div className="absolute -right-[10%] top-[10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
          {/* Neon Blue Orb */}
          <div className="absolute right-[15%] bottom-[10%] w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] rounded-full bg-gradient-to-tr from-blue-500/15 via-cyan-500/10 to-transparent blur-[100px] mix-blend-multiply dark:mix-blend-screen" />
        </div>


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
