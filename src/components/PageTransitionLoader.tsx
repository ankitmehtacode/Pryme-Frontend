export const PageTransitionLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-[3px] border-white/5" />
      <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#7c3aed] animate-spin" />
    </div>
  </div>
);
