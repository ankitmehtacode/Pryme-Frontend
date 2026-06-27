import { useRef, memo, useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Zap, Sparkles, Percent,
  CheckCircle2, TrendingUp, Users, ShieldCheck,
  PhoneOff, Eye, Award, Star, Building2,
  ChevronRight, ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence, Variants, useInView } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { PrymeAPI } from "@/lib/api";

import idbiLogo from "@/assets/idbi-bank-logo-1.svg";
import axisLogo from "@/assets/axis-bank-logo-1.svg";
import unionLogo from "@/assets/union-bank-of-india.svg";
import kotakLogo from "@/assets/kotak-mahindra-bank-logo-vector_logoshape.com.svg";
import pnbLogo from "@/assets/punjab-national-bank-vector-logo_logoshape.com.svg";
import yesLogo from "@/assets/yes-bank-new-logo-download_logoshape.com.svg";
import tataLogo from "@/assets/tata-capital-logo-svg_logoshape.com.svg";
import hdfcLogo from "@/assets/hdfc.svg";
import heroBankImg from "@/assets/hero-bank-building.png";
import axisBanner from "@/assets/axis_festive_banner.png";
import hdfcBanner from "@/assets/hdfc_preferred_banner.png";
import idbiBanner from "@/assets/idbi_personal_banner.png";

const LOGO_MAP: Record<string, string> = {
  idbi: idbiLogo,
  axis: axisLogo,
  union: unionLogo,
  kotak: kotakLogo,
  pnb: pnbLogo,
  yes: yesLogo,
  tata: tataLogo,
  hdfc: hdfcLogo,
};

import { BANK_OFFERS } from "./ProductSelectorGrid";

// ─────────────────────────────────────────────────────────────────────────────
// 🧠 Animated Counter for Trust Metrics Row
// ─────────────────────────────────────────────────────────────────────────────
const MiniCountUp = ({ to, prefix = "", suffix = "", formatComma = false }: { to: number, prefix?: string, suffix?: string, formatComma?: boolean }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    const duration = 1500;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * to));
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(to);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isInView, to]);

  return (
    <span ref={ref}>
      {prefix}
      {formatComma ? count.toLocaleString("en-IN") : count}
      {suffix}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Bank Offer Cards (right panel)
// ─────────────────────────────────────────────────────────────────────────────
const initialOffers = [
  {
    id: "axis-pre", bank: "AXIS BANK", logo: axisLogo,
    title: "Axis Bank Special Festive Offer",
    headline: "Pre-approved Festive Limit",
    amount: "Up to ₹50,00,000",
    highlights: ["Zero documentation (salary a/c)", "Disbursed within 3 hours", "Dedicated Relationship Manager"],
    cta: "View Special Terms",
    tag: "SPECIAL FESTIVE OFFER", icon: Sparkles,
    accentColor: "#97144d",
    bgIcons: [TrendingUp, ShieldCheck],
    bannerImageUrl: axisBanner
  },
  {
    id: "hdfc-rate", bank: "HDFC BANK", logo: hdfcLogo,
    title: "HDFC Bank Special Festive Offer",
    headline: "HDFC Preferred Loan Offer Interest rates from",
    amount: "10.5% p.a.*",
    highlights: ["Flexible repayment options", "Paperless process", "Approval in 24 hours"],
    cta: "View Details",
    tag: "PREFERRED OFFER", icon: Percent,
    accentColor: "#004c8f",
    bgIcons: [Award, Building2],
    bannerImageUrl: hdfcBanner
  },
  {
    id: "idbi-personal", bank: "IDBI BANK", logo: idbiLogo,
    title: "IDBI Special Processing Fee Waiver",
    headline: "Zero Processing Fee on Personal Loans",
    amount: "Save up to ₹25,000",
    highlights: ["Quick digital sanction in 4 hours", "Foreclosure charges waived off", "No hidden charges"],
    cta: "View Details",
    tag: "ZERO FEE OFFER", icon: Zap,
    accentColor: "#0284c7",
    bgIcons: [ShieldCheck, Star],
    bannerImageUrl: idbiBanner
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FRAMER MOTION VARIANTS — 3D Perspective Staggered Springs (Techy & Minimal)
// ─────────────────────────────────────────────────────────────────────────────
const containerVariants: Variants = {
  enter: { 
    opacity: 0, 
    x: 45, 
    rotateY: 8,
    scale: 0.97,
  },
  center: { 
    opacity: 1, 
    x: 0, 
    rotateY: 0,
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 320,
      damping: 28,
      mass: 0.8,
      staggerChildren: 0.05,
      delayChildren: 0.06
    } 
  },
  exit: { 
    opacity: 0, 
    x: -45, 
    rotateY: -8,
    scale: 0.97,
    transition: { 
      duration: 0.28, 
      ease: [0.25, 1, 0.5, 1] 
    } 
  }
};

const childVariants: Variants = {
  enter: { opacity: 0, y: 8, scale: 0.98 },
  center: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 380,
      damping: 24
    } 
  },
  exit: { opacity: 0, y: -4, transition: { duration: 0.15 } }
};

