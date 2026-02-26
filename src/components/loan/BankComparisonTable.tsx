import { Building2, Star, ArrowRight, ExternalLink, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BankOffer {
  id: string;
  bankName: string;
  maxLoanAmount: number;
  roi: number;
  processingFee: string;
  emi: number;
  approvalProbability: number;
  processingTime: string;
  featured?: boolean;
  recommended?: boolean;
}

interface BankComparisonTableProps {
  offers: BankOffer[];
  loanAmount: number;
  tenure: number;
  onApplyDirect: (bankId: string) => void;
  onApplyWithPyrme: (bankId: string) => void;
}

const BankComparisonTable = ({
  offers,
  loanAmount,
  tenure,
  onApplyDirect,
  onApplyWithPyrme,
}: BankComparisonTableProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getApprovalColor = (probability: number) => {
    if (probability >= 80) return { bg: "bg-success", text: "text-success", label: "High" };
    if (probability >= 60) return { bg: "bg-warning", text: "text-warning", label: "Medium" };
    return { bg: "bg-destructive", text: "text-destructive", label: "Low" };
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-hidden">
        <div className="card-elevated overflow-hidden">
          <table className="data-table">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-[200px]">Bank</th>
                <th>Max Loan</th>
                <th>ROI</th>
                <th>Processing Fee</th>
                <th>Monthly EMI</th>
                <th>Approval Probability</th>
                <th>Time</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => {
                const approval = getApprovalColor(offer.approvalProbability);
                return (
                  <tr 
                    key={offer.id} 
                    className={cn(
                      "group transition-colors",
                      offer.recommended && "bg-primary/5"
                    )}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{offer.bankName}</span>
                            {offer.recommended && (
                              <span className="badge-recommended flex items-center gap-1">
                                <Star className="w-3 h-3 fill-trust" />
                                Best Rate
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="font-medium text-foreground">{formatCurrency(offer.maxLoanAmount)}</td>
                    <td>
                      <span className={cn(
                        "font-bold text-lg",
                        offer.recommended ? "text-primary" : "text-foreground"
                      )}>
                        {offer.roi}%
                      </span>
                      <span className="text-xs text-muted-foreground block">p.a.</span>
                    </td>
                    <td className="text-muted-foreground">{offer.processingFee}</td>
                    <td className="font-semibold text-foreground">{formatCurrency(offer.emi)}</td>
                    <td>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                            <div 
                              className={cn("h-full rounded-full transition-all", approval.bg)}
                              style={{ width: `${offer.approvalProbability}%` }}
                            />
                          </div>
                          <span className={cn("text-sm font-medium", approval.text)}>
                            {offer.approvalProbability}%
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{approval.label} Probability</span>
                      </div>
                    </td>
                    <td className="text-sm text-muted-foreground">{offer.processingTime}</td>
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onApplyDirect(offer.id)}
                          className="text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Direct
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onApplyWithPyrme(offer.id)}
                          className={cn(
                            "text-xs",
                            offer.recommended 
                              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                              : "bg-foreground text-background hover:bg-foreground/90"
                          )}
                        >
                          With PRYME
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {offers.map((offer) => {
          const approval = getApprovalColor(offer.approvalProbability);
          return (
            <div 
              key={offer.id} 
              className={cn(
                "card-elevated p-5",
                offer.recommended && "ring-2 ring-primary/20"
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{offer.bankName}</p>
                    <p className="text-xs text-muted-foreground">{offer.processingTime}</p>
                  </div>
                </div>
                {offer.recommended && (
                  <span className="badge-recommended flex items-center gap-1">
                    <Star className="w-3 h-3 fill-trust" />
                    Best
                  </span>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
                  <p className={cn(
                    "text-xl font-bold",
                    offer.recommended ? "text-primary" : "text-foreground"
                  )}>
                    {offer.roi}%
                  </p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Monthly EMI</p>
                  <p className="text-xl font-bold text-foreground">{formatCurrency(offer.emi)}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Max Loan</p>
                  <p className="text-sm font-semibold text-foreground">{formatCurrency(offer.maxLoanAmount)}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Processing Fee</p>
                  <p className="text-sm font-semibold text-foreground">{offer.processingFee}</p>
                </div>
              </div>

              {/* Approval Probability */}
              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Approval Probability</span>
                  <span className={cn("text-sm font-semibold", approval.text)}>
                    {offer.approvalProbability}% - {approval.label}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all", approval.bg)}
                    style={{ width: `${offer.approvalProbability}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onApplyDirect(offer.id)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Apply Direct
                </Button>
                <Button
                  className={cn(
                    "flex-1",
                    offer.recommended 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-foreground text-background"
                  )}
                  onClick={() => onApplyWithPyrme(offer.id)}
                >
                  With PRYME
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BankComparisonTable;
