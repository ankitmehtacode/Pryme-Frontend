import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { PrymeAPI } from "@/lib/api";
import { ArrowRight, Calculator, CheckCircle2, FileText, ShieldCheck, Sparkles, TrendingUp, Users, Zap, Building2, ChevronRight, Lock, Loader2, ArrowLeft, ExternalLink, Gift, Clock, Star, BadgeCheck, AlertCircle } from "lucide-react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollReveal from "@/components/ui/ScrollReveal";
import OffersMarquee from "@/components/home/OffersMarquee";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { BankComparisonCard, BankOfferDTO } from "@/components/loan/BankComparisonCard";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { formatIndianCurrency } from "@/lib/utils";

import hdfcLogo from "@/assets/hdfc.png";
import iciciLogo from "@/assets/icici.png";
import axisLogo from "@/assets/axis-bank.png";
import kotakLogo from "@/assets/kotak-mahindra-bank-logo-vector_logoshape.com.svg";
import sbiLogo from "@/assets/sbi.png";
import bobLogo from "@/assets/bob.png";
import pnbLogo from "@/assets/punjab-national-bank-vector-logo_logoshape.com.svg";
import yesLogo from "@/assets/yes-bank.png";
import rblLogo from "@/assets/rbl-bank.svg";
import bajajLogo from "@/assets/bajaj-finserv.png";
import ltLogo from "@/assets/lt-finance.png";
import bandhanLogo from "@/assets/bandhan-bank.png";
import abflLogo from "@/assets/abfl.png";
import scLogo from "@/assets/sc.svg";
import indusindLogo from "@/assets/indusind.svg";
import idbiLogo from "@/assets/idbi-bank.png";
import tataLogo from "@/assets/tata-capital.png";
import idfcLogo from "@/assets/idfc.png";
import jioLogo from "@/assets/jio.png";

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
  effectiveTenureYears: number;
  maxLoanAmount: number;
  principalAmount: number;
  approvalOdds: number;
  processingTime: string;
  requiredDocs: string[];
  bankKey: string;
  originalEngineResult?: any;
}

interface LeadDataPayload {
  leadId?: string;
  cibilScore: number;
  productType: string;
  employmentType?: string;
  monthlyIncome: number;
  loanAmount: number;
  loanTenure?: number;
  fullName: string;
  engineResults?: any[];
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
    className={`rounded-[1.75rem] border border-border/30 dark:border-white/[0.04] bg-card dark:bg-[#0d1829] overflow-hidden ${isHero ? "p-8 md:p-10" : "p-6"}`}
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
  const { isAuthenticated } = useAuth();

  const { data: productRewards = [] } = useQuery({
    queryKey: ["publicProductRewards"],
    queryFn: () => PrymeAPI.getPublicProductRewards()
  });

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

