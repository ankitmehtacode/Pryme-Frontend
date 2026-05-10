import React, { useState, useEffect } from "react";
import { X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BankLogoUploader } from "./BankLogoUploader";

interface AdminBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any | null;
  onSubmit: (data: { bankName: string; logoUrl: string; isActive: boolean }) => void;
}

export const AdminBankModal: React.FC<AdminBankModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}) => {
  const [bankName, setBankName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showLogoCropper, setShowLogoCropper] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBankName(initialData?.bankName || "");
      setLogoUrl(initialData?.logoUrl || "");
      setIsActive(initialData?.active ?? initialData?.isActive ?? true);
      setShowLogoCropper(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEditing = !!initialData?.id;

  const handleSubmit = () => {
    if (!bankName.trim()) return;
    onSubmit({ bankName: bankName.trim(), logoUrl, isActive });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0a0a10] rounded-2xl border border-white/[0.08] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isEditing ? "Edit Partner Bank" : "Add Partner Bank"}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? "Update bank details and logo"
                  : "Register a new banking partner"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Bank Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Bank Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. HDFC Bank"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>

          {/* Logo Section */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Bank Logo
            </label>

            {!showLogoCropper ? (
              <div className="space-y-3">
                {/* Current logo preview */}
                {logoUrl ? (
                  <div className="flex items-center gap-4 p-3 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                    <div className="w-20 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-white/[0.1]">
                      <img
                        src={logoUrl}
                        alt="Bank logo"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 truncate">
                        {logoUrl.startsWith("data:") ? "Uploaded image (320×160)" : logoUrl}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 text-xs shrink-0"
                      onClick={() => setLogoUrl("")}
                    >
                      Remove
                    </Button>
                  </div>
                ) : null}

                {/* Upload button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.04] h-10"
                  onClick={() => setShowLogoCropper(true)}
                >
                  {logoUrl ? "Replace Logo" : "Upload Logo Image"}
                </Button>

                {/* OR manual URL */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[10px] text-slate-600 uppercase tracking-wider font-medium">
                    or paste URL
                  </span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>
                <input
                  type="url"
                  value={logoUrl.startsWith("data:") ? "" : logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-xs text-white placeholder:text-slate-600 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                />
              </div>
            ) : (
              <BankLogoUploader
                currentLogoUrl={logoUrl}
                onLogoReady={(dataUrl) => {
                  setLogoUrl(dataUrl);
                  setShowLogoCropper(false);
                }}
                onCancel={() => setShowLogoCropper(false)}
              />
            )}
          </div>

          {/* Status toggle */}
          <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/[0.06]">
            <div>
              <p className="text-sm font-medium text-slate-300">Active Status</p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Active banks appear in eligibility engine and partner marquee
              </p>
            </div>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                isActive ? "bg-blue-600" : "bg-white/[0.08]"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-white/[0.06]">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!bankName.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 px-6"
          >
            {isEditing ? "Save Changes" : "Add Bank"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminBankModal;
