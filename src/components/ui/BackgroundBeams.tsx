import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden z-0 pointer-events-none",
        "bg-transparent dark:bg-transparent", 
        className
      )}
    >
      {/* 🧠 4K Ready: Dynamic Grid lines */}
      <div
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* 🧠 Animated Dynamic Beams */}
      <div className="absolute top-0 left-0 w-full h-full opacity-50 dark:opacity-80 mix-blend-screen dark:mix-blend-color-dodge">
        {/* Beam 1 */}
        <motion.div
          animate={{
            transform: [
              "translateY(-100%) translateX(-50%) rotate(-45deg)",
              "translateY(200%) translateX(100%) rotate(-45deg)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-0 left-1/4 w-[1px] h-[400px] bg-gradient-to-b from-transparent via-primary to-transparent blur-[2px]"
          style={{ width: "2px" }}
        />
        {/* Beam 2 */}
        <motion.div
          animate={{
            transform: [
              "translateY(-100%) translateX(50%) rotate(-45deg)",
              "translateY(200%) translateX(-100%) rotate(-45deg)",
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
            delay: 3,
          }}
          className="absolute top-0 right-1/4 w-[1px] h-[500px] bg-gradient-to-b from-transparent via-violet-400 to-transparent blur-[3px]"
          style={{ width: "3px" }}
        />
        {/* Beam 3 */}
        <motion.div
          animate={{
            transform: [
              "translateY(-100%) translateX(0%) rotate(45deg)",
              "translateY(200%) translateX(50%) rotate(45deg)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
            delay: 1,
          }}
          className="absolute top-0 left-1/2 w-[1px] h-[600px] bg-gradient-to-b from-transparent via-blue-400 to-transparent blur-[2px]"
          style={{ width: "2px" }}
        />
      </div>

      {/* 🧠 Ambient glowing orb in the center */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 dark:bg-primary/20 blur-[120px] rounded-full"
      />
    </div>
  );
};

export default BackgroundBeams;
