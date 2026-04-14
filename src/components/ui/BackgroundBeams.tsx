import React from "react";
import { cn } from "@/lib/utils";

/**
 * BackgroundBeams — CSS-only version.
 * 
 * The previous version used 4 Framer Motion `animate` loops with `repeat: Infinity`,
 * each running a separate requestAnimationFrame-driven transform interpolation.
 * That's 4 perpetual animation loops burning CPU on EVERY page that imports this.
 * 
 * This version uses pure CSS @keyframes — runs entirely on the compositor thread,
 * zero JS, zero RAF. Visually identical.
 */
export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden z-0 pointer-events-none",
        "bg-transparent",
        className
      )}
      style={{ contain: "strict" }}
    >
      <style>{`
        @keyframes beam1 {
          0% { transform: translateY(-100%) translateX(-50%) rotate(-45deg); }
          100% { transform: translateY(200%) translateX(100%) rotate(-45deg); }
        }
        @keyframes beam2 {
          0% { transform: translateY(-100%) translateX(50%) rotate(-45deg); }
          100% { transform: translateY(200%) translateX(-100%) rotate(-45deg); }
        }
        @keyframes beam3 {
          0% { transform: translateY(-100%) translateX(0%) rotate(45deg); }
          100% { transform: translateY(200%) translateX(50%) rotate(45deg); }
        }
        @keyframes orbPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
        }
      `}</style>

      {/* Grid pattern — static, no animation overhead */}
      <div
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* CSS-animated beams — zero JS */}
      <div className="absolute top-0 left-0 w-full h-full opacity-50 mix-blend-screen">
        <div
          className="absolute top-0 left-1/4 w-[2px] h-[400px] bg-gradient-to-b from-transparent via-primary to-transparent blur-[1px]"
          style={{ animation: "beam1 8s linear infinite" }}
        />
        <div
          className="absolute top-0 right-1/4 w-[3px] h-[500px] bg-gradient-to-b from-transparent via-blue-400 to-transparent blur-[2px]"
          style={{ animation: "beam2 12s linear infinite 3s" }}
        />
        <div
          className="absolute top-0 left-1/2 w-[2px] h-[600px] bg-gradient-to-b from-transparent via-blue-400 to-transparent blur-[1px]"
          style={{ animation: "beam3 10s linear infinite 1s" }}
        />
      </div>

      {/* CSS-animated ambient orb — replaces Framer Motion scale+opacity loop */}
      <div
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-primary/10 blur-[60px] rounded-full"
        style={{ animation: "orbPulse 8s ease-in-out infinite" }}
      />
    </div>
  );
};

export default BackgroundBeams;
