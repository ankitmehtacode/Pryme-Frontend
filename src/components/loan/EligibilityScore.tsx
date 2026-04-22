import { useState, useEffect } from "react";
import { TrendingUp, AlertCircle, CheckCircle, Activity, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

interface EligibilityScoreProps {
  score: number;
  cibilScore: number;
  monthlyIncome: number;
  loanAmount: number;
}

const EligibilityScore = ({ score: initialScore, cibilScore, monthlyIncome, loanAmount }: EligibilityScoreProps) => {
  const [localCibil, setLocalCibil] = useState(cibilScore);
  const [localIncome, setLocalIncome] = useState(monthlyIncome);
  const [editingIncome, setEditingIncome] = useState(false);
  const [incomeInputValue, setIncomeInputValue] = useState(monthlyIncome.toString());

  useEffect(() => {
    setLocalCibil(cibilScore);
  }, [cibilScore]);

  useEffect(() => {
    setLocalIncome(monthlyIncome);
    setIncomeInputValue(monthlyIncome.toString());
  }, [monthlyIncome]);

  // Dynamically recalculate the score if the user plays with the CIBIL slider or Income
  const displayScore = (() => {
    let base = ((localCibil - 300) / 600) * 40;
    const effectiveIncome = Math.max(localIncome, 1);
    const ratio = loanAmount / (effectiveIncome * 12);
    base += Math.max(0, (1 - ratio / 10) * 40);
    base += 20;
    return Math.min(100, Math.round(base));
  })();

  const getScoreDetails = (s: number) => {
    if (s >= 80) {
      return {
        label: "Excellent",
        color: "text-[#103783]",
        bgColor: "bg-[#103783]",
        stroke: "stroke-[#103783]",
        shadow: "drop-shadow-[0_0_12px_rgba(124,58,237,0.4)]",
        description: "You have a high chance of approval.",
        icon: CheckCircle,
      };
    } else if (s >= 60) {
      return {
        label: "Good",
        color: "text-indigo-500",
        bgColor: "bg-indigo-500",
        stroke: "stroke-indigo-500",
        shadow: "drop-shadow-[0_0_12px_rgba(99,102,241,0.4)]",
        description: "Your profile looks promising.",
        icon: TrendingUp,
      };
    } else if (s >= 40) {
      return {
        label: "Fair",
        color: "text-amber-500",
        bgColor: "bg-amber-500",
        stroke: "stroke-amber-500",
        shadow: "drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]",
        description: "Consider improving your CIBIL.",
        icon: AlertCircle,
      };
    }
    return {
      label: "Needs Work",
      color: "text-rose-500",
      bgColor: "bg-rose-500",
      stroke: "stroke-rose-500",
      shadow: "drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]",
      description: "Focus on improving credit score.",
      icon: AlertCircle,
    };
  };

  const details = getScoreDetails(displayScore);
  const IconComponent = details.icon;

  // Calculate arc for circular progress
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const progressArc = (displayScore / 100) * circumference;

  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)} L`;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleIncomeSubmit = () => {
    const val = parseInt(incomeInputValue.replace(/\D/g, ''), 10);
    if (!isNaN(val) && val > 0) {
      setLocalIncome(val);
      setIncomeInputValue(val.toString());
    } else {
      setIncomeInputValue(localIncome.toString());
    }
    setEditingIncome(false);
  };

  const effectiveIncome = Math.max(localIncome, 1);
  const factors = [
    { id: "cibil", label: "CIBIL Score", value: localCibil.toString(), status: localCibil >= 750 ? "good" : localCibil >= 650 ? "fair" : "poor" },
    { id: "income", label: "Income", value: formatCurrency(localIncome), status: "good", isEditable: true },
    { id: "ratio", label: "Loan/Income Ratio", value: `${((loanAmount / (effectiveIncome * 12)) * 100).toFixed(1)}%`, status: loanAmount <= effectiveIncome * 36 ? "good" : "fair" },
  ];

  return (
    <div className="bg-card text-card-foreground border border-border dark:bg-[#080d1e] dark:border-white/10 rounded-[2rem] p-5 md:p-6 lg:p-7 shadow-xl dark:shadow-2xl relative overflow-hidden h-full flex flex-col transition-all dark:hover:border-[#103783]/30">
      
      {/* Ambient Glow */}
      <div className={`absolute top-[-5%] right-[-5%] w-32 h-32 transform-gpu rounded-full pointer-events-none ${details.bgColor.replace('bg-', 'bg-')}/15`} />

      <div className="flex items-center gap-3.5 mb-6 relative z-10 shrink-0">
        <div className="w-11 h-11 rounded-xl bg-secondary dark:bg-[#0d1829] border border-border dark:border-white/5 flex items-center justify-center shadow-sm shrink-0">
          <Activity className="w-5 h-5 text-primary dark:text-[#103783]" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-xl md:text-2xl tracking-tight leading-none mb-1">Eligibility Score</h3>
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">Predictive AI Analysis</p>
        </div>
      </div>

      {/* Circular Progress (Condensed) */}
      <div className="flex flex-col items-center justify-center mb-6 relative z-10 shrink-0">
        <div className="relative w-32 h-32 md:w-36 md:h-36 drop-shadow-md dark:drop-shadow-xl mb-4">
          <svg className={`w-full h-full -rotate-90 dark:${details.shadow}`} viewBox="0 0 130 130">
            {/* Background circle */}
            <circle
              cx="65" cy="65" r={radius} fill="none" className="stroke-slate-200 dark:stroke-[#222]" strokeWidth="10"
            />
            {/* Progress circle */}
            <circle
              cx="65" cy="65" r={radius} fill="none"
              className={cn("transition-all duration-1000 ease-out", details.stroke)}
              strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - progressArc}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
            <span className={cn("text-3xl font-bold tracking-tight leading-none", details.color)}>{displayScore}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1.5">out of 100</span>
          </div>
        </div>

        {/* Score Label Inline */}
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-border dark:border-white/5 shadow-sm",
          details.bgColor.replace('bg-', 'bg-') + "/10",
          details.color
        )}>
          <IconComponent className="w-3.5 h-3.5" />
          {details.label}
        </div>
      </div>

      {/* Interactive CIBIL Simulator (Condensed) */}
      <div className="mb-6 bg-secondary/20 dark:bg-[#0d1829] p-4 md:px-5 rounded-2xl border border-border dark:border-white/5 relative z-10 shadow-sm transition-all hover:border-[#103783]/30 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Simulate CIBIL</span>
          <span className={cn("text-base font-bold bg-background dark:bg-[#080d1e] px-3.5 py-1.5 rounded-lg border border-border dark:border-white/5 shadow-sm leading-none", localCibil >= 750 ? "text-[#103783]" : localCibil >= 650 ? "text-amber-500" : "text-rose-500")}>
            {localCibil}
          </span>
        </div>
        <Slider value={[localCibil]} onValueChange={(v) => setLocalCibil(v[0])} min={300} max={900} step={5} className="cursor-pointer py-1" />
        <div className="flex justify-between mt-3">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">300</span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">900</span>
        </div>
      </div>

      {/* Factors Breakdown */}
      <div className="space-y-2.5 pt-5 border-t border-border dark:border-white/10 mt-auto relative z-10 flex-1 flex flex-col justify-end">
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-1">
          Contributing Factors
        </p>
        {factors.map((factor) => (
          <div key={factor.id} className="flex items-center justify-between p-3 bg-secondary/30 dark:bg-[#0d1829] rounded-xl border border-border dark:border-white/5 shadow-sm">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{factor.label}</span>
            <div className="flex items-center gap-2.5">
              
              {factor.id === "income" ? (
                editingIncome ? (
                  <div className="flex items-center">
                    <span className="text-xs md:text-sm font-bold text-foreground mr-1">₹</span>
                    <input
                      autoFocus
                      type="text"
                      className="w-20 bg-transparent text-right text-xs md:text-sm font-bold text-foreground outline-none border-b-2 border-primary/50 focus:border-primary transition-colors py-0.5 rounded-none m-0"
                      value={incomeInputValue}
                      onChange={(e) => setIncomeInputValue(e.target.value.replace(/\D/g, ''))}
                      onBlur={handleIncomeSubmit}
                      onKeyDown={(e) => e.key === "Enter" && handleIncomeSubmit()}
                    />
                  </div>
                ) : (
                  <div 
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => {
                      setIncomeInputValue(localIncome.toString());
                      setEditingIncome(true);
                    }}
                  >
                    <span className="text-xs md:text-sm font-bold text-foreground leading-none border-b border-dashed border-muted-foreground/50 group-hover:border-primary transition-colors pb-0.5">
                      {factor.value}
                    </span>
                    <Edit2 className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                )
              ) : (
                <span className="text-xs md:text-sm font-bold text-foreground leading-none">{factor.value}</span>
              )}

              <div className={cn(
                "w-2 h-2 rounded-full shadow-sm",
                factor.status === "good" ? "bg-[#103783] shadow-[0_0_6px_rgba(124,58,237,0.5)]" : factor.status === "fair" ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" : "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]"
              )} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EligibilityScore;

