import { useEffect, useRef, useState } from "react";
import {
  User, Calendar, MapPin, Building, Building2, CreditCard, Phone,
  Users, GraduationCap, IndianRupee, Briefcase, Landmark, Camera,
  Loader2, Percent, FileText, Stethoscope, Scale, Home, UserPlus
} from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { PrymeAPI } from "@/lib/api";
import { useApplicationStore } from "@/store/applicationStore";
import { findBankLogoByName } from "@/pages/ApplyDirect";
import {
  ValidatedInput, StyledSelect, PillSelector, FrozenField,
} from "@/components/loan/shared/FormComponents";
import {
  SALARIED_LABELS, PROFESSIONAL_LABELS, BUSINESS_LABELS,
  PROFESSION_SUB_SPECIALTIES,
} from "@/lib/applicationTypes";
import type {
  ReferenceContact, ModeOfWork, AddressOwnership,
  SalariedDetails, ProfessionalDetails, BusinessDetails, FinancialDetails,
} from "@/lib/applicationTypes";

const MARITAL_STATUS_OPTIONS = ["Single", "Married", "Divorced", "Widowed"];
const RELIGION_OPTIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Parsi", "Other"];
const QUALIFICATION_OPTIONS = ["Undergraduate", "Graduate", "Postgraduate", "Doctorate", "Other"];

// Shared shape both BasicKYC and CoApplicantDetails satisfy structurally —
// lets one PersonalInfoSection serve both without a generic.
interface PersonalProfileHolder {
  fullName: string;
  dateOfBirth: string;
  pinCode: string;
  state?: string;
  city?: string;
  email?: string;
  religion?: string;
  emailOfficial?: string;
  motherName?: string;
  maritalStatus?: string;
  spouseName?: string;
  qualification?: string;
  numberOfDependents?: number;
  currentAddress?: string;
  currentAddressType?: AddressOwnership;
  permanentAddress?: string;
  permanentAddressType?: AddressOwnership;
  references?: [ReferenceContact, ReferenceContact];
}

const emptyReferences: [ReferenceContact, ReferenceContact] = [
  { name: "", phone: "" },
  { name: "", phone: "" },
];

// ─── Loan Details bar ────────────────────────────────────────────────────