  // ── Engine Data Mapper ──────────────────────────────────────────────────
  const dynamicOffers = useMemo((): BankOffer[] => {
    if (!leadData || !leadData.engineResults || leadData.engineResults.length === 0) return [];

    // Filter only eligible offers returned by Matrix Engine (Java)
    const eligibleResults = leadData.engineResults.filter((r: any) => r && (r.eligible === true || r.isEligible === true));

    const mappedOffers = eligibleResults.map((er: any, index: number) => {
      // Map Matrix response onto our UI BankOffer structure
      // Resolve the correct bank theme and logo based on the bank's name
      const resolveBankTheme = (bankName: string, productCode: string, lenderName?: string) => {
        const name = `${lenderName || ""} ${bankName || ""} ${productCode || ""}`.toUpperCase();

        if (name.includes("HDFC")) return { c: "bg-[#004c8f]", x: "#004c8f", img: hdfcLogo, bankKey: "HDFC" };
        if (name.includes("ICICI")) return { c: "bg-[#f58220]", x: "#f58220", img: iciciLogo, bankKey: "ICICI" };
        if (name.includes("AXIS")) return { c: "bg-[#97144d]", x: "#97144d", img: axisLogo, bankKey: "AXIS" };
        if (name.includes("KOTAK")) return { c: "bg-[#ed1c24]", x: "#ed1c24", img: kotakLogo, bankKey: "KOTAK" };
        if (name.includes("SBI") || name.includes("STATE BANK")) return { c: "bg-[#0f3b8c]", x: "#0f3b8c", img: sbiLogo, bankKey: "SBI" };
        if (name.includes("BOB") || name.includes("BARODA")) return { c: "bg-[#f15a22]", x: "#f15a22", img: bobLogo, bankKey: "BOB" };
        if (name.includes("PNB") || name.includes("PUNJAB")) return { c: "bg-[#a32020]", x: "#a32020", img: pnbLogo, bankKey: "PNB" };
        if (name.includes("YES")) return { c: "bg-[#005197]", x: "#005197", img: yesLogo, bankKey: "YES" };
        if (name.includes("BAJAJ")) return { c: "bg-[#005cb9]", x: "#005cb9", img: bajajLogo, bankKey: "BAJAJ" };
        if (name.includes("LNT") || name.includes("L&T")) return { c: "bg-[#ffcc00]", x: "#ffcc00", img: ltLogo, bankKey: "LNT" };
        if (name.includes("BANDHAN")) return { c: "bg-[#005087]", x: "#005087", img: bandhanLogo, bankKey: "BANDHAN" };
        if (name.includes("ABFL") || name.includes("ADITYA")) return { c: "bg-[#c62828]", x: "#c62828", img: abflLogo, bankKey: "ABFL" };
        if (name.includes("RBL")) return { c: "bg-[#0A387E]", x: "#0A387E", img: rblLogo, bankKey: "RBL" };
        if (name.includes("SC") || name.includes("STANDARD")) return { c: "bg-[#00a546]", x: "#00a546", img: scLogo, bankKey: "SC" };
        if (name.includes("INDUSIND")) return { c: "bg-[#8a1921]", x: "#8a1921", img: indusindLogo, bankKey: "INDUSIND" };
        if (name.includes("JIO")) return { c: "bg-[#0a2240]", x: "#0a2240", img: jioLogo, bankKey: "JIO" };
        if (name.includes("IDFC")) return { c: "bg-[#9d1d27]", x: "#9d1d27", img: idfcLogo, bankKey: "IDFC" };
        if (name.includes("IDBI")) return { c: "bg-[#00703c]", x: "#00703c", img: idbiLogo, bankKey: "IDBI" };
        if (name.includes("TATA")) return { c: "bg-[#005a9c]", x: "#005a9c", img: tataLogo, bankKey: "TATA" };

        // Generic fallback colors using a stable hash so it doesn't change on re-render
        const fallbacks = [
          { c: "bg-[#1e293b]", x: "#1e293b", img: undefined }, // Slate
          { c: "bg-[#0f172a]", x: "#0f172a", img: undefined }, // Slate darker
          { c: "bg-[#334155]", x: "#334155", img: undefined }  // Slate lighter
        ];
        const fb = fallbacks[name.length % fallbacks.length];
        return { ...fb, bankKey: `GENERIC-${name}` };
      };

      const theme = resolveBankTheme(er?.lenderName || er?.productName, er?.productCode, er?.lenderName);

      // Map dynamic backend fields without hardcoded fallbacks
      const roiPercent = er?.roi != null ? (er.roi < 1 ? er.roi * 100 : er.roi) : 0;
      const processingFee = er?.processingFee != null ? er.processingFee : 0;
      const maxLoanAmount = er?.maxEligibleAmount || leadData.loanAmount;
      // Bank can never disburse more than it deems the applicant eligible for —
      // EMI/repayment figures must be based on this capped amount, not the raw request.
      const principalAmount = Math.min(leadData.loanAmount, maxLoanAmount);

      return {
        id: er?.productCode || er?.lenderId || Math.random().toString(),
        bankName: er?.lenderName || er?.productName || "Partner Bank",
        logoColor: theme.c,
        brandHex: theme.x,
        logoUrl: theme.img,
        interestRate: parseFloat(roiPercent.toFixed(2)),
        processingFee: parseFloat(processingFee.toFixed(2)),
        effectiveTenureYears: (er?.tenureMonths || 60) / 12,
        requestedTenure: leadData.loanTenure,
        maxLoanAmount,
        principalAmount,
        approvalOdds: 98,
        processingTime: "48 hrs",
        requiredDocs: ["PAN Card", "Aadhaar Card", "Salary Slips (3 months)", "Bank Statement (6 months)"],
        originalEngineResult: er,
        employmentType: leadData.employmentType || leadData.productType,
        bankKey: theme.bankKey
      };
    });

    // Sort mapped offers: highest eligible loan amount first, then lowest interest rate, then lowest processing fee
    const sortedOffers = mappedOffers.sort((a, b) => {
      if (a.maxLoanAmount !== b.maxLoanAmount) {
        return b.maxLoanAmount - a.maxLoanAmount;
      }
      if (a.interestRate !== b.interestRate) {
        return a.interestRate - b.interestRate;
      }
      return a.processingFee - b.processingFee;
    });

    // Deduplicate: Keep only the single best offer for each unique bankKey
    const seenBanks = new Set<string>();
    const uniqueOffers: BankOffer[] = [];

    for (const offer of sortedOffers) {
      if (!seenBanks.has(offer.bankKey)) {
        seenBanks.add(offer.bankKey);
        uniqueOffers.push(offer);
      }
    }

    // Assign final approval odds based on overall rank
    return uniqueOffers.map((offer, idx) => {
      const nameHash = offer.bankName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return {
        ...offer,
        approvalOdds: idx === 0 ? 98 : 85 + (nameHash % 13)
      };
    });
  }, [leadData]);

