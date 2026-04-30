import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Sparkles, AlertTriangle, Copy, Check } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 PRICING MATRIX BUILDER — "Dummy-Proof" SpEL Compiler
// ═══════════════════════════════════════════════════════════════════════════════
//
// This component gives non-tech admins a visual table UI to define multi-
// dimensional pricing rules. Under the hood, it compiles the UI state into
// a valid SpEL expression string that EXACTLY matches the variables injected
// by FinancialComputationEngine.resolveInterestRate():
//
//   #cibil      — Integer (CIBIL score)
//   #loanAmount — Double  (requested amount)
//   #empType    — String  ('SALARIED', 'SEP', 'ANY')
//
// The compiled string is passed to the parent via onChange() for persistence.
// ═══════════════════════════════════════════════════════════════════════════════

// ── TYPES ────────────────────────────────────────────────────────────────────

export interface PricingRule {
  id: string;
  empType: "ANY" | "SALARIED" | "SEP";
  minCibil: number | null;
  maxAmount: number | null;
  roi: number;
}

interface PricingMatrixBuilderProps {
  value: string;          // Current SpEL string from DB (may be empty/null)
  onChange: (spel: string) => void;  // Callback to propagate compiled SpEL
  baseRate?: number;      // Product's static ROI for reference display
}

// ── EMPLOYMENT TYPE OPTIONS ──────────────────────────────────────────────────

const EMP_TYPES = [
  { value: "ANY", label: "Any Employment" },
  { value: "SALARIED", label: "Salaried" },
  { value: "SEP", label: "Self-Employed (SEP)" },
] as const;

// ── PURE COMPILER FUNCTION ──────────────────────────────────────────────────
// This is the critical pure function. It takes the UI rules array and the
// fallback rate and generates valid SpEL. Zero side effects, unit-testable.

export function compileRulesToSpel(rules: PricingRule[], fallbackRoi: number): string {
  const validRules = rules.filter(r => r.roi > 0);

  if (validRules.length === 0) {
    return String(fallbackRoi);
  }

  // Build ternary chain from LAST rule backwards (innermost → outermost)
  // Result: (cond1) ? roi1 : ((cond2) ? roi2 : fallback)
  let expression = String(fallbackRoi);

  // Iterate in reverse so the first rule in the UI has highest priority
  for (let i = validRules.length - 1; i >= 0; i--) {
    const rule = validRules[i];
    const conditions: string[] = [];

    // Employment type filter (skip if ANY — it matches everyone)
    if (rule.empType !== "ANY") {
      conditions.push(`#empType == '${rule.empType}'`);
    }

    // CIBIL minimum threshold
    if (rule.minCibil !== null && rule.minCibil > 0) {
      conditions.push(`#cibil >= ${rule.minCibil}`);
    }

    // Loan amount ceiling
    if (rule.maxAmount !== null && rule.maxAmount > 0) {
      conditions.push(`#loanAmount <= ${rule.maxAmount}`);
    }

    // If no conditions were added, this rule is unconditional — just use its ROI
    if (conditions.length === 0) {
      expression = String(rule.roi);
      continue;
    }

    const conditionStr = conditions.join(" && ");
    expression = `(${conditionStr}) ? ${rule.roi} : (${expression})`;
  }

  return expression;
}

// ── GENERATE UNIQUE ID ───────────────────────────────────────────────────────

function genId(): string {
  return typeof crypto !== "undefined"
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 11);
}

// ── COMPONENT ───────────────────────────────────────────────────────────────

