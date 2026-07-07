// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 PRYME PROGRESSIVE PROFILING ENGINE — STATE MANAGEMENT HOOK
// ═══════════════════════════════════════════════════════════════════════════════
// React hook with useReducer + sessionStorage middleware.
// Every state mutation is automatically persisted. On mount, state is hydrated
// from sessionStorage so the user never loses progress.
// ═══════════════════════════════════════════════════════════════════════════════

import { useReducer, useEffect, useCallback, useRef } from 'react';
import type {
  ApplicationState,
  ApplicationAction,
  FormStep,
  BasicKYC,
  SalariedData,
  ProfessionalData,
  BusinessData,
  LoanRequirements,
  DocumentItem,
} from '@/types/application';
import { resolveDocumentMatrix } from '@/lib/documentMatrix';
import { generateSafeUUID } from '@/lib/utils';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'pryme_application_state';
const APPLICATION_VERSION = '1.0.0';

// ─── DEFAULT STATE FACTORY ──────────────────────────────────────────────────

const createDefaultState = (): ApplicationState => ({
  applicationId: generateSafeUUID(),
  status: 'DRAFT',
  currentStep: 'BASIC_KYC',
  completedSteps: [],
  createdAt: new Date().toISOString(),
  lastUpdatedAt: new Date().toISOString(),

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
    employmentCategory: null,
  },

  salariedData: null,
  professionalData: null,
  businessData: null,

  loanRequirements: {
    loanType: 'PERSONAL_LOAN',
    loanAmount: 500000,
    loanTenure: 5,
    purpose: '',
    cibilScore: 750,
  },

  documents: [],

  consentTCAccepted: false,
  consentCIBILPull: false,
  consentDataSharing: false,
});

// ─── REDUCER ────────────────────────────────────────────────────────────────

function applicationReducer(state: ApplicationState, action: ApplicationAction): ApplicationState {
  const timestamp = new Date().toISOString();

  switch (action.type) {
    case 'SET_BASIC_KYC': {
      const updatedKYC = { ...state.basicKYC, ...action.payload };

      // If employment category changed, clear the other employment data paths
      // to prevent stale data from a previous selection
      let salariedData = state.salariedData;
      let professionalData = state.professionalData;
      let businessData = state.businessData;

      if (
        action.payload.employmentCategory !== undefined &&
        action.payload.employmentCategory !== state.basicKYC.employmentCategory
      ) {
        salariedData = null;
        professionalData = null;
        businessData = null;
      }

      return {
        ...state,
        basicKYC: updatedKYC,
        salariedData,
        professionalData,
        businessData,
        lastUpdatedAt: timestamp,
      };
    }

    case 'SET_SALARIED_DATA':
      return {
        ...state,
        salariedData: state.salariedData
          ? { ...state.salariedData, ...action.payload }
          : {
              subType: 'PRIVATE',
              companyName: '',
              designation: '',
              officialEmail: '',
              workExperienceYears: 0,
              currentCompanyYears: 0,
              netMonthlyIncome: 0,
              hasExistingLoans: false,
              existingEMI: 0,
              ...action.payload,
            } as SalariedData,
        // Clear other paths
        professionalData: null,
        businessData: null,
        lastUpdatedAt: timestamp,
      };

    case 'SET_PROFESSIONAL_DATA':
      return {
        ...state,
        professionalData: state.professionalData
          ? { ...state.professionalData, ...action.payload }
          : {
              subType: 'CA',
              registrationNumber: '',
              practiceName: '',
              practiceYears: 0,
              practiceAddress: '',
              annualTurnover: 0,
              netMonthlyIncome: 0,
              hasExistingLoans: false,
              existingEMI: 0,
              ...action.payload,
            } as ProfessionalData,
        // Clear other paths
        salariedData: null,
        businessData: null,
        lastUpdatedAt: timestamp,
      };

    case 'SET_BUSINESS_DATA':
      return {
        ...state,
        businessData: state.businessData
          ? { ...state.businessData, ...action.payload }
          : {
              businessProgram: 'ITR_BASED',
              businessName: '',
              businessType: 'PROPRIETORSHIP',
              industryType: '',
              businessVintageYears: 0,
              businessAddress: '',
              netMonthlyIncome: 0,
              hasExistingLoans: false,
              existingEMI: 0,
              ...action.payload,
            } as BusinessData,
        // Clear other paths
        salariedData: null,
        professionalData: null,
        lastUpdatedAt: timestamp,
      };

    case 'SET_LOAN_REQUIREMENTS':
      return {
        ...state,
        loanRequirements: { ...state.loanRequirements, ...action.payload },
        lastUpdatedAt: timestamp,
      };

    case 'SET_DOCUMENT_STATUS': {
      const { documentId, status, fileUrl, fileName } = action.payload;
      return {
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === documentId ? { ...doc, status, fileUrl, fileName } : doc
        ),
        lastUpdatedAt: timestamp,
      };
    }

    case 'SET_CONSENT':
      return {
        ...state,
        [action.payload.field]: action.payload.value,
        lastUpdatedAt: timestamp,
      };

    case 'GO_TO_STEP':
      return {
        ...state,
        currentStep: action.payload,
        lastUpdatedAt: timestamp,
      };

    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: state.completedSteps.includes(action.payload)
          ? state.completedSteps
          : [...state.completedSteps, action.payload],
        lastUpdatedAt: timestamp,
      };

    case 'RESET_APPLICATION':
      return createDefaultState();

    case 'HYDRATE':
      return action.payload;

    default:
      return state;
  }
}