  // ── EMI + Comparison Intelligence ─────────────────────────────────────
  function calcEMI(p: number, r: number, t: number) {
    const mr = r / (12 * 100), n = t * 12;
    if (mr === 0) return Math.round(p / n);
    return Math.round((p * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1));
  }

  // 🧠 RULES OF HOOKS FIX: ALL useMemo/useCallback hooks MUST run
  // unconditionally before any early returns. React requires hooks
  // to be called in the same order on every render.

  const emis = useMemo(() => {
    if (!leadData || dynamicOffers.length === 0) return {};
    const m: Record<string, number> = {};
    dynamicOffers.forEach(o => {
      // Prefer the engine's own proposed EMI (already computed on the capped/eligible
      // amount server-side); fall back to a local calc on the capped principal only
      // if the backend didn't return one.
      const backendEmi = o.originalEngineResult?.proposedEmi;
      m[o.id] = backendEmi != null
        ? Math.round(Number(backendEmi))
        : calcEMI(o.principalAmount, o.interestRate, o.effectiveTenureYears);
    });
    return m;
  }, [dynamicOffers, leadData]);

  const totalRepayments = useMemo(() => {
    if (!leadData || dynamicOffers.length === 0) return {};
    const m: Record<string, number> = {};
    dynamicOffers.forEach(o => { m[o.id] = (emis[o.id] || 0) * o.effectiveTenureYears * 12; });
    return m;
  }, [dynamicOffers, leadData, emis]);

  // The list is ranked by highest eligible loan amount first (see sortedOffers
  // above), not by EMI -- a generous-FOIR lender can rank #1 while genuinely
  // having a higher EMI than a lender below it. "Lowest EMI" must be computed
  // independently from the ranking so the tag never claims something false.
  const lowestEmiOfferId = useMemo(() => {
    if (!dynamicOffers.length) return null;
    let bestId = dynamicOffers[0].id;
    let bestEmi = emis[bestId] ?? Infinity;
    for (const o of dynamicOffers) {
      const e = emis[o.id];
      if (e != null && e < bestEmi) {
        bestEmi = e;
        bestId = o.id;
      }
    }
    return bestId;
  }, [dynamicOffers, emis]);

