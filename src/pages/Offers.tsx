import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, Calculator, CheckCircle2, FileText, ShieldCheck, Sparkles, TrendingUp, Users, Zap, Building2, ChevronRight, Lock, Loader2, ArrowLeft, ExternalLink, Gift, Clock, Star, BadgeCheck } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollReveal from "@/components/ui/ScrollReveal";
import OffersMarquee from "@/components/home/OffersMarquee";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { BankComparisonCard, BankOfferDTO } from "@/components/loan/BankComparisonCard";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// ── Local Bank Logo Assets ──────────────────────────────────────────────
import hdfcLogo from "@/assets/hdfc.svg";
import iciciLogo from "@/assets/icici.svg";
import axisLogo from "@/assets/axis-bank-logo-1.svg";
import kotakLogo from "@/assets/kotak-mahindra-bank-logo-vector_logoshape.com.svg";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface BankOffer {
  id: string;
  bankName: string;
  logoColor: string;
  logoUrl?: string;
  brandHex: string;
  interestRate: number;
  processingFee: number;
  maxTenure: number;
  maxLoanAmount: number;
  approvalOdds: number;
  processingTime: string;
  requiredDocs: string[];
}

interface LeadDataPayload {
  leadId?: string;
  cibilScore: number;
  productType: string;
  monthlyIncome: number;
  loanAmount: number;
  fullName: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

const spring = { type: "spring" as const, stiffness: 200, damping: 26 };

// ═══════════════════════════════════════════════════════════════════════════════
// SHIMMER EFFECT — Subtle animated highlight on hero card
// ═══════════════════════════════════════════════════════════════════════════════

const ShimmerEffect = () => (
  <motion.div
    className="absolute inset-0 z-0 overflow-hidden rounded-[1.75rem] pointer-events-none"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 0.5 }}
  >
    <motion.div
      className="absolute -inset-full w-[200%] h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -skew-x-12"
      animate={{ x: ["-100%", "100%"] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
    />
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// VALUE SCORE BAR — Visual reinforcement of "best value"
// ═══════════════════════════════════════════════════════════════════════════════

const ValueScoreBar = ({ score }: { score: number }) => (
  <div className="w-full">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">Best Value Score</span>
      <span className="text-[11px] font-extrabold text-white/80 tabular-nums">{score}/100</span>
    </div>
    <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-green-300"
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON LOADER
// ═══════════════════════════════════════════════════════════════════════════════

const SkeletonCard = ({ isHero, delay }: { isHero?: boolean; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ delay }}
    className={`rounded-[1.75rem] border border-border/30 dark:border-white/[0.04] bg-card dark:bg-[#111] overflow-hidden ${isHero ? "p-8 md:p-10" : "p-6"}`}
  >
    <div className="flex gap-4 items-center mb-6">
      <div className={`${isHero ? "w-14 h-14" : "w-11 h-11"} rounded-2xl bg-secondary/60 dark:bg-white/[0.04] animate-pulse`} />
      <div className="space-y-2 flex-1">
        <div className={`${isHero ? "h-6 w-40" : "h-5 w-32"} bg-secondary/60 dark:bg-white/[0.04] rounded-lg animate-pulse`} />
        <div className="h-3 w-24 bg-secondary/60 dark:bg-white/[0.04] rounded animate-pulse" />
      </div>
    </div>
    <div className={`${isHero ? "h-16" : "h-12"} w-48 bg-secondary/60 dark:bg-white/[0.04] rounded-xl animate-pulse mb-6`} />
    <div className="grid grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-16 bg-secondary/60 dark:bg-white/[0.04] rounded animate-pulse" />
          <div className="h-6 w-full bg-secondary/60 dark:bg-white/[0.04] rounded animate-pulse" />
        </div>
      ))}
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function Offers() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }, []);

  const leadData = location.state as LeadDataPayload | null;

  const [isLocking, setIsLocking] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(true);

  useEffect(() => {
    if (leadData) {
      const t = setTimeout(() => setShowSkeleton(false), 800);
      return () => clearTimeout(t);
    }
    setShowSkeleton(false);
  }, [leadData]);

  // ── Offers Engine ─────────────────────────────────────────────────────
  const dynamicOffers = useMemo((): BankOffer[] => {
    if (!leadData) return [];

    const baseRate = leadData.cibilScore >= 750 ? 10.25 : leadData.cibilScore >= 650 ? 12.5 : 15.0;
    const baseOdds = leadData.cibilScore >= 750 ? 98 : leadData.cibilScore >= 650 ? 82 : 45;

    return [
      {
        id: "hdfc", bankName: "HDFC Bank", logoColor: "bg-[#004c8f]", brandHex: "#004c8f",
        logoUrl: hdfcLogo,
        interestRate: baseRate, processingFee: 1.5, maxTenure: 5, maxLoanAmount: 5000000,
        approvalOdds: baseOdds, processingTime: "24–48 hrs",
        requiredDocs: ["PAN Card", "Aadhaar Card", "Salary Slips (3 months)", "Bank Statement (6 months)", "Form 16 / ITR"],
      },
      {
        id: "icici", bankName: "ICICI Bank", logoColor: "bg-[#f58220]", brandHex: "#f58220",
        logoUrl: iciciLogo,
        interestRate: baseRate + 0.25, processingFee: 1.0, maxTenure: 5, maxLoanAmount: 4000000,
        approvalOdds: Math.max(10, baseOdds - 5), processingTime: "48–72 hrs",
        requiredDocs: ["PAN Card", "Aadhaar Card", "Salary Slips (3 months)", "Bank Statement (6 months)"],
      },
      {
        id: "axis", bankName: "Axis Bank", logoColor: "bg-[#97144d]", brandHex: "#97144d",
        logoUrl: axisLogo,
        interestRate: baseRate + 0.5, processingFee: 2.0, maxTenure: 7, maxLoanAmount: 4500000,
        approvalOdds: Math.max(10, baseOdds + 2), processingTime: "48 hrs",
        requiredDocs: ["PAN Card", "Aadhaar Card", "Salary Slips (3 months)", "Bank Statement (6 months)", "Form 16"],
      },
      {
        id: "kotak", bankName: "Kotak Mahindra", logoColor: "bg-[#ed1c24]", brandHex: "#ed1c24",
        logoUrl: kotakLogo,
        interestRate: baseRate + 0.75, processingFee: 1.5, maxTenure: 5, maxLoanAmount: 3500000,
        approvalOdds: Math.max(10, baseOdds - 10), processingTime: "3–5 days",
        requiredDocs: ["PAN Card", "Aadhaar Card", "Salary Slips (3 months)", "Bank Statement (6 months)", "Form 16 / ITR", "Address Proof"],
      },
    ].sort((a, b) => a.interestRate - b.interestRate);
  }, [leadData]);

  // ── EMI + Comparison Intelligence ─────────────────────────────────────
  function calcEMI(p: number, r: number, t: number) {
    const mr = r / (12 * 100), n = t * 12;
    return Math.round((p * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1));
  }

  const emis = useMemo(() => {
    if (!leadData) return {};
    const m: Record<string, number> = {};
    dynamicOffers.forEach(o => { m[o.id] = calcEMI(leadData.loanAmount, o.interestRate, o.maxTenure); });
    return m;
  }, [dynamicOffers, leadData]);

  const totalRepayments = useMemo(() => {
    if (!leadData) return {};
    const m: Record<string, number> = {};
    dynamicOffers.forEach(o => { m[o.id] = calcEMI(leadData.loanAmount, o.interestRate, o.maxTenure) * o.maxTenure * 12; });
    return m;
  }, [dynamicOffers, leadData]);

  // Savings vs next best
  const savingsVsNext = useMemo(() => {
    if (dynamicOffers.length < 2 || !leadData) return { emiDiff: 0, totalDiff: 0, comparedTo: "" };
    const hero = dynamicOffers[0], next = dynamicOffers[1];
    return {
      emiDiff: (emis[next.id] || 0) - (emis[hero.id] || 0),
      totalDiff: (totalRepayments[next.id] || 0) - (totalRepayments[hero.id] || 0),
      comparedTo: next.bankName,
    };
  }, [dynamicOffers, emis, totalRepayments, leadData]);

  // Value score for hero
  const heroValueScore = useMemo(() => {
    if (!dynamicOffers.length) return 0;
    const hero = dynamicOffers[0];
    let score = 50;
    score += Math.min(25, hero.approvalOdds / 4);
    if (hero.interestRate <= 11) score += 15;
    if (hero.processingTime.includes("24")) score += 10;
    return Math.min(97, Math.round(score));
  }, [dynamicOffers]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleUnlock = async (offer: BankOffer) => {
    if (!leadData) return;
    setIsLocking(offer.id);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({ title: "Offer Secured ✨", description: `${offer.bankName} application locked. Create your account to track it.` });
      navigate("/auth", { state: { emailHint: "", intent: "track_lead", leadId: leadData.leadId } });
    } catch {
      toast({ title: "Connection Error", description: "Please try again.", variant: "destructive" });
      setIsLocking(null);
      throw new Error("API Gateway routing failed"); // Throw so the error boundary can catch it
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // SCENARIO A: PUBLIC PAGE
  // ═══════════════════════════════════════════════════════════════════════

  if (!leadData) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0a0a]">
        <Helmet><title>Exclusive Offers | PRYME Consulting</title></Helmet>
        <Header />
        <SmoothScroll>
          <main className="flex-1 pt-24 md:pt-32">
            <section className="pb-24">
              <ScrollReveal direction="up">
                <div className="container mx-auto px-4 max-w-4xl text-center mb-16">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-widest mb-6 border border-primary/20">
                    <Gift className="w-4 h-4" /> Member Perks
                  </span>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-8 tracking-tight">
                    Premium <span className="text-primary italic">Incentives</span>
                  </h1>
                  <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                    Our scale allows us to negotiate exclusive rates and zero-processing fee deals that you won't find on bank websites.
                  </p>
                </div>
              </ScrollReveal>
              <div className="py-12 bg-white/30 dark:bg-white/[0.02] backdrop-blur-xl border-y border-white/30 dark:border-white/[0.06] mb-20"><OffersMarquee /></div>
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                  {[
                    { icon: Zap, title: "Zero Processing Fees", bank: "HDFC Bank Special", text: "Available for Home Loans above ₹50L.", color: "from-blue-500/10 to-blue-600/10" },
                    { icon: Sparkles, title: "0.25% ROI Reduction", bank: "Standard Chartered", text: "Exclusive for PRYME customers with CIBIL > 800.", color: "from-blue-500/10 to-blue-800/10" },
                    { icon: Gift, title: "₹5000 Amazon Voucher", bank: "Personal Loan Perk", text: "Get rewarded on first disbursement through our platform.", color: "from-amber-500/10 to-amber-600/10" },
                    { icon: TrendingUp, title: "Double Rewards Points", bank: "Credit Card Offer", text: "2x points on all digital spends for 90 days.", color: "from-blue-700/10 to-blue-800/10" },
                  ].map((offer, i) => (
                    <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                      <div className={`p-8 rounded-[2.5rem] bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl ${offer.color} border border-white/40 dark:border-white/[0.08] flex flex-col md:flex-row gap-8 items-center transition-all hover:scale-[1.02] hover:shadow-lg`}>
                        <div className="w-24 h-24 rounded-3xl bg-white/60 dark:bg-white/[0.06] backdrop-blur-xl flex items-center justify-center shrink-0 shadow-lg border border-white/40 dark:border-white/[0.1]">
                          <offer.icon className="w-10 h-10 text-primary" />
                        </div>
                        <div className="text-center md:text-left flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80 mb-2 block">{offer.bank}</span>
                          <h3 className="text-2xl font-semibold text-foreground mb-3">{offer.title}</h3>
                          <p className="text-slate-600 dark:text-slate-400 mb-6">{offer.text}</p>
                          <Button onClick={() => navigate('/apply')} className="rounded-xl h-12 px-8 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20">Claim Deal</Button>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>
          </main>
          <Footer />
        </SmoothScroll>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SCENARIO B: DECISION UI
  // ═══════════════════════════════════════════════════════════════════════

  const heroOffer = dynamicOffers[0];
  const otherOffers = dynamicOffers.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-foreground flex flex-col font-sans selection:bg-primary/30">
      <Helmet><title>Your Best Loan Option | PRYME</title></Helmet>
      <Header />

      <main className="flex-1 pt-24 md:pt-28 pb-24 relative overflow-hidden">
        {/* Ambient glow — Dynamic bank brand color */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] blur-[160px] rounded-full pointer-events-none opacity-[0.07]"
          style={{ background: `radial-gradient(circle, ${heroOffer.brandHex}, transparent 70%)` }}
        />
        {/* Secondary ambient */}
        <div className="absolute top-[200px] right-0 w-[400px] h-[400px] bg-gradient-to-b from-[#103783]/[0.04] to-transparent blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 max-w-5xl relative z-10">

          {/* ═══════════════════════════════════════════════════════════
              STICKY MINI SUMMARY BAR — Replaces sidebar entirely
              ═══════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8 bg-white/60 dark:bg-white/[0.04] backdrop-blur-xl border border-white/40 dark:border-white/[0.08] rounded-[1.25rem] px-5 py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-6 md:gap-8">
              {[
                { label: "Amount", value: `₹${leadData.loanAmount.toLocaleString("en-IN")}` },
                { label: "CIBIL", value: `${leadData.cibilScore}` },
                { label: "Income", value: `₹${(leadData.monthlyIncome || 50000).toLocaleString("en-IN")}` },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">{s.label}</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3 h-3" /> No credit impact
              </div>
              <div className="w-px h-4 bg-white/30 dark:bg-white/[0.06]" />
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                <Lock className="w-3 h-3" /> Encrypted
              </div>
            </div>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════
              HERO HEADER — 2-second scan rule
              ═══════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary dark:text-[#9BAFD9] mb-1.5">
              We found your best match
            </p>
            <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight text-foreground">
              {dynamicOffers.length} lenders want to fund you. Here's the smartest pick.
            </h1>
          </motion.div>

          {/* Skeleton loading */}
          <AnimatePresence>
            {showSkeleton && (
              <motion.div exit={{ opacity: 0 }} className="space-y-4 mb-4">
                <SkeletonCard isHero delay={0} />
                <SkeletonCard delay={0.1} />
                <SkeletonCard delay={0.15} />
              </motion.div>
            )}
          </AnimatePresence>

          {!showSkeleton && (
            <div className="space-y-4">

              {/* ═══════════════════════════════════════════════════════
                  🏆 HERO CARD — 1.4x larger, dominant, gradient bg
                  This IS the decision. Everything else is secondary.
                  ═══════════════════════════════════════════════════════ */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.1, ...spring }}
                className="relative rounded-[2rem] overflow-hidden"
                style={{ boxShadow: `0 24px 60px ${heroOffer.brandHex}18, 0 0 0 1px ${heroOffer.brandHex}15` }}
              >
                {/* Dynamic gradient bg — Uses hero bank's brand colour */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${heroOffer.brandHex} 0%, ${heroOffer.brandHex}dd 40%, ${heroOffer.brandHex}aa 100%)`,
                  }}
                />
                {/* Glass overlay for depth */}
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />

                {/* Shimmer sweep */}
                <ShimmerEffect />

                {/* Glassmorphic border */}
                <div className="absolute inset-0 rounded-[2rem] border border-white/15 pointer-events-none z-10" />

                <div className="relative z-10 p-7 md:p-10">

                  {/* ── Top: Identity + Recommended Label ──────────── */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/95 backdrop-blur-xl flex items-center justify-center shadow-xl ring-2 ring-white/30 p-2 overflow-hidden">
                        {heroOffer.logoUrl ? (
                          <img src={heroOffer.logoUrl} alt={heroOffer.bankName} className="w-full h-full object-contain" />
                        ) : (
                          <Building2 className="w-7 h-7" style={{ color: heroOffer.brandHex }} />
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">{heroOffer.bankName}</h2>
                        <div className="flex items-center gap-2.5 mt-1">
                          <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> {heroOffer.approvalOdds}% approval
                          </span>
                          <span className="text-white/20">•</span>
                          <span className="text-[11px] text-white/50 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {heroOffer.processingTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Recommended badge — frosted glass */}
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Recommended for you
                    </div>
                  </div>

                  {/* ── Savings callout — Comparison intelligence ───── */}
                  {savingsVsNext.totalDiff > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/15"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                      <span className="text-[12px] font-bold text-white">
                        You save ₹{savingsVsNext.totalDiff.toLocaleString("en-IN")} vs {savingsVsNext.comparedTo}
                      </span>
                    </motion.div>
                  )}

                  {/* ── EMI — PRIMARY METRIC (giant) ───────────────── */}
                  <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10 mb-7">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-1">Monthly EMI</p>
                      <p className="text-[44px] md:text-[52px] font-extrabold text-white tracking-tight leading-none tabular-nums">
                        <span className="text-xl font-semibold text-white/50 mr-1">₹</span>{(emis[heroOffer.id] || 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Frosted glass metric chips */}
                    <div className="flex flex-wrap gap-3 pb-1">
                      {[
                        { label: "Total Repayment", value: `₹${(totalRepayments[heroOffer.id] || 0).toLocaleString("en-IN")}` },
                        { label: "Interest (APR)", value: `${heroOffer.interestRate}%` },
                        { label: "Tenure", value: `${heroOffer.maxTenure} yrs` },
                        { label: "Processing Fee", value: `${heroOffer.processingFee}%` },
                      ].map((m, i) => (
                        <div key={i} className="px-3.5 py-2 rounded-xl bg-white/[0.08] backdrop-blur-xl border border-white/[0.1]">
                          <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/35 leading-none mb-1">{m.label}</p>
                          <p className="text-sm font-bold text-white/90 tabular-nums leading-none">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Inline reasons — Why this is best ──────────── */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mb-7">
                    {[
                      "Lowest total repayment",
                      `${heroOffer.approvalOdds}% approval probability`,
                      `Fast disbursal (${heroOffer.processingTime})`,
                    ].map((reason, i) => (
                      <span key={i} className="flex items-center gap-1.5 text-[12px] font-medium text-white/60">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" /> {reason}
                      </span>
                    ))}
                  </div>

                  {/* ── Value Score Bar ─────────────────────────────── */}
                  <div className="mb-8 max-w-sm">
                    <ValueScoreBar score={heroValueScore} />
                  </div>

                  {/* ── CTA + Trust — Glassmorphic button ──────────── */}
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <Button
                        onClick={() => handleUnlock(heroOffer)}
                        disabled={isLocking !== null}
                        className="rounded-xl h-14 px-10 text-base font-bold bg-white/95 backdrop-blur-xl text-foreground hover:bg-white shadow-2xl shadow-black/10 hover:shadow-black/15 transition-all hover:scale-[1.02] active:scale-[0.99] border border-white/60 w-full sm:w-auto"
                        style={{ color: heroOffer.brandHex }}
                      >
                        {isLocking === heroOffer.id ? (
                          <span className="flex items-center gap-2 justify-center"><Loader2 className="w-5 h-5 animate-spin" /> Securing...</span>
                        ) : (
                          <span className="flex items-center gap-2 justify-center">Apply with Pryme <ArrowRight className="w-5 h-5" /></span>
                        )}
                      </Button>
                      <button
                        className="rounded-xl h-14 px-6 text-sm font-semibold transition-all border backdrop-blur-md bg-white/10 border-white/20 text-white/90 hover:bg-white/20 hover:text-white flex items-center justify-center gap-2 w-full sm:w-auto"
                        title={`Apply directly on ${heroOffer.bankName} website`}
                      >
                        Apply Directly <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] text-white/35 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-300/60" /> No impact on credit score
                      </span>
                      <span className="text-[10px] text-white/35 flex items-center gap-1">
                        <Users className="w-3 h-3 text-white/35" /> Trusted by 2L+ users
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ═══════════════════════════════════════════════════════
                  OTHER OPTIONS — Flat, neutral, smaller = secondary
                  ═══════════════════════════════════════════════════════ */}
              {otherOffers.length > 0 && (
                <div className="mt-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mb-4 ml-1">
                    Other options
                  </p>
                  <ErrorBoundary>
                    <div className="space-y-3">
                      {otherOffers.map((offer) => {
                        const emi = emis[offer.id] || 0;
                        const totalRep = totalRepayments[offer.id] || 0;
                        const emiDiffFromHero = emi - (emis[heroOffer.id] || 0);
                        const totalDiffFromHero = totalRep - (totalRepayments[heroOffer.id] || 0);
                        const isExpanded = expandedCard === offer.id;

                        return (
                          <BankComparisonCard
                            key={offer.id}
                            offer={offer as BankOfferDTO}
                            emi={emi}
                            totalRepayment={totalRep}
                            emiDiffFromHero={emiDiffFromHero}
                            totalDiffFromHero={totalDiffFromHero}
                            heroBankName={heroOffer.bankName}
                            principalAmount={leadData.loanAmount}
                            isExpanded={isExpanded}
                            onToggleExpand={() => setExpandedCard(isExpanded ? null : offer.id)}
                            onApply={async (providerId) => await handleUnlock(dynamicOffers.find(o => o.id === providerId)!)}
                            isGlobalLocking={isLocking !== null}
                          />
                        );
                      })}
                    </div>
                  </ErrorBoundary>
                </div>
              )}

              {/* ── Bottom trust bar ─────────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 flex flex-wrap items-center justify-center gap-6 py-4"
              >
                {[
                  { icon: ShieldCheck, label: "No credit score impact", color: "text-emerald-500" },
                  { icon: Lock, label: "256-bit SSL encryption", color: "text-blue-500" },
                  { icon: BadgeCheck, label: "RBI-regulated partners", color: "text-blue-500" },
                  { icon: Users, label: "Trusted by 2,00,000+ users", color: "text-muted-foreground" },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/50">
                    <t.icon className={`w-3.5 h-3.5 ${t.color}`} /> {t.label}
                  </div>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      </main>

      {/* ── Mobile Sticky CTA (thumb zone) ──────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 xl:hidden bg-card/95 dark:bg-[#111]/95 backdrop-blur-xl border-t border-border dark:border-white/[0.06] px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground truncate">{heroOffer.bankName}</p>
            <p className="text-[10px] text-muted-foreground tabular-nums">₹{(emis[heroOffer.id] || 0).toLocaleString("en-IN")}/mo</p>
          </div>
          <Button
            onClick={() => handleUnlock(heroOffer)}
            disabled={isLocking !== null}
            className="rounded-xl h-11 px-6 bg-[#103783] text-white text-sm font-bold shadow-lg shadow-[#103783]/20 hover:bg-[#0c2a66]"
          >
            {isLocking ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4 mr-1.5" /> Unlock offer</>}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}