import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, User, Phone, Users, Calendar, MapPin, Briefcase } from "lucide-react";
import { useApplicationStore } from "@/store/applicationStore";
import { ValidatedInput, StyledSelect, PillSelector, ToggleSwitch } from "../shared/FormComponents";
import { EmploymentDetailsFields } from "../shared/EmploymentDetailsFields";
import { EMPLOYMENT_OPTIONS } from "../shared/constants";
import { SelectItem } from "@/components/ui/select";
import type { EmploymentType, FinancialDetails } from "@/lib/applicationTypes";

interface CoApplicantStepProps {
  cardCn: string;
}

export const CoApplicantStep: React.FC<CoApplicantStepProps> = ({ cardCn }) => {
  const store = useApplicationStore();
  const financialFootprint = store.financialFootprint || {};
  const coApplicant = financialFootprint.coApplicantDetails || {
    fullName: '',
    mobileNumber: '',
    relationship: '',
    dateOfBirth: '',
    pinCode: '',
    employmentType: null,
    companyName: '',
    netMonthlySalary: '',
    financialDetails: { path: null, data: {} } as FinancialDetails,
  };
  const updateCoApplicant = store.updateCoApplicantDetails || (() => {});
  const coApplicantFinancialDetails = coApplicant.financialDetails || ({ path: null, data: {} } as FinancialDetails);

  return (
    <div className={cardCn}>
      <ToggleSwitch
        label="Adding a Co-Applicant?"
        description="A co-applicant can increase your loan eligibility"
        icon={UserPlus}
        checked={!!financialFootprint.hasCoApplicant}
        onChange={(v) => store.updateFinancialFootprint({ hasCoApplicant: v })}
      />

      <AnimatePresence>
        {!!financialFootprint.hasCoApplicant && (
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
                <StyledSelect
                  label="Relationship with Applicant"
                  icon={Users}
                  value={coApplicant.relationship || undefined}
                  onValueChange={(v) => updateCoApplicant({ relationship: v as any })}
                  placeholder="Select relationship"
                >
                  <SelectItem value="SPOUSE">Spouse</SelectItem>
                  <SelectItem value="FATHER">Father</SelectItem>
                  <SelectItem value="MOTHER">Mother</SelectItem>
                  <SelectItem value="SON">Son</SelectItem>
                  <SelectItem value="DAUGHTER">Daughter(Unmarried)</SelectItem>
                  <SelectItem value="BROTHER">Brother</SelectItem>
                  <SelectItem value="SISTER">Sister(Unmarried)</SelectItem>
                </StyledSelect>
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

              {/* Employment — exact same options/divisions as the primary applicant,
                  mapped through the same shared component so both forms compute
                  income with identical GST-margin/ITR-annualization formulas. */}
              <PillSelector<EmploymentType>
                label="Employment Type"
                icon={Briefcase}
                options={EMPLOYMENT_OPTIONS}
                value={coApplicant.employmentType || null}
                onChange={(v) => updateCoApplicant({ employmentType: v })}
              />

              <EmploymentDetailsFields
                employmentType={coApplicant.employmentType}
                financialDetails={coApplicantFinancialDetails}
                onUpdateSalaried={store.updateCoApplicantSalariedDetails}
                onUpdateProfessional={store.updateCoApplicantProfessionalDetails}
                onUpdateBusiness={store.updateCoApplicantBusinessDetails}
                loanType={store.loanRequirements?.loanType}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
