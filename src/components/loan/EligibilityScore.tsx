import { TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EligibilityScoreProps {
  score: number;
  cibilScore: number;
  monthlyIncome: number;
  loanAmount: number;
}

const EligibilityScore = ({ score, cibilScore, monthlyIncome, loanAmount }: EligibilityScoreProps) => {
  const getScoreDetails = () => {
    if (score >= 80) {
      return {
        label: "Excellent",
        color: "text-success",
        bgColor: "bg-success",
        description: "You have a high chance of approval with competitive rates.",
        icon: CheckCircle,
      };
    } else if (score >= 60) {
      return {
        label: "Good",
        color: "text-primary",
        bgColor: "bg-primary",
        description: "Your profile looks promising. A few improvements could boost your chances.",
        icon: TrendingUp,
      };
    } else if (score >= 40) {
      return {
        label: "Fair",
        color: "text-warning",
        bgColor: "bg-warning",
        description: "Consider improving your CIBIL score or adjusting loan amount.",
        icon: AlertCircle,
      };
    }
    return {
      label: "Needs Work",
      color: "text-destructive",
      bgColor: "bg-destructive",
      description: "Focus on improving your credit score before applying.",
      icon: AlertCircle,
    };
  };

  const details = getScoreDetails();
  const IconComponent = details.icon;

  // Calculate arc for circular progress
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progressArc = (score / 100) * circumference;

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
    { label: "CIBIL Score", value: cibilScore.toString(), status: cibilScore >= 750 ? "good" : cibilScore >= 650 ? "fair" : "poor" },
    { label: "Income", value: formatCurrency(monthlyIncome), status: "good" },
    { label: "Loan/Income Ratio", value: `${((loanAmount / (monthlyIncome * 12)) * 100).toFixed(1)}%`, status: loanAmount <= monthlyIncome * 36 ? "good" : "fair" },
  ];

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Eligibility Score</h3>
          <p className="text-xs text-muted-foreground">Based on your profile</p>
        </div>
      </div>

      {/* Circular Progress */}
      <div className="flex justify-center mb-6">
        <div className="relative w-44 h-44">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={`hsl(var(--${score >= 80 ? "success" : score >= 60 ? "primary" : score >= 40 ? "warning" : "destructive"}))`}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progressArc}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-4xl font-bold", details.color)}>{score}</span>
            <span className="text-sm text-muted-foreground">out of 100</span>
          </div>
        </div>
      </div>

      {/* Score Label */}
      <div className="text-center mb-6">
        <div className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
          details.bgColor + "/10",
          details.color
        )}>
          <IconComponent className="w-4 h-4" />
          {details.label}
        </div>
        <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto">
          {details.description}
        </p>
      </div>

      {/* Factors Breakdown */}
      <div className="space-y-3 pt-4 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contributing Factors</p>
        {factors.map((factor) => (
          <div key={factor.label} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="text-sm text-foreground">{factor.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{factor.value}</span>
              <div className={cn(
                "w-2 h-2 rounded-full",
                factor.status === "good" ? "bg-success" : factor.status === "fair" ? "bg-warning" : "bg-destructive"
              )} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EligibilityScore;
