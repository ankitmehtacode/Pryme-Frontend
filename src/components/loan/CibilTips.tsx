import { useState } from "react";
import {
  Lightbulb, TrendingUp, CreditCard, Clock, AlertTriangle,
  ShieldCheck, Users, Landmark, FileCheck, ChevronDown, Zap, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// 🧠 160-IQ CIBIL TIPS: Curated from HSBC, Standard Chartered, Bajaj Finserv, Financial Express.
const tips = [
  {
    icon: CreditCard,
    title: "Pay Your Card Bill Twice a Month",
    tagline: "Hidden Utilization Hack",
    description: "Don't wait for the due date. Pay half mid-month and half before the cycle ends. Banks report your balance on a specific date — if that day catches a high balance, your utilization ratio spikes even if you pay in full later. Splitting payments keeps the reported balance permanently low.",
    impact: "+20–40 pts",
    impactType: "positive" as const,
    category: "advanced",
  },
  {
    icon: TrendingUp,
    title: "Request a Limit Increase, Don't Use It",
    tagline: "Silent Ratio Killer",
    description: "Call your bank and ask for a credit limit increase. If your limit goes from ₹1L to ₹3L but you still spend only ₹20K/mo, your utilization drops from 20% to under 7%. This alone can add 30+ points over 2–3 months. Most people never ask.",
    impact: "+25–40 pts",
    impactType: "positive" as const,
    category: "advanced",
  },
  {
    icon: Users,
    title: "Credit Piggybacking (Authorized User Trick)",
    tagline: "Instant History Injection",
    description: "Get added as an authorized user on a parent's or spouse's old, high-limit credit card with perfect payment history. Their entire credit history for that card gets mirrored onto your report. You inherit years of perfect payments overnight without spending a single rupee.",
    impact: "+40–80 pts",
    impactType: "positive" as const,
    category: "advanced",
  },
  {
    icon: Landmark,
    title: "Use an FD-Backed Secured Card",
    tagline: "Build from Zero",
    description: "If you have no credit history or a damaged score, open an FD of ₹25K–50K and get a secured credit card against it. Use it for small recurring bills (Netflix, phone recharge) and always pay in full. Within 6 months, you'll have a legitimate credit footprint.",
    impact: "+50–100 pts",
    impactType: "positive" as const,
    category: "rebuild",
  },
  {
    icon: FileCheck,
    title: "Get a Loan Closure Letter Every Time",
    tagline: "Prevent Ghost Debt",
    description: "After you fully repay any loan, banks sometimes don't update CIBIL records for months. Your report will still show an active loan. Always collect a closure letter and follow up until CIBIL reflects 'Closed'. Thousands have damaged scores because of this silent bug.",
    impact: "Prevents −50 pts",
    impactType: "critical" as const,
    category: "essential",
  },
  {
    icon: AlertTriangle,
    title: "Never Be a Loan Guarantor",
    tagline: "Silent Credit Destroyer",
    description: "If you sign as a guarantor for a friend's or relative's loan and they miss payments, the default hits YOUR credit report. You become legally co-liable. It's the fastest way to destroy a good score without borrowing a rupee yourself.",
    impact: "Risk: −100+ pts",
    impactType: "critical" as const,
    category: "essential",
  },
  {
    icon: Eye,
    title: "Soft Pull ≠ Hard Pull. Know the Difference.",
    tagline: "Inquiry Awareness",
    description: "Checking your own score on CRED, Paytm, or Google Pay is a 'soft inquiry' — it does NOT affect your score. But every bank application triggers a 'hard inquiry' that drops your score 5–10 points. Space out applications by at least 3–6 months.",
    impact: "−5 to −10 per pull",
    impactType: "warning" as const,
    category: "essential",
  },
  {
    icon: Clock,
    title: "Never Close Your Oldest Credit Card",
    tagline: "Age of History Matters",
    description: "CIBIL factors in the average age of your credit accounts. If your oldest card is 8 years old and you close it, your average credit age could drop from 5 years to 2 years overnight. Keep it open with one small auto-pay transaction per quarter.",
    impact: "+15–30 pts",
    impactType: "positive" as const,
    category: "essential",
  },
];

const categoryLabels: Record<string, string> = {
  advanced: "PRO MOVES",
  essential: "MUST-KNOW",
  rebuild: "SCORE REPAIR",
};

const impactColors: Record<string, string> = {
  positive: "text-blue-800 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
  warning: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  critical: "text-red-500 dark:text-red-400 bg-red-500/10 border-red-500/20",
};

const CibilTips = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filteredTips = filter === "all" ? tips : tips.filter(t => t.category === filter);

  const toggleTip = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  // 🧠 Master lightbulb is "on" whenever ANY tip is expanded
  const isBulbActive = expandedIndex !== null;

  return (
    <div className="bg-card dark:bg-[#080d1e] text-card-foreground border border-border dark:border-white/10 rounded-[2rem] p-5 md:p-7 shadow-xl dark:shadow-2xl relative overflow-hidden transition-all">
      {/* Ambient glow — intensifies when a tip is expanded */}
      <motion.div
        animate={{
          opacity: isBulbActive ? 0.25 : 0.05,
          scale: isBulbActive ? 1.3 : 1,
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-48 h-48 bg-amber-400 transform-gpu rounded-full pointer-events-none"
      />

      {/* Header with Glowing Lightbulb */}
      <div className="flex items-center gap-3.5 mb-5 relative z-10">
        <motion.div
          animate={{
            boxShadow: isBulbActive
              ? "0 0 20px rgba(251,191,36,0.5), 0 0 40px rgba(251,191,36,0.25)"
              : "0 0 0px rgba(251,191,36,0)",
            backgroundColor: isBulbActive ? "rgba(251,191,36,0.15)" : "transparent",
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-11 h-11 rounded-full bg-secondary dark:bg-[#0d1829] border border-border dark:border-amber-500/20 shadow-sm flex items-center justify-center shrink-0 transition-colors"
        >
          <motion.div
            animate={{
              scale: isBulbActive ? [1, 1.2, 1] : 1,
              rotate: isBulbActive ? [0, -5, 5, 0] : 0,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Lightbulb
              className={cn(
                "w-5 h-5 transition-all duration-300",
                isBulbActive
                  ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] fill-amber-400/30"
                  : "text-amber-500/60"
              )}
            />
          </motion.div>
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-foreground tracking-tight leading-none mb-1">CIBIL Score Hacks</h3>
          <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-sm inline-block leading-none">
            INSIDER KNOWLEDGE
          </p>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-5 relative z-10">
        {[
          { key: "all", label: "All Tips" },
          { key: "advanced", label: "Pro Moves" },
          { key: "essential", label: "Must-Know" },
          { key: "rebuild", label: "Score Repair" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setExpandedIndex(null); }}
            className={cn(
              "text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/30",
              filter === f.key
                ? "bg-primary dark:bg-[#103783] text-primary-foreground dark:text-white border-primary dark:border-[#103783] shadow-sm"
                : "bg-secondary/50 dark:bg-[#0d1829] text-muted-foreground border-border dark:border-white/5 hover:border-primary/30 dark:hover:border-white/10"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tips Accordion - Constrained Height with Custom Scrollbar */}
      <div className="space-y-3 relative z-10 max-h-[60vh] overflow-y-auto overflow-x-hidden pb-4 pr-3 overscroll-contain [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border dark:[&::-webkit-scrollbar-thumb]:bg-white/10">
        <AnimatePresence mode="popLayout">
          {filteredTips.map((tip, index) => {
            const isExpanded = expandedIndex === index;
            const Icon = tip.icon;
            const colors = impactColors[tip.impactType];

            return (
              <motion.div
                key={tip.title}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 400, damping: 30, delay: index * 0.04 }}
              >
                <div
                  onClick={() => toggleTip(index)}
                  className={cn(
                    "relative cursor-pointer rounded-2xl transition-all duration-300 border overflow-hidden group",
                    isExpanded
                      ? "bg-secondary dark:bg-black/60 border-amber-500/30 dark:border-amber-500/30 shadow-lg dark:shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                      : "bg-secondary/30 dark:bg-[#0d1829] border-border dark:border-white/5 hover:border-primary/20 dark:hover:border-white/10"
                  )}
                  role="button"
                  aria-expanded={isExpanded}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && toggleTip(index)}
                >
                  {/* Header Row */}
                  <div className="flex items-center gap-3.5 p-4">
                    {/* Per-tip mini lightbulb that glows when active */}
                    <motion.div
                      animate={{
                        boxShadow: isExpanded
                          ? "0 0 12px rgba(251,191,36,0.4)"
                          : "0 0 0px rgba(251,191,36,0)",
                      }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-sm",
                        isExpanded
                          ? "bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30"
                          : "bg-card dark:bg-[#080d1e] border border-border dark:border-white/5 text-muted-foreground"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                          {categoryLabels[tip.category]}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground leading-tight truncate pr-6">{tip.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("text-[9px] font-bold px-2 py-1 rounded-md border hidden sm:inline-block", colors)}>
                        {tip.impact}
                      </span>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="text-muted-foreground"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0">
                          <div className="border-t border-border dark:border-white/10 pt-3 mt-0">
                            {/* Tagline with glowing zap */}
                            <div className="flex items-center gap-1.5 mb-2.5">
                              <motion.div
                                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                              >
                                <Zap className="w-3 h-3 text-amber-500 fill-amber-500/30" />
                              </motion.div>
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{tip.tagline}</span>
                            </div>
                            {/* Body */}
                            <p className="text-[11px] md:text-xs font-medium text-muted-foreground leading-relaxed">
                              {tip.description}
                            </p>
                            {/* Impact Badge (mobile) */}
                            <div className="mt-3 sm:hidden">
                              <span className={cn("text-[9px] font-bold px-2.5 py-1 rounded-md border inline-block", colors)}>
                                Impact: {tip.impact}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer note */}
      <div className="mt-5 pt-4 border-t border-border dark:border-white/5 relative z-10">
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-primary dark:text-[#103783] shrink-0 mt-0.5" />
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-relaxed">
            Data sourced from CIBIL TransUnion, RBI guidelines, and top-tier Indian bank risk frameworks.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CibilTips;
