import { useState, useRef } from "react";
import { ArrowRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const SmartInput = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const div = divRef.current;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      navigate(`/apply?amount=${value}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg mx-auto z-20">
      {/* The "Spotlight" Container 
        - Tracks cursor movement
        - Adds depth with shadows
        - Updated to use Green tint on focus
      */}
      <div
        ref={divRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setOpacity(1)}
        onMouseLeave={() => setOpacity(0)}
        className={cn(
          "relative overflow-hidden rounded-full p-[1px] transition-all duration-300",
          isFocused ? "shadow-lg shadow-emerald-500/10 scale-[1.01]" : "shadow-md shadow-slate-200/50"
        )}
        style={{
            // Brand Green Tint (#2aac64 is approx 42, 172, 100)
            background: isFocused ? "rgba(42, 172, 100, 0.1)" : "rgba(226, 232, 240, 0.6)"
        }}
      >
        {/* Dynamic Glowing Border Layer - Green Spotlight */}
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            opacity,
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(42, 172, 100, 0.4), transparent 40%)`,
          }}
        />
        
        {/* Inner Content - Glassmorphism */}
        <div className="relative flex items-center bg-white/90 backdrop-blur-xl rounded-full h-16 transition-colors">
          
          {/* Search Icon */}
          <div className="pl-6 pr-3 text-slate-400">
            <Search className={cn("w-5 h-5 transition-colors", isFocused && "text-[#2aac64]")} />
          </div>

          {/* Input Field */}
          <input
            type="text"
            value={value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setValue(e.target.value)}
            className="w-full bg-transparent py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none text-lg font-medium tracking-tight"
            placeholder="How much funding do you need?" 
          />

          {/* Action Button */}
          <div className="pr-1.5">
            <button 
                type="submit"
                className={cn(
                    "h-12 px-6 rounded-full font-semibold text-sm transition-all duration-300 flex items-center gap-2",
                    value.trim() 
                        // Updated to Brand Green (#2aac64) and slightly darker green on hover (#259b5a)
                        ? "bg-[#2aac64] text-white shadow-md shadow-emerald-200 hover:bg-[#259b5a] hover:scale-105 active:scale-95" 
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                )}
                disabled={!value.trim()}
            >
                Check <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default SmartInput;