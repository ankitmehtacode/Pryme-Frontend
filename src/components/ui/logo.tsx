import React from 'react';

export const Logo = ({ className, width = 48, height = 48 }: { className?: string, width?: number, height?: number }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="prymeBrandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#103783" />
          <stop offset="100%" stopColor="#9BAFD9" />
        </linearGradient>
      </defs>
      
      {/* Left Wing (Deep Blue #103783) 
          A sweeping shape with a sharp top-left protrusion, curving down to a flat bottom 
      */}
      <path 
        d="M15 35 
           C25 35, 30 45, 30 65 
           L30 80 
           L45 80 
           L45 40 
           C45 20, 35 15, 15 15 
           Z" 
        fill="#103783" 
      />

      {/* Right Top Wing (Gradient) 
          A voluminous leaf shape
      */}
      <path 
        d="M50 35 
           C50 15, 60 15, 85 15 
           L85 45 
           C85 65, 70 70, 50 70 
           Z" 
        fill="url(#prymeBrandGradient)" 
      />

      {/* Right Bottom Sweep (Light Blue #9BAFD9) 
          A soft curved base under the main leaf 
      */}
      <path 
        d="M50 75 
           C65 75, 85 75, 85 65 
           C85 85, 65 90, 50 90 
           Z" 
        fill="#9BAFD9" 
      />
    </svg>
  );
};