function LoanDetailsBar() {
  const loanRequirements = useApplicationStore((s) => s.loanRequirements);
  const bankLogo = findBankLogoByName(loanRequirements.selectedBankName);

  return (
    <div className="p-5 md:p-6 rounded-2xl border border-border bg-secondary/20 dark:bg-white/[0.02]">
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Loan Details</h3>
        {bankLogo && (
          <img src={bankLogo} alt={loanRequirements.selectedBankName} className="h-8 object-contain shrink-0" />
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FrozenField label="Loan Amount" icon={IndianRupee} value={loanRequirements.loanAmount} formatAsCurrency />
        <FrozenField label="Tenure" icon={Calendar} value={loanRequirements.tenureYears ? `${loanRequirements.tenureYears} yrs` : undefined} />
        <FrozenField label="Credit Score" icon={CreditCard} value={loanRequirements.cibilScore || undefined} />
        <FrozenField label="Property Value" icon={Home} value={loanRequirements.propertyValue} formatAsCurrency />
      </div>
    </div>
  );
}

// ─── Photo upload widgets ────────────────────────────────────────────────

function CircularPhotoUpload({
  label, imageUrl, isUploading, onUpload, disabled, disabledHint,
}: {
  label: string; imageUrl?: string; isUploading: boolean;
  onUpload: (file: File) => void; disabled?: boolean; disabledHint?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-2" title={disabled ? disabledHint : undefined}>
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/10 border-2 border-border flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
          ) : (
            <User className="w-7 h-7 text-slate-400" />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            </div>
          )}
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg,image/png" disabled={disabled || isUploading} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-white rounded-lg shadow-lg hover:scale-110 transition-transform disabled:opacity-40 disabled:hover:scale-100"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      </div>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}

function PhotoUploadPair({ applicationId, existingCoApplicantPhotoUrl }: { applicationId?: string; existingCoApplicantPhotoUrl?: string }) {
  const [applicantPhotoUrl, setApplicantPhotoUrl] = useState<string | undefined>(undefined);
  const [isApplicantUploading, setIsApplicantUploading] = useState(false);
  const [coApplicantPhotoUrl, setCoApplicantPhotoUrl] = useState<string | undefined>(existingCoApplicantPhotoUrl);
  const [isCoApplicantUploading, setIsCoApplicantUploading] = useState(false);

  useEffect(() => {
    PrymeAPI.getProfile().then((res: any) => {
      if (res?.profilePictureUrl) setApplicantPhotoUrl(res.profilePictureUrl);
    }).catch(() => {});
  }, []);

  const handleApplicantUpload = async (file: File) => {
    setIsApplicantUploading(true);
    try {
      const { data, error } = await PrymeAPI.initiateAvatarUpload(file.type);
      if (error || !data?.uploadUrl) throw new Error(error?.message || "Could not get upload URL");

      const s3Response = await fetch(data.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!s3Response.ok) throw new Error("Upload rejected by secure vault. Please try again.");

      // 🧠 data.documentId is the raw S3 object key, not a viewable URL -- updateProfile's
      // response re-resolves it into a presigned download URL (same as getProfile does on
      // load), so use that for the preview instead of the raw key.
      const updated: any = await PrymeAPI.updateProfile({ profilePictureUrl: data.documentId });
      setApplicantPhotoUrl(updated?.profilePictureUrl || data.documentId);
      toast({ title: "Photo Updated", description: "Applicant photo has been saved." });
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err?.message || "Could not upload the applicant's photo.", variant: "destructive" });
    } finally {
      setIsApplicantUploading(false);
    }
  };

  const handleCoApplicantUpload = async (file: File) => {
    if (!applicationId) return;
    setIsCoApplicantUploading(true);
    try {
      const { error } = await PrymeAPI.uploadApplicationDocument(applicationId, "Co-Applicant Photo", file);
      if (error) throw new Error(error.message);
      setCoApplicantPhotoUrl(URL.createObjectURL(file));
      toast({ title: "Photo Updated", description: "Co-applicant photo has been saved." });
    } catch {
      toast({ title: "Upload Failed", description: "Could not upload the co-applicant's photo.", variant: "destructive" });
    } finally {
      setIsCoApplicantUploading(false);
    }
  };

  return (
    <div className="flex items-start gap-6">
      <CircularPhotoUpload label="Applicant" imageUrl={applicantPhotoUrl} isUploading={isApplicantUploading} onUpload={handleApplicantUpload} />
      <CircularPhotoUpload
        label="Coapplicant"
        imageUrl={coApplicantPhotoUrl}
        isUploading={isCoApplicantUploading}
        onUpload={handleCoApplicantUpload}
        disabled={!applicationId}
        disabledHint="Save your application first to add a co-applicant photo"
      />
    </div>
  );
}

// ─── Personal Information section (reused for applicant + co-applicant) ──

