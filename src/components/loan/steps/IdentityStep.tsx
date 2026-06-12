import React from "react";
import { User, Phone, CheckCircle2, Mail, Calendar, MapPin, Building2, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import { useApplicationStore } from "@/store/applicationStore";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ValidatedInput, StyledSelect } from "../shared/FormComponents";
import { RELIGIONS, STATE_CITIES } from "../shared/constants";

interface IdentityStepProps {
  cardCn: string;
}

export const IdentityStep: React.FC<IdentityStepProps> = ({ cardCn }) => {
  const store = useApplicationStore();
  const basicKYC = store.basicKYC || {
    fullName: '',
    mobileNumber: '',
    mobileVerified: false,
    email: '',
    dateOfBirth: '',
    panNumber: '',
    state: '',
    city: '',
    pinCode: '',
    religion: '',
    employmentType: null,
  };
  const errors = store.validationErrors || {};

  return (
    <div id="section-identity" className={cn(cardCn, 'transition-all duration-500')}>
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-[#0d1829] border border-border dark:border-white/[0.06] flex items-center justify-center">
          <User className="w-5 h-5 text-primary dark:text-[#103783]" />
        </div>
        <h3 className="text-lg font-bold text-foreground tracking-tight">Verify Identity</h3>
      </div>

      <div className="space-y-5 relative z-10">
        <ValidatedInput
          label="Full Name (As per PAN)"
          placeholder="Rahul Sharma"
          icon={User}
          value={basicKYC.fullName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBasicKYC({ fullName: e.target.value })}
          isValid={(basicKYC.fullName || "").length >= 3}
          error={errors.fullName}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2 relative">
            <ValidatedInput
              label="Mobile Number"
              placeholder="9876543210"
              icon={Phone}
              maxLength={10}
              value={basicKYC.mobileNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBasicKYC({ mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              isValid={/^[6-9]\d{9}$/.test(basicKYC.mobileNumber)}
              error={errors.mobileNumber}
            />
            {/^[6-9]\d{9}$/.test(basicKYC.mobileNumber) && !basicKYC.mobileVerified && (
              <div className="animate-in fade-in slide-in-from-top-1 mt-1 space-y-2">
                {/* Verify Now / Verify Later toggle */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-xs font-semibold border-primary/30 text-primary hover:bg-primary hover:text-white transition-all"
                    onClick={() => {
                      toast({ title: "OTP Sent", description: `A 6-digit OTP has been sent to ${basicKYC.mobileNumber}` });
                    }}
                  >
                    <Phone className="w-3 h-3 mr-1.5" /> Verify Now
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-9 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                    onClick={() => {
                      // Skip verification — mark as not verified but allow progression
                      store.updateBasicKYC({ mobileVerified: false });
                      toast({ title: "Skipped", description: "You can verify your mobile later from your profile." });
                    }}
                  >
                    Verify Later
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground/50 ml-0.5">Verification is optional. You can proceed without it.</p>
              </div>
            )}
            {basicKYC.mobileVerified && (
              <div className="flex items-center gap-1.5 mt-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-semibold text-primary">Mobile Verified</span>
              </div>
            )}
          </div>
          <ValidatedInput
            label="Email Address"
            type="email"
            placeholder="rahul@company.com"
            icon={Mail}
            value={basicKYC.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBasicKYC({ email: e.target.value })}
            isValid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicKYC.email)}
            error={errors.email}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ValidatedInput
            label="Date of Birth"
            type="date"
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 19)).toISOString().split("T")[0]}
            icon={Calendar}
            value={basicKYC.dateOfBirth}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBasicKYC({ dateOfBirth: e.target.value })}
            isValid={!!basicKYC.dateOfBirth}
            error={errors.dateOfBirth}
          />

          <StyledSelect
            label="Religion"
            icon={User}
            value={basicKYC.religion}
            onValueChange={(v) => store.updateBasicKYC({ religion: v })}
            placeholder="Select Religion"
            error={errors.religion}
          >
            {RELIGIONS.map((r) => (
              <SelectItem key={r} value={r} className="cursor-pointer">{r}</SelectItem>
            ))}
          </StyledSelect>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StyledSelect
            label="State"
            icon={MapPin}
            value={basicKYC.state}
            onValueChange={(v) => {
              store.updateBasicKYC({ state: v, city: '' });
            }}
            placeholder="Select State"
            error={errors.state}
          >
            {Object.keys(STATE_CITIES).map((s) => (
              <SelectItem key={s} value={s} className="cursor-pointer">{s}</SelectItem>
            ))}
          </StyledSelect>

          <StyledSelect
            label="City"
            icon={Building2}
            value={basicKYC.city}
            onValueChange={(v) => store.updateBasicKYC({ city: v })}
            placeholder={basicKYC.state ? "Select City" : "Select state first"}
            error={errors.city}
          >
            {(STATE_CITIES[basicKYC.state] || []).map((c) => (
              <SelectItem key={c} value={c} className="cursor-pointer">{c}</SelectItem>
            ))}
          </StyledSelect>

          <ValidatedInput
            label="PIN Code"
            placeholder="400001"
            icon={Hash}
            maxLength={6}
            value={basicKYC.pinCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBasicKYC({ pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            isValid={/^\d{6}$/.test(basicKYC.pinCode)}
            error={errors.pinCode}
          />
        </div>
      </div>
    </div>
  );
};
