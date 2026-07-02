import { Sparkles, Percent, Zap, TrendingUp, ShieldCheck, Award, Building2, Star } from "lucide-react";

import idbiLogo from "@/assets/idbi-bank-logo-1.svg";
import axisLogo from "@/assets/axis-bank-logo-1.svg";
import unionLogo from "@/assets/union-bank-of-india.svg";
import kotakLogo from "@/assets/kotak-mahindra-bank-logo-vector_logoshape.com.svg";
import pnbLogo from "@/assets/punjab-national-bank-vector-logo_logoshape.com.svg";
import yesLogo from "@/assets/yes-bank-new-logo-download_logoshape.com.svg";
import tataLogo from "@/assets/tata-capital-logo-svg_logoshape.com.svg";
import hdfcLogo from "@/assets/hdfc.svg";
import idfcLogo from "@/assets/idfc.svg";
import jioLogo from "@/assets/jio.svg";

import axisBanner from "@/assets/axis_festive_banner.png";
import hdfcBanner from "@/assets/hdfc_preferred_banner.png";
import idbiBanner from "@/assets/idbi_personal_banner.png";

export const LOGO_MAP: Record<string, string> = {
  idbi: idbiLogo,
  axis: axisLogo,
  union: unionLogo,
  kotak: kotakLogo,
  pnb: pnbLogo,
  yes: yesLogo,
  tata: tataLogo,
  hdfc: hdfcLogo,
  idfc: idfcLogo,
  jio: jioLogo,
};

export const initialOffers = [
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