// ─────────────────────────────────────────────────────────────────────────────
// TRUST BADGES — Left panel static content
// ─────────────────────────────────────────────────────────────────────────────
const trustBadges = [
  { icon: PhoneOff, label: "No Spam Calls" },
  { icon: ShieldCheck, label: "No Impact On\nCredit Score" },
  { icon: Eye, label: "Complete\nTransparency" },
  { icon: Award, label: "Higher\nApproval Chances" },
];

// ─────────────────────────────────────────────────────────────────────────────
// OFFER CARD COMPONENT — Single bank offer card
// ─────────────────────────────────────────────────────────────────────────────
const OfferCard = memo(({ offer, compact = false }: { offer: typeof initialOffers[0] & { bannerImageUrl?: string | null; heroImageUrl?: string | null; targetUrl?: string | null }; compact?: boolean }) => {
  const targetUrl = offer.targetUrl || "/apply";
  // 200-IQ FOMO badge based on offer details
  const fomoBadge = offer.id.includes("axis")
    ? { text: "Only 4 slots left", color: "bg-rose-500/10 text-rose-700 border-rose-500/20" }
    : offer.id.includes("hdfc")
    ? { text: "Closing in 2 hours", color: "bg-amber-500/10 text-amber-700 border-amber-500/20" }
    : { text: "Sanctioned in 4h", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" };

  // ─── IMAGE MODE: Full-bleed banner image (PaisaBazaar/BankBazaar style) ───
  if (offer.bannerImageUrl) {
    return (
      <div
        className="relative h-full rounded-3xl overflow-hidden group cursor-default transition-all duration-500 hover:shadow-[0_24px_60px_rgba(0,0,0,0.12)] hover:-translate-y-1"
        style={{
          boxShadow: `0 8px 32px 0 rgba(16,55,131,0.06), 0 20px 40px -10px ${offer.accentColor}15`
        }}
      >
        {/* Full-bleed image */}
        <img
          src={offer.bannerImageUrl}
          alt={`${offer.bank} — ${offer.title}`}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          loading="eager"
        />

        {/* Subtle gradient overlay at bottom for contrast */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none" />

        {/* Floating FOMO badge — top right */}
        <span className={`absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border backdrop-blur-md bg-white/70 shadow-lg ${fomoBadge.color}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
          {fomoBadge.text}
        </span>

        {/* Floating CTA button overlay — bottom right */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center">
          {targetUrl.startsWith("http://") || targetUrl.startsWith("https://") ? (
            <a 
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-[#103783] text-white px-4 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-lg hover:scale-[1.05] active:scale-[0.95] transition-all hover:bg-[#0c2a66]"
              style={{
                backgroundColor: offer.accentColor || "#103783",
                boxShadow: offer.accentColor ? `0 4px 12px ${offer.accentColor}40` : undefined
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {offer.cta || "View Details"}
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </a>
          ) : (
            <Link 
              to={targetUrl}
              className="inline-flex items-center gap-1 bg-[#103783] text-white px-4 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-lg hover:scale-[1.05] active:scale-[0.95] transition-all hover:bg-[#0c2a66]"
              style={{
                backgroundColor: offer.accentColor || "#103783",
                boxShadow: offer.accentColor ? `0 4px 12px ${offer.accentColor}40` : undefined
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {offer.cta || "View Details"}
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          )}
        </div>

        {/* Techy shimmer sweep */}
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-[1200ms] ease-out pointer-events-none" />
      </div>
    );
  }

  // ─── TEXT MODE: Glassmorphic card fallback (existing layout) ──────────────
  return (
    <div 
      className="relative h-full bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 overflow-hidden transition-all duration-500 hover:shadow-[0_24px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 flex flex-col justify-between p-5 sm:p-6 group"
      style={{
        boxShadow: `0 8px 32px 0 rgba(16,55,131,0.04), inset 0 1px 1px 0 rgba(255,255,255,0.8), 0 20px 40px -10px ${offer.accentColor}12`
      }}
    >
      {/* 200-IQ Techy Shimmer Reflection Sweep */}
      <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[1200ms] ease-out pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top Header Row with Bank Logo & FOMO Badge */}
        <motion.div 
          variants={childVariants}
          className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100/50 shrink-0"
        >
          {/* Enlarged Bank Logo (Responsive and Landscape-Friendly) */}
          <div className="h-8 w-24 bg-white/70 backdrop-blur-sm border border-white shadow-sm p-1 rounded-xl flex items-center justify-center overflow-hidden">
            {offer.logo ? (
              <img src={offer.logo} alt={offer.bank} className="h-full w-auto object-contain object-left max-w-[80px]" />
            ) : (
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-700 tracking-tight">{offer.bank}</span>
              </div>
            )}
          </div>

          {/* Pulse FOMO Tag */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${fomoBadge.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse shrink-0" />
            {fomoBadge.text}
          </span>
        </motion.div>

        {/* Middle Content Group (grows to fill available space) */}
        <div className="flex-1 flex flex-col justify-center my-auto py-2">
          {/* Headline + Amount */}
          <motion.div variants={childVariants} className="mb-3">
            <h3 className="text-sm font-bold text-[#0a1530]/80 leading-snug mb-1" style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif' }}>
              {offer.headline}
            </h3>
            <p className="text-xl font-extrabold tracking-tight" style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif', color: offer.accentColor }}>
              {offer.amount}
            </p>
          </motion.div>

          {/* Highlights */}
          {offer.highlights && offer.highlights.filter(Boolean).length > 0 && (
            <motion.div variants={childVariants} className="space-y-2">
              {offer.highlights.filter(Boolean).map((h, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-xs text-slate-600 font-semibold leading-tight">{h}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* CTA Button using brand-color overlay */}
        <motion.div variants={childVariants} className="mt-4 shrink-0">
          {targetUrl.startsWith("http://") || targetUrl.startsWith("https://") ? (
            <a 
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2.5 px-4 text-xs font-bold text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-center"
              style={{ 
                backgroundColor: offer.accentColor,
                boxShadow: `0 8px 16px -4px ${offer.accentColor}40`
              }}
            >
              {offer.cta}
            </a>
          ) : (
            <Link 
              to={targetUrl}
              className="block w-full py-2.5 px-4 text-xs font-bold text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-center"
              style={{ 
                backgroundColor: offer.accentColor,
                boxShadow: `0 8px 16px -4px ${offer.accentColor}40`
              }}
            >
              {offer.cta}
            </Link>
          )}
        </motion.div>
      </div>
    </div>
  );
});
OfferCard.displayName = "OfferCard";

// ═══════════════════════════════════════════════════════════════════════════════
// HERO SECTION — Split-Panel Layout
// Left: Static marketing text + CTAs
// Center: Bank building illustration
// Right: Rotating bank offer cards
// ═══════════════════════════════════════════════════════════════════════════════

const HeroSection = memo(() => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const isInView = useInView(heroRef, { once: false, margin: "0px 0px 200px 0px" });

  // ── Dynamic offers from API ────────────────────────────────────────────
  const { data: dynamicOffers = [] } = useQuery({
    queryKey: ["public_hero_offers"],
    queryFn: () => PrymeAPI.getHeroOffers().then(res => res.offers || res.data || res)
  });

  const activeOffers = dynamicOffers.length > 0 ? dynamicOffers.map((offer: { title?: string; lenderName?: string; tag?: string; desc?: string; logoType?: string; headline?: string; amount?: string; cta?: string; bannerImageUrl?: string; heroImageUrl?: string; targetUrl?: string }, i: number) => {
    const baseVisual = initialOffers[i % initialOffers.length];
    const mappedLogo = offer.logoType && LOGO_MAP[offer.logoType.toLowerCase()]
      ? LOGO_MAP[offer.logoType.toLowerCase()]
      : baseVisual.logo;
    return {
      ...baseVisual,
      title: offer.title || baseVisual.title,
      bank: offer.lenderName || baseVisual.bank,
      tag: offer.tag || baseVisual.tag || "HOT RATE",
      headline: offer.headline || baseVisual.headline,
      amount: offer.amount || baseVisual.amount,
      highlights: offer.desc ? offer.desc.split('|').map((s: string) => s.trim()) : baseVisual.highlights,
      cta: offer.cta || baseVisual.cta,
      logo: mappedLogo,
      bannerImageUrl: offer.bannerImageUrl || baseVisual.bannerImageUrl || null,
      heroImageUrl: offer.heroImageUrl || baseVisual.heroImageUrl || null,
      targetUrl: offer.targetUrl || "/apply",
    };
  }) : initialOffers.map(o => ({ ...o, bannerImageUrl: o.bannerImageUrl, heroImageUrl: null as string | null, targetUrl: "/apply" }));

  // ── Carousel logic (single card) ─────────────────────────────────
  const totalSlides = activeOffers.length;
  const activeIndex = Math.abs(page % totalSlides);
  const currentOffer = activeOffers[activeIndex];

  const paginate = useCallback((newDirection: number) => {
    setIsAutoPlaying(false);
    setPage([page + newDirection, newDirection]);
  }, [page]);

  // PERF: Pause autoplay when hero is scrolled off-screen
  useEffect(() => {
    if (!isAutoPlaying || !isInView) return;
    const interval = setInterval(() => {
      setPage((prevPage) => [prevPage[0] + 1, 1]);
    }, 7000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isInView]);

  return (
    <section
      ref={heroRef}
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#f0f4ff] via-white to-[#fafafa]"
      style={{ contain: 'layout style paint' }}
    >
      {/* ────────────── SUBTLE BACKGROUND DECORATION ────────────── */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#103783]/[0.03] rounded-full pointer-events-none" style={{ transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#103783]/[0.02] rounded-full pointer-events-none" style={{ transform: 'translate(-30%, 30%)' }} />

      {/* ────────────── TECH GRID PATTERN ────────────── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-80 z-0"
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
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.12] z-0" xmlns="http://www.w3.org/2000/svg">
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px] relative z-10">

        {/* ════════════════════════════════════════════════════════════
            MAIN HERO GRID — 3-Column Split Panel
            Left: Static text | Center: Illustration | Right: Offer cards
            ════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 lg:items-stretch items-center pt-8 md:pt-12 lg:pt-8 pb-6 lg:pb-8 min-h-[420px] lg:min-h-[480px]">

          {/* ─────── LEFT PANEL: Static Marketing Content ─────── */}
          <div className="lg:col-span-5 flex flex-col justify-center order-1 lg:order-1">

            {/* Eyebrow badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-wrap items-center gap-2 mb-3"
            >
              {["INSTANT ELIGIBILITY", "ZERO SPAM", "NO HIDDEN CHARGES"].map((badge, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#103783]">
                  {i === 0 && <Zap className="w-3 h-3 text-amber-500" />}
                  {badge}
                  {i < 2 && <span className="text-slate-300 ml-1">•</span>}
                </span>
              ))}
            </motion.div>

            {/* H1 Headline — Transducer font */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-[2rem] sm:text-[2.5rem] md:text-[2.75rem] lg:text-[2.5rem] xl:text-[3rem] font-extrabold text-[#0a1530] tracking-tight leading-[1.05] mb-3"
              style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif' }}
            >
              FIND THE<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#103783] to-[#1e56c7]">RIGHT BANK</span><br />
              BEFORE YOU APPLY.
            </motion.h1>

            {/* Subheadline — Gilroy body font */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-sm sm:text-[15px] text-slate-500 font-medium leading-relaxed mb-4 max-w-md"
            >
              Get matched with the best loan offers from 15+ banks
              based on your real eligibility — without harming your credit score.
            </motion.p>

            {/* Trust Badges Row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap items-start gap-3 sm:gap-4 mb-4"
            >
              {trustBadges.map((badge, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 text-center min-w-[60px]">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <badge.icon className="w-4 h-4 text-[#103783]" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide leading-tight whitespace-pre-line">
                    {badge.label}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* CTA Button Row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-wrap items-center gap-x-4 gap-y-2"
            >
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 bg-[#103783] text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-[#103783]/20 hover:shadow-[#103783]/30 hover:bg-[#0c2a66] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                See My Loan Options
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* FOMO Animated Shiny Text */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-extrabold tracking-wide uppercase shrink-0">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-600"></span>
                </span>
                <span className="shiny-text-fomo">
                  Only 3 pre-approved slots remaining today
                </span>
              </div>
            </motion.div>

            {/* Trust Metrics Row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap items-center justify-start gap-x-6 gap-y-4 mt-5 pt-4 border-t border-slate-100/80"
            >
              {/* Metric 1: Customers */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 text-[#103783]" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-[#0a1530] leading-none tracking-tight" style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif' }}>
                    <MiniCountUp to={10000} suffix="+" formatComma={true} />
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Customers Trusted</p>
                </div>
              </div>

              {/* Metric 2: Loans */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-[#103783]" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-[#0a1530] leading-none tracking-tight" style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif' }}>
                    <MiniCountUp to={500} prefix="₹" suffix="+ Cr" />
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Loans Facilitated</p>
                </div>
              </div>

              {/* Metric 3: Rating */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-extrabold text-[#0a1530] leading-none tracking-tight" style={{ fontFamily: '"Transducer", "Space Grotesk", system-ui, sans-serif' }}>
                    4.8/5
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Customer Rating</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ─────── CENTER: Bank Building Illustration ─────── */}
          <div className="hidden lg:flex lg:col-span-3 lg:items-center justify-center lg:order-2 relative">
            {/* Barely-visible ambient light — adds depth without being "decorative" */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 60% 50% at 50% 55%, rgba(16,55,131,0.04) 0%, transparent 100%)',
              }}
            />
            {/* Concentric decorative tech circles behind the building to frame it */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="absolute w-[220px] h-[220px] rounded-full border border-[#103783]/[0.02]" />
              <div className="absolute w-[330px] h-[330px] rounded-full border border-[#103783]/[0.015]" />
              <div className="absolute w-[440px] h-[440px] rounded-full border border-[#103783]/[0.008]" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-[340px] xl:max-w-[380px]"
            >
              <img
                src={currentOffer.heroImageUrl || heroBankImg}
                alt={currentOffer.heroImageUrl ? `${currentOffer.bank} hero illustration` : "Professional walking toward a bank building"}
                className="w-full h-auto object-contain"
                loading="eager"
                fetchPriority="high"
                style={{
                  WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 98%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                  maskImage: 'linear-gradient(to bottom, black 70%, transparent 98%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                  WebkitMaskComposite: 'destination-in',
                  maskComposite: 'intersect',
                  filter: 'drop-shadow(0 4px 20px rgba(16,55,131,0.08))',
                }}
              />
            </motion.div>
          </div>

          {/* ─────── RIGHT PANEL: Rotating Offer Cards ─────── */}
          <div className="lg:col-span-4 flex flex-col gap-3 order-2 lg:order-3 relative mt-8 lg:mt-0 lg:h-full justify-between">

            {/* Ambient brand glow behind the card */}
            {currentOffer && (
              <div 
                className="absolute -inset-6 rounded-[40px] blur-3xl opacity-20 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  background: `radial-gradient(circle at center, ${currentOffer.accentColor} 0%, transparent 65%)`,
                }}
              />
            )}

            {/* Pagination dots */}
            <div className="flex items-center justify-end gap-1.5 mb-1 z-10 shrink-0">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setPage([i, i > activeIndex ? 1 : -1]);
                  }}
                  className={`rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    i === activeIndex
                      ? "bg-[#103783] w-5 h-1.5"
                      : "bg-slate-300 w-1.5 h-1.5 hover:bg-slate-400"
                  }`}
                  aria-label={`Show offer ${i + 1}`}
                />
              ))}
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => paginate(-1)}
                  className="w-6 h-6 rounded-full flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-[#103783] transition-colors shadow-sm"
                  aria-label="Previous offers"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => paginate(1)}
                  className="w-6 h-6 rounded-full flex items-center justify-center bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-[#103783] transition-colors shadow-sm"
                  aria-label="Next offers"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Animated single card */}
            <div className="relative flex-1 min-h-[290px] lg:min-h-0 lg:h-full z-10">
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={activeIndex}
                  variants={containerVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex flex-col transform-gpu"
                  style={{ willChange: 'transform, opacity' }}
                >
                  {currentOffer && (
                    <OfferCard offer={currentOffer} compact={false} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;
