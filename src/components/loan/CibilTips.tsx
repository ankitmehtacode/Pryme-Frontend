import { useState, useRef, useEffect } from "react";
import {
  Lightbulb, TrendingUp, CalendarClock, Clock, History, AlertTriangle,
  ShieldCheck, FileCheck, ChevronDown, Zap, Layers, UserX, CheckCircle2,
  Search, Percent, ListChecks, LineChart, Layers3, Merge, XCircle, Sprout,
  Gavel, ArrowLeftRight, Anchor
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// 🧠 200-IQ CREDIT SCORE HACKS: Curated, RBI-2025-aware playbook.
const tips = [
  {
    icon: TrendingUp,
    title: "Request a Limit Increase, Don't Use It",
    tagline: "Silent Ratio Killer",
    description: "Call your bank and ask for a credit limit increase. If your limit goes from ₹1L to ₹3L but you still spend only ₹20K/mo, your utilization drops from 20% to under 7%. This alone can add 30+ points over 2–3 months. Most people never ask.",
    impact: "+25 to 40 pts",
    impactType: "positive" as const,
    category: "optimize",
  },
  {
    icon: CalendarClock,
    title: "Pay Before the Statement Date, Not the Due Date",
    tagline: "Silent Ratio Killer",
    description: "Bureaus report your balance as of your statement date — not when you pay the bill. Clear most of your dues 3–5 days before the statement generates, and your reported utilization looks near-zero even if you spend heavily all month.",
    impact: "+15 to 25 pts",
    impactType: "positive" as const,
    category: "optimize",
  },
  {
    icon: ShieldCheck,
    title: "Set Every EMI and Bill to Auto-Debit",
    tagline: "Foundation",
    description: "Payment history is the single heaviest factor in your score. One missed EMI can undo months of progress. Auto-debit removes the human-error risk entirely.",
    impact: "+20 to 35 pts",
    impactType: "positive" as const,
    category: "foundation",
  },
  {
    icon: Clock,
    title: "Space Out Loan/Card Applications",
    tagline: "Avoid Stacking",
    description: "Each new application triggers a hard inquiry. Three applications in a month reads as financial distress to the algorithm, even if you're approved for all three. Leave 3–6 months between applications where possible.",
    impact: "+10 to 20 pts",
    impactType: "positive" as const,
    category: "avoid",
  },
  {
    icon: History,
    title: "Keep Old Cards Open (Even Unused)",
    tagline: "History Builder",
    description: "Closing your oldest card shortens your average credit history length overnight. Keep it alive with one small transaction every few months instead — as long as there's no annual fee working against you.",
    impact: "+10 to 15 pts",
    impactType: "positive" as const,
    category: "foundation",
  },
  {
    icon: FileCheck,
    title: "Dispute a Wrongly-Reported \"Active\" Loan",
    tagline: "Error Fix",
    description: "If a loan you've fully closed still shows as active or \"settled\" instead of \"closed,\" it can drag your score down hard. Raise a dispute on the bureau's site — under RBI's 2025 Master Direction, this must be addressed within a set timeline, and you get a free corrected report once fixed.",
    impact: "+30 to 60 pts",
    impactType: "positive" as const,
    category: "fix",
  },
  {
    icon: AlertTriangle,
    title: "Never Take a Cash Advance on a Credit Card",
    tagline: "Red Flag",
    description: "Cash advances are treated as a distress signal by lenders and can spike your utilization instantly, since they often carry no interest-free grace period.",
    impact: "Risk: −20 to −35 pts",
    impactType: "warning" as const,
    category: "avoid",
  },
  {
    icon: Layers,
    title: "Maintain a Healthy Credit Mix",
    tagline: "Diversify",
    description: "Having both secured (car/home loan) and unsecured (credit card/personal loan) credit shows lenders you can handle different risk types responsibly. All-unsecured profiles score lower than mixed ones.",
    impact: "+10 to 20 pts",
    impactType: "positive" as const,
    category: "optimize",
  },
  {
    icon: UserX,
    title: "Avoid Being a Co-Applicant for Unreliable Borrowers",
    tagline: "Joint Exposure",
    description: "A joint loan reports on your file too. If your co-applicant misses payments, your score takes the hit exactly as if you'd missed it yourself.",
    impact: "Risk: −15 to −30 pts",
    impactType: "warning" as const,
    category: "avoid",
  },
  {
    icon: CheckCircle2,
    title: "Convert a \"Settled\" Loan Status to \"Closed\"",
    tagline: "Error Fix",
    description: "\"Settled\" (partial repayment) reads very differently to lenders than \"Closed\" (paid in full). If you've since paid the balance, get the status updated — it's one of the most damaging tags to leave sitting on a report.",
    impact: "+25 to 45 pts",
    impactType: "positive" as const,
    category: "fix",
  },
  {
    icon: Search,
    title: "Check Your Free Annual Report for Errors",
    tagline: "Audit",
    description: "You're entitled to one free full report per year from each bureau. A single wrongly-reported default or duplicate account can be silently costing you 50+ points without you knowing.",
    impact: "+0 to 60 pts",
    impactType: "positive" as const,
    category: "fix",
  },
  {
    icon: Percent,
    title: "Keep Utilization Under 30% At the Bank Level Too",
    tagline: "Silent Ratio Killer",
    description: "Bureaus don't just look at overall utilization — they check per-card usage too. Maxing one card while others sit idle can hurt more than spreading spend evenly, even at the same total amount.",
    impact: "+10 to 20 pts",
    impactType: "positive" as const,
    category: "optimize",
  },
  {
    icon: ListChecks,
    title: "Pay Off Smaller Debts First",
    tagline: "Quick Wins",
    description: "Clearing smaller loans/cards fully (rather than making partial payments across many) reduces your number of open obligations faster, which lenders read as improved credit discipline sooner.",
    impact: "+15 to 25 pts",
    impactType: "positive" as const,
    category: "optimize",
  },
  {
    icon: LineChart,
    title: "Track Score Changes Every 2 Weeks",
    tagline: "Monitor",
    description: "This doesn't move your score directly, but catching a dip early (fraud, missed payment, new inquiry) lets you fix it before it compounds.",
    impact: "+10 to 20 pts (indirect)",
    impactType: "positive" as const,
    category: "foundation",
  },
  {
    icon: Layers3,
    title: "Avoid Multiple BNPL/Small-Ticket Loans Simultaneously",
    tagline: "Avoid Stacking",
    description: "Buy-Now-Pay-Later is useful for building history when new to credit, but running several at once looks like overextension, not responsibility.",
    impact: "Risk: −10 to −20 pts",
    impactType: "warning" as const,
    category: "avoid",
  },
  {
    icon: Merge,
    title: "Consolidate High-Interest Debt Into One Loan",
    tagline: "Simplify",
    description: "Merging multiple credit card balances into a single lower-interest personal loan reduces your number of revolving balances and makes on-time repayment easier to sustain — both of which help your score.",
    impact: "+15 to 30 pts",
    impactType: "positive" as const,
    category: "optimize",
  },
  {
    icon: XCircle,
    title: "Don't Let a Rejected Application Trigger More Applications",
    tagline: "Red Flag",
    description: "A rejection already causes one hard inquiry hit. Immediately applying elsewhere stacks inquiries and signals desperation to the algorithm — wait and fix the underlying issue first.",
    impact: "Risk: −10 to −15 pts/inquiry",
    impactType: "warning" as const,
    category: "avoid",
  },
  {
    icon: Sprout,
    title: "New to Credit? Start With a Secured Card",
    tagline: "Starter Move",
    description: "A credit card issued against a fixed deposit is easy to get approved for and, used responsibly, builds a repayment history from zero faster than waiting for an unsecured card approval.",
    impact: "+10 to 20 pts (6 months)",
    impactType: "positive" as const,
    category: "foundation",
  },
  {
    icon: Gavel,
    title: "Escalate Unresolved Disputes to the RBI Ombudsman",
    tagline: "Error Fix",
    description: "If a bureau doesn't fix a dispute within the mandated window, RBI's 2025 Directions allow escalation — and entitle you to compensation for the delay. Don't let a stuck dispute sit unresolved indefinitely.",
    impact: "+30 to 60 pts (once resolved)",
    impactType: "positive" as const,
    category: "fix",
  },
  {
    icon: ArrowLeftRight,
    title: "Avoid Frequent Balance Transfers Between Cards",
    tagline: "Caution",
    description: "Frequently transferring balances to \"reset\" interest can trigger new inquiries and signal revolving debt dependence, which offsets the interest savings with a score dip.",
    impact: "Risk: −5 to −15 pts",
    impactType: "warning" as const,
    category: "avoid",
  },
  {
    icon: Anchor,
    title: "Keep Your Oldest Loan/Card Active With Minimal Spend",
    tagline: "History Builder",
    description: "Length of credit history compounds — the longer an account has been open and well-managed, the more it anchors your score against short-term dips elsewhere.",
    impact: "+10 to 15 pts",
    impactType: "positive" as const,
    category: "foundation",
  },
];

const categoryLabels: Record<string, string> = {
  optimize: "OPTIMIZE",
  foundation: "FOUNDATION",
  avoid: "AVOID RISK",
  fix: "FIX & DISPUTE",
};

const impactColors: Record<string, string> = {
  positive: "text-blue-800 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
  warning: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  critical: "text-red-500 dark:text-red-400 bg-red-500/10 border-red-500/20",
};

interface CibilTipsProps {
  calculatorHeight?: number;
}

const INITIAL_VISIBLE_TIPS = 6;

const CibilTips = ({ calculatorHeight }: CibilTipsProps = {}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [showAll, setShowAll] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredTips = filter === "all" ? tips : tips.filter(t => t.category === filter);
  // 🧠 showAll previously only affected the container's height animation --
  // every tip was still rendered underneath, just clipped/scrollable. That
  // meant "collapsed" showed however many tips fit calculatorHeight (or all
  // of them, on pages like Apply.tsx that don't pass calculatorHeight at
  // all) instead of a predictable, small number. Slice the actual list so
  // collapsed always means "a handful", regardless of container height.
  const visibleTips = showAll ? filteredTips : filteredTips.slice(0, INITIAL_VISIBLE_TIPS);

  const toggleTip = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  // 🧠 Reset scroll position when minimizing to prevent blank view offsets
  useEffect(() => {
    if (!showAll && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [showAll]);

  // 🧠 Master lightbulb is "on" whenever ANY tip is expanded
  const isBulbActive = expandedIndex !== null;

  return (
    <motion.div 
      animate={{
        height: !showAll && calculatorHeight ? calculatorHeight : "auto"
      }}
      transition={{ 
        type: "spring", 
        stiffness: 280, 
        damping: 32 
      }}
      className="bg-card dark:bg-[#080d1e] text-card-foreground border border-slate-200/80 dark:border-[#103783]/20 rounded-[2rem] p-4 md:p-5 shadow-xl dark:shadow-2xl relative overflow-hidden w-full flex flex-col"
    >
      {/* Ambient glow — intensifies when a tip is expanded */}
      <motion.div
        animate={{
          opacity: isBulbActive ? 0.25 : 0.05,
          scale: isBulbActive ? 1.3 : 1,
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />

      {/* Header with Glowing Lightbulb */}
      <div className="flex items-center gap-3.5 mb-3.5 relative z-10">
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
          <h3 className="text-xl font-bold text-foreground tracking-tight leading-none mb-1">Credit Score Hacks</h3>
          <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-sm inline-block leading-none">
            INSIDER KNOWLEDGE
          </p>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-3.5 relative z-10">
        {[
          { key: "all", label: "All Tips" },
          { key: "optimize", label: "Optimize" },
          { key: "foundation", label: "Foundation" },
          { key: "avoid", label: "Avoid Risk" },
          { key: "fix", label: "Fix & Dispute" },
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
      <div 
        ref={scrollContainerRef}
        className="space-y-2 relative z-10 flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-4 pr-3 [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border dark:[&::-webkit-scrollbar-thumb]:bg-white/10"
      >
        <AnimatePresence>
          {visibleTips.map((tip, index) => {
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
                  <div className="flex items-center gap-3.5 py-3 px-3.5">
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
                      <h4 className="text-sm font-bold text-foreground leading-tight break-words pr-2">{tip.title}</h4>
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

      {/* View All / Show Less button */}
      {filteredTips.length > INITIAL_VISIBLE_TIPS && (
        <div className="flex justify-center mt-3 mb-1 relative z-10">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full sm:w-auto bg-primary/10 dark:bg-[#103783]/20 border border-primary/20 dark:border-[#103783]/40 hover:bg-primary/20 dark:hover:bg-[#103783]/30 text-primary dark:text-[#3876f2] font-bold text-[10px] md:text-xs px-6 py-2.5 rounded-xl transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
          >
            <span>{showAll ? "See Less" : `View All Tips (+${filteredTips.length - INITIAL_VISIBLE_TIPS})`}</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", showAll && "rotate-180")} />
          </button>
        </div>
      )}

      {/* Footer note */}
      <div className="mt-3 pt-3 border-t border-border dark:border-white/5 relative z-10">
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-primary dark:text-[#103783] shrink-0 mt-0.5" />
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-relaxed">
            Data sourced from CIBIL TransUnion, RBI guidelines, and top-tier Indian bank risk frameworks.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CibilTips;
