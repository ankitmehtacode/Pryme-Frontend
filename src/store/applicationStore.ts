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
} from '@/lib/applicationTypes';

// ─── DEFAULT STATE FACTORY ──────────────────────────────────────────────────

const createFreshState = (): ApplicationState => ({
  applicationId: crypto.randomUUID(),
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

  financialDetails: { path: null, data: null },

  loanRequirements: {
    loanType: 'PERSONAL_LOAN',
    loanAmount: 500000,
    tenureYears: 5,
    purpose: '',
    cibilScore: 750,
  },

  financialFootprint: {
    panNumber: '',
    totalExistingEMI: 0,
    primaryBankName: '',
    hasCoApplicant: false,
    propertyIdentified: false,
    estimatedPropertyValue: 0,
    isAbove50Lakhs: false,
  },

  documents: [],

  consent: {
    termsAccepted: false,
    cibilPullAuthorized: false,
    dataSharingAuthorized: false,
  },
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
  netMonthlySalary: 0,
  hasExistingLoans: false,
  existingEMI: 0,
};

const defaultProfessional: ProfessionalDetails = {
  subType: 'CA',
  registrationNumber: '',
  practiceName: '',
  practiceYears: 0,
  practiceAddress: '',
  annualGrossReceipts: 0,
  netMonthlyIncome: 0,
  hasExistingLoans: false,
  existingEMI: 0,
};

const defaultBusiness: BusinessDetails = {
  subType: 'ITR_BASED',
  businessName: '',
  entityType: 'PROPRIETORSHIP',
  industryType: '',
  vintageYears: 0,
  businessAddress: '',
  netMonthlyIncome: 0,
  hasExistingLoans: false,
  existingEMI: 0,
};

// ─── STORE SCHEMA VERSION ───────────────────────────────────────────────────
// Bump this when the ApplicationState shape changes. Zustand's persist
// middleware uses this to decide whether to hydrate or purge stale data.

const STORE_VERSION = 2;

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
              ? { path: null, data: null } as FinancialDetails
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
          const current =
            state.financialDetails.path === 'SALARIED'
              ? state.financialDetails.data
              : defaultSalaried;
          return {
            financialDetails: {
              path: 'SALARIED' as const,
              data: { ...current, ...data },
            },
            lastModifiedAt: new Date().toISOString(),
          };
        }),

      updateProfessionalDetails: (data: Partial<ProfessionalDetails>) =>
        set((state) => {
          const current =
            state.financialDetails.path === 'PROFESSIONAL'
              ? state.financialDetails.data
              : defaultProfessional;
          return {
            financialDetails: {
              path: 'PROFESSIONAL' as const,
              data: { ...current, ...data },
            },
            lastModifiedAt: new Date().toISOString(),
          };
        }),

      updateBusinessDetails: (data: Partial<BusinessDetails>) =>
        set((state) => {
          const current =
            state.financialDetails.path === 'SELF_EMPLOYED'
              ? state.financialDetails.data
              : defaultBusiness;
          return {
            financialDetails: {
              path: 'SELF_EMPLOYED' as const,
              data: { ...current, ...data },
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

      // Version migration — if STORE_VERSION is bumped, purge stale data
      migrate: (persistedState, version) => {
        if (version !== STORE_VERSION) {
          console.info('[Pryme] Store schema updated — resetting application state.');
          return createFreshState();
        }
        return persistedState as ApplicationState;
      },
    }
  )
);
