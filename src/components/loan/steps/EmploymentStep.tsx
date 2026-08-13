import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Home, AlertCircle } from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import { useApplicationStore } from "@/store/applicationStore";
import { cn } from "@/lib/utils";
import { StyledSelect, PillSelector } from "../shared/FormComponents";
import { EmploymentDetailsFields } from "../shared/EmploymentDetailsFields";
import { EMPLOYMENT_OPTIONS } from "../shared/constants";
import type {
  EmploymentType, HomePropertyType, CommercialPropertyType, IndustrialPropertyType, PropertyType
} from "@/lib/applicationTypes";

interface EmploymentStepProps {
  cardCn: string;
}

export const EmploymentStep: React.FC<EmploymentStepProps> = ({ cardCn }) => {
  const rawStore = useApplicationStore();

  // Wrap rawStore to guarantee nested objects exist during early hydration phases
  const store = {
    ...rawStore,
    basicKYC: rawStore.basicKYC || {
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
    },
    financialDetails: rawStore.financialDetails || { path: null, data: {} },
    loanRequirements: rawStore.loanRequirements || {
      loanType: 'PERSONAL_LOAN' as any,
      loanAmount: 500000,
      tenureYears: 5,
      purpose: '',
      cibilScore: 750,
    },
    validationErrors: rawStore.validationErrors || {},
  };

  const errors = store.validationErrors;
  const setErrors = store.setValidationErrors || (() => {});

  return (
    <div id="section-employment" className={cn(cardCn, 'transition-all duration-500')}>
      <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-secondary dark:bg-[#0d1829] border border-border dark:border-white/[0.06] flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-primary dark:text-[#103783]" />
          </div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">Employment & Income</h3>
        </div>

        <div className="space-y-6 relative z-10">
          <PillSelector<EmploymentType>
            label="What describes you best?"
            icon={Briefcase}
            options={EMPLOYMENT_OPTIONS}
            value={store.basicKYC.employmentType}
            onChange={(v) => {
              store.updateBasicKYC({ employmentType: v });
              setErrors({});
            }}
          />
          {errors.employmentType && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 font-medium ml-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.employmentType}
            </motion.p>
          )}

          <EmploymentDetailsFields
            employmentType={store.basicKYC.employmentType}
            financialDetails={store.financialDetails}
            onUpdateSalaried={store.updateSalariedDetails}
            onUpdateProfessional={store.updateProfessionalDetails}
            onUpdateBusiness={store.updateBusinessDetails}
            onSelectOtherProfession={() => {
              store.updateBasicKYC({ employmentType: 'SELF_EMPLOYED' });
              store.updateBusinessDetails({});
              setErrors({});
            }}
            loanType={store.loanRequirements.loanType}
            errors={errors}
            vehicleOnRoadPrice={store.loanRequirements.vehicleOnRoadPrice}
            vehicleQuotationPrice={store.loanRequirements.vehicleQuotationPrice}
            onUpdateLoanRequirements={store.updateLoanRequirements}
          />

          {/* ── Conditional Property Selectors based on Loan Type (Moved to Stage 2) ── */}
          <AnimatePresence mode="popLayout">
            {(store.loanRequirements.loanType === "HOME_LOAN" || store.loanRequirements.loanType === "LAP" || store.loanRequirements.loanType === "BUSINESS_LOAN") && (
              <motion.div
                key="property-selectors"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
                className="p-5 rounded-2xl border border-primary/10 bg-primary/5 dark:bg-[#103783]/10 overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Home className="w-4 h-4 text-primary dark:text-[#103783]" />
                  <h4 className="text-sm font-bold text-foreground">Property Type Selection</h4>
                </div>
                <div className="space-y-4">
                  {store.loanRequirements.loanType === "LAP" && (
                    <StyledSelect
                      label="Type of Property"
                      value={store.loanRequirements.propertyCategory || ""}
                      onValueChange={(v) => {
                        const category = v as 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL';
                        store.updateLoanRequirements({
                          propertyCategory: category,
                          propertyType: undefined,
                          // Commercial/Industrial is now selected directly at this tier, so
                          // businessPropertyCategory mirrors it immediately -- no separate
                          // "Business Property Category" step needed for LAP anymore.
                          businessPropertyCategory: category === 'RESIDENTIAL' ? undefined : category,
                        });
                      }}
                      placeholder="Select category"
                    >
                      <SelectItem value="RESIDENTIAL" className="cursor-pointer">Residential</SelectItem>
                      <SelectItem value="COMMERCIAL" className="cursor-pointer">Commercial</SelectItem>
                      <SelectItem value="INDUSTRIAL" className="cursor-pointer">Industrial</SelectItem>
                    </StyledSelect>
                  )}

                  {(store.loanRequirements.loanType === "HOME_LOAN" || (store.loanRequirements.loanType === "LAP" && store.loanRequirements.propertyCategory === "RESIDENTIAL")) && (
                    <StyledSelect
                      label="Property"
                      value={store.loanRequirements.propertyType || ""}
                      onValueChange={(v) => store.updateLoanRequirements({ propertyType: v as Extract<PropertyType, HomePropertyType> })}
                      placeholder="Select property type"
                    >
                      <SelectItem value="FLAT" className="cursor-pointer">Flat / Apartment</SelectItem>
                      <SelectItem value="HOME" className="cursor-pointer">Independent House / Villa</SelectItem>
                      <SelectItem value="PLOT" className="cursor-pointer">Plot / Land</SelectItem>
                    </StyledSelect>
                  )}

                  {((store.loanRequirements.loanType === "LAP" && (store.loanRequirements.propertyCategory === "COMMERCIAL" || store.loanRequirements.propertyCategory === "INDUSTRIAL")) || store.loanRequirements.loanType === "BUSINESS_LOAN") && (
                    <>
                      {/* LAP already selected Commercial/Industrial in the "Type of Property"
                          tier above (which mirrors it into businessPropertyCategory), so this
                          selector is only needed for Business Loan, which has no earlier tier. */}
                      {store.loanRequirements.loanType === "BUSINESS_LOAN" && (
                        <StyledSelect
                          label="Type of Property"
                          value={store.loanRequirements.businessPropertyCategory || ""}
                          onValueChange={(v) => store.updateLoanRequirements({ businessPropertyCategory: v as 'COMMERCIAL' | 'INDUSTRIAL', propertyType: undefined })}
                          placeholder="Select category"
                        >
                          <SelectItem value="COMMERCIAL" className="cursor-pointer">Commercial</SelectItem>
                          <SelectItem value="INDUSTRIAL" className="cursor-pointer">Industrial</SelectItem>
                        </StyledSelect>
                      )}

                      {store.loanRequirements.businessPropertyCategory === "COMMERCIAL" && (
                        <StyledSelect
                          label="Commercial Property"
                          value={store.loanRequirements.propertyType || ""}
                          onValueChange={(v) => store.updateLoanRequirements({ propertyType: v as Extract<PropertyType, CommercialPropertyType> })}
                          placeholder="Select commercial property"
                        >
                          <SelectItem value="HOSPITAL" className="cursor-pointer">Hospital</SelectItem>
                          <SelectItem value="HOSTEL" className="cursor-pointer">Hostel</SelectItem>
                          <SelectItem value="RESTAURANTS" className="cursor-pointer">Restaurants</SelectItem>
                          <SelectItem value="HOTEL" className="cursor-pointer">Hotel</SelectItem>
                          <SelectItem value="MARRIAGE_GARDEN" className="cursor-pointer">Marriage Garden</SelectItem>
                          <SelectItem value="SCHOOL" className="cursor-pointer">School</SelectItem>
                          <SelectItem value="SHOP" className="cursor-pointer">Shop</SelectItem>
                          <SelectItem value="WAREHOUSE" className="cursor-pointer">Warehouse</SelectItem>
                          <SelectItem value="GODOWN" className="cursor-pointer">Godown</SelectItem>
                        </StyledSelect>
                      )}

                      {store.loanRequirements.businessPropertyCategory === "INDUSTRIAL" && (
                        <StyledSelect
                          label="Industrial Property"
                          value={store.loanRequirements.propertyType || ""}
                          onValueChange={(v) => store.updateLoanRequirements({ propertyType: v as Extract<PropertyType, IndustrialPropertyType> })}
                          placeholder="Select industrial property"
                        >
                          <SelectItem value="FACTORIES" className="cursor-pointer">Factories</SelectItem>
                          <SelectItem value="WAREHOUSES" className="cursor-pointer">Warehouses</SelectItem>
                          <SelectItem value="DISTRIBUTION_CENTER" className="cursor-pointer">Distribution Center</SelectItem>
                          <SelectItem value="R_AND_D_FACILITY" className="cursor-pointer">R&D Facility</SelectItem>
                          <SelectItem value="FLEX_SPACES" className="cursor-pointer">Flex Spaces</SelectItem>
                        </StyledSelect>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
  );
};
