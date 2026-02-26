import { FileText, Download, CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  uploaded?: boolean;
}

const defaultDocuments: DocumentRequirement[] = [
  { id: "1", name: "Identity Proof", description: "Aadhaar, PAN, Passport, or Voter ID", required: true },
  { id: "2", name: "Address Proof", description: "Utility bill, Rent agreement, or Bank statement", required: true },
  { id: "3", name: "Income Proof", description: "Salary slips (3 months) or ITR", required: true },
  { id: "4", name: "Bank Statements", description: "Last 6 months statements", required: true },
  { id: "5", name: "Employment Proof", description: "Offer letter or experience certificate", required: false },
  { id: "6", name: "Property Documents", description: "For home/LAP loans only", required: false },
];

interface RequiredDocumentsProps {
  documents?: DocumentRequirement[];
  productType?: string;
}

const RequiredDocuments = ({ 
  documents = defaultDocuments, 
  productType = "personal" 
}: RequiredDocumentsProps) => {
  const filteredDocs = documents.filter(doc => {
    if (doc.id === "6" && !["home", "lap"].includes(productType)) return false;
    return true;
  });

  return (
    <div className="neo-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl neo-card-inset flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Required Documents</h3>
            <p className="text-xs text-muted-foreground">For loan processing</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-primary">
          <Download className="w-3 h-3 mr-1" />
          Download List
        </Button>
      </div>

      <div className="space-y-3">
        {filteredDocs.map((doc) => (
          <div 
            key={doc.id} 
            className="flex items-center justify-between p-3 neo-card-inset rounded-lg"
          >
            <div className="flex items-center gap-3">
              {doc.uploaded ? (
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
              ) : (
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${doc.required ? 'border-primary' : 'border-muted-foreground'}`} />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {doc.name}
                  {doc.required && <span className="text-destructive ml-1">*</span>}
                </p>
                <p className="text-xs text-muted-foreground">{doc.description}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              <Upload className="w-3 h-3 mr-1" />
              Upload
            </Button>
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
