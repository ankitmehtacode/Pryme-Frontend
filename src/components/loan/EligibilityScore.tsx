import { useState, useEffect } from "react";
import { TrendingUp, AlertCircle, CheckCircle, Activity } from "lucide-react";
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

  useEffect(() => {
    setLocalCibil(cibilScore);
  }, [cibilScore]);

  // Dynamically recalculate the score if the user plays with the CIBIL slider
  const displayScore = (() => {
    let base = ((localCibil - 300) / 600) * 40;
    const ratio = loanAmount / (monthlyIncome * 12);
    base += Math.max(0, (1 - ratio / 10) * 40);
    base += 20;
    return Math.min(100, Math.round(base));
  })();

  const getScoreDetails = (s: number) => {
    if (s >= 80) {
      return {
        label: "Excellent",
        color: "text-[#2aac64]",
        bgColor: "bg-[#2aac64]",
        stroke: "stroke-[#2aac64]",
        shadow: "drop-shadow-[0_0_15px_rgba(42,172,100,0.4)]",
        description: "You have a high chance of approval with competitive rates.",
        icon: CheckCircle,
      };
    } else if (s >= 60) {
      return {
        label: "Good",
        color: "text-indigo-400",
        bgColor: "bg-indigo-500",
        stroke: "stroke-indigo-500",
        shadow: "drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]",
        description: "Your profile looks promising. A few improvements could boost your chances.",
        icon: TrendingUp,
      };
    } else if (s >= 40) {
      return {
        label: "Fair",
        color: "text-amber-400",
        bgColor: "bg-amber-500",
        stroke: "stroke-amber-500",
        shadow: "drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]",
        description: "Consider improving your CIBIL score or adjusting loan amount.",
        icon: AlertCircle,
      };
    }
    return {
      label: "Needs Work",
      color: "text-rose-500",
      bgColor: "bg-rose-500",
      stroke: "stroke-rose-500",
      shadow: "drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]",
      description: "Focus on improving your credit score before applying.",
      icon: AlertCircle,
    };
  };

  const details = getScoreDetails(displayScore);
  const IconComponent = details.icon;

  // Calculate arc for circular progress
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progressArc = (displayScore / 100) * circumference;

  const formatCurrency = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const factors = [
    { label: "CIBIL Score", value: localCibil.toString(), status: localCibil >= 750 ? "good" : localCibil >= 650 ? "fair" : "poor" },
    { label: "Income", value: formatCurrency(monthlyIncome), status: "good" },
    { label: "Loan/Income Ratio", value: `${((loanAmount / (monthlyIncome * 12)) * 100).toFixed(1)}%`, status: loanAmount <= monthlyIncome * 36 ? "good" : "fair" },
  ];

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden h-full flex flex-col transition-all hover:border-[#2aac64]/30">
      
      {/* Ambient Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full pointer-events-none ${details.bgColor.replace('bg-', 'bg-')}/10`} />

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-[#111] border border-white/5 flex items-center justify-center shadow-sm">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-lg tracking-tight">Eligibility Score</h3>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">Predictive AI Analysis</p>
        </div>
      </div>

      {/* Circular Progress */}
      <div className="flex justify-center mb-6 relative z-10">
        <div className="relative w-44 h-44 drop-shadow-xl">
          <svg className={`w-full h-full -rotate-90 ${details.shadow}`} viewBox="0 0 160 160">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#222"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              className={cn("transition-all duration-1000 ease-out", details.stroke)}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progressArc}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-xl font-semibold", details.color)}>{displayScore}</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-slate-500 mt-1">out of 100</span>
          </div>
        </div>
      </div>

      {/* Score Label */}
      <div className="text-center mb-6 relative z-10">
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-widest border border-white/5",
          details.bgColor.replace('bg-', 'bg-') + "/10",
          details.color
        )}>
          <IconComponent className="w-3.5 h-3.5" />
          {details.label}
        </div>
        <p className="text-xs font-medium text-slate-400 mt-4 max-w-xs mx-auto leading-relaxed">
          {details.description}
        </p>
      </div>

      {/* Interactive CIBIL Simulator */}
      <div className="mb-6 bg-[#111] p-4 rounded-xl border border-white/5 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Simulate CIBIL</span>
          <span className={cn("text-sm font-semibold", localCibil >= 750 ? "text-[#2aac64]" : localCibil >= 650 ? "text-amber-400" : "text-rose-500")}>
            {localCibil}
          </span>
        </div>
        <Slider 
          value={[localCibil]} 
          onValueChange={(v) => setLocalCibil(v[0])} 
          min={300} max={900} step={5} 
          className="cursor-pointer" 
        />
        <div className="flex justify-between mt-2">
          <span className="text-[9px] font-medium text-slate-600 uppercase">300</span>
          <span className="text-[9px] font-medium text-slate-600 uppercase">900</span>
        </div>
      </div>

      {/* Factors Breakdown */}
      <div className="space-y-3 pt-4 border-t border-white/10 mt-auto relative z-10">
        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-4">Contributing Factors</p>
        {factors.map((factor) => (
          <div key={factor.label} className="flex items-center justify-between p-3 bg-[#111] rounded-xl border border-white/5">
            <span className="text-xs font-medium text-slate-300">{factor.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">{factor.value}</span>
              <div className={cn(
                "w-2 h-2 rounded-full shadow-sm",
                factor.status === "good" ? "bg-[#2aac64] shadow-[0_0_5px_rgba(42,172,100,0.6)]" : factor.status === "fair" ? "bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.6)]" : "bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.6)]"
              )} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EligibilityScore;