  const savingsVsNext = useMemo(() => {
    if (dynamicOffers.length < 2 || !leadData) return { emiDiff: 0, totalDiff: 0, comparedTo: "" };
    const hero = dynamicOffers[0], next = dynamicOffers[1];
    return {
      emiDiff: (emis[next.id] || 0) - (emis[hero.id] || 0),
      totalDiff: (totalRepayments[next.id] || 0) - (totalRepayments[hero.id] || 0),
      comparedTo: next.bankName,
    };
  }, [dynamicOffers, emis, totalRepayments, leadData]);

  const heroValueScore = useMemo(() => {
    if (!dynamicOffers.length) return 0;
    const hero = dynamicOffers[0];
    let score = 50;
    score += Math.min(25, hero.approvalOdds / 4);
    if (hero.interestRate <= 11) score += 15;
    if (hero.processingTime.includes("24")) score += 10;
    return Math.min(97, Math.round(score));
  }, [dynamicOffers]);

  // ═══════════════════════════════════════════════════════════════════════
  // SCENARIO B: EXCEPTION ZERO-STATE (No Offers Matched Engine Profile)
  // ═══════════════════════════════════════════════════════════════════════
  // ── Handlers (must be declared before any early returns to avoid conditional hook-like patterns) ──
  const handleUnlock = useCallback(async (offer: BankOffer) => {
    if (!leadData) return;
    setIsLocking(offer.id);
    try {
      localStorage.setItem("pryme_target_bank", offer.bankName);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 🧠 AUTH-AWARE ROUTING FIX: If the user is already authenticated,
      // send them to their dashboard to continue the application — NOT
      // back to /auth which confuses logged-in users.
      if (isAuthenticated) {
        toast({ title: "Offer Secured ✨", description: `${offer.bankName} application locked. Redirecting to your dashboard.` });
        navigate("/dashboard", { state: { selectedBank: offer.bankName, leadData } });
      } else {
        toast({ title: "Offer Secured ✨", description: `${offer.bankName} application locked. Create your account to track it.` });
        // 🧠 RELAY FIX: leadData.leadId is undefined (Apply.tsx stores it in localStorage, not router state)
        // Read from the actual source of truth where Apply.tsx:116 saved it.
        const storedLeadId = localStorage.getItem("pryme_pending_lead_id");
        navigate("/auth", { state: { emailHint: "", intent: "track_lead", leadId: storedLeadId } });
      }
    } catch {
      toast({ title: "Connection Error", description: "Please try again.", variant: "destructive" });
      setIsLocking(null);
      throw new Error("API Gateway routing failed"); // Throw so the error boundary can catch it
    }
  }, [leadData, isAuthenticated, navigate]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedCard(prev => prev === id ? null : id);
  }, []);

  const handleApply = useCallback(async (providerId: string) => {
    const offer = dynamicOffers.find(o => o.id === providerId);
    if (offer) {
      await handleUnlock(offer);
    }
  }, [dynamicOffers, handleUnlock]);

  // ═══════════════════════════════════════════════════════════════════════
  // SCENARIO A: PUBLIC PAGE (no lead data — direct URL navigation)
  // ═══════════════════════════════════════════════════════════════════════

  if (!leadData) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080d1e]">
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
              <div className="py-12 bg-white/30 dark:bg-white/[0.02] backdrop-blur-sm border-y border-white/30 dark:border-white/[0.06] mb-20"><OffersMarquee /></div>
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                  {[
                    { icon: Zap, title: "Zero Processing Fees", bank: "HDFC Bank Special", text: "Available for Home Loans above ₹50L.", color: "from-blue-500/10 to-blue-600/10" },
                    { icon: Sparkles, title: "0.25% ROI Reduction", bank: "Standard Chartered", text: "Exclusive for PRYME customers with CIBIL > 800.", color: "from-blue-500/10 to-blue-800/10" },
                    { icon: Gift, title: "₹5000 Amazon Voucher", bank: "Personal Loan Perk", text: "Get rewarded on first disbursement through our platform.", color: "from-amber-500/10 to-amber-600/10" },
                    { icon: TrendingUp, title: "Double Rewards Points", bank: "Credit Card Offer", text: "2x points on all digital spends for 90 days.", color: "from-blue-700/10 to-blue-800/10" },
                  ].map((offer, i) => (
                    <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                      <div className={`p-8 rounded-[2.5rem] bg-white/50 dark:bg-white/[0.03] backdrop-blur-sm ${offer.color} border border-white/40 dark:border-white/[0.08] flex flex-col md:flex-row gap-8 items-center transition-all hover:scale-[1.02] hover:shadow-lg`}>
                        <div className="w-24 h-24 rounded-3xl bg-white/60 dark:bg-white/[0.06] backdrop-blur-sm flex items-center justify-center shrink-0 shadow-lg border border-white/40 dark:border-white/[0.1]">
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
  // SCENARIO B: ZERO-STATE (leadData exists but no eligible offers)
  // 🧠 CRASH-FIX: This guard MUST run before accessing dynamicOffers[0].
  //    Previously, when showSkeleton was true AND dynamicOffers was empty,
  //    this guard was skipped and the Decision UI accessed heroOffer.brandHex
  //    on undefined — causing the production crash.
  //    Fix: Check dynamicOffers.length === 0 regardless of showSkeleton state.
  // ═══════════════════════════════════════════════════════════════════════
  if (dynamicOffers.length === 0) {
    // Still in skeleton phase — show loading shimmer, don't crash
    if (showSkeleton) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#080d1e] text-foreground flex flex-col font-sans">
          <Header />
          <main className="flex-1 pt-24 md:pt-28 pb-24">
            <div className="container mx-auto px-4 max-w-6xl space-y-4">
              <SkeletonCard delay={0} />
              <SkeletonCard delay={0.1} />
              <SkeletonCard delay={0.15} />
            </div>
          </main>
        </div>
      );
    }

    // Skeleton done, still no offers → show rejection UI
    const rawViolations = (leadData as any).engineResults?.[0]?.rejectionReasons || (leadData as any).engineResults?.[0]?.violations || [];
    const maxPossibleAmount = (leadData as any).engineResults?.reduce((max: number, result: any) => {
      const amount = result?.maxEligibleAmount || 0;
      return amount > max ? amount : max;
    }, 0) || 0;

    return (
      <div className="min-h-screen pt-28 pb-20 bg-background flex items-center justify-center">
        <div className="max-w-md w-full px-6 space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-foreground">No Offers Found</h2>
            <p className="text-secondary-foreground text-sm">
              We evaluated your profile against our partner network. Unfortunately, we could not find an eligible loan match right now.
            </p>
          </div>

          {maxPossibleAmount > 0 && leadData.loanAmount > maxPossibleAmount && (
            <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl text-sm space-y-2">
              <div className="font-bold text-primary flex items-center gap-2 text-base">
                <ShieldCheck className="w-5 h-5" /> Maximum Eligibility: {formatIndianCurrency(maxPossibleAmount)}
              </div>
              <p className="text-secondary-foreground/90">
                You requested {formatIndianCurrency(leadData.loanAmount)}, but based on your income and current obligations, the maximum loan amount you can get is <strong className="text-foreground">{formatIndianCurrency(maxPossibleAmount)}</strong>. Try reducing your loan amount.
              </p>
            </div>
          )}

          <div className="bg-secondary/30 p-5 rounded-2xl text-sm space-y-3 border border-border/50">
            <div className="font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" /> {rawViolations.length > 1 ? "Reasons of rejection:" : "Reason of rejection:"}
            </div>
            <ul className="list-disc pl-5 space-y-2 text-secondary-foreground/80">
              {rawViolations.length > 0 ? (
                rawViolations.map((reason: string, idx: number) => (
                  <li key={idx}>{reason}</li>
                ))
              ) : (
                <li>Applicant profile does not meet standard eligibility criteria.</li>
              )}
            </ul>
          </div>

          <Button onClick={() => navigate("/apply-direct")} className="w-full h-12 bg-primary/90 hover:bg-primary text-white font-medium shadow-sm transition-all text-base rounded-xl font-heading">
            Request a Call back
          </Button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SCENARIO C: DECISION UI — heroOffer is GUARANTEED to exist here
  // ═══════════════════════════════════════════════════════════════════════

  const heroOffer = dynamicOffers[0];
  const otherOffers = dynamicOffers.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d1e] text-foreground flex flex-col font-sans selection:bg-primary/30">
      <Helmet><title>Your Best Loan Option | PRYME</title></Helmet>
      <Header />

      <main className="flex-1 pt-24 md:pt-28 pb-24 relative overflow-x-clip">
        {/* 🧠 PERF FIX: radial-gradient replaces transform-gpu — zero CPU rasterization */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full pointer-events-none opacity-[0.07]"
          style={{ background: `radial-gradient(circle, ${heroOffer.brandHex} 0%, transparent 70%)` }}
        />
        <div className="absolute top-[200px] right-0 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(16,55,131,0.04) 0%, transparent 70%)' }} />

        <div className="container mx-auto px-4 max-w-6xl relative z-10">

          {/* ═══════════════════════════════════════════════════════════
              STICKY MINI SUMMARY BAR — Replaces sidebar entirely
              ═══════════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 md:mb-8 bg-slate-50/90 dark:bg-[#0c1322]/90 border border-slate-200 dark:border-white/[0.06] rounded-2xl md:rounded-[1.25rem] px-4 md:px-5 py-3 md:py-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4"
          >
            <div className="flex items-center justify-between md:justify-start w-full md:w-auto gap-4 md:gap-8">
              {[
                { label: "Amount", value: `₹${leadData.loanAmount.toLocaleString("en-IN")}` },
                { label: "CIBIL", value: `${leadData.cibilScore}` },
                { label: "Income", value: `₹${(leadData.monthlyIncome || 50000).toLocaleString("en-IN")}` },
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40">{s.label}</p>
                  <p className="text-[13px] md:text-sm font-bold text-foreground tabular-nums">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 self-end md:self-auto pt-1 md:pt-0 border-t border-border/40 md:border-t-0 w-full md:w-auto justify-end md:justify-end">
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
                <SkeletonCard delay={0} />
                <SkeletonCard delay={0.1} />
                <SkeletonCard delay={0.15} />
              </motion.div>
            )}
          </AnimatePresence>

          {!showSkeleton && (
            <div className="space-y-4">
              <AppErrorBoundary>
                <div className="space-y-3">
                  {dynamicOffers.map((offer, idx) => {
                    const emi = emis[offer.id] || 0;
                    const totalRep = totalRepayments[offer.id] || 0;
                    // Diff is measured against whichever offer genuinely has the
                    // lowest EMI -- not against the #1 ranked (highest eligible
                    // amount) card -- so "+₹X/mo more" is always truthful even
                    // when the top-ranked lender isn't the cheapest one.
                    const isLowestEmi = offer.id === lowestEmiOfferId;
                    const emiDiffFromHero = isLowestEmi ? 0 : emi - (emis[lowestEmiOfferId || ""] || 0);
                    const totalDiffFromHero = isLowestEmi ? 0 : totalRep - (totalRepayments[lowestEmiOfferId || ""] || 0);
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
                        principalAmount={offer.principalAmount}
                        isExpanded={isExpanded}
                        onToggleExpand={handleToggleExpand}
                        onApply={handleApply}
                        isGlobalLocking={isLocking !== null}
                        isRecommended={offer.interestRate === heroOffer.interestRate && offer.processingFee === heroOffer.processingFee}
                        isLowestEmi={isLowestEmi}
                        rewards={productRewards}
                      />
                    );
                  })}
                </div>
              </AppErrorBoundary>

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
      <div className="fixed bottom-0 left-0 right-0 z-50 xl:hidden bg-white/95 dark:bg-[#0c1322]/98 border-t border-slate-200 dark:border-white/[0.06] px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
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