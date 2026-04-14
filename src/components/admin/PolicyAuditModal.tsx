import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { generateSafeUUID } from "@/lib/utils";
import { FieldMetadata } from "@/lib/validations/policySchema";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, idempotencyKey: string) => void;
  metadata: FieldMetadata;
  oldValue: any;
  newValue: any;
}

export const PolicyAuditModal = ({ isOpen, onClose, onConfirm, metadata, oldValue, newValue }: Props) => {
  const [reason, setReason] = useState("");

  const handleCommit = () => {
    if (reason.length < 10) return; // Basic validation
    onConfirm(reason, generateSafeUUID());
    setReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a10] border border-white/[0.1] text-slate-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-500">
            <ShieldAlert className="w-5 h-5" /> Confirm Matrix Modification
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-slate-400">
            You are altering the live routing logic for <strong className="text-white">{metadata.displayName}</strong>.
          </p>
          
          {/* 🧠 THE DIFF VIEWER */}
          <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg border border-white/[0.04] font-mono text-sm">
            <div className="flex flex-col"><span className="text-xs text-slate-500 mb-1">Current State</span><span className="text-red-400">{String(oldValue)}</span></div>
            <ArrowRight className="w-4 h-4 text-slate-600" />
            <div className="flex flex-col items-end"><span className="text-xs text-slate-500 mb-1">New State</span><span className="text-emerald-400">{String(newValue)}</span></div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Audit Trail Justification</label>
            <Textarea 
              placeholder="e.g., RBI Repo Rate adjustment Q3, approved by Risk Dept."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-black/50 border-white/[0.08] focus:border-amber-500/50 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
          <Button variant="ghost" onClick={onClose} className="hover:bg-white/[0.04]">Cancel</Button>
          <Button disabled={reason.length < 10} onClick={handleCommit} className="bg-amber-600 hover:bg-amber-700 text-white">
            Commit to Matrix
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
