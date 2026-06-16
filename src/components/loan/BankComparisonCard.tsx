import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, TrendingUp, ArrowRight, Loader2, Calculator, FileText, CheckCircle2, ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BankOfferDTO {
  id: string;
  bankName: string;
  logoColor: string;
  logoUrl?: string;
  brandHex: string; // e.g. "#004c8f" — the bank's primary brand colour
  interestRate: number;
  processingFee: number;
  maxTenure: number;
  maxLoanAmount: number;
  approvalOdds: number;
  processingTime: string;
  requiredDocs: string[];
}

interface BankComparisonCardProps {
  offer: BankOfferDTO;
  emi: number;
  totalRepayment: number;
  emiDiffFromHero: number;
  totalDiffFromHero: number;
  heroBankName: string;
  principalAmount: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onApply: (providerId: string) => Promise<void>;
  isGlobalLocking: boolean;
}

export function BankComparisonCard({
  offer,
  emi,
  totalRepayment,
  emiDiffFromHero,
  totalDiffFromHero,
  heroBankName,
  principalAmount,
  isExpanded,
  onToggleExpand,
  onApply,
  isGlobalLocking,
}: BankComparisonCardProps) {
  const [localStatus, setLocalStatus] = useState<"idle" | "processing" | "resolved">("idle");
  const [logoError, setLogoError] = useState(false);

  const handleApplyClick = async () => {
    setLocalStatus("processing");
    try {
      await onApply(offer.id);
      setLocalStatus("resolved");
    } catch {
      setLocalStatus("idle");
    }
  };

  const isLocking = localStatus === "processing";
  const brand = offer.brandHex;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.3, ease: "easeOut" } }}
      className="group relative antialiased z-10 hover:z-20"
    >
      {/* ── Glassmorphic Card Shell ──────────────────────────── */}
      <div
        className={`
          relative rounded-[2rem] overflow-hidden
          bg-white/90 dark:bg-zinc-900/60 backdrop-blur-2xl
          border transition-all duration-500 will-change-transform
          ${isExpanded
            ? 'border-white/60 dark:border-white/[0.15] shadow-[0_16px_48px_rgba(0,0,0,0.1)]'
            : 'border-white/40 dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.06)] group-hover:shadow-[0_24px_64px_rgba(0,0,0,0.12)] group-hover:border-white/80 dark:group-hover:border-white/[0.22]'
          }
        `}
      >
        {/* ── Left Brand Accent — Dynamic bank color bar ─────── */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-[2rem] transition-transform duration-500 origin-left group-hover:scale-x-150"
          style={{ background: `linear-gradient(to bottom, ${brand}, ${brand}99)` }}
        />

        {/* ── Subtle Brand Glow on Hover ────────────────────── */}
        <div
          className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(120% 100% at 0% 50%, ${brand}0A 0%, transparent 60%)`,
          }}
        />

        <div className="pl-6 pr-5 py-6 md:pl-8 md:pr-6 md:py-6">
          {/* ── Main Desktop Grid ───────────────────────────── */}
          <div className="grid grid-cols-[1fr] xl:grid-cols-[230px_120px_170px_1fr_auto] items-center gap-4 xl:gap-6">

            {/* ── Bank Identity ────────────────────────────── */}
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl"
                style={{
                  background: offer.logoUrl && !logoError
                    ? 'white'
                    : brand,
                  border: `2px solid ${brand}33`,
                  boxShadow: `0 8px 24px ${brand}25`,
                  padding: offer.logoUrl && !logoError ? '8px' : '0',
                }}
              >
                {offer.logoUrl && !logoError ? (
                  <img
                    src={offer.logoUrl}
                    alt={offer.bankName}
                    className="w-full h-full object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <h3 className="text-base sm:text-lg font-extrabold text-foreground truncate tracking-tight">{offer.bankName}</h3>
                <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 stroke-[2.5]" /> {offer.approvalOdds}% approval
                </span>
              </div>
            </div>

            {/* ── EMI ──────────────────────────────────────── */}
            <div className="hidden xl:block">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">EMI</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums leading-none tracking-tight">
                <span className="text-base sm:text-lg text-muted-foreground/50 mr-0.5">₹</span>{emi.toLocaleString("en-IN")}
              </p>
            </div>

            {/* ── Comparison Diff ──────────────────────────── */}
            <div className="hidden xl:flex flex-col justify-center min-h-[44px]">
              {emiDiffFromHero !== 0 ? (
                <>
                  <p
                    className="text-xs sm:text-sm font-extrabold tabular-nums whitespace-nowrap tracking-tight"
                    style={{ color: emiDiffFromHero > 0 ? '#ea580c' : '#10b981' }}
                  >
                    {emiDiffFromHero > 0
                      ? `+₹${emiDiffFromHero.toLocaleString("en-IN")}/mo more`
                      : `-₹${Math.abs(emiDiffFromHero).toLocaleString("en-IN")}/mo less`}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground/60 font-semibold tabular-nums whitespace-nowrap mt-0.5">
                    {totalDiffFromHero > 0
                      ? `₹${totalDiffFromHero.toLocaleString("en-IN")} extra total`
                      : totalDiffFromHero < 0
                        ? `₹${Math.abs(totalDiffFromHero).toLocaleString("en-IN")} less total`
                        : "Same total"}
                  </p>
                </>
              ) : (
                <div className="flex items-center">
                  <span className="text-xs font-bold text-muted-foreground/60 bg-slate-100/80 dark:bg-white/[0.06] px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-white/[0.05]">
                    Best Match
                  </span>
                </div>
              )}
            </div>

            {/* ── Metrics Chips ────────────────────────────── */}
            <div className="hidden xl:flex items-center gap-3">
              {[
                { label: "APR", value: `${offer.interestRate}%` },
                { label: "Tenure", value: `${offer.maxTenure} yrs` },
                { label: "Fee", value: offer.processingFee >= 100 ? `₹${Math.round(offer.processingFee).toLocaleString("en-IN")}` : `${offer.processingFee}%` },
              ].map((m, i) => (
                <div
                  key={i}
                  className="px-3.5 py-2.5 rounded-[1rem] bg-slate-50/80 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.08] backdrop-blur-md shadow-sm transition-all duration-300 group-hover:bg-white dark:group-hover:bg-white/[0.08] group-hover:shadow-md group-hover:border-slate-300 dark:group-hover:border-white/[0.15]"
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none mb-1.5">{m.label}</p>
                  <p className="text-sm sm:text-base font-extrabold text-foreground tabular-nums leading-none tracking-tight">{m.value}</p>
                </div>
              ))}
            </div>

            {/* ── CTA ──────────────────────────────────────── */}
            <div className="flex items-center gap-3 justify-end w-full xl:w-auto mt-5 xl:mt-0 xl:col-start-5">
              <div className="flex flex-row xl:flex-col items-stretch gap-2.5 flex-1 xl:flex-initial w-full xl:w-[160px]">
                <Button
                  onClick={handleApplyClick}
                  disabled={isGlobalLocking && !isLocking}
                  className="rounded-xl h-11 xl:h-11 px-3 sm:px-5 text-xs sm:text-sm font-extrabold transition-all duration-300 flex-1 xl:flex-none border-0 shadow-lg hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] group/btn relative overflow-hidden"
                  style={{
                    background: localStatus === "resolved"
                      ? '#10b981'
                      : brand,
                    color: 'white',
                  }}
                >
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  {localStatus === "resolved" ? (
                    <span className="relative z-10 flex items-center justify-center">Applied <CheckCircle2 className="w-4 h-4 ml-1.5" /></span>
                  ) : isLocking ? (
                    <Loader2 className="relative z-10 w-4 h-4 animate-spin hidden xl:block mx-auto" />
                  ) : (
                    <span className="relative z-10 flex items-center justify-center w-full">
                      Apply with Pryme 
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover/btn:translate-x-1" />
                    </span>
                  )}
                </Button>
                <button
                  className="rounded-xl h-11 xl:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-bold transition-all border backdrop-blur-md bg-white/60 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.1] text-muted-foreground hover:bg-slate-50 dark:hover:bg-white/[0.08] hover:text-foreground hover:border-slate-300 dark:hover:border-white/[0.2] flex items-center justify-center gap-1.5 flex-1 xl:flex-none shadow-sm"
                  title={`Apply directly on ${offer.bankName} website`}
                >
                  Apply Directly <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={onToggleExpand}
                className={`
                  p-3 xl:p-2.5 rounded-xl transition-all duration-300 border backdrop-blur-md shrink-0 shadow-sm
                  ${isExpanded
                    ? 'bg-slate-100 dark:bg-white/10 border-slate-300 dark:border-white/20'
                    : 'bg-slate-50 dark:bg-transparent border-slate-200 dark:border-transparent hover:bg-white dark:hover:bg-white/[0.06] hover:border-slate-300 dark:hover:border-white/40'
                  }
                `}
                style={isExpanded ? { color: brand } : { color: 'var(--muted-foreground)' }}
                title="View requirements"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* ── Mobile Stats Row ────────────────────────────── */}
          <div className="xl:hidden mt-5 grid grid-cols-4 gap-3">
            {[
              { label: "EMI", value: `₹${emi.toLocaleString("en-IN")}`, bold: true },
              { label: "APR", value: `${offer.interestRate}%` },
              { label: "Tenure", value: `${offer.maxTenure} yrs` },
              { label: "Fee", value: offer.processingFee >= 100 ? `₹${Math.round(offer.processingFee).toLocaleString("en-IN")}` : `${offer.processingFee}%` },
            ].map((m, i) => (
              <div
                key={i}
                className="px-3 py-3 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] backdrop-blur-md shadow-sm transition-colors group-hover:bg-white dark:group-hover:bg-white/[0.08]"
              >
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">{m.label}</p>
                <p className={`${m.bold ? 'text-lg font-extrabold' : 'text-sm font-bold'} text-foreground tabular-nums tracking-tight`}>{m.value}</p>
              </div>
            ))}
            {emiDiffFromHero !== 0 && (
              <div className="col-span-4 mt-1.5 flex flex-col gap-0.5">
                 <p className="text-xs sm:text-sm font-extrabold tabular-nums tracking-tight" style={{ color: emiDiffFromHero > 0 ? '#ea580c' : '#10b981' }}>
                    {emiDiffFromHero > 0
                      ? `+₹${emiDiffFromHero.toLocaleString("en-IN")}/mo more`
                      : `-₹${Math.abs(emiDiffFromHero).toLocaleString("en-IN")}/mo less`} than {heroBankName}
                  </p>
                  <p className="text-[11px] text-muted-foreground/60 font-semibold tabular-nums">
                    {totalDiffFromHero > 0
                      ? `₹${totalDiffFromHero.toLocaleString("en-IN")} extra total`
                      : totalDiffFromHero < 0
                        ? `₹${Math.abs(totalDiffFromHero).toLocaleString("en-IN")} less total`
                        : "Same total"}
                  </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Expandable Details Panel ──────────────────────── */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div
                className="border-t mx-5 md:mx-7"
                style={{ borderColor: `${brand}15` }}
              />
              <div className="p-5 md:px-7 md:py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cost breakdown */}
                <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md rounded-2xl p-4 border border-white/30 dark:border-white/[0.05]">
                  <h4 className="text-xs font-bold text-foreground mb-3.5 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5" style={{ color: brand }} /> Cost Breakdown
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      { l: "Principal", v: principalAmount },
                      { l: "Total Interest", v: totalRepayment - principalAmount },
                      ...(offer.processingFee >= 100
                        ? [
                            { l: "Processing Fee (Base)", v: Math.round(offer.processingFee / 1.18) },
                            { l: "GST on PF (18%)", v: offer.processingFee - Math.round(offer.processingFee / 1.18) }
                          ]
                        : [
                            { l: `Processing (${offer.processingFee}%)`, v: Math.round(principalAmount * offer.processingFee / 100) },
                            { l: "GST on PF", v: Math.round(principalAmount * offer.processingFee / 100 * 0.18) }
                          ]
                      )
                    ].map((r, i) => (
                      <div key={i} className="flex justify-between text-[11px] py-1.5 border-b border-dashed border-slate-100/60 dark:border-white/[0.04] last:border-b-0">
                        <span className="text-muted-foreground font-medium">{r.l}</span>
                        <span className="font-bold text-foreground tabular-nums">₹{r.v.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Required docs */}
                <div className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md rounded-2xl p-4 border border-white/30 dark:border-white/[0.05]">
                  <h4 className="text-xs font-bold text-foreground mb-3.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" style={{ color: brand }} /> Documents Required
                  </h4>
                  <div className="space-y-2">
                    {offer.requiredDocs.map((doc, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="text-foreground/80 font-medium">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
