import React, { useState } from "react";
import { FieldMetadata } from "@/lib/validations/policySchema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PolicyAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (auditReason: string) => void;
  metadata: FieldMetadata | null;
  oldValue: string;
  newValue: string;
}

export const PolicyAuditModal: React.FC<PolicyAuditModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  metadata,
  oldValue,
  newValue,
}) => {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.length > 10) {
      onConfirm(reason);
      setReason(""); // reset for next time
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason("");
      onClose();
    }
  };

  if (!metadata) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-[#050508] border-slate-800 text-slate-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Matrix Blast Radius
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            You are about to modify a core banking policy parameter. This change 
            will immediately affect the evaluation engine.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col gap-6">
          {/* Diff Renderer */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              {metadata.displayName}
            </span>
            <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-md border border-slate-800 font-mono text-lg">
              <span className="text-red-400 line-through decoration-red-400/50">
                {oldValue || "empty"}
              </span>
              <span className="text-slate-500">→</span>
              <span className="text-green-400 font-bold">
                {newValue || "empty"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="reason" className="text-sm font-medium text-slate-300">
              Audit Justification (Required)
            </label>
            <Textarea
              id="reason"
              placeholder="E.g., Approved via internal ticket IT-4029. Adjusting FOIR limits."
              className="bg-slate-950 border-slate-800 min-h-[100px] text-slate-100 placeholder:text-slate-600 focus-visible:ring-blue-500"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <span className={`text-xs ${reason.length > 10 ? "text-green-500" : "text-amber-500"}`}>
              {reason.length} / 11 min characters
            </span>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-slate-100 hover:bg-slate-800">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={reason.length <= 10}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium"
          >
            Commit to Matrix
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
