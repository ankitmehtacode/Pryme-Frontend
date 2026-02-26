import { Lightbulb, TrendingUp, CreditCard, Clock, AlertTriangle, CheckCircle } from "lucide-react";

const tips = [
  {
    icon: CreditCard,
    title: "Pay Bills On Time",
    description: "Timely payments of credit cards and EMIs boost your score significantly.",
    impact: "+30-50 points"
  },
  {
    icon: TrendingUp,
    title: "Reduce Credit Utilization",
    description: "Keep credit card usage below 30% of your limit for better scores.",
    impact: "+20-40 points"
  },
  {
    icon: Clock,
    title: "Maintain Credit History",
    description: "Older credit accounts show stability. Don't close old cards.",
    impact: "+15-25 points"
  },
  {
    icon: AlertTriangle,
    title: "Limit Hard Inquiries",
    description: "Avoid multiple loan applications in short periods.",
    impact: "-5 to -10 points per inquiry"
  }
];

const CibilTips = () => {
  return (
    <div className="neo-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl neo-card-inset flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-trust" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Tips to Improve CIBIL</h3>
          <p className="text-xs text-muted-foreground">Boost your approval chances</p>
        </div>
      </div>

      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex gap-3 p-3 neo-card-inset rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <tip.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm text-foreground">{tip.title}</p>
                <span className="text-xs font-medium text-success whitespace-nowrap">{tip.impact}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CibilTips;
