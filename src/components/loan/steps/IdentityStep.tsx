import React, { useEffect, useRef } from "react";
import { User, Phone, Calendar, MapPin, Building2, Hash } from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import { useApplicationStore } from "@/store/applicationStore";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ValidatedInput, StyledSelect } from "../shared/FormComponents";
import { MobileOtpVerifier } from "../shared/MobileOtpVerifier";
import { STATE_CITIES } from "../shared/constants";

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
    employmentType: null,
  };
  const errors = store.validationErrors || {};
  const { user, isAuthenticated } = useAuth();

  // Returning verified user: prefill the number they already proved and mark it
  // verified, so they are not asked to repeat an SMS round-trip on every visit.
  //
  // Guarded by a ref rather than by "is the field empty": this must run once per
  // session hydration, never fight a user who is deliberately typing a different
  // number. Only the backend's mobileVerified flag can set this -- the form can
  // trust it because it arrives from an authenticated /auth/me, not from anything
  // the browser could have written.
  const prefillApplied = useRef(false);
  useEffect(() => {
    if (prefillApplied.current) return;
    if (!isAuthenticated || !user?.mobileVerified || !user?.phone) return;
    if (basicKYC.mobileNumber && basicKYC.mobileNumber !== user.phone) return;

    prefillApplied.current = true;
    store.updateBasicKYC({ mobileNumber: user.phone, mobileVerified: true });
  }, [isAuthenticated, user?.mobileVerified, user?.phone]); // eslint-disable-line react-hooks/exhaustive-deps

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
              placeholder="e.g. 9876543210"
              icon={Phone}
              maxLength={10}
              value={basicKYC.mobileNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => store.updateBasicKYC({ mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              isValid={/^[6-9]\d{9}$/.test(basicKYC.mobileNumber)}
              error={errors.mobileNumber}
            />
            {/* Verification is mandatory -- the submit button stays disabled
                until this reports success. The component owns the OTP exchange;
                the token it returns is the server's proof and the only thing
                submission is checked against. */}
            <MobileOtpVerifier
              mobileNumber={basicKYC.mobileNumber}
              verified={!!basicKYC.mobileVerified}
              onVerified={(token, verifiedNumber) => {
                store.updateBasicKYC({
                  mobileNumber: verifiedNumber,
                  mobileVerified: true,
                  mobileVerificationToken: token,
                });
                toast({ title: "Mobile verified", description: "Your number has been confirmed." });
              }}
            />
          </div>
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
            placeholder="e.g. 400001"
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
