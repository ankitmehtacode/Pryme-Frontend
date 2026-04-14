import { useState } from "react";
import { FieldMetadata } from "@/lib/validations/policySchema";
import { DynamicPolicyInput } from "./DynamicPolicyInput";
import { PolicyAuditModal } from "./PolicyAuditModal";
import { usePolicyUpdate } from "@/hooks/usePolicyUpdate";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";

interface Props {
  entityId: string;
  entityType: string;
  metadata: FieldMetadata;
  initialValue: any;
}

export const PolicyFieldEditor = ({ entityId, entityType, metadata, initialValue }: Props) => {
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [stagedValue, setStagedValue] = useState(initialValue);
  const [isModalOpen, setModalOpen] = useState(false);
  const mutation = usePolicyUpdate();

  const isChanged = currentValue !== stagedValue;

  const handleUpdateClick = () => {
    if (!isChanged) return;
    
    if (metadata.requiresReason) {
      setModalOpen(true);
    } else {
      // Direct commit for low-impact fields
      executeCommit("Standard update", "");
    }
  };

  const executeCommit = (reason: string, idempotencyKey: string) => {
    mutation.mutate(
      { 
        id: entityId, 
        key: metadata.fieldKey, 
        value: stagedValue,
        auditReason: reason
      },
      {
        onSuccess: () => {
          setCurrentValue(stagedValue);
          setModalOpen(false);
        }
      }
    );
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-white/[0.08] transition-colors relative group">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <label className="text-sm font-semibold text-white tracking-wide">
            {metadata.displayName}
          </label>
          <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
            // {metadata.fieldKey}
          </span>
        </div>
        {metadata.requiresReason && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 tracking-wider shadow-sm">
            <ShieldCheck className="w-3 h-3" /> Audited
          </span>
        )}
      </div>

      {/* The Dynamic Input Factory */}
      <div>
        <DynamicPolicyInput 
          metadata={metadata} 
          value={stagedValue} 
          onChange={setStagedValue} 
        />
      </div>

      {/* Action Controls */}
      {isChanged && (
        <div className="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-white/[0.04] animate-in fade-in slide-in-from-top-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setStagedValue(currentValue)}
            className="text-slate-400 hover:text-white h-8 text-xs"
          >
            Discard
          </Button>
          <Button 
            size="sm"
            onClick={handleUpdateClick}
            disabled={mutation.isPending}
            className={`h-8 text-xs font-semibold ${
              metadata.requiresReason 
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-[0_0_15px_rgba(217,119,6,0.3)]" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {mutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
            {metadata.requiresReason ? "Review & Commit" : "Update Value"}
          </Button>
        </div>
      )}

      {/* The Security Gate */}
      <PolicyAuditModal 
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={executeCommit}
        metadata={metadata}
        oldValue={currentValue}
        newValue={stagedValue}
      />
    </div>
  );
};