function PersonalInfoSection({
  data, onUpdate, isCoApplicant,
}: {
  data: PersonalProfileHolder;
  onUpdate: (patch: Partial<PersonalProfileHolder>) => void;
  isCoApplicant?: boolean;
}) {
  const refs = data.references || emptyReferences;
  const updateReference = (idx: 0 | 1, patch: Partial<ReferenceContact>) => {
    const next: [ReferenceContact, ReferenceContact] = [{ ...refs[0] }, { ...refs[1] }];
    next[idx] = { ...next[idx], ...patch };
    onUpdate({ references: next });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FrozenField label="Full Name" icon={User} value={data.fullName} />
        <FrozenField label="Date of Birth" icon={Calendar} value={data.dateOfBirth} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {isCoApplicant ? (
          <>
            <ValidatedInput label="State" icon={MapPin} value={data.state || ""} onChange={(e: any) => onUpdate({ state: e.target.value })} />
            <ValidatedInput label="City" icon={Building} value={data.city || ""} onChange={(e: any) => onUpdate({ city: e.target.value })} />
          </>
        ) : (
          <>
            <FrozenField label="State" icon={MapPin} value={data.state} />
            <FrozenField label="City" icon={Building} value={data.city} />
          </>
        )}
        <FrozenField label="PIN Code" icon={MapPin} value={data.pinCode} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StyledSelect label="Religion" icon={Users} value={data.religion} onValueChange={(v) => onUpdate({ religion: v })} placeholder="Select religion">
          {RELIGION_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
        </StyledSelect>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <ValidatedInput label="Current Address" icon={Home} value={data.currentAddress || ""} onChange={(e: any) => onUpdate({ currentAddress: e.target.value })} />
          <PillSelector<AddressOwnership>
            label="Current Address Type"
            options={[{ value: "OWNED", label: "Owned" }, { value: "RENTED", label: "Rented" }]}
            value={data.currentAddressType || null}
            onChange={(v) => onUpdate({ currentAddressType: v })}
          />
        </div>
        <div className="space-y-2">
          <ValidatedInput label="Permanent Address" icon={Home} value={data.permanentAddress || ""} onChange={(e: any) => onUpdate({ permanentAddress: e.target.value })} />
          <PillSelector<AddressOwnership>
            label="Permanent Address Type"
            options={[{ value: "OWNED", label: "Owned" }, { value: "RENTED", label: "Rented" }]}
            value={data.permanentAddressType || null}
            onChange={(v) => onUpdate({ permanentAddressType: v })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <ValidatedInput label="Mother's Name" icon={User} value={data.motherName || ""} onChange={(e: any) => onUpdate({ motherName: e.target.value })} />
        <StyledSelect label="Marital Status" icon={Users} value={data.maritalStatus} onValueChange={(v) => onUpdate({ maritalStatus: v })} placeholder="Select status">
          {MARITAL_STATUS_OPTIONS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
        </StyledSelect>
        {data.maritalStatus === "Married" && (
          <ValidatedInput label="Spouse Name" icon={User} value={data.spouseName || ""} onChange={(e: any) => onUpdate({ spouseName: e.target.value })} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StyledSelect label="Qualification" icon={GraduationCap} value={data.qualification} onValueChange={(v) => onUpdate({ qualification: v })} placeholder="Select qualification">
          {QUALIFICATION_OPTIONS.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
        </StyledSelect>
        <ValidatedInput
          label="No. of Dependents" icon={Users} type="number"
          value={data.numberOfDependents ?? ""}
          onChange={(e: any) => onUpdate({ numberOfDependents: e.target.value === "" ? undefined : Number(e.target.value) })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="grid grid-cols-2 gap-3 md:col-span-2 md:grid-cols-4">
          <ValidatedInput label="Reference 1 Name" icon={UserPlus} value={refs[0].name} onChange={(e: any) => updateReference(0, { name: e.target.value })} />
          <ValidatedInput label="Reference 1 Phone" icon={Phone} value={refs[0].phone} onChange={(e: any) => updateReference(0, { phone: e.target.value })} />
          <ValidatedInput label="Reference 2 Name" icon={UserPlus} value={refs[1].name} onChange={(e: any) => updateReference(1, { name: e.target.value })} />
          <ValidatedInput label="Reference 2 Phone" icon={Phone} value={refs[1].phone} onChange={(e: any) => updateReference(1, { phone: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

// ─── Occupation section (reused for applicant + co-applicant) ────────────

function OccupationSection({ financialDetails }: { financialDetails: FinancialDetails }) {
  if (financialDetails.path === "SALARIED") {
    const d = financialDetails.data as SalariedDetails;
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FrozenField label="Employer Type" icon={Briefcase} value={d.subType ? SALARIED_LABELS[d.subType] : undefined} />
          <FrozenField label="Company Name" icon={Building2} value={d.companyName} />
          <FrozenField label="Designation" icon={Briefcase} value={d.designation} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FrozenField label="Gross Monthly Income" icon={IndianRupee} value={d.grossSalary} formatAsCurrency />
          <FrozenField label="Net Monthly Income" icon={IndianRupee} value={d.netMonthlySalary} formatAsCurrency />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FrozenField label="Current Experience" icon={Calendar} value={d.currentCompanyYears ? `${d.currentCompanyYears} yrs` : undefined} />
          <FrozenField label="Total Experience" icon={Calendar} value={d.totalExperienceYears ? `${d.totalExperienceYears} yrs` : undefined} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FrozenField label="Current Monthly EMI" icon={IndianRupee} value={d.existingEMI} formatAsCurrency />
          <FrozenField label="EMIs Closing in 12 Months" icon={IndianRupee} value={d.maturingLoanEMI} formatAsCurrency />
        </div>
      </div>
    );
  }

  if (financialDetails.path === "PROFESSIONAL") {
    const d = financialDetails.data as ProfessionalDetails;
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FrozenField label="Profession" icon={Scale} value={d.subType ? PROFESSIONAL_LABELS[d.subType] : undefined} />
          <FrozenField label="Practice / Firm Name" icon={Building2} value={d.practiceName} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FrozenField label="Annual Gross Receipts" icon={IndianRupee} value={d.annualGrossReceipts} formatAsCurrency />
          <FrozenField label="Annual Income (As Per ITR)" icon={IndianRupee} value={d.netMonthlyIncome ? d.netMonthlyIncome * 12 : undefined} formatAsCurrency />
        </div>
        <FrozenField label="Current Office Address" icon={Home} value={d.practiceAddress} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FrozenField label="Current Monthly EMI" icon={IndianRupee} value={d.existingEMI} formatAsCurrency />
          <FrozenField label="EMIs Closing in 12 Months" icon={IndianRupee} value={d.maturingLoanEMI} formatAsCurrency />
        </div>
      </div>
    );
  }

  if (financialDetails.path === "SELF_EMPLOYED") {
    const d = financialDetails.data as BusinessDetails;
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FrozenField label="Business Domain" icon={Landmark} value={d.industryType} />
          <FrozenField label="Business Vintage" icon={Calendar} value={d.vintageYears ? `${d.vintageYears} yrs` : undefined} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FrozenField label="Annual Income (As Per ITR)" icon={IndianRupee} value={d.netProfit} formatAsCurrency />
          <FrozenField label="Total GST Turnover (Last 12 Months)" icon={Percent} value={d.last12MonthsGstTurnover} formatAsCurrency />
        </div>
        <FrozenField label="Annual Turnover" icon={IndianRupee} value={d.annualTurnover} formatAsCurrency />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FrozenField label="Current Monthly EMI" icon={IndianRupee} value={d.existingEMI} formatAsCurrency />
          <FrozenField label="EMIs Closing in 12 Months" icon={IndianRupee} value={d.maturingLoanEMI} formatAsCurrency />
        </div>
      </div>
    );
  }

  return (
    <p className="text-sm text-muted-foreground italic">Employment details were not captured in the original application.</p>
  );
}

// New fields layered on top of the frozen occupation summary, editable
// regardless of which employment path was originally selected.
function OccupationNewFieldsSection({
  financialDetails, onUpdateSalaried, onUpdateProfessional, onUpdateBusiness,
}: {
  financialDetails: FinancialDetails;
  onUpdateSalaried: (data: Partial<SalariedDetails>) => void;
  onUpdateProfessional: (data: Partial<ProfessionalDetails>) => void;
  onUpdateBusiness: (data: Partial<BusinessDetails>) => void;
}) {
  if (financialDetails.path === "SALARIED") {
    const d = financialDetails.data as SalariedDetails;
    return (
      <div className="space-y-5 pt-1">
        <PillSelector<ModeOfWork>
          label="Mode of Work"
          options={[{ value: "REMOTE", label: "Remote" }, { value: "ONSITE", label: "On-site" }, { value: "HYBRID", label: "Hybrid" }]}
          value={d.modeOfWork || null}
          onChange={(v) => onUpdateSalaried({ modeOfWork: v })}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ValidatedInput label="Current Office Address" icon={Home} value={d.officeAddress || ""} onChange={(e: any) => onUpdateSalaried({ officeAddress: e.target.value })} />
          <ValidatedInput label="Rental Income (If Any)" icon={IndianRupee} formatAsCurrency value={d.rentalIncome ?? ""} onChange={(e: any) => onUpdateSalaried({ rentalIncome: e.target.value === "" ? undefined : Number(e.target.value) })} />
        </div>
      </div>
    );
  }

  if (financialDetails.path === "PROFESSIONAL") {
    const d = financialDetails.data as ProfessionalDetails;
    const subSpecialties = d.subType ? PROFESSION_SUB_SPECIALTIES[d.subType] : undefined;
    if (!subSpecialties) return null;
    return (
      <StyledSelect label={`${PROFESSIONAL_LABELS[d.subType]} Specialty`} icon={Stethoscope} value={d.professionSubSpecialty} onValueChange={(v) => onUpdateProfessional({ professionSubSpecialty: v })} placeholder="Select specialty">
        {subSpecialties.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
      </StyledSelect>
    );
  }

  if (financialDetails.path === "SELF_EMPLOYED") {
    const d = financialDetails.data as BusinessDetails;
    return (
      <ValidatedInput label="Nature of Work" icon={FileText} value={d.natureOfWork || ""} onChange={(e: any) => onUpdateBusiness({ natureOfWork: e.target.value })} />
    );
  }

  return null;
}

// ─── Root component ───────────────────────────────────────────────────────

export function CustomerLoanInformationStep({
  applicationId, existingCoApplicantPhotoUrl,
}: {
  applicationId?: string;
  existingCoApplicantPhotoUrl?: string;
}) {
  const store = useApplicationStore();
  const hasCoApplicant = store.financialFootprint?.hasCoApplicant;
  const coApplicant = store.financialFootprint?.coApplicantDetails;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1">
          <LoanDetailsBar />
        </div>
        <PhotoUploadPair applicationId={applicationId} existingCoApplicantPhotoUrl={existingCoApplicantPhotoUrl} />
      </div>

      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Applicant Information
        </h3>
        <PersonalInfoSection data={store.basicKYC} onUpdate={store.updateBasicKYC} />

        <h4 className="text-sm font-bold text-foreground flex items-center gap-2 pt-2">
          <Briefcase className="w-4 h-4 text-primary" /> Occupation
        </h4>
        <OccupationSection financialDetails={store.financialDetails} />
        <OccupationNewFieldsSection
          financialDetails={store.financialDetails}
          onUpdateSalaried={store.updateSalariedDetails}
          onUpdateProfessional={store.updateProfessionalDetails}
          onUpdateBusiness={store.updateBusinessDetails}
        />
      </div>

      {hasCoApplicant && coApplicant && (
        <div className="space-y-4 pt-4 border-t border-border">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Co-Applicant Information
          </h3>
          <PersonalInfoSection data={coApplicant} onUpdate={store.updateCoApplicantDetails} isCoApplicant />

          <h4 className="text-sm font-bold text-foreground flex items-center gap-2 pt-2">
            <Briefcase className="w-4 h-4 text-primary" /> Occupation
          </h4>
          <OccupationSection financialDetails={coApplicant.financialDetails} />
          <OccupationNewFieldsSection
            financialDetails={coApplicant.financialDetails}
            onUpdateSalaried={store.updateCoApplicantSalariedDetails}
            onUpdateProfessional={store.updateCoApplicantProfessionalDetails}
            onUpdateBusiness={store.updateCoApplicantBusinessDetails}
          />
        </div>
      )}
    </div>
  );
}

export default CustomerLoanInformationStep;
