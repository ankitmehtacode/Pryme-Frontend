// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 PRYME PROGRESSIVE PROFILING ENGINE — ZUSTAND APPLICATION STORE
// ═══════════════════════════════════════════════════════════════════════════════
// Zustand store with `persist` middleware piped to sessionStorage.
// Every mutation auto-serializes. On tab refresh the user's progress is
// fully hydrated — zero data loss, zero friction.
//
// Architecture notes:
// • immer-style immutable updates via shallow spread (no immer dependency)
// • `partialize` keeps only serializable ApplicationState keys in storage
// • Version-stamped: if the schema changes, stale sessions are auto-purged
// ═══════════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ApplicationStore,
  ApplicationState,
  BasicKYC,
  FinancialDetails,
  FinancialFootprint,
  SalariedDetails,
  ProfessionalDetails,
  BusinessDetails,
  LoanRequirements,
  DocumentItem,
  DocumentStatus,
  StageNumber,
  CoApplicantDetails,
} from '@/lib/applicationTypes';
import { generateSafeUUID } from '@/lib/utils';

// ─── DEFAULT STATE FACTORY ──────────────────────────────────────────────────

const createFreshState = (): ApplicationState => ({
  applicationId: generateSafeUUID(),
  currentStage: 1,
  completedStages: [],
  createdAt: new Date().toISOString(),
  lastModifiedAt: new Date().toISOString(),

  basicKYC: {
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

  financialDetails: { path: null, data: {} } as FinancialDetails,

  loanRequirements: {
    loanType: '',
    loanAmount: 0,
    tenureYears: 0,
    purpose: '',
    cibilScore: 0,
  },

  financialFootprint: {
    panNumber: '',
    totalExistingEMI: 0,
    primaryBankName: '',
    hasCoApplicant: false,
    propertyIdentified: false,
    estimatedPropertyValue: 0,
    isAbove50Lakhs: false,
    coApplicantDetails: {
      fullName: '',
      mobileNumber: '',
      relationship: '',
      dateOfBirth: '',
      pinCode: '',
      employmentType: null,
      companyName: '',
      netMonthlySalary: '',
      financialDetails: { path: null, data: {} } as FinancialDetails,
    },
  },

  documents: [],

  consent: {
    termsAccepted: false,
    cibilPullAuthorized: false,
    dataSharingAuthorized: false,
  },

  validationErrors: {},
});

// ─── DEFAULT SUB-TYPE FACTORIES ─────────────────────────────────────────────
// When the user selects an employment path for the first time, we scaffold
// the data object with sensible defaults so the form renders immediately.

const defaultSalaried: SalariedDetails = {
  subType: 'PRIVATE',
  companyName: '',
  designation: '',
  officialEmail: '',
  totalExperienceYears: 0,
  currentCompanyYears: 0,
  grossSalary: 0,
  netMonthlySalary: 0,
  hasExistingLoans: false,
  existingEMI: undefined,
};

const defaultProfessional: ProfessionalDetails = {
  subType: 'CA',
  registrationNumber: '',
  practiceName: '',
  practiceYears: 0,
  totalPracticeYears: 0,
  yearsInCurrentFirm: 0,
  practiceAddress: '',
  annualGrossReceipts: 0,
  netMonthlyIncome: 0,
  itrFiledYears: undefined,
  last12MonthsGstTurnover: undefined,
  annualDepreciation: undefined,
  caCertifiedAccounts: false,
  hasExistingLoans: false,
  existingEMI: undefined,
};

const defaultBusiness: BusinessDetails = {
  subType: 'ITR_BASED',
  businessName: '',
  entityType: 'PROPRIETORSHIP',
  industryType: '',
  vintageYears: 0,
  gstRegistrationDate: undefined,
  businessAddress: '',
  // ITR fields
  annualTurnover: 0,
  netProfit: 0,
  itrFiledYears: undefined,
  depreciation: 0,                   // P&L add-back for LAP / HOME_LOAN
  // GST fields
  gstNumber: undefined,
  last12MonthsGstTurnover: 0,        // new primary GST income field
  monthlyGSTTurnover: 0,
  // Banking
  abbTier: undefined,
  primaryBankName: undefined,
  accountHeldMonths: undefined,
  // Compliance
  isCaCertifiedOrAudited: false,     // boolean — must default false not undefined
  // Common
  netMonthlyIncome: 0,
  hasExistingLoans: false,
  existingEMI: undefined,
};

const defaultCoApplicant = (): CoApplicantDetails => ({
  fullName: '',
  mobileNumber: '',
  relationship: '',
  dateOfBirth: '',
  pinCode: '',
  employmentType: null,
  companyName: '',
  netMonthlySalary: '',
  financialDetails: { path: null, data: {} } as FinancialDetails,
});

// ─── STORE SCHEMA VERSION ───────────────────────────────────────────────────
// Bump this when the ApplicationState shape changes. Zustand's persist
// middleware uses this to decide whether to hydrate or purge stale data.

const STORE_VERSION = 6;

// ─── THE STORE ──────────────────────────────────────────────────────────────

export const useApplicationStore = create<ApplicationStore>()(
  persist(
    (set, get) => ({
      // ── Spread the default state ──────────────────────────────────────
      ...createFreshState(),

      // ══════════════════════════════════════════════════════════════════
      // NAVIGATION
      // ══════════════════════════════════════════════════════════════════

      setStage: (stage: StageNumber) =>
        set({
          currentStage: stage,
          lastModifiedAt: new Date().toISOString(),
        }),

      completeStage: (stage: StageNumber) =>
        set((state) => ({
          completedStages: state.completedStages.includes(stage)
            ? state.completedStages
            : [...state.completedStages, stage],
          lastModifiedAt: new Date().toISOString(),
        })),

      // ══════════════════════════════════════════════════════════════════
      // DATA MUTATORS
      // ══════════════════════════════════════════════════════════════════

      updateBasicKYC: (data: Partial<BasicKYC>) =>
        set((state) => {
          const updatedKYC = { ...state.basicKYC, ...data };

          // 🧠 CRITICAL: If employmentType changed, reset financialDetails
          // to prevent stale data from a previous path leaking through
          const employmentChanged =
            data.employmentType !== undefined &&
            data.employmentType !== state.basicKYC.employmentType;

          return {
            basicKYC: updatedKYC,
            financialDetails: employmentChanged
              ? { path: null, data: {} } as FinancialDetails
              : state.financialDetails,
            lastModifiedAt: new Date().toISOString(),
          };
        }),

      updateFinancialDetails: (details: FinancialDetails) =>
        set({
          financialDetails: details,
          lastModifiedAt: new Date().toISOString(),
        }),

      updateSalariedDetails: (data: Partial<SalariedDetails>) =>
        set((state) => {
          // 3-way merge: default seeds missing keys → persisted overwrites → update applies
          const persisted = state.financialDetails.path === 'SALARIED'
            ? state.financialDetails.data
            : ({} as Partial<SalariedDetails>);
          return {
            financialDetails: {
              path: 'SALARIED' as const,
              data: { ...defaultSalaried, ...persisted, ...data },
            },
            lastModifiedAt: new Date().toISOString(),
          };
        }),

      updateProfessionalDetails: (data: Partial<ProfessionalDetails>) =>
        set((state) => {
          // 3-way merge: default seeds missing keys → persisted overwrites → update applies
          const persisted = state.financialDetails.path === 'PROFESSIONAL'
            ? state.financialDetails.data
            : ({} as Partial<ProfessionalDetails>);
          return {
            financialDetails: {
              path: 'PROFESSIONAL' as const,
              data: { ...defaultProfessional, ...persisted, ...data },
            },
            lastModifiedAt: new Date().toISOString(),
          };
        }),

      updateBusinessDetails: (data: Partial<BusinessDetails>) =>
        set((state) => {
          // 3-way merge: default seeds missing keys → persisted overwrites → update applies
          const persisted = state.financialDetails.path === 'SELF_EMPLOYED'
            ? state.financialDetails.data
            : ({} as Partial<BusinessDetails>);
          return {
            financialDetails: {
              path: 'SELF_EMPLOYED' as const,
              data: { ...defaultBusiness, ...persisted, ...data },
            },
            lastModifiedAt: new Date().toISOString(),
          };
        }),

      updateLoanRequirements: (data: Partial<LoanRequirements>) =>
        set((state) => ({
          loanRequirements: { ...state.loanRequirements, ...data },
          lastModifiedAt: new Date().toISOString(),
        })),

      updateFinancialFootprint: (data: Partial<FinancialFootprint>) =>
        set((state) => ({
          financialFootprint: { ...state.financialFootprint, ...data },
          lastModifiedAt: new Date().toISOString(),
        })),

      updateCoApplicantDetails: (data: Partial<CoApplicantDetails>) =>
        set((state) => {
          const existing = state.financialFootprint?.coApplicantDetails || defaultCoApplicant();

          // Mirrors updateBasicKYC: if employmentType changed, reset financialDetails
          // to prevent stale data from a previous path leaking through.
          const employmentChanged =
            data.employmentType !== undefined &&
            data.employmentType !== existing.employmentType;

          return {
            financialFootprint: {
              ...state.financialFootprint,
              coApplicantDetails: {
                ...existing,
                ...data,
                financialDetails: employmentChanged
                  ? ({ path: null, data: {} } as FinancialDetails)
                  : existing.financialDetails,
              },
            },
            lastModifiedAt: new Date().toISOString(),
          };
        }),

      // Mirrors updateSalariedDetails/updateProfessionalDetails/updateBusinessDetails
      // above, but scoped to financialFootprint.coApplicantDetails.financialDetails
      // instead of the root financialDetails — so the co-applicant employment form
      // reuses the exact same fields/defaults/3-way-merge behavior as the primary
      // applicant's.
      updateCoApplicantSalariedDetails: (data: Partial<SalariedDetails>) =>
        set((state) => {
          const coApplicant = state.financialFootprint?.coApplicantDetails || defaultCoApplicant();
          const persisted = coApplicant.financialDetails?.path === 'SALARIED'
            ? coApplicant.financialDetails.data
            : ({} as Partial<SalariedDetails>);
          return {
            financialFootprint: {
              ...state.financialFootprint,
              coApplicantDetails: {
                ...coApplicant,
                financialDetails: {
                  path: 'SALARIED' as const,
                  data: { ...defaultSalaried, ...persisted, ...data },
                },
              },
            },
            lastModifiedAt: new Date().toISOString(),
          };
        }),

      updateCoApplicantProfessionalDetails: (data: Partial<ProfessionalDetails>) =>
        set((state) => {
          const coApplicant = state.financialFootprint?.coApplicantDetails || defaultCoApplicant();
          const persisted = coApplicant.financialDetails?.path === 'PROFESSIONAL'
            ? coApplicant.financialDetails.data
            : ({} as Partial<ProfessionalDetails>);
          return {
            financialFootprint: {
              ...state.financialFootprint,
              coApplicantDetails: {
                ...coApplicant,
                financialDetails: {
                  path: 'PROFESSIONAL' as const,
                  data: { ...defaultProfessional, ...persisted, ...data },
                },
              },
            },
            lastModifiedAt: new Date().toISOString(),
          };
        }),

      updateCoApplicantBusinessDetails: (data: Partial<BusinessDetails>) =>
        set((state) => {
          const coApplicant = state.financialFootprint?.coApplicantDetails || defaultCoApplicant();
          const persisted = coApplicant.financialDetails?.path === 'SELF_EMPLOYED'
            ? coApplicant.financialDetails.data
            : ({} as Partial<BusinessDetails>);
          return {
            financialFootprint: {
              ...state.financialFootprint,
              coApplicantDetails: {
                ...coApplicant,
                financialDetails: {
                  path: 'SELF_EMPLOYED' as const,
                  data: { ...defaultBusiness, ...persisted, ...data },
                },
              },
            },
            lastModifiedAt: new Date().toISOString(),
          };
        }),

      updateDocuments: (docs: DocumentItem[]) =>
        set({
          documents: docs,
          lastModifiedAt: new Date().toISOString(),
        }),

      setDocumentStatus: (
        docId: string,
        status: DocumentStatus,
        fileUrl?: string,
        fileName?: string
      ) =>
        set((state) => ({
          documents: state.documents.map((doc) =>
            doc.id === docId
              ? { ...doc, status, ...(fileUrl && { fileUrl }), ...(fileName && { fileName }) }
              : doc
          ),
          lastModifiedAt: new Date().toISOString(),
        })),

      setConsent: (field, value) =>
        set((state) => ({
          consent: { ...state.consent, [field]: value },
          lastModifiedAt: new Date().toISOString(),
        })),

      // ══════════════════════════════════════════════════════════════════
      // VALIDATION
      // ══════════════════════════════════════════════════════════════════

      setValidationErrors: (errors) =>
        set({
          validationErrors: errors,
        }),

      setValidationError: (field, error) =>
        set((state) => {
          const newErrors = { ...state.validationErrors };
          if (error) {
            newErrors[field] = error;
          } else {
            delete newErrors[field];
          }
          return { validationErrors: newErrors };
        }),

      clearValidationErrors: () =>
        set({ validationErrors: {} }),

      // ══════════════════════════════════════════════════════════════════
      // LIFECYCLE
      // ══════════════════════════════════════════════════════════════════

      resetApplication: () => {
        set(createFreshState());
      },

      // ══════════════════════════════════════════════════════════════════
      // COMPUTED HELPERS (read-only, no mutation)
      // ══════════════════════════════════════════════════════════════════

      getActiveEmploymentPath: () => get().basicKYC.employmentType,

      getProgress: () => {
        const { completedStages } = get();
        return Math.round((completedStages.length / 5) * 100);
      },

      isStageAccessible: (stage: StageNumber) => {
        const { currentStage, completedStages } = get();
        // Can access current stage, any completed stage, or the next uncompleted stage
        if (stage === currentStage) return true;
        if (completedStages.includes(stage)) return true;
        if (stage === currentStage + 1 && completedStages.includes(currentStage as StageNumber))
          return true;
        return false;
      },
    }),

    // ── Persist Configuration ─────────────────────────────────────────────
    {
      name: 'pryme-loan-session',
      storage: createJSONStorage(() => sessionStorage),
      version: STORE_VERSION,

      // Only persist pure data — strip out action functions
      partialize: (state) => ({
        applicationId: state.applicationId,
        currentStage: state.currentStage,
        completedStages: state.completedStages,
        createdAt: state.createdAt,
        lastModifiedAt: state.lastModifiedAt,
        basicKYC: state.basicKYC,
        financialDetails: state.financialDetails,
        loanRequirements: state.loanRequirements,
        financialFootprint: state.financialFootprint,
        documents: state.documents,
        consent: state.consent,
      }),

      // Forward-patch migration — preserves user data across schema version bumps.
      // Instead of purging, we deep-merge the persisted session over a fresh skeleton.
      // Only genuinely new fields (not in the old session) get their fresh defaults.
      // Fields the user already filled in survive the upgrade untouched.
      migrate: (persistedState, version) => {
        if (version === STORE_VERSION) {
          // Same version — no migration needed, hydrate as-is
          return persistedState as ApplicationState;
        }

        console.info(`[Pryme] Store migrated v${version} → v${STORE_VERSION} — forward-patching user data.`);
        const persisted = (persistedState ?? {}) as Partial<ApplicationState>;
        const fresh = createFreshState();

        // Patch financialDetails: re-hydrate the active path with 3-way merge so
        // new required fields get their defaults while existing user entries survive.
        let patchedFinancialDetails: ApplicationState['financialDetails'] = fresh.financialDetails;
        if (persisted.financialDetails?.path === 'SALARIED') {
          patchedFinancialDetails = {
            path: 'SALARIED',
            data: { ...defaultSalaried, ...persisted.financialDetails.data },
          };
        } else if (persisted.financialDetails?.path === 'PROFESSIONAL') {
          patchedFinancialDetails = {
            path: 'PROFESSIONAL',
            data: { ...defaultProfessional, ...persisted.financialDetails.data },
          };
        } else if (persisted.financialDetails?.path === 'SELF_EMPLOYED') {
          patchedFinancialDetails = {
            path: 'SELF_EMPLOYED',
            data: { ...defaultBusiness, ...persisted.financialDetails.data },
          };
        }

        return {
          ...fresh,
          // Preserve identity + progress
          applicationId:    persisted.applicationId    ?? fresh.applicationId,
          currentStage:     persisted.currentStage     ?? fresh.currentStage,
          completedStages:  persisted.completedStages  ?? fresh.completedStages,
          createdAt:        persisted.createdAt        ?? fresh.createdAt,
          // Merge flat sub-trees over fresh defaults so new keys appear silently
          basicKYC:           { ...fresh.basicKYC,           ...persisted.basicKYC },
          financialDetails:   patchedFinancialDetails,
          loanRequirements:   { ...fresh.loanRequirements,   ...persisted.loanRequirements },
          financialFootprint: {
            ...fresh.financialFootprint,
            ...persisted.financialFootprint,
            coApplicantDetails: {
              ...fresh.financialFootprint.coApplicantDetails,
              ...(persisted.financialFootprint?.coApplicantDetails ?? {}),
            },
          },
          documents:          persisted.documents ?? fresh.documents,
          consent:            { ...fresh.consent,            ...persisted.consent },
        } as ApplicationState;
      },
    }
  )
);
