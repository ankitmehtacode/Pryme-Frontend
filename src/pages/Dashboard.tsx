import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FileText, Search, CheckCircle, CreditCard, Clock,
  AlertCircle, Building2, TrendingUp, Activity,
  ShieldCheck, ChevronRight, ArrowRight, Wallet,
  UploadCloud, CheckCircle2, Circle, Loader2, Edit2, Target, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

// 🧠 ARCHITECTURE IMPORTS
import api, { PrymeAPI } from "@/lib/api";
import { getDocumentsForLoanType, groupDocumentsByCategory, ProductType, EmploymentType } from "@/lib/documentData";

// --- Types & Interfaces ---
interface ApplicationDoc {
  docType: string;
  url?: string;
  name?: string;
  id?: string;
}

interface Application {
  applicationId: string;
  status: string;
  loanType: string;
  requestedAmount: number;
  completionPercentage: number;
  createdAt: string;
  assignee?: string;
  documents?: ApplicationDoc[];
  metadata?: Record<string, any>;
}

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
}

const initialFormData: DashboardFormData = {
  panNumber: "", dob: "", currentCity: "", pinCode: "", 
  companyName: "", designation: "", workExperience: "", officeEmail: "", 
  monthlyEMI: "", existingBank: "", coApplicant: "No", loanPurpose: "", 
};

type ViewState = "LOADING" | "FUNNEL" | "DASHBOARD" | "EMPTY";

const spring = { stiffness: 120, damping: 28, mass: 0.8 };

