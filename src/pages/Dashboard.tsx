import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FileText, Search, CheckCircle, Clock,
  AlertCircle, Building2, TrendingUp, Activity,
  ShieldCheck, ChevronRight, ChevronDown, ArrowRight, Wallet,
  UploadCloud, CheckCircle2, Circle, Loader2, Edit2, Target, X,
  User, Briefcase, Lock, Mail, Users, Award, Check, Plus, Phone, Landmark, Coins,
  CalendarDays, Home, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PageShell, Surface, Stack, Inline, Container, Section, SplitLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { cn, buildCleanMetadata, formatISTDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import applicationBannerImg from "@/assets/images/application-banner-isometric.png";
import { useApplicationStore } from "@/store/applicationStore";
import { CustomerLoanInformationStep } from "@/components/loan/steps/CustomerLoanInformationStep";

// 🧠 ARCHITECTURE IMPORTS
import api, { PrymeAPI, resolveApiUrl } from "@/lib/api";
import { getDocumentsForLoanType, groupDocumentsByCategory, ProductType, EmploymentType } from "@/lib/documentData";
import { LOAN_TYPE_LABELS, type ApplicationStore } from "@/lib/applicationTypes";

// 🧠 THE FIX: useApplicationStore is a sessionStorage-persisted Zustand store,
// designed for the single continuous /apply wizard session. CustomerLoanInformationStep
// (Stage 1 of this page) reads and writes it exclusively -- but a returning user
// hits this page in a brand-new browser session, where the store is back to its
// empty defaults, and none of it was ever sent to the backend by handleNextStage
// (which only PATCHed the separate, narrower `formData` shape as metadata).
// So every field that went through the store silently reset on next login.
//
// Fix: persist the store's own shape losslessly as a nested `storeSnapshot` key
// inside the same metadata blob (the backend entity's own comment already
// anticipates exactly this: "Maps React's dynamic Funnel Zustand store directly
// into a highly efficient JSONB column"), and rehydrate it on boot. No new flat
// field-mapping convention to invent or keep in sync -- the store's own types are
// already the schema, and JSON round-trips them exactly.
type ApplicationStoreSnapshot = Partial<Pick<ApplicationStore, "basicKYC" | "financialDetails" | "loanRequirements" | "financialFootprint">>;

// 🧠 MULTI-APPLICATION INDEPENDENCE: a user can now have several applications
// in flight at once (e.g. Home Loan + Loan Against Property). They share ONE
// global store, so switching which application is active has to (a) carry
// forward facts about the APPLICANT -- basicKYC, financialDetails,
// financialFootprint: identity, income, employment, co-applicant -- since
// those don't change per product and re-asking for them would be absurd,
// while (b) never leaking one application's loan-specific data
// (amount/tenure/property/purpose/selected bank) into a different one.
// loanRequirements is therefore hard-reset to defaults on every switch
// before the target application's own saved values (if any) are layered
// back on top -- updateLoanRequirements merges rather than replaces, so
// every field (including the optional property/vehicle ones) has to be
// listed explicitly or a stale value from the previous application would
// silently survive the merge.
const BLANK_LOAN_REQUIREMENTS: ApplicationStore["loanRequirements"] = {
  loanType: "" as ApplicationStore["loanRequirements"]["loanType"],
  loanAmount: 0,
  tenureYears: 0,
  purpose: "",
  cibilScore: 0,
  propertyIdentified: undefined,
  propertyType: undefined,
  propertyCategory: undefined,
  businessPropertyCategory: undefined,
  propertyValue: undefined,
  propertyCity: undefined,
  vehicleOnRoadPrice: undefined,
  vehicleQuotationPrice: undefined,
  selectedBankName: undefined,
};

function parseMetadata(app: Application): Record<string, any> | undefined {
  if (!app.metadata) return undefined;
  return typeof app.metadata === "string"
    ? (() => { try { return JSON.parse(app.metadata as string); } catch { return undefined; } })()
    : app.metadata;
}

function parseStoreSnapshot(app: Application): ApplicationStoreSnapshot | undefined {
  return parseMetadata(app)?.storeSnapshot as ApplicationStoreSnapshot | undefined;
}

function loadApplicationDataIntoStore(store: ApplicationStore, targetApp: Application, allApps: Application[]) {
  const targetSnapshot = parseStoreSnapshot(targetApp);
  const targetMetadata = parseMetadata(targetApp);
  const hasCommonData = (s?: ApplicationStoreSnapshot) => !!(s?.basicKYC || s?.financialDetails?.path);

  // Prefer this application's own saved common data; if it doesn't have any
  // yet (e.g. just created for a second product), fall back to the first
  // other application that does -- "information already filled in" carries
  // over instead of being re-asked.
  const commonSource = hasCommonData(targetSnapshot)
    ? targetSnapshot
    : allApps
        .filter((a) => a.applicationId !== targetApp.applicationId)
        .map(parseStoreSnapshot)
        .find(hasCommonData);

  if (commonSource?.basicKYC) store.updateBasicKYC(commonSource.basicKYC);
  if (commonSource?.financialFootprint) store.updateFinancialFootprint(commonSource.financialFootprint);
  if (commonSource?.financialDetails?.path) store.updateFinancialDetails(commonSource.financialDetails);

  store.updateLoanRequirements(BLANK_LOAN_REQUIREMENTS);
  if (targetSnapshot?.loanRequirements) store.updateLoanRequirements(targetSnapshot.loanRequirements);

  // 🧠 loanRequirements.loanAmount/cibilScore only ever come from this
  // client-authored JSON snapshot, which is written solely by this funnel's
  // "Save & Continue" (handleNextStage). Any application that reached its
  // current status without ever passing through that -- admin-approved,
  // elevated straight from a lead, etc. -- has a correct requestedAmount/
  // declaredCibilScore on the backend record itself but nothing in the
  // snapshot, so the Loan Details bar rendered blank even though the
  // application genuinely has this data. Fall back to those authoritative
  // columns whenever the snapshot didn't provide them.
  store.updateLoanRequirements({
    loanAmount: targetSnapshot?.loanRequirements?.loanAmount || targetApp.requestedAmount || undefined,
    cibilScore: targetSnapshot?.loanRequirements?.cibilScore || targetApp.declaredCibilScore || undefined,
    // Applications that came from the original apply wizard (elevated from a
    // lead, never touched this funnel's own Save & Continue) carry
    // propertyValue/tenure as FLAT top-level metadata keys instead -- written
    // by buildCleanMetadata during the wizard's initial lead submission,
    // never nested under storeSnapshot.loanRequirements like this funnel
    // writes them. Same data, different key path; fall back to it.
    propertyValue: targetSnapshot?.loanRequirements?.propertyValue || numberOrUndefined(targetMetadata?.propertyValue),
    tenureYears: targetSnapshot?.loanRequirements?.tenureYears || numberOrUndefined(targetMetadata?.tenure),
  });
}

function numberOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

// --- Types & Interfaces ---
/** What the document matrix shows for a slot that has a file in it. */
interface UploadedDocInfo {
  fileName?: string;
  url?: string;
  docType?: string;
}

interface ApplicationDoc {
  docType: string;
  url?: string;
  name?: string;
  id?: string;
  // The vault's GET /applications/{id}/documents returns DocumentMetadataResponse,
  // which names these differently from the shape the rest of this page assumed.
  originalFilename?: string;
  storagePath?: string;
}

/**
 * Builds the document-matrix lookup from whatever the server says exists.
 *
 * Keyed three ways on purpose: the backend uppercases docType (see
 * DocumentVaultService.sanitizeDocType), the matrix renders from lowercase
 * doc.id, and older rows were keyed by normalised display name. One document
 * therefore has to answer to all three, or an already-uploaded file renders as
 * an empty slot after a refresh.
 */
const buildUploadedDocMap = (documents: ApplicationDoc[] | undefined): Record<string, UploadedDocInfo> => {
  const map: Record<string, UploadedDocInfo> = {};
  (documents || []).forEach((d) => {
    if (!d.docType) return;
    const info: UploadedDocInfo = {
      // originalFilename is what the vault actually returns; d.name only exists
      // on the (never-populated) shape the application payload was assumed to have.
      fileName: d.originalFilename || d.name,
      // No URL is returned either -- the file is fetched through the authenticated
      // download gateway, keyed by document id. Same-site top-level navigation, so
      // the PRYME_SID cookie rides along and the link just works.
      url: d.url || (d.id ? resolveApiUrl(`/documents/${d.id}/download`) : undefined),
      docType: d.docType,
    };
    map[d.docType] = info;
    map[d.docType.toLowerCase()] = info;
  });
  return map;
};


interface Application {
  applicationId: string;
  status: string;
  loanType: string;
  requestedAmount: number;
  declaredCibilScore?: number;
  completionPercentage: number;
  createdAt: string;
  assignee?: string;
  documents?: ApplicationDoc[];
  metadata?: Record<string, any>;
  // Backend's optimistic-locking version (ApplicationResponse.version) --
  // required by PATCH /applications/{id}/status (see handleFinalSubmit).
  version?: number;
}

/**
 * Which application this user was last working in.
 *
 * localStorage, not sessionStorage: the whole point is to survive closing the
 * tab and signing back in, which is exactly when sessionStorage is gone.
 *
 * It holds an application id, which is not a secret and is useless without the
 * session cookie -- every read of it is re-validated against the list the
 * backend returned for the *current* user, so a stale id from a previous
 * account on a shared machine simply doesn't match and is ignored.
 */
const ACTIVE_APPLICATION_KEY = "pryme_active_application_id";

/**
 * The application to open on boot.
 *
 * Prefers the one the user was last in. /applications/me is ordered by
 * updatedAt, so apps[0] is the most recently *modified* application -- a good
 * fallback, but it answers a slightly different question, since an admin
 * editing an old application also moves it to the front. The remembered id is
 * the only signal that reflects what the user themselves was doing.
 *
 * Always re-validated against `apps` rather than trusted: an application that
 * has since been withdrawn, or that belongs to a different account on a shared
 * browser, is simply absent from the list and falls through to the default.
 */
const pickInitialApplication = (apps: Application[]): Application => {
  let rememberedId: string | null = null;
  try {
    rememberedId = localStorage.getItem(ACTIVE_APPLICATION_KEY);
  } catch {
    // Safari private mode throws on access. Losing the preference is fine;
    // failing to load the dashboard over it is not.
  }
  if (!rememberedId) return apps[0];
  return apps.find((a) => a.applicationId === rememberedId) ?? apps[0];
};

interface DashboardFormData {
  panNumber: string;
  dob: string;
  currentCity: string;
  pinCode: string;
  companyName: string;
  designation: string;
  workExperience: string;
  officeEmail: string;
  monthlyEMI: string;
  existingBank: string;
  coApplicant: string;
  loanPurpose: string;
  requestedAmount: string;
  tenure: string;
}

const initialFormData: DashboardFormData = {
  panNumber: "", dob: "", currentCity: "", pinCode: "", 
  companyName: "", designation: "", workExperience: "", officeEmail: "", 
  monthlyEMI: "", existingBank: "", coApplicant: "No", loanPurpose: "", 
  requestedAmount: "", tenure: "",
};

type ViewState = "LOADING" | "FUNNEL" | "DASHBOARD" | "EMPTY";

const spring = { stiffness: 120, damping: 28, mass: 0.8 };

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

// Same defensive substring normalization Apply.tsx's findApplicationForCurrentProduct
// and the docGroups loanType handling elsewhere in this file already use --
// app.loanType isn't returned in one consistent format everywhere.
const formatLoanTypeLabel = (raw?: string) => {
  const s = String(raw || "").toLowerCase();
  if (s.includes("business")) return "Business Loan";
  if (s.includes("home")) return "Home Loan";
  if (s.includes("lap") || s.includes("property")) return "Loan Against Property";
  if (s.includes("education")) return "Education Loan";
  if (s.includes("auto") || s.includes("car")) return "Auto Loan";
  if (s.includes("personal")) return "Personal Loan";
  return raw || "Loan";
};

const getStatusConfig = (status: string) => {
  switch (status?.toUpperCase()) {
    case "NEW":
      return { color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/50 dark:text-blue-400", icon: FileText, progress: 20, label: "Submitted" };
    case "LOGIN":
      return { color: "text-blue-800 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/50 dark:text-blue-400", icon: Activity, progress: 50, label: "Processing" };
    case "VERIFIED":
      return { color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800/50 dark:text-indigo-400", icon: ShieldCheck, progress: 75, label: "Verified" };
    case "SANCTIONED":
      return { color: "text-blue-800 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-950/50 dark:text-blue-400", icon: CheckCircle, progress: 90, label: "Approved" };
    case "DISBURSED":
      return { color: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/50 dark:text-emerald-400", icon: Wallet, progress: 100, label: "Disbursed" };
    case "REJECTED":
      return { color: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800/50 dark:text-red-400", icon: AlertCircle, progress: 100, label: "Rejected" };
    default:
      return { color: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700/50 dark:text-slate-400", icon: Clock, progress: 5, label: status || "Draft" };
  }
};

const Dashboard: React.FC = () => {
  const { user, isLoading: authLoading, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const store = useApplicationStore();

  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [viewState, setViewState] = useState<ViewState>("LOADING");
  
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [activeApplication, setActiveApplication] = useState<Application | null>(null);
  
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});
  // Holds the uploaded file itself, not a bare boolean. Every existing
  // truthiness check (uploadedDocs[id]) still works, but the row can now render
  // what was actually uploaded -- filename, and a link to view it -- so the
  // matrix shows the documents rather than just a tick that they exist.
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, UploadedDocInfo>>({});
  const [dragOverDocId, setDragOverDocId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Application deletion (withdrawal) -- `appPendingDeletion` drives a single
  // shared confirmation dialog rendered once at the bottom of this component,
  // rather than one AlertDialog per row, so it works the same whether
  // triggered from the switcher dropdown or a Client Portfolio card.
  const [appPendingDeletion, setAppPendingDeletion] = useState<Application | null>(null);
  const [isDeletingApp, setIsDeletingApp] = useState<boolean>(false);

  const [currentStage, setCurrentStage] = useState<number>(1);
  const [formData, setFormData] = useState<DashboardFormData>(initialFormData);

  // Remembers the active application, from one place rather than at each call
  // site that switches it.
  //
  // There are four such sites today -- initial boot, the switcher dropdown,
  // "Manage Documents & Details" in the portfolio, and the pending-lead
  // elevation inside handleNextStage (which *changes* the id mid-session, from
  // a synthetic "pending-" scaffold to the real one the backend minted). An
  // effect on the id catches all four, and catches the fifth that someone adds
  // later without knowing this preference exists.
  useEffect(() => {
    const id = activeApplication?.applicationId;
    // "pending-<timestamp>" scaffolds are client-only and never persisted, so
    // remembering one would just be an id that can never match again.
    if (!id || id.startsWith("pending-")) return;
    try {
      localStorage.setItem(ACTIVE_APPLICATION_KEY, id);
    } catch {
      // Private mode. The dashboard still works, it just forgets.
    }
  }, [activeApplication?.applicationId]);

  // 🧠 SMART NORMALIZER: Aligns React frontend names with Java Backend Sanitized Names
  const normalizeDocName = (name: string) => name.trim().toUpperCase().replace(/\s+/g, '_');

  // Switches the funnel to a specific application -- used on initial boot AND
  // by the application picker below. Documents/stage are a hard replace (each
  // application's own, never merged with another's); personal/employment data
  // carries over via loadApplicationDataIntoStore, loan-specific data resets.
  /**
   * Loads the document matrix straight from the vault for a given application.
   *
   * Takes the id as an argument rather than reading activeApplication, because
   * callers invoke it in the same tick they set that state -- reading it here
   * would see the previous application, or none at all on first load.
   */
  const hydrateDocumentsFromVault = useCallback(async (applicationId?: string) => {
    if (!applicationId) return;
    try {
      const docs = await PrymeAPI.getApplicationDocuments(applicationId);
      const list: ApplicationDoc[] = Array.isArray(docs) ? docs : (docs?.documents ?? []);
      if (list.length > 0) setUploadedDocs(buildUploadedDocMap(list));
    } catch (e) {
      console.warn("Could not load documents for application", applicationId, e);
    }
  }, []);

  const loadApplicationIntoFunnel = useCallback((targetApp: Application, allApps: Application[]) => {
    setActiveApplication(targetApp);

    // The backend's sanitizeDocType() always uppercases whatever docType was
    // sent (see DocumentVaultService.java), so a document uploaded with
    // doc.id="hl_sale_deed" comes back here as docType="HL_SALE_DEED" --
    // but the render-time lookups below check uploadedDocs[doc.id], which is
    // still lowercase. Without also storing the lowercased key, that never
    // matches, so every already-uploaded document silently reverted to
    // "not uploaded" on refresh / re-selecting the application.
    // Seed from the application payload if it happens to carry documents, then
    // fetch the vault's list -- which is the only reliable source. The backend's
    // ApplicationResponse has no documents field at all, so relying on it left
    // the matrix empty on every login even though the files were safely stored
    // (and visible in the CRM, which reads the document table directly).
    setUploadedDocs(buildUploadedDocMap(targetApp.documents));
    void hydrateDocumentsFromVault(targetApp.applicationId);

    // 🧠 Must run before the 100%-completion early return below, not after --
    // otherwise a completed application's Applicant Information silently
    // renders blank the moment the user reaches it via initial boot or the
    // switcher dropdown (both call this function), since CustomerLoanInformationStep
    // reads only from this store, never from `targetApp` directly. The
    // "Update Information / Documents" button already worked around this by
    // calling loadApplicationDataIntoStore itself before switching views --
    // this fixes it at the source instead of relying on every caller to know that.
    loadApplicationDataIntoStore(store, targetApp, allApps);

    const progress = targetApp.completionPercentage || 0;

    // A completed application no longer bounces to the portfolio on login. Once
    // the details are in and the documents are uploaded, the document matrix is
    // the only screen the applicant has any reason to return to -- it is where
    // they check what was received and swap anything wrong. The portfolio stays
    // one click away via the header link in the funnel.
    setViewState("FUNNEL");

    // Land on the document matrix whenever stage 1 has already been captured.
    // Once we hold the applicant's details, stage 1 is not something they came
    // back to do -- re-entering there makes them page past a filled-in form to
    // reach the documents, which is the only part still needing them. Stage 1
    // stays one "Back" away for anyone who does want to change a detail.
    //
    // Keyed off the stored data rather than completionPercentage alone: the
    // percentage is written by handleNextStage, so an application whose details
    // arrived by any other route (elevated lead, admin edit) would otherwise be
    // sent back to a form it had already answered.
    const stageOneCaptured =
      progress >= 50 ||
      Boolean(targetApp.documents?.length) ||
      Boolean(store.basicKYC?.fullName && store.basicKYC?.mobileNumber);

    setCurrentStage(stageOneCaptured ? 2 : 1);

    // 🧠 SINGLE SOURCE OF TRUTH: fall back to financialDetails.data.existingEMI
    // (the same field the eligibility engine already used) when this application
    // has no saved monthlyEMI yet -- read AFTER the store load above so this
    // reflects the application just switched to, not whichever was active before.
    const storeEmi = useApplicationStore.getState().financialDetails?.data?.existingEMI;
    const emiFallback = storeEmi != null ? String(storeEmi) : "";

    let parsedMeta: Partial<DashboardFormData> = {};
    if (targetApp.metadata) {
      if (typeof targetApp.metadata === "string") {
        try {
          parsedMeta = JSON.parse(targetApp.metadata);
        } catch (e) {
          console.error("Failed to parse metadata", e);
        }
      } else if (typeof targetApp.metadata === "object") {
        parsedMeta = targetApp.metadata;
      }
    }
    setFormData(prev => ({
      ...prev,
      ...parsedMeta,
      monthlyEMI: parsedMeta.monthlyEMI || emiFallback,
      requestedAmount: parsedMeta.requestedAmount || String(targetApp.requestedAmount || ""),
      tenure: parsedMeta.tenure || ""
    }));
  }, [store]);

  // Withdraws (soft-deletes) an application -- DELETE /applications/{id}.
  // The backend keeps the row and its audit trail, just excludes it from
  // future /applications/me responses, so here we only need to drop it from
  // local state and, if it was the active one, switch to whatever's left.
  const handleDeleteApplication = async (app: Application) => {
    setIsDeletingApp(true);
    try {
      // Synthetic client-only scaffold (see the "pending-" fallback in
      // bootDashboard) was never persisted to the backend -- nothing to call.
      if (!app.applicationId.startsWith("pending-")) {
        await api.delete(`/applications/${app.applicationId}`);
      }

      toast({ title: "Application Deleted", description: `${formatLoanTypeLabel(app.loanType)} has been removed from your dashboard.` });

      const remaining = myApplications.filter((a) => a.applicationId !== app.applicationId);
      setMyApplications(remaining);

      // Drop the remembered id if it pointed at what was just withdrawn.
      // pickInitialApplication would ignore the stale value anyway (it is
      // re-validated against the list), but leaving a tombstone in storage
      // makes the next person to read this code wonder whether it can.
      try {
        if (localStorage.getItem(ACTIVE_APPLICATION_KEY) === app.applicationId) {
          localStorage.removeItem(ACTIVE_APPLICATION_KEY);
        }
      } catch {
        /* private mode -- nothing was stored to begin with */
      }

      if (activeApplication?.applicationId === app.applicationId) {
        if (remaining.length > 0) {
          loadApplicationIntoFunnel(remaining[0], remaining);
        } else {
          setActiveApplication(null);
          setViewState("EMPTY");
        }
      }

      setAppPendingDeletion(null);
    } catch (error: any) {
      console.error("Delete Application Error:", error);
      toast({
        title: "Could Not Delete",
        description: error.response?.data?.message || error.message || "Failed to delete the application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeletingApp(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    
    const bootDashboard = async () => {
      if (authLoading) return;
      if (!user) {
        navigate("/auth?redirect=/dashboard", { replace: true });
        return;
      }
      // 🧠 This was isAdmin (ADMIN/SUPER_ADMIN only), so an EMPLOYEE landing on
      // /dashboard -- whether by direct URL, a bookmark, or the header menu's
      // "Application Tracker" link -- fell straight through to the customer
      // application-tracker experience instead of being sent to /admin like
      // every other staff role already was.
      if (isStaff) {
        navigate("/admin", { replace: true });
        return;
      }

      try {
        const pendingLead = localStorage.getItem("pryme_pending_lead_id");
        const selectedBank = localStorage.getItem("pryme_target_bank") || "Pryme Aggregator";
        let elevationSucceeded = false;

        if (pendingLead) {
          try {
            await PrymeAPI.elevateLead(pendingLead, user.id, selectedBank);
            elevationSucceeded = true;
          } catch (e: any) {
            // 🧠 409 CONFLICT: Lead was already elevated — still a success path
            if (e?.message?.includes("409") || e?.message?.includes("already")) {
              elevationSucceeded = true;
            }
            console.warn("Lead elevation skipped or failed:", e);
          } finally {
            // Always clean up — stale IDs cause infinite retry loops
            localStorage.removeItem("pryme_pending_lead_id");
            localStorage.removeItem("pryme_target_bank");
          }
        }

        const response = await api.get("/applications/me", { signal: abortController.signal });
        const apps: Application[] = response?.data?.content ? response.data.content : (Array.isArray(response?.data) ? response.data : []);
        
        setMyApplications(apps);

        if (apps.length > 0) {
          // Not apps[0]: a user with several applications was landed on the
          // most recently touched one rather than the one they were actually
          // in, which reads as an empty application -- blank matrix, no
          // documents -- even though nothing was lost.
          loadApplicationIntoFunnel(pickInitialApplication(apps), apps);
        } else {
          // 🧠 RELAY FIX: If there's a cached pending application from the /apply flow,
          // scaffold a synthetic FUNNEL so the user sees the form immediately instead of
          // a dead-end "No Active Instruments" screen. This handles the case where
          // lead elevation failed but the user clearly came from the loan application flow.
          const cachedApp = localStorage.getItem("pryme_pending_application");
          if (cachedApp) {
            try {
              const parsed = JSON.parse(cachedApp);
              // Create a synthetic application so the FUNNEL renders
              const scaffold: Application = {
                applicationId: "pending-" + Date.now(),
                status: "DRAFT",
                loanType: parsed.loanType || "PERSONAL_LOAN",
                requestedAmount: parsed.loanAmount || 0,
                completionPercentage: 0,
                createdAt: new Date().toISOString(),
              };
              setMyApplications([scaffold]);
              setActiveApplication(scaffold);
              setCurrentStage(1);
              setViewState("FUNNEL");
            } catch (e) {
              setViewState("EMPTY");
            }
          } else {
            setViewState("EMPTY");
          }
        }
      } catch (error: any) {
        if (error.name === "CanceledError" || error.message === "canceled") return;
        console.error("Dashboard Sync Error:", error);
        setViewState("EMPTY");
      } finally {
        setIsDataLoading(false);
      }
    };

    bootDashboard();

    const unlockTimer = setTimeout(() => {
      setIsDataLoading(prev => {
        if (prev) {
          setViewState(prevViewState => prevViewState === "LOADING" ? "EMPTY" : prevViewState);
          return false;
        }
        return prev;
      });
    }, 5000);

    return () => {
      abortController.abort();
      clearTimeout(unlockTimer);
    };
  }, [user, authLoading, isStaff, navigate]);

  // 🧠 Stage 1 ("Customer & Loan Information") shows PAN/DOB/City/PIN as
  // frozen, already-collected data -- fill formData's copy of them from the
  // applicationStore (the real source, populated earlier in Apply.tsx) when
  // there's no backend-saved value yet, so handleNextStage's existing
  // validation still passes without asking the applicant to re-type them.
  useEffect(() => {
    if (viewState !== "FUNNEL") return;
    const kyc = store.basicKYC;
    if (!kyc.panNumber && !kyc.dateOfBirth && !kyc.city && !kyc.pinCode) return;
    setFormData(prev => ({
      ...prev,
      panNumber: prev.panNumber || kyc.panNumber || "",
      dob: prev.dob || kyc.dateOfBirth || "",
      currentCity: prev.currentCity || kyc.city || "",
      pinCode: prev.pinCode || kyc.pinCode || "",
    }));
  }, [viewState, store.basicKYC]);

  const { docGroups } = useMemo(() => {
    if (!activeApplication && viewState !== "FUNNEL") return { docGroups: [] };
    
    let parsed: Record<string, any> = {};
    try {
      const savedApp = localStorage.getItem("pryme_pending_application");
      if (savedApp && savedApp !== "undefined") {
        parsed = JSON.parse(savedApp);
      }
    } catch(e) {
      console.error("Failed to parse pending application", e);
    }
    
    const rawLoan = activeApplication?.loanType || parsed?.loanType || "Personal Loan";
    const rawEmp = activeApplication?.metadata?.employmentType || parsed?.employmentType || "Salaried";

    const formatEnumString = (str: string) => {
      if (!str) return str;
      
      const s = str.toUpperCase().replace(/ /g, '_');
      if (s === "LAP" || s === "LOAN_AGAINST_PROPERTY") return "LAP";
      if (s === "SEP" || s === "SELF_EMPLOYED_PROFESSIONAL") return "SEP";
      if (s === "SENP" || s === "SELF_EMPLOYED_NON_PROFESSIONAL") return "SENP";
      if (s === "SALARIED") return "Salaried";
      if (s === "HOME_LOAN" || s === "HOME") return "Home Loan";
      if (s === "PERSONAL_LOAN" || s === "PERSONAL") return "Personal Loan";
      if (s === "BUSINESS_LOAN" || s === "BUSINESS") return "Business Loan";
      if (s === "AUTO_LOAN" || s === "CAR_LOAN" || s === "AUTO") return "Auto Loan";
      if (s === "BT_TOP_UP" || s === "BT_TOPUP" || s === "BT") return "Loan Transfer|Top Up";

      // Fallback
      return str.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    };

    const targetLoan = formatEnumString(rawLoan) as ProductType;
    const targetEmp = formatEnumString(rawEmp) as EmploymentType;

    const allDocs = getDocumentsForLoanType(targetLoan, targetEmp) || [];

    return {
      docGroups: groupDocumentsByCategory(allDocs).map(g => ({
        category: g.category,
        displayName: g.displayName,
        docs: g.docs.map(d => ({ id: d.id, name: d.label, required: !d.optional }))
      }))
    };
  }, [activeApplication, viewState]);

  const handleNextStage = async () => {
    if (!activeApplication) return;
    
    setIsSaving(true);
    
    const newStage = currentStage + 1;
    const newProgress = Math.min(currentStage * 50, 100);
    
    try {
      let targetAppId = activeApplication.applicationId;
      
      // 🧠 JIT BACKEND SYNC: If this is a synthetic frontend application (from a lost lead),
      // we must recreate the lead on the backend and elevate it before we can PATCH progress.
      if (targetAppId.startsWith("pending-")) {
        const cachedAppStr = localStorage.getItem("pryme_pending_application");
        const cachedApp = cachedAppStr ? JSON.parse(cachedAppStr) : {};
        
        // 🧠 NORMALIZE LOAN TYPE: Backend explicitly strictly requires lowercase
        // values: personal, business, home, education, lap
        const rawLoanType = String(activeApplication.loanType || cachedApp.loanType || "personal").toLowerCase();
        let normalizedLoanType = "personal";
        if (rawLoanType.includes("business")) normalizedLoanType = "business";
        else if (rawLoanType.includes("home")) normalizedLoanType = "home";
        else if (rawLoanType.includes("education")) normalizedLoanType = "education";
        else if (rawLoanType.includes("lap")) normalizedLoanType = "lap";
        
        // 1. Submit a fresh lead with whatever data we can scrape together
        const leadRes = await PrymeAPI.submitLead({
           ...cachedApp, // Spread first so our explicit overrides win
           fullName: user?.name || "Pryme Client",
           phone: "9999999999", // Fallback required by backend validation
           loanAmount: parseFloat(formData.requestedAmount) || activeApplication.requestedAmount || cachedApp.loanAmount || 100000,
           loanType: normalizedLoanType,
           productType: normalizedLoanType, // 🧠 FIX: submitLead prefers productType over loanType
           cibilScore: cachedApp.cibilScore || 0,
           monthlyIncome: cachedApp.monthlyIncome || 0,
           employmentType: cachedApp.employmentType || "SALARIED",
        });
        
        const newLeadId = leadRes?.lead?.id || leadRes?.data?.lead?.id;
        if (!newLeadId) throw new Error("Backend failed to generate recovery lead.");
        
        // 2. Elevate the fresh lead
        const selectedBank = localStorage.getItem("pryme_target_bank") || "Pryme Aggregator";
        const elevateRes = await PrymeAPI.elevateLead(newLeadId, user?.id || "", selectedBank);
        
        targetAppId = elevateRes?.application?.applicationId || elevateRes?.data?.application?.applicationId;
        if (!targetAppId) throw new Error("Backend failed to elevate recovery lead.");
        
        // 3. Update the frontend context
        setActiveApplication(prev => prev ? { ...prev, applicationId: targetAppId } : null);
        
        // Cleanup old synthetic data
        localStorage.removeItem("pryme_pending_application");
      }

      // 🧠 SINGLE SOURCE OF TRUTH: keep financialDetails.data.existingEMI (the field
      // eligibility computations read) in sync with whatever's being saved here --
      // same reasoning as the pre-fill above, in the write direction.
      const financialPath = store.financialDetails?.path;
      const emiValue = Number(formData.monthlyEMI) || 0;
      if (financialPath === 'SALARIED') store.updateSalariedDetails({ existingEMI: emiValue });
      else if (financialPath === 'PROFESSIONAL') store.updateProfessionalDetails({ existingEMI: emiValue });
      else if (financialPath === 'SELF_EMPLOYED') store.updateBusinessDetails({ existingEMI: emiValue });

      // 🧠 Read via getState() rather than the closed-over `store` so this
      // reflects the existingEMI sync just above, which mutates the global
      // store synchronously -- the component-scoped `store` snapshot from
      // this render wouldn't include it.
      const freshStore = useApplicationStore.getState();
      const storeSnapshot: ApplicationStoreSnapshot = {
        basicKYC: freshStore.basicKYC,
        financialDetails: freshStore.financialDetails,
        loanRequirements: freshStore.loanRequirements,
        financialFootprint: freshStore.financialFootprint,
      };

      const patchData: Record<string, any> = {
         metadata: { ...buildCleanMetadata(formData), storeSnapshot },
         completionPercentage: newProgress
      };

      if (formData.requestedAmount) {
         patchData.requestedAmount = parseFloat(formData.requestedAmount);
      }

      await api.patch(`/applications/${targetAppId}`, patchData);
      toast({ title: "Progress Saved", description: "Your data has been securely saved." });
      
      // Sync applications and activeApplication state
      const appResponse = await api.get("/applications/me");
      const apps = appResponse?.data?.content ? appResponse.data.content : (Array.isArray(appResponse?.data) ? appResponse.data : []);
      setMyApplications(apps);
      const updatedApp = apps.find((a: any) => a.applicationId === targetAppId);
      if (updatedApp) {
        setActiveApplication(updatedApp);
      }
      
      setCurrentStage(newStage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      console.error("Sync Error:", error);
      toast({ 
        title: "Sync Error", 
        description: error.response?.data?.message || error.message || "Failed to synchronise progress. Please check connection.", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Hands the application to underwriting. Formerly the "Submit to Underwriter"
   * click; now fired once every required document is in the vault.
   *
   * The status PATCH and the completion PATCH are unchanged -- ops still sees
   * the application arrive exactly as before. What changed is the trigger: the
   * user no longer has to press anything, because with a direct-pass matrix
   * there is no moment where the files are "not yet sent".
   */
  const submitToUnderwriting = async () => {
    if (!activeApplication) return;

    setIsSaving(true);

    try {
      // The /status endpoint enforces optimistic locking (ApplicationService.
      // validateVersion) -- it 409s with "Optimistic Lock Fault: Version
      // mismatch" whenever request.version() is null, which it always was
      // here since Application never carried the backend's version field.
      // Every "Submit to Underwriter" click failed for this reason alone,
      // regardless of the application's actual state.
      await api.patch(`/applications/${activeApplication.applicationId}/status`, {
        status: "LOGIN",
        version: activeApplication.version,
      });
      await api.patch(`/applications/${activeApplication.applicationId}`, { completionPercentage: 100 });

      toast({ title: "Underwriting Initiated", description: "All required documents are in. You can still replace or remove them from My Applications." });

      setMyApplications(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[0].completionPercentage = 100;
          updated[0].status = "LOGIN";
        }
        return updated;
      });
    } catch (error: any) {
      console.error("Submission Error:", error);
      // fetchWithAuth (src/lib/api.ts) throws a plain Error whose .message IS
      // the backend's real reason -- there is no axios-style error.response
      // on this client, so that lookup always came back undefined and every
      // failure showed the same generic fallback text no matter what
      // actually went wrong.
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Re-reads the vault's document list and repaints the matrix from it.
   *
   * The matrix is a direct view of what the vault holds -- there is no batch
   * submit, so a slot must reflect the server the moment an upload or delete
   * settles. Failure here is deliberately silent: the optimistic state already
   * shows the right thing, and a toast about a background refresh would only
   * confuse someone whose upload plainly worked.
   */
  const refreshDocuments = useCallback(async () => {
    const applicationId = activeApplication?.applicationId;
    if (!applicationId) return;
    try {
      const docs = await PrymeAPI.getApplicationDocuments(applicationId);
      const list: ApplicationDoc[] = Array.isArray(docs) ? docs : (docs?.documents ?? []);
      // Unconditional here (unlike the hydrate path): an empty list after a
      // delete is the correct new state, not a failed read.
      setUploadedDocs(buildUploadedDocMap(list));
      setActiveApplication(prev => (prev ? { ...prev, documents: list } : prev));
    } catch (e) {
      console.warn("Document list refresh failed; keeping optimistic state", e);
    }
  }, [activeApplication?.applicationId]);

  // Fires submitToUnderwriting exactly once, when the last required document
  // lands. Guarded by a ref rather than by application status because the status
  // PATCH is asynchronous -- two uploads finishing together would otherwise both
  // observe the old status and both submit.
  const underwritingHandoffFired = useRef(false);
  useEffect(() => {
    if (viewState !== "FUNNEL" || currentStage !== 2) return;
    if (!activeApplication || underwritingHandoffFired.current) return;

    const required = docGroups.flatMap(g => g.docs.filter(d => d.required));
    if (required.length === 0) return;

    const allPresent = required.every(d =>
      uploadedDocs[d.id] || uploadedDocs[d.id.toUpperCase()] || uploadedDocs[normalizeDocName(d.name)]
    );
    if (!allPresent) return;

    // Already handed over on a previous visit -- re-uploading a file should not
    // re-submit an application that underwriting is already working on.
    if (activeApplication.status === "LOGIN" || (activeApplication.completionPercentage || 0) >= 100) {
      underwritingHandoffFired.current = true;
      return;
    }

    underwritingHandoffFired.current = true;
    void submitToUnderwriting();
  }, [uploadedDocs, docGroups, currentStage, viewState, activeApplication]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileUpload = async (doc: { id: string; name: string; required: boolean }, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = '';

    if (!activeApplication?.applicationId) {
      toast({ title: "Matrix Fault", description: "Application footprint missing. Please refresh.", variant: "destructive" });
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "Payload Too Large", description: "File must be under 10MB.", variant: "destructive" });
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: "Invalid Format", description: "Only PDF, JPG, and PNG are supported.", variant: "destructive" });
      return;
    }

    setUploadingDocs(prev => ({ ...prev, [doc.id]: true }));

    try {
      // Use doc.id (a stable "hl_sale_deed"-style identifier), not doc.name --
      // the backend's sanitizeDocType() only allows [A-Z0-9_-], and several
      // real document labels contain parentheses or an en-dash (e.g. "Sale
      // Deed (if resale property)", "Title chain documents (20–30 years)"),
      // which always failed with "Vault Rejected: Document Name contains
      // invalid characters".
      const { error } = await PrymeAPI.uploadApplicationDocument(activeApplication.applicationId, doc.id, file);

      if (error) {
        toast({ title: "Vault Rejected", description: error.message || "Failed to encrypt file.", variant: "destructive" });
      } else {
        toast({ title: "Document Secured", description: `${doc.name} successfully encrypted in vault.` });
        // Show it immediately from the local file, then reconcile against the
        // vault. The optimistic entry keeps the slot from flickering empty while
        // the round-trip completes; refreshDocuments replaces it with the
        // server's record, which is what carries the viewable URL.
        setUploadedDocs(prev => ({
          ...prev,
          [doc.id]: { fileName: file.name, docType: doc.id },
          [doc.id.toUpperCase()]: { fileName: file.name, docType: doc.id },
        }));
        void refreshDocuments();
      }
    } catch (err: any) {
      console.error("Upload stream disrupted:", err);
      toast({ title: "Upload Error", description: "Network stream disrupted.", variant: "destructive" });
    } finally {
      setUploadingDocs(prev => ({ ...prev, [doc.id]: false }));
    }
  };

  const handleRemoveDocument = async (doc: { id: string; name: string }) => {
    if (!activeApplication?.applicationId) return;
    
    setUploadingDocs(prev => ({ ...prev, [doc.id]: true }));
    try {
      // Same fix as upload: doc.id is the sanitizer-safe identifier the
      // document was actually stored under, not a normalized form of the
      // (potentially punctuation-containing) display label.
      const { error } = await PrymeAPI.deleteApplicationDocument(activeApplication.applicationId, doc.id);
      if (error) {
         toast({ title: "Delete Failed", description: error.message || "Failed to remove document.", variant: "destructive" });
      } else {
         setUploadedDocs(prev => {
            const next = { ...prev };
            delete next[doc.id];
            delete next[doc.id.toUpperCase()];
            delete next[normalizeDocName(doc.name)];
            return next;
         });
         void refreshDocuments();
         setConfirmDeleteId(null);
         toast({ title: "Document Removed", description: `${doc.name} was successfully removed.` });
      }
    } catch (err) {
      toast({ title: "Delete Error", description: "Failed to communicate with vault.", variant: "destructive" });
    } finally {
      setUploadingDocs(prev => ({ ...prev, [doc.id]: false }));
    }
  };

  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverDocId(id);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverDocId(null);
  };
  const onDrop = (e: React.DragEvent, doc: { id: string; name: string; required: boolean }) => {
    e.preventDefault();
    setDragOverDocId(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const pseudoEvent = { target: { files: e.dataTransfer.files, value: '' } } as any;
      handleFileUpload(doc, pseudoEvent);
    }
  };

  if (authLoading || isDataLoading || viewState === "LOADING") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium text-sm tracking-wide">Syncing architecture...</p>
        </motion.div>
      </div>
    );
  }

  const stages = [
    { id: 1, label: "Identity & Location", desc: "Basic KYC Verification" },
    { id: 2, label: "Document Matrix", desc: "Review and submit application" },
  ];

  return (
    <>
      <Helmet>
        <title>Client Portal | PRYME Bank-Grade Solutions</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] selection:bg-primary/20">
        <Header />

        <PageShell className="flex-1">
          <main className="flex-1 w-full pt-[150px] md:pt-[170px] flex flex-col">
            <AnimatePresence mode="wait">
            {viewState === "FUNNEL" && (
              <motion.div 
                key="funnel"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
              >
                <Section spacing="xs">
                  <Container size="wide" className="max-w-[800px] -mt-[80px]">
                    <Surface className="relative border border-slate-200/60 shadow-lg shadow-slate-200/30 rounded-3xl bg-white p-5 md:p-6">
                      {/* Giant Graphic in Top Right Card Background */}
                      <div className="absolute -top-[70px] right-0 w-64 h-64 md:w-[320px] md:h-[320px] pointer-events-none select-none z-0 hidden md:block">
                        <img 
                          src={applicationBannerImg} 
                          className="w-full h-full object-contain animate-float-medium drop-shadow-xl" 
                          alt="" 
                        />
                      </div>
                      <div className="border-b border-slate-100 pb-2 mb-3 flex flex-col justify-start gap-1 relative z-10">
                        <Inline gap="var(--space-2)" align="center" className="text-blue-600 font-bold text-xs uppercase tracking-widest justify-start">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                          Your Application
                        </Inline>
                        <Inline justify="space-between" align="center" className="gap-3 flex-wrap">
                          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-display tracking-tight leading-tight">
                            Let's get you funded
                          </h1>
                          {/* The only route back to the portfolio now that login lands
                              here. Without it a returning applicant would have no way to
                              reach their other applications or the delete action. */}
                          {myApplications.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setViewState("DASHBOARD");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                            >
                              <Wallet className="w-3.5 h-3.5" />
                              My Portfolio
                            </button>
                          )}
                        </Inline>
                      </div>

                      {/* Application switcher -- only shown once there's more than one
                          in-progress application to choose between. A dropdown rather than
                          a pill row: pills labeled only by loan type render identically for
                          two applications of the same type, giving no way to tell them apart
                          or see which is actually selected. The dropdown disambiguates each
                          entry with a status badge, amount, and date, and only the chosen
                          application's funnel renders below -- selecting one is the only
                          thing that changes what's on screen. */}
                      {(() => {
                        const inProgressApps = myApplications.filter(a => (a.completionPercentage || 0) < 100);
                        if (inProgressApps.length <= 1) return null;
                        const activeStatus = activeApplication ? getStatusConfig(activeApplication.status) : null;
                        return (
                          <div className="mb-4 relative z-10">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="flex items-center justify-between gap-3 w-full sm:w-auto sm:min-w-[280px] px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-colors text-left">
                                  <span className="flex items-center gap-2 min-w-0">
                                    <span className="font-bold text-sm text-slate-900 truncate">
                                      {activeApplication ? formatLoanTypeLabel(activeApplication.loanType) : "Select application"}
                                    </span>
                                    {activeStatus && (
                                      <span className={cn("px-1.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide shrink-0", activeStatus.color)}>
                                        {activeStatus.label}
                                      </span>
                                    )}
                                  </span>
                                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-[300px]">
                                {inProgressApps.map((app) => {
                                  const isActive = activeApplication?.applicationId === app.applicationId;
                                  const statusConfig = getStatusConfig(app.status);
                                  return (
                                    <DropdownMenuItem
                                      key={app.applicationId}
                                      onSelect={() => { if (!isActive) loadApplicationIntoFunnel(app, myApplications); }}
                                      className="flex items-start gap-2.5 py-2.5 px-2.5 cursor-pointer group"
                                    >
                                      <span className={cn("mt-1 w-3.5 h-3.5 shrink-0 flex items-center justify-center", isActive ? "text-blue-600" : "text-transparent")}>
                                        <Check className="w-3.5 h-3.5" />
                                      </span>
                                      <span className="flex flex-col gap-1 min-w-0 flex-1">
                                        <span className="font-bold text-sm text-slate-900 truncate">
                                          {formatLoanTypeLabel(app.loanType)}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
                                          <span className={cn("px-1.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide", statusConfig.color)}>
                                            {statusConfig.label}
                                          </span>
                                          <span>{formatINR(app.requestedAmount)}</span>
                                          <span className="text-slate-300">·</span>
                                          <span>{formatISTDate(app.createdAt)}</span>
                                        </span>
                                      </span>
                                      <button
                                        type="button"
                                        // Stop the click from bubbling to the DropdownMenuItem's own
                                        // select handler above -- otherwise clicking delete would also
                                        // switch the active application before the confirm dialog opens.
                                        onClick={(e) => { e.stopPropagation(); e.preventDefault(); setAppPendingDeletion(app); }}
                                        className="mt-0.5 p-1 rounded-md text-slate-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                        aria-label={`Delete ${formatLoanTypeLabel(app.loanType)} application`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        );
                      })()}
                  <SplitLayout className="grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <SplitLayout.Media className="lg:col-span-3 sticky top-6 lg:border-r lg:border-slate-100 lg:pr-6">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Application Steps</h3>
                      
                      <div className="relative flex flex-col gap-6">
                        {/* Timeline Connection Line */}
                        <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-slate-100 dark:bg-white/[0.04]"></div>
                        
                        {stages.map((s) => {
                          const isCompleted = currentStage > s.id;
                          const isActive = currentStage === s.id;
                          const isLocked = currentStage < s.id;

                          // Icon config
                          let StepIcon = Lock;
                          if (isCompleted) StepIcon = Check;
                          else {
                            if (s.id === 1) StepIcon = User;
                            else if (s.id === 2) StepIcon = Briefcase;
                            else if (s.id === 3) StepIcon = Wallet;
                            else if (s.id === 4) StepIcon = Coins;
                            else StepIcon = FileText;
                          }

                          return (
                            <button
                              key={s.id}
                              disabled={isLocked}
                              onClick={() => setCurrentStage(s.id)}
                              className={`flex items-start gap-4 text-left w-full transition-all duration-300 p-2.5 rounded-xl ${
                                isActive 
                                  ? "bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 shadow-sm" 
                                  : isCompleted 
                                    ? "hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer" 
                                    : "opacity-60 cursor-not-allowed"
                              }`}
                            >
                              {/* Step circle status indicator */}
                              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border z-10 transition-all ${
                                isCompleted 
                                  ? "bg-emerald-500 border-emerald-500 text-white" 
                                  : isActive 
                                    ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20" 
                                    : "bg-slate-50 border-slate-200 text-slate-400"
                              }`}>
                                <StepIcon className="w-5 h-5" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate ${isActive ? "text-blue-600" : "text-slate-800"}`}>{s.label}</p>
                                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">{s.desc}</p>
                              </div>
                              {isActive && <ChevronRight className="w-4 h-4 text-blue-600 self-center shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* 100% Secure & Confidential banner block */}
                      <div className="mt-5 bg-blue-50/40 border border-blue-100 p-4 rounded-2xl flex gap-3.5 items-start">
                        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">100% Secure & Confidential</p>
                          <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-relaxed">Your data is protected with bank-level security.</p>
                        </div>
                      </div>
                  </SplitLayout.Media>

                  <SplitLayout.Content className="lg:col-span-9 lg:pl-6">
                    <motion.div key={currentStage} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                      <div className="relative z-10">
                        
                        {currentStage === 1 && (
                          <Stack gap="var(--space-4)" className="relative z-10">
                            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                              <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">1. Customer & Loan Information</h2>
                                <p className="text-sm text-slate-500 font-medium mt-1">Please review your details and provide any additional information to help us find the best loan offers for you.</p>
                              </div>
                            </div>

                            <CustomerLoanInformationStep
                              applicationId={activeApplication?.applicationId?.startsWith("pending-") ? undefined : activeApplication?.applicationId}
                              existingCoApplicantPhotoUrl={activeApplication?.documents?.find(d => d.name === "Co-Applicant Photo" || d.docType === "Co-Applicant Photo")?.url}
                            />
                          </Stack>
                        )}

                        {currentStage === 2 && (
                          <Stack gap="var(--space-5)" className="relative z-10">
                            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                              <div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">2. Document Matrix</h2>
                                <p className="text-sm text-slate-500 font-medium mt-1">Review your details, upload the required documentation, and submit to underwriting.</p>
                              </div>
                            </div>
                            
                            {/* Overall Progress */}
                            {(() => {
                              const totalDocsCount = docGroups.reduce((sum, g) => sum + g.docs.length, 0);
                              const uploadedDocsCount = docGroups.reduce((sum, g) => sum + g.docs.filter(d => uploadedDocs[d.id] || uploadedDocs[normalizeDocName(d.name)]).length, 0);
                              const overallPercent = totalDocsCount > 0 ? Math.round((uploadedDocsCount / totalDocsCount) * 100) : 0;
                              return (
                                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                  <p className="text-sm font-semibold text-slate-500 mb-3">Overall Progress</p>
                                  <div className="flex items-center gap-6">
                                    <span className="text-4xl font-black text-blue-600 leading-none shrink-0">{overallPercent}%</span>
                                    <Progress value={overallPercent} className="h-2 flex-1 bg-slate-100 [&>div]:bg-blue-600" />
                                    <span className="text-sm font-semibold text-slate-500 whitespace-nowrap shrink-0">{uploadedDocsCount} / {totalDocsCount} Documents Uploaded</span>
                                  </div>
                                  <p className="text-xs font-medium text-slate-500 mt-2">{uploadedDocsCount} of {totalDocsCount} Uploaded</p>
                                </div>
                              );
                            })()}

                            {/* Loan Details (from previous step) */}
                            {(() => {
                              // 🧠 Same precedence as the formData hydration effect above:
                              // the persisted application record wins when it has the field,
                              // falling back to loanRequirements (the same store Stage 1's
                              // own "Loan Details" bar in CustomerLoanInformationStep reads,
                              // populated during the /apply intake and localStorage-persisted).
                              const lr = store.loanRequirements;
                              const loanAmount = Number(activeApplication?.requestedAmount) || Number(lr?.loanAmount) || 0;
                              const tenureYears = Number(activeApplication?.metadata?.tenure) || Number(lr?.tenureYears) || 0;
                              const cibilScore = activeApplication?.declaredCibilScore || lr?.cibilScore || 0;
                              const propertyValue = Number(activeApplication?.metadata?.propertyValue) || Number(lr?.propertyValue) || 0;
                              const loanTypeLabel = (lr?.loanType && LOAN_TYPE_LABELS[lr.loanType]) || activeApplication?.loanType || "—";

                              const loanDetails = [
                                {
                                  icon: Wallet,
                                  label: "Loan Amount",
                                  value: loanAmount > 0 ? formatINR(loanAmount) : "—",
                                },
                                {
                                  icon: CalendarDays,
                                  label: "Tenure",
                                  value: tenureYears > 0 ? `${tenureYears} Years` : "—",
                                },
                                {
                                  icon: FileText,
                                  label: "Loan Type",
                                  value: loanTypeLabel,
                                },
                                {
                                  icon: Award,
                                  label: "Credit Score",
                                  value: cibilScore > 0 ? cibilScore : "—",
                                },
                                {
                                  icon: Home,
                                  label: "Property Value",
                                  value: propertyValue > 0 ? formatINR(propertyValue) : "—",
                                },
                              ];

                              return (
                                <div className="bg-white border border-slate-100 rounded-2xl p-5">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Loan Details (from previous step)</p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                                    {loanDetails.map((item) => (
                                      <div key={item.label} className="flex flex-col gap-1.5 min-w-0">
                                        <item.icon className="w-4 h-4 text-blue-500" />
                                        <p className="text-[11px] text-slate-500 font-medium">{item.label}</p>
                                        <p className="text-sm font-bold text-slate-800 truncate">{item.value}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Documents Upload Section */}
                            <Stack gap="var(--space-4)">
                              <Inline justify="space-between" align="center">
                                <Inline align="center" gap="var(--space-3)">
                                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5 text-orange-500" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-slate-800 text-base">Upload Documents</h3>
                                    <p className="text-xs text-slate-500 font-medium">Upload the required documents to proceed.</p>
                                  </div>
                                </Inline>
                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full shrink-0">
                                  {docGroups.reduce((sum, g) => sum + g.docs.filter(d => uploadedDocs[d.id] || uploadedDocs[normalizeDocName(d.name)]).length, 0)} Uploaded
                                </span>
                              </Inline>

                              <Stack gap="var(--space-3)">
                                {docGroups.map((group) => {
                                  const categorySubtitles: Record<string, string> = {
                                    "Identity Documents": "Upload identity-related documents",
                                    "Income Documents": "Upload income-related documents",
                                    "Property Documents": "Upload property-related documents",
                                    "Financial Documents": "Upload financial-related documents",
                                    "Business Proof": "Upload business-related documents",
                                    "Additional Documents": "Upload any additional supporting documents"
                                  };
                                  const subtitle = categorySubtitles[group.displayName] || `Upload ${group.displayName.toLowerCase()}`;

                                  const totalDocs = group.docs.length;
                                  const securedDocs = group.docs.filter(d => uploadedDocs[d.id] || uploadedDocs[normalizeDocName(d.name)]).length;
                                  const isOpen = !collapsedCategories[group.category];

                                  return (
                                    <Collapsible
                                      key={group.category}
                                      open={isOpen}
                                      onOpenChange={(open) => setCollapsedCategories(prev => ({ ...prev, [group.category]: !open }))}
                                      className="border border-slate-100 rounded-2xl overflow-hidden"
                                    >
                                      <CollapsibleTrigger className="w-full flex items-center justify-between gap-3 p-4 hover:bg-slate-50/60 transition-colors">
                                        <Inline align="center" gap="var(--space-3)">
                                          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                            <FileText className="w-4 h-4 text-orange-500" />
                                          </div>
                                          <div className="text-left">
                                            <h4 className="text-sm font-bold text-slate-800">{group.displayName}</h4>
                                            <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
                                          </div>
                                        </Inline>
                                        <Inline align="center" gap="var(--space-3)" className="shrink-0">
                                          <span className="text-xs font-semibold text-slate-500">{securedDocs} / {totalDocs} Uploaded</span>
                                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                                        </Inline>
                                      </CollapsibleTrigger>

                                      <CollapsibleContent>
                                      <Stack gap="var(--space-3)" className="px-4 pb-4">
                                        {group.docs.map((doc) => {
                                          const isUploading = uploadingDocs[doc.id];
                                          // The record itself, so the row can show the file rather than a tick.
                                          const uploadedInfo = uploadedDocs[doc.id]
                                            || uploadedDocs[doc.id.toUpperCase()]
                                            || uploadedDocs[normalizeDocName(doc.name)];
                                          const isUploaded = Boolean(uploadedInfo);
                                          const isDragging = dragOverDocId === doc.id;
                                          const isConfirmingDelete = confirmDeleteId === doc.id;

                                          let cardClass = "doc-card-pending";
                                          if (isDragging) cardClass = "doc-card-dragover";
                                          if (isUploading) cardClass = "doc-card-uploading animate-pulse-glow";
                                          if (isUploaded) cardClass = "doc-card-secured";

                                          return (
                                            <Inline 
                                              key={doc.id} 
                                              align="center"
                                              justify="space-between"
                                              className={`group relative p-4 rounded-xl border transition-all ${cardClass}`}
                                              onDragOver={(e) => onDragOver(e, doc.id)}
                                              onDragLeave={onDragLeave}
                                              onDrop={(e) => onDrop(e, doc)}
                                            >
                                              <Stack gap="none" className="z-10">
                                                <Inline align="center" gap="var(--space-2)">
                                                  {isUploaded && <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-checkmark" />}
                                                  <span className={`font-bold text-xs ${isUploaded ? 'text-emerald-700' : 'text-slate-800'}`}>
                                                    {doc.name} {doc.required && !isUploaded && <span className="text-red-500 ml-1">*</span>}
                                                  </span>
                                                </Inline>
                                                {!isUploaded && <span className="text-[10px] font-medium text-slate-500 mt-0.5">PDF, JPG, PNG up to 10MB</span>}
                                                {isUploaded && (
                                                  <Inline align="center" gap="var(--space-2)" className="mt-0.5 flex-wrap">
                                                    <span className="text-[10px] text-slate-600 font-medium max-w-[220px] truncate" title={uploadedInfo?.fileName}>
                                                      {uploadedInfo?.fileName || "Document on file"}
                                                    </span>
                                                    {uploadedInfo?.url && (
                                                      <a
                                                        href={uploadedInfo.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] font-bold text-blue-600 hover:underline"
                                                      >
                                                        View
                                                      </a>
                                                    )}
                                                    <span className="text-[10px] text-emerald-600 font-bold tracking-wide">Secured</span>
                                                  </Inline>
                                                )}
                                              </Stack>
                                              
                                              <Inline align="center" gap="var(--space-3)" className="z-10">
                                                <input 
                                                  title={`Upload ${doc.name}`}
                                                  type="file" 
                                                  id={`upload-${doc.id}`} 
                                                  className="hidden" 
                                                  accept=".pdf,.jpg,.jpeg,.png"
                                                  onChange={(e) => handleFileUpload(doc, e)}
                                                  // Not disabled when uploaded: the same input backs Replace,
                                                  // so a user can swap a wrong file without deleting first.
                                                  disabled={isUploading}
                                                />
                                                
                                                {isUploading && (
                                                  <Inline align="center" gap="var(--space-2)" className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium text-xs">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Encrypting
                                                  </Inline>
                                                )}

                                                {isUploaded && !isUploading && (
                                                  <Inline align="center" gap="var(--space-2)">
                                                    {isConfirmingDelete ? (
                                                      <Inline align="center" className="bg-white shadow-sm border border-red-100 rounded-lg p-1 animate-in fade-in zoom-in duration-200">
                                                        <span className="text-[10px] font-medium text-red-600 px-2">Remove?</span>
                                                        <Button size="sm" variant="ghost" className="h-7 hover:bg-red-50 text-red-600 px-2" onClick={() => handleRemoveDocument(doc)}>Yes</Button>
                                                        <Button size="sm" variant="ghost" className="h-7 hover:bg-slate-100 px-2" onClick={() => setConfirmDeleteId(null)}>No</Button>
                                                      </Inline>
                                                    ) : (
                                                      <>
                                                        <Label
                                                          htmlFor={`upload-${doc.id}`}
                                                          className="inline-flex items-center justify-center rounded-lg text-[11px] font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 h-8 px-3 cursor-pointer transition-colors"
                                                        >
                                                          Replace
                                                        </Label>
                                                        <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          title={`Remove ${doc.name}`}
                                                          className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                          onClick={() => setConfirmDeleteId(doc.id)}
                                                        >
                                                          <X className="w-4 h-4" />
                                                        </Button>
                                                      </>
                                                    )}
                                                  </Inline>
                                                )}

                                                {!isUploaded && !isUploading && (
                                                  <Label 
                                                    htmlFor={`upload-${doc.id}`} 
                                                    className="inline-flex items-center justify-center rounded-xl text-xs font-bold transition-all focus-visible:outline-none border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 shadow-sm h-9 px-4 cursor-pointer"
                                                  >
                                                    <UploadCloud className="w-4 h-4 mr-2 text-blue-600" />
                                                    Browse Files
                                                  </Label>
                                                )}
                                              </Inline>
                                            </Inline>
                                          );
                                        })}
                                      </Stack>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  );
                                })}
                              </Stack>
                            </Stack>
                          </Stack>
                        )}

                        {/* Navigation Actions Row */}
                        <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center relative z-10">
                          {currentStage > 1 ? (
                            <Button 
                              variant="ghost" 
                              onClick={() => setCurrentStage(prev => prev - 1)}
                              className="h-12 px-6 font-bold text-slate-600 hover:bg-slate-50 rounded-xl"
                            >
                              Back
                            </Button>
                          ) : <div />}

                          {/* No submit button on the documents stage. Documents pass
                              straight through to the vault as they are uploaded, so there
                              is nothing left to "submit" -- a button there would imply the
                              files were still being held locally. The application is
                              handed to underwriting automatically once every required
                              document is present (see the effect that calls
                              submitToUnderwriting), and the user can keep replacing or
                              removing files afterwards from My Applications. */}
                          {currentStage === 2 ? (
                            <Inline align="center" gap="var(--space-2)" className="text-xs font-semibold text-slate-500">
                              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                              <span>Documents save automatically as you upload them.</span>
                            </Inline>
                          ) : (
                            <Button
                              onClick={handleNextStage}
                              disabled={isSaving}
                              className="h-12 px-8 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/10 disabled:opacity-70 transition-all rounded-xl hover:-translate-y-0.5"
                            >
                              {isSaving ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                              ) : (
                                <>Save &amp; Continue <ChevronRight className="w-4 h-4 ml-1.5" /></>
                              )}
                            </Button>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  </SplitLayout.Content>
                </SplitLayout>
              </Surface>

                {/* Funnel Page bottom row features block */}
                <div className="mt-8 max-w-[650px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 p-2">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center border border-blue-100/50 dark:border-blue-900/30 shrink-0 mb-2.5">
                      <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Bank-Level Security</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-normal">Your data is 100% secure</p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center border border-blue-100/50 dark:border-blue-900/30 shrink-0 mb-2.5">
                      <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Instant Processing</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-normal">Quick & hassle-free</p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center border border-blue-100/50 dark:border-blue-900/30 shrink-0 mb-2.5">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Minimal Documentation</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-normal">Only what's essential</p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center border border-blue-100/50 dark:border-blue-900/30 shrink-0 mb-2.5">
                      <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">24/7 Support</p>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-normal">We're here to help</p>
                  </div>
                </div>
                  </Container>
                </Section>
              </motion.div>
            )}
          </AnimatePresence>

          {(viewState === "DASHBOARD" || viewState === "EMPTY") && (
            <AnimatePresence mode="wait">
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
              >
                <Surface className="relative overflow-hidden rounded-3xl border border-slate-200/60 shadow-sm bg-gradient-to-br from-white via-white to-blue-50/40 mb-[var(--space-md)]">
                  <Section spacing="lg">
                    <Container size="expanded">
                    <Inline justify="space-between" align="end" className="flex-col md:flex-row gap-[var(--space-4)]">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
                        <h1 className="text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))] mb-[var(--space-2)] tracking-tight">Client Portfolio</h1>
                        <p className="text-[hsl(var(--muted-foreground))] text-[length:var(--text-large)]">Real-time tracking for your active financial instruments.</p>
                      </motion.div>
                      {viewState !== "EMPTY" && (
                        <Inline gap="var(--space-3)" align="center">
                          {isAdmin && (
                            <Button onClick={() => navigate("/admin")} variant="outline" className="border-[hsl(var(--border))]">
                              <Building2 className="w-4 h-4 mr-2" /> Admin Core
                            </Button>
                          )}
                          <Link to="/apply">
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                              New Application <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </Link>
                        </Inline>
                      )}
                    </Inline>
                    </Container>
                  </Section>
                </Surface>

                <Section spacing="none">
                  <Container size="expanded">
                  {viewState === "EMPTY" ? (
                    <Surface className="relative overflow-hidden rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 bg-gradient-to-br from-white via-white to-blue-50/30">
                      <Section spacing="2xl">
                        <Container size="full">
                          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={spring}
                              className="flex-1 text-center lg:text-left max-w-lg mx-auto lg:mx-0"
                            >
                              <Inline gap="var(--space-2)" align="center" className="text-blue-600 font-bold text-xs uppercase tracking-widest justify-center lg:justify-start mb-3">
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                Your Portfolio
                              </Inline>
                              <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">No Active Instruments</h3>
                              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                                Your portfolio is empty. Start a new application to explore offers from our banking partners and track it right here.
                              </p>
                              <Link to="/apply">
                                <Button
                                  size="lg"
                                  className="h-12 px-8 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 rounded-xl transition-all hover:-translate-y-0.5"
                                >
                                  Initialize Application <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                              </Link>
                              <Inline gap="var(--space-2)" align="center" className="justify-center lg:justify-start mt-6 text-xs font-semibold text-slate-400">
                                <Lock className="w-3.5 h-3.5" /> Takes less than 5 minutes &middot; 100% secure &amp; confidential
                              </Inline>
                            </motion.div>

                            <div className="flex-1 flex justify-center lg:justify-end">
                              <img
                                src={applicationBannerImg}
                                alt=""
                                className="w-56 md:w-72 h-auto object-contain animate-float-medium drop-shadow-xl select-none pointer-events-none"
                              />
                            </div>
                          </div>
                        </Container>
                      </Section>
                    </Surface>
                  ) : (
                    <Stack gap="var(--space-6)">
                      {myApplications.map((app, index) => {
                        const config = getStatusConfig(app.status);
                        const StatusIcon = config.icon;
                        return (
                          <motion.div key={app.applicationId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", ...spring, delay: index * 0.1 }}>
                            <Surface className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-white to-blue-50/40 shadow-lg shadow-slate-200/40 transition-all hover:border-blue-300/60 hover:shadow-xl hover:shadow-slate-200/60">
                              {/* Brand accent rail -- ties the card to the same blue
                                  gradient language used by the funnel and empty states,
                                  and gives the layout a defined left edge instead of
                                  text floating in a white void. */}
                              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700" />

                              <div className="p-[var(--space-6)] md:p-[var(--space-8)] pl-[calc(var(--space-6)+4px)] md:pl-[calc(var(--space-8)+4px)]">
                                {/* Header: identity on the left, destructive action kept
                                    small and on the right. Previously delete was a
                                    full-width red row that competed with the primary CTA. */}
                                <Inline justify="space-between" align="center" className="gap-3 flex-wrap mb-[var(--space-6)]">
                                  <Inline gap="var(--space-3)" align="center" className="min-w-0">
                                    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[length:var(--text-caption)] font-bold border", config.color)}>
                                      <StatusIcon className="w-3.5 h-3.5" /> {config.label}
                                    </span>
                                    <span className="text-[length:var(--text-small)] font-mono font-medium text-slate-400 truncate">
                                      {app.applicationId}
                                    </span>
                                  </Inline>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Delete application"
                                    className="h-8 w-8 shrink-0 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    onClick={() => setAppPendingDeletion(app)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </Inline>

                                <div className="flex flex-col lg:flex-row lg:items-end gap-[var(--space-6)] lg:gap-[var(--space-10)]">
                                  {/* Amount block -- the single most important fact on the
                                      card, so it leads and is the largest type. */}
                                  <Stack gap="none" className="min-w-0">
                                    <p className="text-[length:var(--text-caption)] font-bold text-blue-600 uppercase tracking-[0.15em] mb-1.5">
                                      {formatLoanTypeLabel(app.loanType) || "Personal Loan"}
                                    </p>
                                    <h3 className="text-[2rem] md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none flex items-baseline gap-2">
                                      <Wallet className="w-6 h-6 md:w-7 md:h-7 text-blue-500/70 shrink-0 self-center" />
                                      <span className="tabular-nums">₹{app.requestedAmount?.toLocaleString("en-IN") || "0"}</span>
                                    </h3>
                                  </Stack>

                                  {/* Progress + meta, right-aligned on desktop so the two
                                      halves read as one row rather than two disconnected
                                      columns with a gap between them. */}
                                  <Stack gap="var(--space-4)" className="flex-1 lg:max-w-sm w-full">
                                    <div>
                                      <Inline justify="space-between" align="center" className="text-[length:var(--text-small)] mb-2 font-semibold">
                                        <span className="text-slate-500">Application progress</span>
                                        <span className="text-blue-600 tabular-nums font-bold">{app.completionPercentage || config.progress}%</span>
                                      </Inline>
                                      <Progress
                                        value={app.completionPercentage || config.progress}
                                        className="h-1.5 bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-blue-600"
                                      />
                                    </div>

                                    <Inline gap="var(--space-2)" className="flex-wrap">
                                      <Inline gap="var(--space-2)" align="center" className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 min-w-0">
                                        <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <Stack gap="none" className="min-w-0">
                                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 leading-none">Initiated</span>
                                          <span className="text-[length:var(--text-small)] font-semibold text-slate-700 truncate">
                                            {app.createdAt ? formatISTDate(app.createdAt) : "N/A"}
                                          </span>
                                        </Stack>
                                      </Inline>
                                      <Inline gap="var(--space-2)" align="center" className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 min-w-0">
                                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <Stack gap="none" className="min-w-0">
                                          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 leading-none">Assignee</span>
                                          <span className="text-[length:var(--text-small)] font-semibold text-slate-700 truncate">
                                            {app.assignee || "Evaluating"}
                                          </span>
                                        </Stack>
                                      </Inline>
                                    </Inline>
                                  </Stack>
                                </div>

                                {/* Primary action as an actual button. It used to be a
                                    ghost row that read as plain text, so the one thing a
                                    user comes here to do looked like a label. */}
                                <div className="mt-[var(--space-6)] pt-[var(--space-5)] border-t border-slate-100">
                                  <Button
                                    className="w-full sm:w-auto h-11 px-6 justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                                    onClick={() => {
                                        setActiveApplication(app);
                                        // 🧠 SILICON VALLEY FEATURE: Re-hydrate the form allowing post-submission edits
                                        // loadApplicationDataIntoStore populates the Zustand store
                                        // (basicKYC/loanRequirements/financialDetails/financialFootprint) --
                                        // CustomerLoanInformationStep reads from the store, not from
                                        // `formData`, so without this call every field rendered blank
                                        // for any application at 100% completion (the only ones that
                                        // reach this button).
                                        loadApplicationDataIntoStore(store, app, myApplications);
                                        if (app.metadata) {
                                          try {
                                            const parsedMeta = typeof app.metadata === "string" ? JSON.parse(app.metadata) : app.metadata;
                                            setFormData(prev => ({ ...prev, ...parsedMeta }));
                                          } catch(e) { console.error(e); }
                                        }

                                        setUploadedDocs(buildUploadedDocMap(app.documents));
                                        void hydrateDocumentsFromVault(app.applicationId);

                                        setViewState("FUNNEL");
                                        // Straight to the document matrix: this button exists so a user
                                        // can revisit what they uploaded, and landing on Applicant
                                        // Information made them page past a form they did not come for.
                                        setCurrentStage(2);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                      }}
                                  >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Manage Documents &amp; Details
                                    <ChevronRight className="w-4 h-4 ml-1.5" />
                                  </Button>
                                </div>
                              </div>
                            </Surface>
                          </motion.div>
                        );
                      })}
                    </Stack>
                  )}
                  </Container>
                </Section>
              </motion.div>
            </AnimatePresence>
          )}
          </main>
        </PageShell>
        <Footer />
      </div>

      {/* Shared delete-application confirmation -- one dialog for both the
          switcher dropdown and the Client Portfolio cards, driven by
          `appPendingDeletion` rather than one AlertDialog instance per row. */}
      <AlertDialog open={!!appPendingDeletion} onOpenChange={(open) => { if (!open && !isDeletingApp) setAppPendingDeletion(null); }}>
        <AlertDialogContent className="rounded-2xl border-slate-200 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">Delete this application?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              {appPendingDeletion && (
                <>
                  This will remove your <span className="font-semibold text-slate-700">{formatLoanTypeLabel(appPendingDeletion.loanType)}</span> application
                  ({formatINR(appPendingDeletion.requestedAmount)}, started {formatISTDate(appPendingDeletion.createdAt)}) from your dashboard.
                  This can't be undone from here -- contact support if you need it restored.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingApp} className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletingApp}
              onClick={(e) => { e.preventDefault(); if (appPendingDeletion) handleDeleteApplication(appPendingDeletion); }}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeletingApp ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Dashboard;
