import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserPlus, User, Phone, Mail, Calendar, 
  MapPin, Briefcase, BriefcaseBusiness, 
  GraduationCap, Building2, IndianRupee 
} from "lucide-react";
import { useApplicationStore } from "@/store/applicationStore";
import { ValidatedInput, PillSelector, ToggleSwitch } from "../shared/FormComponents";

interface CoApplicantStepProps {
  cardCn: string;
}

export const CoApplicantStep: React.FC<CoApplicantStepProps> = ({ cardCn }) => {
  const store = useApplicationStore();
  const coApplicant = store.financialFootprint.coApplicantDetails;
  const updateCoApplicant = store.updateCoApplicantDetails;

  return (
    <div className={cardCn}>
      <ToggleSwitch
        label="Adding a Co-Applicant?"
        description="A co-applicant can increase your loan eligibility"
        icon={UserPlus}
        checked={store.financialFootprint.hasCoApplicant}
        onChange={(v) => store.updateFinancialFootprint({ hasCoApplicant: v })}
      />

      <AnimatePresence>
        {store.financialFootprint.hasCoApplicant && (
          <motion.div
            key="co-applicant-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-6 pt-6 border-t border-border dark:border-white/[0.06] space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-[#103783]/10 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-primary dark:text-[#103783]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Co-Applicant Details</h4>
                  <p className="text-[11px] text-muted-foreground/60">Same details as primary applicant</p>
                </div>
              </div>

              {/* Identity */}
              <ValidatedInput
                label="Full Name (as per PAN)"
                placeholder="Co-Applicant Name"
                icon={User}
                value={coApplicant.fullName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCoApplicant({ fullName: e.target.value })}
                isValid={(coApplicant.fullName || "").length >= 3}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ValidatedInput
                  label="Mobile Number"
                  type="tel"
                  placeholder="9876543210"
                  icon={Phone}
                  value={coApplicant.mobileNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCoApplicant({ mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  isValid={/^[6-9]\d{9}$/.test(coApplicant.mobileNumber)}
                />
                <ValidatedInput
                  label="Email Address"
                  type="email"
                  placeholder="co-applicant@email.com"
                  icon={Mail}
                  value={coApplicant.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCoApplicant({ email: e.target.value })}
                  isValid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coApplicant.email)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ValidatedInput
                  label="Date of Birth"
                  type="date"
                  icon={Calendar}
                  value={coApplicant.dateOfBirth}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCoApplicant({ dateOfBirth: e.target.value })}
                  isValid={!!coApplicant.dateOfBirth}
                />
                <ValidatedInput
                  label="PIN Code"
                  placeholder="400001"
                  icon={MapPin}
                  value={coApplicant.pinCode}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCoApplicant({ pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  isValid={/^\d{6}$/.test(coApplicant.pinCode)}
                />
              </div>

              {/* Employment */}
              <PillSelector
                label="Employment Type"
                icon={Briefcase}
                options={[
                  { value: 'SALARIED', label: 'Salaried', icon: Briefcase },
                  { value: 'SELF_EMPLOYED', label: 'Business', icon: BriefcaseBusiness },
                  { value: 'PROFESSIONAL', label: 'Professional', icon: GraduationCap },
                ]}
                value={coApplicant.employmentType || null}
                onChange={(v) => updateCoApplicant({ employmentType: v as any })}
              />

              {coApplicant.employmentType && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ValidatedInput
                    label={coApplicant.employmentType === 'SALARIED' ? 'Company Name' : coApplicant.employmentType === 'PROFESSIONAL' ? 'Practice / Firm Name' : 'Business Name'}
                    placeholder={coApplicant.employmentType === 'SALARIED' ? 'Infosys Ltd' : coApplicant.employmentType === 'PROFESSIONAL' ? 'Dr. Mehta Clinic' : 'Mehta Enterprises'}
                    icon={Building2}
                    value={coApplicant.companyName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCoApplicant({ companyName: e.target.value })}
                    isValid={(coApplicant.companyName || "").length >= 2}
                  />
                  <ValidatedInput
                    label="Net Monthly Income (₹)"
                    type="number"
                    placeholder="50000"
                    icon={IndianRupee}
                    value={coApplicant.netMonthlySalary}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCoApplicant({ netMonthlySalary: e.target.value })}
                    isValid={Number(coApplicant.netMonthlySalary) >= 10000}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
