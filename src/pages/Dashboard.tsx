import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FileText, Search, CheckCircle, CreditCard, Clock,
  AlertCircle, Building2, TrendingUp, Activity,
  ShieldCheck, ChevronRight, ArrowRight, Wallet,
  UploadCloud, CheckCircle2, Circle, Loader2, Edit2, Target, X,
  User, Briefcase, Lock, Mail, Users, Award, Building, Calendar, MapPin, Check, Plus, Phone, Landmark, Coins
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PageShell, Surface, Stack, Inline, Container, Section, SplitLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, buildCleanMetadata } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import applicationBannerImg from "@/assets/images/application-banner-isometric.png";

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
            if (progress === 0 || progress < 50) setCurrentStage(1);
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
              setFormData(prev => ({ 
                ...prev, 
                ...parsedMeta,
                requestedAmount: parsedMeta.requestedAmount || String(primaryApp.requestedAmount || ""),
                tenure: parsedMeta.tenure || ""
              }));
            } else {
              setFormData(prev => ({
                ...prev,
                requestedAmount: String(primaryApp.requestedAmount || ""),
              }));
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
      if (s === "BT_TOP_UP" || s === "BT_TOPUP" || s === "BT") return "BT|Top Up";

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
        if (!formData.panNumber || formData.panNumber.length !== 10) {
          toast({ title: "Invalid PAN", description: "Please enter a valid 10-character PAN number.", variant: "destructive" });
          return false;
        }
        if (!formData.dob) {
          toast({ title: "Date of Birth Required", description: "Please provide your date of birth.", variant: "destructive" });
          return false;
        }
        if (!formData.currentCity) {
          toast({ title: "City Required", description: "Please enter your current city.", variant: "destructive" });
          return false;
        }
        if (formData.pinCode.length < 6) {
          toast({ title: "Invalid PIN Code", description: "Please enter a valid 6-digit PIN code.", variant: "destructive" });
          return false;
        }
        break;
      // Stages 2+ are document uploads, which have their own validation logic
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

      const patchData: Record<string, any> = {
         metadata: buildCleanMetadata(formData),
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
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-display tracking-tight leading-tight">
                          Let's get you funded
                        </h1>
                      </div>
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
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">1. Identity & Location</h2>
                                <p className="text-sm text-slate-500 font-medium mt-1">Let's start with some basic information to verify your identity.</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <Stack gap="var(--space-2)">
                                <Label htmlFor="panNumber" className="text-xs font-bold uppercase tracking-wider text-slate-500">PAN Number *</Label>
                                <div className="relative">
                                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 pointer-events-none" />
                                  <Input id="panNumber" value={formData.panNumber} onChange={(e) => handleInputChange("panNumber", e.target.value)} placeholder="ABCDE1234F" className="pl-12 h-11 text-sm uppercase border-slate-200 bg-slate-50 rounded-xl font-medium" maxLength={10} />
                                </div>
                              </Stack>
                              
                              <Stack gap="var(--space-2)">
                                <Label htmlFor="dob" className="text-xs font-bold uppercase tracking-wider text-slate-500">Date of Birth *</Label>
                                <div className="relative">
                                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 pointer-events-none" />
                                  <Input id="dob" type="date" value={formData.dob} onChange={(e) => handleInputChange("dob", e.target.value)} className="pl-12 h-11 text-sm border-slate-200 bg-slate-50 rounded-xl font-medium" />
                                </div>
                              </Stack>
                              
                              <Stack gap="var(--space-2)">
                                <Label htmlFor="currentCity" className="text-xs font-bold uppercase tracking-wider text-slate-500">Current City *</Label>
                                <div className="relative">
                                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 pointer-events-none" />
                                  <Input id="currentCity" value={formData.currentCity} onChange={(e) => handleInputChange("currentCity", e.target.value)} placeholder="Indore" className="pl-12 h-11 text-sm border-slate-200 bg-slate-50 rounded-xl font-medium" />
                                </div>
                              </Stack>
                              
                              <Stack gap="var(--space-2)">
                                <Label htmlFor="pinCode" className="text-xs font-bold uppercase tracking-wider text-slate-500">Pin Code *</Label>
                                <div className="relative">
                                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 pointer-events-none" />
                                  <Input id="pinCode" value={formData.pinCode} onChange={(e) => handleInputChange("pinCode", e.target.value.replace(/\\D/g, ''))} placeholder="453200" maxLength={6} className="pl-12 h-11 text-sm border-slate-200 bg-slate-50 rounded-xl font-medium" />
                                </div>
                              </Stack>
                            </div>

                            <div className="bg-blue-50/40 border border-blue-100/50 p-4 rounded-xl flex gap-3 items-center text-blue-700">
                              <Lock className="w-4 h-4 shrink-0" />
                              <span className="text-xs font-semibold">We use this information to fetch your credit profile securely.</span>
                            </div>
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
                            
                            {/* Summary Grid */}
                            <div className="grid grid-cols-1 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                              <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Identity & Location</h4>
                                <div className="space-y-1.5 text-xs">
                                  <p><span className="text-slate-500">PAN:</span> <span className="font-bold text-slate-800">{formData.panNumber}</span></p>
                                  <p><span className="text-slate-500">DOB:</span> <span className="font-bold text-slate-800">{formData.dob}</span></p>
                                  <p><span className="text-slate-500">City:</span> <span className="font-bold text-slate-800">{formData.currentCity} ({formData.pinCode})</span></p>
                                </div>
                              </div>
                            </div>

                            {/* Documents Upload Section */}
                            <Stack gap="var(--space-4)">
                              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-500" /> Required Documentation
                              </h3>
                              
                              <Stack gap="var(--space-4)">
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
                                      <Inline justify="space-between" align="center" className="mb-2">
                                        <h4 className="text-xs font-bold tracking-wider text-slate-500 uppercase">{group.displayName}</h4>
                                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{securedDocs} / {totalDocs} Uploaded</span>
                                      </Inline>
                                      
                                      <Stack gap="var(--space-3)">
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
                                                {isUploaded && <span className="text-[10px] text-emerald-600 font-bold tracking-wide mt-0.5">Secured with AES-256</span>}
                                              </Stack>
                                              
                                              <Inline align="center" gap="var(--space-3)" className="z-10">
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
                                                      <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-8 w-8 text-emerald-600/50 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                                        onClick={() => setConfirmDeleteId(doc.id)}
                                                      >
                                                        <X className="w-4 h-4" />
                                                      </Button>
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
                                    </div>
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

                          <Button 
                            onClick={currentStage === 2 ? handleFinalSubmit : handleNextStage} 
                            disabled={isSaving}
                            className="h-12 px-8 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/10 disabled:opacity-70 transition-all rounded-xl hover:-translate-y-0.5"
                          >
                            {isSaving ? (
                              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {currentStage === 2 ? "Submitting..." : "Saving..."}</>
                            ) : (
                              <>{currentStage === 2 ? "Submit to Underwriter" : "Save & Continue"} <ChevronRight className="w-4 h-4 ml-1.5" /></>
                            )}
                          </Button>
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
                <Surface className="aurora-gradient border-b border-[hsl(var(--border))] mb-[var(--space-lg)]">
                  <Section spacing="lg">
                    <Container size="expanded">
                    <Inline justify="space-between" align="end" className="flex-col md:flex-row gap-[var(--space-4)]">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
                        <h1 className="text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))] mb-[var(--space-2)] tracking-tight">Client Portfolio</h1>
                        <p className="text-[hsl(var(--muted-foreground))] text-[length:var(--text-large)]">Real-time tracking for your active financial instruments.</p>
                      </motion.div>
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
                    </Inline>
                    </Container>
                  </Section>
                </Surface>

                <Section spacing="none">
                  <Container size="expanded">
                  {viewState === "EMPTY" ? (
                    <Surface className="text-center shadow-sm">
                      <Section spacing="2xl">
                        <Container size="full">
                      <div className="w-20 h-20 bg-[hsl(var(--muted))]/60 rounded-full flex items-center justify-center mx-auto mb-[var(--space-6)] border border-[hsl(var(--border))]/50">
                        <FileText className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />
                      </div>
                      <h3 className="text-[length:var(--text-heading)] font-bold text-[hsl(var(--foreground))] mb-[var(--space-2)]">No Active Instruments</h3>
                      <p className="text-[hsl(var(--muted-foreground))] mb-[var(--space-8)] max-w-md mx-auto">Your portfolio is empty. Click below to initiate a new loan application and explore our banking partners.</p>
                      <Link to="/apply"><Button size="lg" className="px-8 bg-blue-600 hover:bg-blue-700 text-white">Initialize Application</Button></Link>
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
                            <Surface className="overflow-hidden hover:border-primary/20 transition-all shadow-sm">
                              <div className="p-[var(--space-6)] md:p-[var(--space-8)] flex flex-col md:flex-row gap-[var(--space-6)] md:gap-[var(--space-12)] justify-between">
                                <Stack gap="var(--space-4)" className="flex-1">
                                  <Inline gap="var(--space-3)" align="center">
                                    <span className={cn("inline-flex items-center gap-[var(--space-1)] px-3 py-1 rounded-full text-[length:var(--text-caption)] font-semibold border", config.color)}>
                                      <StatusIcon className="w-3.5 h-3.5" /> {config.label}
                                    </span>
                                    <span className="text-[length:var(--text-small)] font-mono font-medium text-[hsl(var(--muted-foreground))]">{app.applicationId}</span>
                                  </Inline>
                                  <div>
                                    <p className="text-[length:var(--text-caption)] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mb-[var(--space-1)]">{app.loanType?.replace(/_/g, " ") || "PERSONAL LOAN"}</p>
                                    <h3 className="text-3xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
                                      <Wallet className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />
                                      ₹{app.requestedAmount?.toLocaleString("en-IN") || "0"}
                                    </h3>
                                  </div>
                                </Stack>
                                <Stack gap="var(--space-6)" className="flex-1 max-w-sm">
                                  <div>
                                    <Inline justify="space-between" align="center" className="text-[length:var(--text-small)] mb-[var(--space-3)] font-medium">
                                      <span className="text-[hsl(var(--foreground))]">Processing Matrix</span>
                                      <span className="text-primary tabular-nums">{app.completionPercentage || config.progress}%</span>
                                    </Inline>
                                    <Progress value={app.completionPercentage || config.progress} className="h-2 bg-[hsl(var(--muted))] [&>div]:bg-primary" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-[var(--space-4)] pt-[var(--space-4)] border-t border-[hsl(var(--border))]">
                                    <div>
                                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-widest font-bold mb-[var(--space-1)]">Initiated</p>
                                      <p className="text-[length:var(--text-small)] font-medium text-[hsl(var(--foreground))]">{app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-widest font-bold mb-[var(--space-1)]">Assignee</p>
                                      <p className="text-[length:var(--text-small)] font-medium text-[hsl(var(--foreground))]">{app.assignee || "Evaluating"}</p>
                                    </div>
                                  </div>
                                  <div className="pt-[var(--space-2)] border-t border-[hsl(var(--border))]/50">
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
                                </Stack>
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
    </>
  );
};

export default Dashboard;