export const PricingMatrixBuilder: React.FC<PricingMatrixBuilderProps> = ({
  value,
  onChange,
  baseRate,
}) => {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [fallbackRoi, setFallbackRoi] = useState<number>(baseRate ?? 8.5);
  const [copied, setCopied] = useState(false);

  // ── Recompile on any state change ────────────────────────────────────────
  const recompile = useCallback(
    (newRules: PricingRule[], newFallback: number) => {
      const spel = compileRulesToSpel(newRules, newFallback);
      onChange(spel);
    },
    [onChange]
  );

  // ── Seed fallback from baseRate prop ─────────────────────────────────────
  useEffect(() => {
    if (baseRate && baseRate > 0) {
      setFallbackRoi(baseRate);
    }
  }, [baseRate]);

  // ── CRUD Operations ──────────────────────────────────────────────────────

  const addRule = () => {
    const newRule: PricingRule = {
      id: genId(),
      empType: "ANY",
      minCibil: 750,
      maxAmount: null,
      roi: fallbackRoi > 0 ? fallbackRoi - 0.5 : 8.0,
    };
    const updated = [...rules, newRule];
    setRules(updated);
    recompile(updated, fallbackRoi);
  };

  const updateRule = (id: string, patch: Partial<PricingRule>) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, ...patch } : r));
    setRules(updated);
    recompile(updated, fallbackRoi);
  };

  const removeRule = (id: string) => {
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    recompile(updated, fallbackRoi);
  };

  const updateFallback = (val: number) => {
    setFallbackRoi(val);
    recompile(rules, val);
  };

  // ── Computed SpEL preview ────────────────────────────────────────────────
  const compiledSpel = compileRulesToSpel(rules, fallbackRoi);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(compiledSpel);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Dynamic ROI Pricing Matrix
          </label>
        </div>
        <button
          type="button"
          onClick={addRule}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-medium transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Pricing Tier
        </button>
      </div>

      {/* Fallback Rate Input */}
      <div className="flex items-center gap-4 p-3 bg-slate-900/40 rounded-xl border border-[#103783]/20">
        <div className="flex-1">
          <label className="text-[11px] font-semibold text-slate-500 block mb-1">
            Default / Fallback ROI (%)
          </label>
          <p className="text-[10px] text-slate-600">
            Applied when no tier matches the applicant's profile.
          </p>
        </div>
        <input
          type="number"
          step="0.01"
          min="0"
          max="50"
          value={fallbackRoi}
          onChange={(e) => updateFallback(parseFloat(e.target.value) || 0)}
          className="w-24 bg-[#0d0d14] border border-[#103783]/30 rounded-lg px-3 py-2 text-sm font-mono text-amber-400 outline-none focus:border-blue-500 text-center"
        />
      </div>

      {/* Rules Table */}
      {rules.length > 0 && (
        <div className="bg-[#0d0d14] border border-[#103783]/20 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr_100px_48px] gap-2 px-4 py-2.5 bg-slate-900/50 border-b border-[#103783]/20 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            <span>Employment</span>
            <span>Min CIBIL</span>
            <span>Max Loan Amount</span>
            <span className="text-center">ROI %</span>
            <span></span>
          </div>

          {/* Rule Rows */}
          {rules.map((rule, idx) => (
            <div
              key={rule.id}
              className="grid grid-cols-[1fr_1fr_1fr_100px_48px] gap-2 px-4 py-3 border-b border-[#103783]/10 hover:bg-white/[0.02] transition-colors items-center group"
            >
              {/* Employment Type */}
              <select
                value={rule.empType}
                onChange={(e) =>
                  updateRule(rule.id, { empType: e.target.value as PricingRule["empType"] })
                }
                className="bg-slate-900 border border-[#103783]/30 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
              >
                {EMP_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              {/* Min CIBIL */}
              <input
                type="number"
                min={300}
                max={900}
                placeholder="e.g. 750"
                value={rule.minCibil ?? ""}
                onChange={(e) =>
                  updateRule(rule.id, {
                    minCibil: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                className="bg-slate-900 border border-[#103783]/30 rounded-lg px-2 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-blue-500"
              />

              {/* Max Loan Amount */}
              <input
                type="number"
                min={0}
                placeholder="e.g. 5000000"
                value={rule.maxAmount ?? ""}
                onChange={(e) =>
                  updateRule(rule.id, {
                    maxAmount: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                className="bg-slate-900 border border-[#103783]/30 rounded-lg px-2 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-blue-500"
              />

              {/* ROI */}
              <input
                type="number"
                step="0.01"
                min="0"
                max="50"
                value={rule.roi}
                onChange={(e) =>
                  updateRule(rule.id, { roi: parseFloat(e.target.value) || 0 })
                }
                className="bg-slate-900 border border-[#103783]/30 rounded-lg px-2 py-1.5 text-xs font-mono text-green-400 outline-none focus:border-blue-500 text-center"
              />

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeRule(rule.id)}
                className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {rules.length === 0 && (
        <div className="text-center py-8 border border-dashed border-[#103783]/30 rounded-xl bg-slate-900/20">
          <AlertTriangle className="w-5 h-5 text-amber-500/60 mx-auto mb-2" />
          <p className="text-xs text-slate-500 mb-1">
            No pricing tiers configured.
          </p>
          <p className="text-[10px] text-slate-600">
            All applicants will receive the fallback rate of{" "}
            <strong className="text-amber-400">{fallbackRoi}%</strong>.
          </p>
        </div>
      )}

      {/* Live SpEL Preview */}
      <div className="bg-[#0a0a12] border border-[#103783]/20 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-[#103783]/20">
          <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live SpEL Output
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-[10px] text-slate-500 hover:text-white transition-colors rounded"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="px-4 py-3 text-xs font-mono text-emerald-400/90 whitespace-pre-wrap break-all leading-relaxed overflow-x-auto max-h-32 custom-scrollbar">
          {compiledSpel}
        </pre>
      </div>

      {/* Contract Hint */}
      <div className="flex items-start gap-2 text-[10px] text-slate-600 px-1">
        <AlertTriangle className="w-3 h-3 text-amber-500/50 mt-0.5 shrink-0" />
        <span>
          Variables: <code className="text-amber-400/70">#cibil</code> (int),{" "}
          <code className="text-amber-400/70">#loanAmount</code> (double),{" "}
          <code className="text-amber-400/70">#empType</code> (string). This
          expression is evaluated server-side by the SpEL engine.
        </span>
      </div>
    </div>
  );
};

export default PricingMatrixBuilder;
