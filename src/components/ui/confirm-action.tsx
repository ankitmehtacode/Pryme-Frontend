import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface ConfirmActionProps {
  /** The title shown in the confirmation dialog */
  title?: string;
  /** The description/body text explaining the action */
  description?: string;
  /** Text for the confirm button */
  confirmLabel?: string;
  /** Text for the cancel button */
  cancelLabel?: string;
  /** Variant controls the confirm button styling */
  variant?: "default" | "destructive";
  /** Callback executed when user confirms */
  onConfirm: () => void;
  /** The clickable trigger element — rendered as-is, click is intercepted */
  children: React.ReactElement;
  /** If true, the dialog is disabled and the action fires immediately */
  disabled?: boolean;
}

/**
 * 🧠 ConfirmAction — Wraps any clickable element with a confirmation dialog.
 *
 * Usage:
 * ```tsx
 * <ConfirmAction
 *   title="Change Status"
 *   description="Are you sure you want to move this lead to APPROVED?"
 *   onConfirm={() => statusMutation.mutate(...)}
 * >
 *   <Button>Approve</Button>
 * </ConfirmAction>
 * ```
 */
export const ConfirmAction: React.FC<ConfirmActionProps> = ({
  title = "Confirm Action",
  description = "Are you sure you want to save these changes?",
  confirmLabel = "Yes, Continue",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  children,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (disabled) return;
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    onConfirm();
  };

  return (
    <>
      {React.cloneElement(children, {
        onClick: handleTriggerClick,
      })}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="bg-[#0d0d14] border-white/[0.08] text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">{title}</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:text-white">
              {cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                variant === "destructive"
                  ? "bg-red-600 hover:bg-red-700 text-white border-0"
                  : "bg-blue-600 hover:bg-blue-700 text-white border-0"
              }
            >
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConfirmAction;
