import { useMemo } from "react";
import { FileText, Download, CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type ProductType,
  type EmploymentType,
  getDocumentsForLoanType,
  groupDocumentsByCategory,
} from "@/lib/documentData";

/* Map old-format strings from LoanApplicationForm to our ProductType */
const normalizeProductType = (raw?: string): ProductType => {
  switch (raw?.toLowerCase()) {
    case "home": return "Home Loan";
    case "lap": return "LAP";
    case "business": return "Business Loan";
    case "personal": default: return "Personal Loan";
  }
};

interface RequiredDocumentsProps {
  productType?: string;
  employmentType?: EmploymentType;
}

const RequiredDocuments = ({
  productType: rawProductType,
  employmentType = "Salaried",
}: RequiredDocumentsProps) => {
  const productType = normalizeProductType(rawProductType);

  const groups = useMemo(() => {
    const docs = getDocumentsForLoanType(productType, employmentType);
    return groupDocumentsByCategory(docs);
  }, [productType, employmentType]);

  return (
    <div className="neo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl neo-card-inset flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Required Documents</h3>
            <p className="text-xs text-muted-foreground">
              {productType} — {employmentType === "Salaried" ? "Salaried" : employmentType === "SEP" ? "Professional" : "Business"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-primary">
          <Download className="w-3 h-3 mr-1" />
          Download List
        </Button>
      </div>

      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.category}>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              {group.displayName}
            </h4>
            <div className="space-y-2">
              {group.docs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 neo-card-inset rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${doc.optional ? "border-muted-foreground" : "border-primary"}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {doc.label}
                        {!doc.optional && <span className="text-destructive ml-1">*</span>}
                        {doc.optional && <span className="text-muted-foreground text-xs ml-1">(optional)</span>}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Upload className="w-3 h-3 mr-1" />
                    Upload
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        <span className="text-destructive">*</span> Mandatory documents
      </p>
    </div>
  );
};

export default RequiredDocuments;