// ─── SESSION STORAGE MIDDLEWARE ──────────────────────────────────────────────

function persistToSession(state: ApplicationState): void {
  try {
    const serialized = JSON.stringify({
      version: APPLICATION_VERSION,
      state,
    });
    sessionStorage.setItem(STORAGE_KEY, serialized);
  } catch (e) {
    console.warn('[Pryme] Failed to persist application state:', e);
  }
}

function hydrateFromSession(): ApplicationState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Version guard — if schema changed, don't hydrate stale data
    if (parsed.version !== APPLICATION_VERSION) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed.state as ApplicationState;
  } catch (e) {
    console.warn('[Pryme] Failed to hydrate application state:', e);
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

// ─── THE HOOK ───────────────────────────────────────────────────────────────

export interface UseApplicationReturn {
  state: ApplicationState;
  dispatch: React.Dispatch<ApplicationAction>;

  // Convenience setters
  updateKYC: (data: Partial<BasicKYC>) => void;
  updateSalariedData: (data: Partial<SalariedData>) => void;
  updateProfessionalData: (data: Partial<ProfessionalData>) => void;
  updateBusinessData: (data: Partial<BusinessData>) => void;
  updateLoanRequirements: (data: Partial<LoanRequirements>) => void;
  setDocumentStatus: (documentId: string, status: DocumentItem['status'], fileUrl?: string, fileName?: string) => void;
  setConsent: (field: 'consentTCAccepted' | 'consentCIBILPull' | 'consentDataSharing', value: boolean) => void;

  // Navigation
  goToStep: (step: FormStep) => void;
  completeStep: (step: FormStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Utils
  resetApplication: () => void;
  refreshDocuments: () => void;

  // Computed
  currentEmploymentPath: 'SALARIED' | 'PROFESSIONAL' | 'SELF_EMPLOYED' | null;
  progressPercent: number;
  isStepComplete: (step: FormStep) => boolean;
}

const STEP_ORDER: FormStep[] = [
  'BASIC_KYC',
  'EMPLOYMENT_DETAILS',
  'LOAN_REQUIREMENTS',
  'DOCUMENT_CHECKLIST',
  'REVIEW_SUBMIT',
];

export function useApplicationState(initialLoanType?: string): UseApplicationReturn {
  const [state, dispatch] = useReducer(
    applicationReducer,
    initialLoanType,
    (initType) => {
      const hydrated = hydrateFromSession();
      if (hydrated) return hydrated;

      const fresh = createDefaultState();
      // If a loan type was passed in (e.g. from product card click), pre-set it
      if (initType) {
        const typeMap: Record<string, ApplicationState['loanRequirements']['loanType']> = {
          personal: 'PERSONAL_LOAN',
          home: 'HOME_LOAN',
          business: 'BUSINESS_LOAN',
          lap: 'LAP',
          transfer: 'BT_TOP_UP',
          bt_top_up: 'BT_TOP_UP',
        };
        fresh.loanRequirements.loanType = typeMap[initType.toLowerCase()] || 'PERSONAL_LOAN';
      }
      return fresh;
    }
  );

  // ── Persist on every state change ─────────────────────────────────────────
  useEffect(() => {
    persistToSession(state);
  }, [state]);

  // ── Convenience Dispatchers ───────────────────────────────────────────────

  const updateKYC = useCallback(
    (data: Partial<BasicKYC>) => dispatch({ type: 'SET_BASIC_KYC', payload: data }),
    []
  );

  const updateSalariedData = useCallback(
    (data: Partial<SalariedData>) => dispatch({ type: 'SET_SALARIED_DATA', payload: data }),
    []
  );

  const updateProfessionalData = useCallback(
    (data: Partial<ProfessionalData>) => dispatch({ type: 'SET_PROFESSIONAL_DATA', payload: data }),
    []
  );

  const updateBusinessData = useCallback(
    (data: Partial<BusinessData>) => dispatch({ type: 'SET_BUSINESS_DATA', payload: data }),
    []
  );

  const updateLoanRequirements = useCallback(
    (data: Partial<LoanRequirements>) => dispatch({ type: 'SET_LOAN_REQUIREMENTS', payload: data }),
    []
  );

  const setDocumentStatus = useCallback(
    (documentId: string, status: DocumentItem['status'], fileUrl?: string, fileName?: string) =>
      dispatch({ type: 'SET_DOCUMENT_STATUS', payload: { documentId, status, fileUrl, fileName } }),
    []
  );

  const setConsent = useCallback(
    (field: 'consentTCAccepted' | 'consentCIBILPull' | 'consentDataSharing', value: boolean) =>
      dispatch({ type: 'SET_CONSENT', payload: { field, value } }),
    []
  );

  // ── Navigation ────────────────────────────────────────────────────────────

  const goToStep = useCallback(
    (step: FormStep) => dispatch({ type: 'GO_TO_STEP', payload: step }),
    []
  );

  const completeStep = useCallback(
    (step: FormStep) => dispatch({ type: 'COMPLETE_STEP', payload: step }),
    []
  );

  const nextStep = useCallback(() => {
    const idx = STEP_ORDER.indexOf(state.currentStep);
    if (idx < STEP_ORDER.length - 1) {
      dispatch({ type: 'COMPLETE_STEP', payload: state.currentStep });
      dispatch({ type: 'GO_TO_STEP', payload: STEP_ORDER[idx + 1] });
    }
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    const idx = STEP_ORDER.indexOf(state.currentStep);
    if (idx > 0) {
      dispatch({ type: 'GO_TO_STEP', payload: STEP_ORDER[idx - 1] });
    }
  }, [state.currentStep]);

  // ── Document Matrix Refresh ───────────────────────────────────────────────
  // Recompute the document checklist whenever employment or loan type changes

  const refreshDocuments = useCallback(() => {
    const documents = resolveDocumentMatrix(state);
    // We don't dispatch here to avoid circular — instead the component
    // should call this and use the result. But we DO merge status from
    // existing docs if IDs match (so uploaded files aren't lost).
    const merged: DocumentItem[] = documents.map((doc) => {
      const existing = state.documents.find((d) => d.id === doc.id);
      return existing ? { ...doc, status: existing.status, fileUrl: existing.fileUrl, fileName: existing.fileName } : doc;
    });

    // Direct dispatch to replace documents list
    dispatch({
      type: 'HYDRATE',
      payload: { ...state, documents: merged, lastUpdatedAt: new Date().toISOString() },
    });
  }, [state]);

  // ── Utils ─────────────────────────────────────────────────────────────────

  const resetApplication = useCallback(() => {
    dispatch({ type: 'RESET_APPLICATION' });
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  // ── Computed Values ───────────────────────────────────────────────────────

  const currentEmploymentPath = state.basicKYC.employmentCategory;

  const progressPercent = Math.round(
    (state.completedSteps.length / STEP_ORDER.length) * 100
  );

  const isStepComplete = useCallback(
    (step: FormStep) => state.completedSteps.includes(step),
    [state.completedSteps]
  );

  return {
    state,
    dispatch,
    updateKYC,
    updateSalariedData,
    updateProfessionalData,
    updateBusinessData,
    updateLoanRequirements,
    setDocumentStatus,
    setConsent,
    goToStep,
    completeStep,
    nextStep,
    prevStep,
    resetApplication,
    refreshDocuments,
    currentEmploymentPath,
    progressPercent,
    isStepComplete,
  };
}
