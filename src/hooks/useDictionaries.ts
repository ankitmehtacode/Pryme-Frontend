import { create } from "zustand";
import { PrymeAPI } from "@/lib/api";
import type { DictionaryMap, DictionaryItem } from "@/types/auth.types";

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 DICTIONARY HYDRATION STORE (ZUSTAND)
// ═══════════════════════════════════════════════════════════════════════════════
// ALL dropdowns, filters, and form selects consume from this store.
// NOTHING is hardcoded. If the backend adds "Auto Loan" tomorrow,
// the UI reflects it instantly on next app boot without a frontend redeploy.
// ═══════════════════════════════════════════════════════════════════════════════

// Default fallback dictionaries — used only if the backend endpoint is
// not yet available. These will be replaced by the real API response.
const FALLBACK_DICTIONARIES: DictionaryMap = {
  loanTypes: [
    { value: "HOME_LOAN", label: "Home Loan" },
    { value: "LAP", label: "Loan Against Property" },
    { value: "BUSINESS_LOAN", label: "Business Loan" },
    { value: "PERSONAL_LOAN", label: "Personal Loan" },
    { value: "AUTO_LOAN", label: "Auto Loan" },
  ],
  bankList: [
    { value: "HDFC", label: "HDFC Bank" },
    { value: "SBI", label: "State Bank of India" },
    { value: "ICICI", label: "ICICI Bank" },
    { value: "LT_FINANCE", label: "L&T Finance" },
    { value: "AXIS", label: "Axis Bank" },
    { value: "RBL", label: "RBL Bank" },
    { value: "BAJAJ", label: "Bajaj Finserv" },
    { value: "BANDHAN", label: "Bandhan Bank" },
    { value: "ABFL", label: "Aditya Birla Finance" },
    { value: "SC", label: "Standard Chartered" },
    { value: "INDUSIND", label: "IndusInd Bank" },
  ],
  employmentCategories: [
    { value: "SALARIED", label: "Salaried" },
    { value: "PROFESSIONAL", label: "Professional" },
    { value: "SELF_EMPLOYED", label: "Self Employed" },
  ],
  documentTypes: [
    { value: "PAN_CARD", label: "PAN Card" },
    { value: "AADHAR", label: "Aadhaar Card" },
    { value: "ITR", label: "Income Tax Return" },
    { value: "BANK_STATEMENT", label: "Bank Statement" },
    { value: "SALARY_SLIP", label: "Salary Slip" },
  ],
  states: [],
  propertyTypes: [
    { value: "FLAT", label: "Flat / Apartment" },
    { value: "HOUSE", label: "Independent House" },
    { value: "PLOT", label: "Plot" },
    { value: "COMMERCIAL", label: "Commercial Property" },
  ],
};

interface DictionaryStore {
  dictionaries: DictionaryMap;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  getOptions: (key: keyof DictionaryMap) => DictionaryItem[];
}

export const useDictionaries = create<DictionaryStore>((set, get) => ({
  dictionaries: FALLBACK_DICTIONARIES,
  isHydrated: false,
  isLoading: false,
  error: null,

  /**
   * Called once on app boot by AppInitializer.
   * Fetches the live dictionary from the backend and replaces the fallback.
   * If the endpoint 404s, we gracefully degrade to the static fallback.
   */
  hydrate: async () => {
    if (get().isHydrated) return; // Prevent duplicate fetches
    
    set({ isLoading: true, error: null });
    
    try {
      const data = await PrymeAPI.getDictionaries();
      set({
        dictionaries: data,
        isHydrated: true,
        isLoading: false,
      });
    } catch (err: any) {
      console.warn(
        "Dictionary hydration failed. Using static fallback. Backend may not have /config/dictionaries yet.",
        err.message
      );
      set({
        isHydrated: true, // Mark as hydrated even on failure — use the fallback
        isLoading: false,
        error: err.message,
      });
    }
  },

  /**
   * Convenience accessor for dropdown components.
   * Usage: `const loanTypes = useDictionaries(s => s.getOptions("loanTypes"))`
   */
  getOptions: (key: keyof DictionaryMap) => {
    return get().dictionaries[key] || [];
  },
}));