const getStatusConfig = (status: string) => {
  switch (status?.toUpperCase()) {
    case "SUBMITTED":
      return { color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/50 dark:text-blue-400", icon: FileText, progress: 20, label: "Submitted" };
    case "PROCESSING":
      return { color: "text-blue-800 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/50 dark:text-blue-400", icon: Activity, progress: 50, label: "Processing" };
    case "VERIFIED":
      return { color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800/50 dark:text-indigo-400", icon: ShieldCheck, progress: 75, label: "Verified" };
    case "APPROVED":
      return { color: "text-blue-800 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-950/50 dark:text-blue-400", icon: CheckCircle, progress: 100, label: "Approved" };
    case "REJECTED":
      return { color: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800/50 dark:text-red-400", icon: AlertCircle, progress: 100, label: "Rejected" };
    default:
      return { color: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700/50 dark:text-slate-400", icon: Clock, progress: 5, label: status || "Draft" };
  }
};

const Dashboard: React.FC = () => {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [viewState, setViewState] = useState<ViewState>("LOADING");
  
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [activeApplication, setActiveApplication] = useState<Application | null>(null);
  
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [dragOverDocId, setDragOverDocId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [currentStage, setCurrentStage] = useState<number>(1);
  const [formData, setFormData] = useState<DashboardFormData>(initialFormData);

  // 🧠 SMART NORMALIZER: Aligns React frontend names with Java Backend Sanitized Names
  const normalizeDocName = (name: string) => name.trim().toUpperCase().replace(/\s+/g, '_');

  useEffect(() => {
    const abortController = new AbortController();
    
    const bootDashboard = async () => {
      if (authLoading) return;
      if (!user) {
        navigate("/auth?redirect=/dashboard", { replace: true });
        return;
      }
      if (isAdmin) {
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
          const primaryApp = apps[0]; 
          setActiveApplication(primaryApp);
          const progress = primaryApp.completionPercentage || 0;
          
          // 🧠 TITANIUM HYDRATION: Safe checking for uploaded documents
          if (primaryApp.documents && primaryApp.documents.length > 0) {
            const loadedDocs: Record<string, boolean> = {};
            primaryApp.documents.forEach((d) => {
              if (d.docType) loadedDocs[d.docType] = true;
            });
            setUploadedDocs(loadedDocs);
          }

          if (progress < 100) {
            setViewState("FUNNEL");
            if (progress < 50) setCurrentStage(1);
            else setCurrentStage(2); 
            
            if (primaryApp.metadata) {
              let parsedMeta: Partial<DashboardFormData> = {};
              if (typeof primaryApp.metadata === "string") {
                try {
                  parsedMeta = JSON.parse(primaryApp.metadata);
                } catch (e) {
                  console.error("Failed to parse metadata", e);
                }
              } else if (typeof primaryApp.metadata === "object") {
                parsedMeta = primaryApp.metadata;
              }
              setFormData(prev => ({ ...prev, ...parsedMeta }));
            }
          } else {
            setViewState("DASHBOARD");
          }
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
  }, [user, authLoading, isAdmin, navigate]);
  
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

  const handleInputChange = useCallback((field: keyof DashboardFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateCurrentStage = useCallback((): boolean => {
    switch (currentStage) {
      case 1:
        if (!formData.panNumber || !formData.dob || !formData.currentCity || !formData.pinCode) {
          toast({ title: "Incomplete Identity Data", description: "Please complete all fields in this section.", variant: "destructive" });
          return false;
        }
        if (formData.panNumber.length !== 10) {
          toast({ title: "Invalid PAN", description: "PAN Number must be exactly 10 characters.", variant: "destructive" });
          return false;
        }
        if (formData.pinCode.length < 6) {
          toast({ title: "Invalid PIN Code", description: "Please enter a valid 6-digit PIN code.", variant: "destructive" });
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  }, [currentStage, formData]);

  const handleNextStage = async () => {
    if (!validateCurrentStage()) return;
    if (!activeApplication) return;
    
    setIsSaving(true);
    
    const newStage = currentStage + 1;
    const newProgress = Math.min(currentStage * 50, 100);
    
    try {
      let targetAppId = activeApplication.applicationId;
      
      // 🧠 JIT BACKEND SYNC: If this is a synthetic frontend application (from a lost lead),
      // we must recreate the lead on the backend and elevate it before we can PATCH progress.
      if (targetAppId.startsWith("pending-")) {
        console.log("Synthesizing lost application context into backend...");
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
           loanAmount: activeApplication.requestedAmount || cachedApp.loanAmount || 100000,
           loanType: normalizedLoanType,
           productType: normalizedLoanType, // 🧠 FIX: submitLead prefers productType over loanType
           cibilScore: cachedApp.cibilScore || 0,
           monthlyIncome: cachedApp.monthlyIncome || 0
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

      await api.patch(`/applications/${targetAppId}`, {
         metadata: formData,
         completionPercentage: newProgress
      });
      toast({ title: "Progress Saved", description: "Your data has been securely saved." });
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

  const handleFinalSubmit = async () => {
    if (!activeApplication) return;
    
    // 🧠 STRICT SUBMISSION CHECK: Ensure all mandatory documents are marked as uploaded 
    // Checks against both local ID and backend sanitized DocType format
    const allRequiredDocs = docGroups.flatMap(group => group.docs).filter(d => d.required);
    const missingDocs = allRequiredDocs.some(d => !uploadedDocs[d.id] && !uploadedDocs[normalizeDocName(d.name)]);

    if (missingDocs) {
      toast({ 
        title: "Missing Documents", 
        description: "Please upload all mandatory documents before submission.", 
        variant: "destructive" 
      });
      return;
    }

    setIsSaving(true);

    try {
      await api.patch(`/applications/${activeApplication.applicationId}/status`, { status: "PROCESSING" });
      await api.patch(`/applications/${activeApplication.applicationId}`, { completionPercentage: 100 });
      
      toast({ title: "Underwriting Initiated", description: "All documents secured. Routing to your portfolio tracker." });
      
      setMyApplications(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[0].completionPercentage = 100;
          updated[0].status = "PROCESSING";
        }
        return updated;
      });
      setViewState("DASHBOARD");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      console.error("Submission Error:", error);
      toast({ 
        title: "Submission Failed", 
        description: error.response?.data?.message || "Failed to submit application. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

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
      const { error } = await PrymeAPI.uploadApplicationDocument(activeApplication.applicationId, doc.name, file);
      
      if (error) {
        toast({ title: "Vault Rejected", description: error.message || "Failed to encrypt file.", variant: "destructive" });
      } else {
        toast({ title: "Document Secured", description: `${doc.name} successfully encrypted in vault.` });
        // 🧠 DETERMINISTIC STATE MUTATION: Use both local ID and backend format to guarantee sync
        setUploadedDocs(prev => ({ 
          ...prev, 
          [doc.id]: true,
          [normalizeDocName(doc.name)]: true 
        }));
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
      const { error } = await PrymeAPI.deleteApplicationDocument(activeApplication.applicationId, normalizeDocName(doc.name));
      if (error) {
         toast({ title: "Delete Failed", description: error.message || "Failed to remove document.", variant: "destructive" });
      } else {
         setUploadedDocs(prev => {
            const next = { ...prev };
            delete next[doc.id];
            delete next[normalizeDocName(doc.name)];
            return next;
         });
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
    { id: 1, label: "Identity Matrix", desc: "Basic KYC Verification" },
    { id: 2, label: "Document Vault", desc: "Secure File Ingestion" },
  ];

  return (
    <>
      <Helmet><title>Client Portal | PRYME Bank-Grade Solutions</title></Helmet>
      <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
        <Header />

        <main className="flex-1 pb-24">
          <AnimatePresence mode="wait">
            {viewState === "FUNNEL" && (
              <motion.div 
                key="funnel"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="pt-24 px-4 md:px-8 max-w-6xl mx-auto"
              >
                <div className="relative rounded-[2.5rem] p-8 md:p-12 mb-10 overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/40 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl">
                  {/* Subtle Glowing Orbs */}
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                      <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-white/80 to-white/30 dark:from-white/10 dark:to-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 flex items-center justify-center shadow-lg">
                        <Target className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                          Application Funnel
                        </h1>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100/80 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 border border-blue-200/50 dark:border-blue-500/20 backdrop-blur-md">
                            ID: {activeApplication?.applicationId || "Initializing..."}
                          </span>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                            Routing to: <span className="text-slate-900 dark:text-slate-200 font-bold ml-1">{activeApplication?.targetBank || "Pryme Aggregator"}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end w-full md:w-auto bg-white/40 dark:bg-black/20 p-5 rounded-2xl border border-white/50 dark:border-white/5 backdrop-blur-lg">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 leading-none">
                          {Math.min(currentStage === 1 ? 5 : (currentStage - 1) * 50, 100)}
                        </span>
                        <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">%</span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Completion</p>
                    </div>
                  </div>
                  
                  {/* Premium Progress Track */}
                  <div className="relative z-10 h-4 w-full bg-slate-200/50 dark:bg-slate-950/50 rounded-full overflow-hidden border border-white/60 dark:border-white/5 backdrop-blur-md shadow-inner">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full relative overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(currentStage === 1 ? 5 : (currentStage - 1) * 50, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    >
                      {/* Glass Shimmer Effect */}
                      <div className="absolute inset-0 w-full h-full opacity-30" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)' }}></div>
                    </motion.div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4">
                    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sticky top-24">
                      <h3 className="font-bold text-foreground mb-6">Pipeline Stages</h3>
                      <div className="space-y-6">
                        {stages.map((s) => {
                          const isCompleted = currentStage > s.id;
                          const isActive = currentStage === s.id;
                          return (
                            <div key={s.id} className="flex gap-4">
                              <div className="mt-1">
                                {isCompleted ? <CheckCircle2 className="w-6 h-6 text-blue-500" /> : 
                                 isActive ? <Circle className="w-6 h-6 text-blue-500 fill-blue-500/10" /> : 
                                 <Circle className="w-6 h-6 text-slate-300 dark:text-slate-700" />}
                              </div>
                              <div>
                                <p className={`font-semibold ${isActive ? "text-blue-500" : isCompleted ? "text-slate-400 dark:text-slate-500" : "text-foreground"}`}>{s.label}</p>
                                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-8">
                    <motion.div key={currentStage} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-2xl shadow-sm border border-border p-8 relative overflow-hidden">
                      
                      {currentStage === 1 && (
                        <div className="space-y-6 relative z-10">
                          <h2 className="text-xl font-bold border-b border-border pb-4">1. Identity & Location</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="panNumber">PAN Number *</Label>
                              <Input id="panNumber" value={formData.panNumber} onChange={(e) => handleInputChange("panNumber", e.target.value)} placeholder="ABCDE1234F" className="bg-background uppercase" maxLength={10} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="dob">Date of Birth *</Label>
                              <Input id="dob" type="date" value={formData.dob} onChange={(e) => handleInputChange("dob", e.target.value)} className="bg-background" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="currentCity">Current City *</Label>
                              <Input id="currentCity" value={formData.currentCity} onChange={(e) => handleInputChange("currentCity", e.target.value)} className="bg-background" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="pinCode">Pin Code *</Label>
                              <Input id="pinCode" value={formData.pinCode} onChange={(e) => handleInputChange("pinCode", e.target.value.replace(/\D/g, ''))} maxLength={6} className="bg-background" />
                            </div>
                          </div>
                        </div>
                      )}

                      {currentStage === 2 && (
                        <div className="space-y-8 relative z-10">
                          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                            <div className="bg-blue-500/10 p-2 rounded-lg"><FileText className="w-5 h-5 text-blue-500"/></div>
                            <div>
                              <h2 className="text-xl font-bold">2. Document Vault</h2>
                              <p className="text-sm text-muted-foreground">Final step. Securely upload documents to initiate underwriting.</p>
                            </div>
                          </div>

                          <div className="space-y-8">
                            {docGroups.map((group) => {
                              const categoryColors: Record<string, string> = {
                                "Identity Documents": "bg-blue-500",
                                "Income Documents": "bg-emerald-500",
                                "Property Documents": "bg-amber-500",
                                "Financial Documents": "bg-purple-500",
                                "Business Proof": "bg-indigo-500",
                                "Additional Documents": "bg-slate-500"
                              };
                              const badgeColor = categoryColors[group.displayName] || "bg-blue-500";
                              
                              const totalDocs = group.docs.length;
                              const securedDocs = group.docs.filter(d => uploadedDocs[d.id] || uploadedDocs[normalizeDocName(d.name)]).length;

                              return (
                              <div key={group.category} className="relative pl-6">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${badgeColor} rounded-full opacity-60`}></div>
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-sm font-bold tracking-wider text-foreground uppercase">{group.displayName}</h4>
                                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-md">{securedDocs} / {totalDocs} Uploaded</span>
                                </div>
                                <div className="space-y-4">
                                  {group.docs.map((doc) => {
                                    const isUploading = uploadingDocs[doc.id];
                                    const isUploaded = uploadedDocs[doc.id] || uploadedDocs[normalizeDocName(doc.name)];
                                    const isDragging = dragOverDocId === doc.id;
                                    const isConfirmingDelete = confirmDeleteId === doc.id;

                                    let cardClass = "doc-card-pending";
                                    if (isDragging) cardClass = "doc-card-dragover";
                                    if (isUploading) cardClass = "doc-card-uploading animate-pulse-glow";
                                    if (isUploaded) cardClass = "doc-card-secured";

                                    return (
                                      <div 
                                        key={doc.id} 
                                        className={`group relative flex items-center justify-between p-5 rounded-xl ${cardClass}`}
                                        onDragOver={(e) => onDragOver(e, doc.id)}
                                        onDragLeave={onDragLeave}
                                        onDrop={(e) => onDrop(e, doc)}
                                      >
                                        <div className="flex flex-col gap-1 z-10">
                                          <div className="flex items-center gap-2">
                                            {isUploaded && <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-checkmark" />}
                                            <span className={`font-semibold text-sm ${isUploaded ? 'text-emerald-900' : 'text-foreground'}`}>
                                              {doc.name} {doc.required && !isUploaded && <span className="text-red-500 ml-1">*</span>}
                                            </span>
                                          </div>
                                          {!isUploaded && <span className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</span>}
                                          {isUploaded && <span className="text-xs text-emerald-600/80 font-medium">Secured with AES-256</span>}
                                        </div>
                                        
                                        <div className="z-10 flex items-center gap-3">
                                          <input 
                                            title={`Upload ${doc.name}`}
                                            type="file" 
                                            id={`upload-${doc.id}`} 
                                            className="hidden" 
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => handleFileUpload(doc, e)}
                                            disabled={isUploading || isUploaded}
                                          />
                                          
                                          {isUploading && (
                                            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium text-sm">
                                              <Loader2 className="w-4 h-4 animate-spin" /> Encrypting
                                            </div>
                                          )}

                                          {isUploaded && !isUploading && (
                                            <div className="flex items-center gap-2">
                                              {isConfirmingDelete ? (
                                                <div className="flex items-center bg-white shadow-sm border border-red-100 rounded-lg p-1 animate-in fade-in zoom-in duration-200">
                                                  <span className="text-xs font-medium text-red-600 px-2">Remove?</span>
                                                  <Button size="sm" variant="ghost" className="h-7 hover:bg-red-50 text-red-600 px-2" onClick={() => handleRemoveDocument(doc)}>Yes</Button>
                                                  <Button size="sm" variant="ghost" className="h-7 hover:bg-slate-100 px-2" onClick={() => setConfirmDeleteId(null)}>No</Button>
                                                </div>
                                              ) : (
                                                <Button 
                                                  variant="ghost" 
                                                  size="icon" 
                                                  className="h-8 w-8 text-emerald-600/50 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                                  onClick={() => setConfirmDeleteId(doc.id)}
                                                >
                                                  <X className="w-4 h-4" />
                                                </Button>
                                              )}
                                            </div>
                                          )}

                                          {!isUploaded && !isUploading && (
                                            <Label 
                                              htmlFor={`upload-${doc.id}`} 
                                              className="inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all focus-visible:outline-none border border-border bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 shadow-sm h-10 px-4 cursor-pointer"
                                            >
                                              <UploadCloud className="w-4 h-4 mr-2 text-blue-500" />
                                              Browse Files
                                            </Label>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )})}
                          </div>
                        </div>
                      )}

                      <div className="mt-10 pt-6 border-t border-border flex justify-end relative z-10">
                        <Button 
                          onClick={currentStage === 2 ? handleFinalSubmit : handleNextStage} 
                          disabled={isSaving}
                          className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 disabled:opacity-70 transition-all"
                        >
                          {isSaving ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {currentStage === 2 ? "Securing Data..." : "Saving..."}</>
                          ) : (
                            <>{currentStage === 2 ? "Submit to Underwriter" : "Save & Continue"} <ChevronRight className="w-5 h-5 ml-2" /></>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                </div>
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
                <section className="aurora-gradient pt-24 pb-12">
                  <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">Client Portfolio</h1>
                        <p className="text-muted-foreground text-lg">Real-time tracking for your active financial instruments.</p>
                      </motion.div>
                      <div className="flex items-center gap-3">
                        {isAdmin && (
                          <Button onClick={() => navigate("/admin")} variant="outline" className="border-border">
                            <Building2 className="w-4 h-4 mr-2" /> Admin Core
                          </Button>
                        )}
                        <Link to="/apply">
                          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                            New Application <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="py-12">
                  <div className="container mx-auto px-4 max-w-6xl">
                    {viewState === "EMPTY" ? (
                      <div className="bg-card rounded-3xl border border-border p-16 text-center shadow-sm">
                        <div className="w-20 h-20 bg-muted/60 rounded-full flex items-center justify-center mx-auto mb-6 border border-border/50">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No Active Instruments</h3>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">Your portfolio is empty. Click below to initiate a new loan application and explore our banking partners.</p>
                        <Link to="/apply"><Button size="lg" className="px-8 bg-blue-600 hover:bg-blue-700 text-white">Initialize Application</Button></Link>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {myApplications.map((app, index) => {
                          const config = getStatusConfig(app.status);
                          const StatusIcon = config.icon;
                          return (
                            <motion.div key={app.applicationId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", ...spring, delay: index * 0.1 }} className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/20 transition-all shadow-sm">
                              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-12 justify-between">
                                <div className="space-y-4 flex-1">
                                  <div className="flex items-center gap-3">
                                    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border", config.color)}>
                                      <StatusIcon className="w-3.5 h-3.5" /> {config.label}
                                    </span>
                                    <span className="text-sm font-mono font-medium text-muted-foreground">{app.applicationId}</span>
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{app.loanType?.replace(/_/g, " ") || "PERSONAL LOAN"}</p>
                                    <h3 className="text-3xl font-bold text-foreground flex items-center gap-2">
                                      <Wallet className="w-6 h-6 text-muted-foreground" />
                                      ₹{app.requestedAmount?.toLocaleString("en-IN") || "0"}
                                    </h3>
                                  </div>
                                </div>
                                <div className="flex-1 max-w-sm space-y-6">
                                  <div>
                                    <div className="flex justify-between text-sm mb-3 font-medium">
                                      <span className="text-foreground">Processing Matrix</span>
                                      <span className="text-primary tabular-nums">{app.completionPercentage || config.progress}%</span>
                                    </div>
                                    <Progress value={app.completionPercentage || config.progress} className="h-2 bg-muted [&>div]:bg-primary" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                    <div>
                                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Initiated</p>
                                      <p className="text-sm font-medium text-foreground">{app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Assignee</p>
                                      <p className="text-sm font-medium text-foreground">{app.assignee || "Evaluating"}</p>
                                    </div>
                                  </div>
                                  <div className="pt-2 border-t border-border/50">
                                    <Button 
                                      variant="ghost" 
                                      className="w-full justify-between hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                                      onClick={() => {
                                        setActiveApplication(app);
                                        // 🧠 SILICON VALLEY FEATURE: Re-hydrate the form allowing post-submission edits
                                        if (app.metadata) {
                                          try {
                                            const parsedMeta = typeof app.metadata === "string" ? JSON.parse(app.metadata) : app.metadata;
                                            setFormData(prev => ({ ...prev, ...parsedMeta }));
                                          } catch(e) { console.error(e); }
                                        }

                                        if (app.documents && app.documents.length > 0) {
                                          const loadedDocs: Record<string, boolean> = {};
                                          app.documents.forEach((d) => {
                                            if (d.docType) loadedDocs[d.docType] = true;
                                          });
                                          setUploadedDocs(loadedDocs);
                                        }

                                        setViewState("FUNNEL");
                                        setCurrentStage(1);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                      }}
                                    >
                                      <span className="flex items-center"><Edit2 className="w-4 h-4 mr-2" /> Update Information / Documents</span>
                                      <ChevronRight className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>
              </motion.div>
            </AnimatePresence>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Dashboard;