import { useState, useEffect, useMemo, useCallback } from "react";\nimport { useNavigate, Link } from "react-router-dom";\nimport { Helmet } from "react-helmet-async";\nimport {\n  FileText, Search, CheckCircle, CreditCard, Clock,\n  AlertCircle, Building2, TrendingUp, Activity,\n  ShieldCheck, ChevronRight, ArrowRight, Wallet,\n  UploadCloud, CheckCircle2, Circle, Loader2, Edit2, Target, X,\n  MapPin, Calendar, Lock, Headphones, Zap, Shield\n} from "lucide-react";\nimport { motion, AnimatePresence } from "framer-motion";\nimport Header from "@/components/layout/Header";\nimport Footer from "@/components/layout/Footer";\nimport { PageShell, Surface, Stack, Inline, Container, Section, SplitLayout } from "@/components/layout";\nimport { Button } from "@/components/ui/button";\nimport { Progress } from "@/components/ui/progress";\nimport { Input } from "@/components/ui/input";\nimport { Label } from "@/components/ui/label";\nimport { cn } from "@/lib/utils";\nimport { useAuth } from "@/hooks/useAuth";\nimport { toast } from "@/hooks/use-toast";\n\n// 🧠 ARCHITECTURE IMPORTS\nimport api, { PrymeAPI } from "@/lib/api";\nimport { getDocumentsForLoanType, groupDocumentsByCategory, ProductType, EmploymentType } from "@/lib/documentData";\n\n// --- Types & Interfaces ---\ninterface ApplicationDoc {\n  docType: string;\n  url?: string;\n  name?: string;\n  id?: string;\n}\n\ninterface Application {\n  applicationId: string;\n  status: string;\n  loanType: string;\n  requestedAmount: number;\n  completionPercentage: number;\n  createdAt: string;\n  assignee?: string;\n  documents?: ApplicationDoc[];\n  metadata?: Record<string, any>;\n}\n\ninterface DashboardFormData {\n  panNumber: string;\n  dob: string;\n  currentCity: string;\n  pinCode: string;\n  companyName: string;\n  designation: string;\n  workExperience: string;\n  officeEmail: string;\n  monthlyEMI: string;\n  existingBank: string;\n  coApplicant: string;\n  loanPurpose: string;\n}\n\nconst initialFormData: DashboardFormData = {\n  panNumber: "", dob: "", currentCity: "", pinCode: "", \n  companyName: "", designation: "", workExperience: "", officeEmail: "", \n  monthlyEMI: "", existingBank: "", coApplicant: "No", loanPurpose: "", \n};\n\ntype ViewState = "LOADING" | "FUNNEL" | "DASHBOARD" | "EMPTY";\n\nconst spring = { stiffness: 120, damping: 28, mass: 0.8 };\n\nconst getStatusConfig = (status: string) => {\n  switch (status?.toUpperCase()) {\n    case "SUBMITTED":\n      return { color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/50 dark:text-blue-400", icon: FileText, progress: 20, label: "Submitted" };\n    case "PROCESSING":\n      return { color: "text-blue-800 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/50 dark:text-blue-400", icon: Activity, progress: 50, label: "Processing" };\n    case "VERIFIED":\n      return { color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800/50 dark:text-indigo-400", icon: ShieldCheck, progress: 75, label: "Verified" };\n    case "APPROVED":\n      return { color: "text-blue-800 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-950/50 dark:text-blue-400", icon: CheckCircle, progress: 100, label: "Approved" };\n    case "REJECTED":\n      return { color: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800/50 dark:text-red-400", icon: AlertCircle, progress: 100, label: "Rejected" };\n    default:\n      return { color: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700/50 dark:text-slate-400", icon: Clock, progress: 5, label: status || "Draft" };\n  }\n};\n\nconst Dashboard: React.FC = () => {\n  const { user, isLoading: authLoading, isAdmin } = useAuth();\n  const navigate = useNavigate();\n  \n  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);\n  const [isSaving, setIsSaving] = useState<boolean>(false);\n  const [viewState, setViewState] = useState<ViewState>("LOADING");\n  \n  const [myApplications, setMyApplications] = useState<Application[]>([]);\n  const [activeApplication, setActiveApplication] = useState<Application | null>(null);\n  \n  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});\n  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});\n  const [dragOverDocId, setDragOverDocId] = useState<string | null>(null);\n  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);\n\n  const [currentStage, setCurrentStage] = useState<number>(1);\n  const [formData, setFormData] = useState<DashboardFormData>(initialFormData);\n\n  // 🧠 SMART NORMALIZER: Aligns React frontend names with Java Backend Sanitized Names\n  const normalizeDocName = (name: string) => name.trim().toUpperCase().replace(/\s+/g, '_');\n\n  useEffect(() => {\n    const abortController = new AbortController();\n    \n    const bootDashboard = async () => {\n      if (authLoading) return;\n      if (!user) {\n        navigate("/auth?redirect=/dashboard", { replace: true });\n        return;\n      }\n      if (isAdmin) {\n        navigate("/admin", { replace: true });\n        return;\n      }\n\n      try {\n        const pendingLead = localStorage.getItem("pryme_pending_lead_id");\n        const selectedBank = localStorage.getItem("pryme_target_bank") || "Pryme Aggregator";\n        let elevationSucceeded = false;\n\n        if (pendingLead) {\n          try {\n            await PrymeAPI.elevateLead(pendingLead, user.id, selectedBank);\n            elevationSucceeded = true;\n          } catch (e: any) {\n            // 🧠 409 CONFLICT: Lead was already elevated — still a success path\n            if (e?.message?.includes("409") || e?.message?.includes("already")) {\n              elevationSucceeded = true;\n            }\n            console.warn("Lead elevation skipped or failed:", e);\n          } finally {\n            // Always clean up — stale IDs cause infinite retry loops\n            localStorage.removeItem("pryme_pending_lead_id");\n            localStorage.removeItem("pryme_target_bank");\n          }\n        }\n\n        const response = await api.get("/applications/me", { signal: abortController.signal });\n        const apps: Application[] = response?.data?.content ? response.data.content : (Array.isArray(response?.data) ? response.data : []);\n        \n        setMyApplications(apps);\n\n        if (apps.length > 0) {\n          const primaryApp = apps[0]; \n          setActiveApplication(primaryApp);\n          const progress = primaryApp.completionPercentage || 0;\n          \n          // 🧠 TITANIUM HYDRATION: Safe checking for uploaded documents\n          if (primaryApp.documents && primaryApp.documents.length > 0) {\n            const loadedDocs: Record<string, boolean> = {};\n            primaryApp.documents.forEach((d) => {\n              if (d.docType) loadedDocs[d.docType] = true;\n            });\n            setUploadedDocs(loadedDocs);\n          }\n\n          if (progress < 100) {\n            setViewState("FUNNEL");\n            if (progress < 50) setCurrentStage(1);\n            else setCurrentStage(2); \n            \n            if (primaryApp.metadata) {\n              let parsedMeta: Partial<DashboardFormData> = {};\n              if (typeof primaryApp.metadata === "string") {\n                try {\n                  parsedMeta = JSON.parse(primaryApp.metadata);\n                } catch (e) {\n                  console.error("Failed to parse metadata", e);\n                }\n              } else if (typeof primaryApp.metadata === "object") {\n                parsedMeta = primaryApp.metadata;\n              }\n              setFormData(prev => ({ ...prev, ...parsedMeta }));\n            }\n          } else {\n            setViewState("DASHBOARD");\n          }\n        } else {\n          // 🧠 RELAY FIX: If there's a cached pending application from the /apply flow,\n          // scaffold a synthetic FUNNEL so the user sees the form immediately instead of\n          // a dead-end "No Active Instruments" screen. This handles the case where\n          // lead elevation failed but the user clearly came from the loan application flow.\n          const cachedApp = localStorage.getItem("pryme_pending_application");\n          if (cachedApp) {\n            try {\n              const parsed = JSON.parse(cachedApp);\n              // Create a synthetic application so the FUNNEL renders\n              const scaffold: Application = {\n                applicationId: "pending-" + Date.now(),\n                status: "DRAFT",\n                loanType: parsed.loanType || "PERSONAL_LOAN",\n                requestedAmount: parsed.loanAmount || 0,\n                completionPercentage: 0,\n                createdAt: new Date().toISOString(),\n              };\n              setMyApplications([scaffold]);\n              setActiveApplication(scaffold);\n              setCurrentStage(1);\n              setViewState("FUNNEL");\n            } catch (e) {\n              setViewState("EMPTY");\n            }\n          } else {\n            setViewState("EMPTY");\n          }\n        }\n      } catch (error: any) {\n        if (error.name === "CanceledError" || error.message === "canceled") return;\n        console.error("Dashboard Sync Error:", error);\n        setViewState("EMPTY");\n      } finally {\n        setIsDataLoading(false);\n      }\n    };\n\n    bootDashboard();\n\n    const unlockTimer = setTimeout(() => {\n      setIsDataLoading(prev => {\n        if (prev) {\n          setViewState(prevViewState => prevViewState === "LOADING" ? "EMPTY" : prevViewState);\n          return false;\n        }\n        return prev;\n      });\n    }, 5000);\n\n    return () => {\n      abortController.abort();\n      clearTimeout(unlockTimer);\n    };\n  }, [user, authLoading, isAdmin, navigate]);\n  \n  const { docGroups } = useMemo(() => {\n    if (!activeApplication && viewState !== "FUNNEL") return { docGroups: [] };\n    \n    let parsed: Record<string, any> = {};\n    try {\n      const savedApp = localStorage.getItem("pryme_pending_application");\n      if (savedApp && savedApp !== "undefined") {\n        parsed = JSON.parse(savedApp);\n      }\n    } catch(e) {\n      console.error("Failed to parse pending application", e);\n    }\n    \n    const rawLoan = activeApplication?.loanType || parsed?.loanType || "Personal Loan";\n    const rawEmp = activeApplication?.metadata?.employmentType || parsed?.employmentType || "Salaried";\n\n    const formatEnumString = (str: string) => {\n      if (!str) return str;\n      \n      const s = str.toUpperCase().replace(/ /g, '_');\n      if (s === "LAP" || s === "LOAN_AGAINST_PROPERTY") return "LAP";\n      if (s === "SEP" || s === "SELF_EMPLOYED_PROFESSIONAL") return "SEP";\n      if (s === "SENP" || s === "SELF_EMPLOYED_NON_PROFESSIONAL") return "SENP";\n      if (s === "SALARIED") return "Salaried";\n      if (s === "HOME_LOAN" || s === "HOME") return "Home Loan";\n      if (s === "PERSONAL_LOAN" || s === "PERSONAL") return "Personal Loan";\n      if (s === "BUSINESS_LOAN" || s === "BUSINESS") return "Business Loan";\n      if (s === "AUTO_LOAN" || s === "CAR_LOAN" || s === "AUTO") return "Auto Loan";\n      if (s === "BT_TOP_UP" || s === "BT_TOPUP" || s === "BT") return "BT|Top Up";\n\n      // Fallback\n      return str.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');\n    };\n\n    const targetLoan = formatEnumString(rawLoan) as ProductType;\n    const targetEmp = formatEnumString(rawEmp) as EmploymentType;\n\n    const allDocs = getDocumentsForLoanType(targetLoan, targetEmp) || [];\n\n    return {\n      docGroups: groupDocumentsByCategory(allDocs).map(g => ({\n        category: g.category,\n        displayName: g.displayName,\n        docs: g.docs.map(d => ({ id: d.id, name: d.label, required: !d.optional }))\n      }))\n    };\n  }, [activeApplication, viewState]);\n\n  const handleInputChange = useCallback((field: keyof DashboardFormData, value: string) => {\n    setFormData(prev => ({ ...prev, [field]: value }));\n  }, []);\n\n  const validateCurrentStage = useCallback((): boolean => {\n    switch (currentStage) {\n      case 1:\n        if (!formData.panNumber || !formData.dob || !formData.currentCity || !formData.pinCode) {\n          toast({ title: "Incomplete Identity Data", description: "Please complete all fields in this section.", variant: "destructive" });\n          return false;\n        }\n        if (formData.panNumber.length !== 10) {\n          toast({ title: "Invalid PAN", description: "PAN Number must be exactly 10 characters.", variant: "destructive" });\n          return false;\n        }\n        if (formData.pinCode.length < 6) {\n          toast({ title: "Invalid PIN Code", description: "Please enter a valid 6-digit PIN code.", variant: "destructive" });\n          return false;\n        }\n        break;\n      default:\n        break;\n    }\n    return true;\n  }, [currentStage, formData]);\n\n  const handleNextStage = async () => {\n    if (!validateCurrentStage()) return;\n    if (!activeApplication) return;\n    \n    setIsSaving(true);\n    \n    const newStage = currentStage + 1;\n    const newProgress = Math.min(currentStage * 50, 100);\n    \n    try {\n      let targetAppId = activeApplication.applicationId;\n      \n      // 🧠 JIT BACKEND SYNC: If this is a synthetic frontend application (from a lost lead),\n      // we must recreate the lead on the backend and elevate it before we can PATCH progress.\n      if (targetAppId.startsWith("pending-")) {\n        const cachedAppStr = localStorage.getItem("pryme_pending_application");\n        const cachedApp = cachedAppStr ? JSON.parse(cachedAppStr) : {};\n        \n        // 🧠 NORMALIZE LOAN TYPE: Backend explicitly strictly requires lowercase\n        // values: personal, business, home, education, lap\n        const rawLoanType = String(activeApplication.loanType || cachedApp.loanType || "personal").toLowerCase();\n        let normalizedLoanType = "personal";\n        if (rawLoanType.includes("business")) normalizedLoanType = "business";\n        else if (rawLoanType.includes("home")) normalizedLoanType = "home";\n        else if (rawLoanType.includes("education")) normalizedLoanType = "education";\n        else if (rawLoanType.includes("lap")) normalizedLoanType = "lap";\n        \n        // 1. Submit a fresh lead with whatever data we can scrape together\n        const leadRes = await PrymeAPI.submitLead({\n           ...cachedApp, // Spread first so our explicit overrides win\n           fullName: user?.name || "Pryme Client",\n           phone: "9999999999", // Fallback required by backend validation\n           loanAmount: activeApplication.requestedAmount || cachedApp.loanAmount || 100000,\n           loanType: normalizedLoanType,\n           productType: normalizedLoanType, // 🧠 FIX: submitLead prefers productType over loanType\n           cibilScore: cachedApp.cibilScore || 0,\n           monthlyIncome: cachedApp.monthlyIncome || 0\n        });\n        \n        const newLeadId = leadRes?.lead?.id || leadRes?.data?.lead?.id;\n        if (!newLeadId) throw new Error("Backend failed to generate recovery lead.");\n        \n        // 2. Elevate the fresh lead\n        const selectedBank = localStorage.getItem("pryme_target_bank") || "Pryme Aggregator";\n        const elevateRes = await PrymeAPI.elevateLead(newLeadId, user?.id || "", selectedBank);\n        \n        targetAppId = elevateRes?.application?.applicationId || elevateRes?.data?.application?.applicationId;\n        if (!targetAppId) throw new Error("Backend failed to elevate recovery lead.");\n        \n        // 3. Update the frontend context\n        setActiveApplication(prev => prev ? { ...prev, applicationId: targetAppId } : null);\n        \n        // Cleanup old synthetic data\n        localStorage.removeItem("pryme_pending_application");\n      }\n\n      await api.patch(`/applications/${targetAppId}`, {\n         metadata: formData,\n         completionPercentage: newProgress\n      });\n      toast({ title: "Progress Saved", description: "Your data has been securely saved." });\n      setCurrentStage(newStage);\n      window.scrollTo({ top: 0, behavior: "smooth" });\n    } catch (error: any) {\n      console.error("Sync Error:", error);\n      toast({ \n        title: "Sync Error", \n        description: error.response?.data?.message || error.message || "Failed to synchronise progress. Please check connection.", \n        variant: "destructive" \n      });\n    } finally {\n      setIsSaving(false);\n    }\n  };\n\n  const handleFinalSubmit = async () => {\n    if (!activeApplication) return;\n    \n    // 🧠 STRICT SUBMISSION CHECK: Ensure all mandatory documents are marked as uploaded \n    // Checks against both local ID and backend sanitized DocType format\n    const allRequiredDocs = docGroups.flatMap(group => group.docs).filter(d => d.required);\n    const missingDocs = allRequiredDocs.some(d => !uploadedDocs[d.id] && !uploadedDocs[normalizeDocName(d.name)]);\n\n    if (missingDocs) {\n      toast({ \n        title: "Missing Documents", \n        description: "Please upload all mandatory documents before submission.", \n        variant: "destructive" \n      });\n      return;\n    }\n\n    setIsSaving(true);\n\n    try {\n      await api.patch(`/applications/${activeApplication.applicationId}/status`, { status: "PROCESSING" });\n      await api.patch(`/applications/${activeApplication.applicationId}`, { completionPercentage: 100 });\n      \n      toast({ title: "Underwriting Initiated", description: "All documents secured. Routing to your portfolio tracker." });\n      \n      setMyApplications(prev => {\n        const updated = [...prev];\n        if (updated.length > 0) {\n          updated[0].completionPercentage = 100;\n          updated[0].status = "PROCESSING";\n        }\n        return updated;\n      });\n      setViewState("DASHBOARD");\n      window.scrollTo({ top: 0, behavior: "smooth" });\n    } catch (error: any) {\n      console.error("Submission Error:", error);\n      toast({ \n        title: "Submission Failed", \n        description: error.response?.data?.message || "Failed to submit application. Please try again.", \n        variant: "destructive" \n      });\n    } finally {\n      setIsSaving(false);\n    }\n  };\n\n  const handleFileUpload = async (doc: { id: string; name: string; required: boolean }, event: React.ChangeEvent<HTMLInputElement>) => {\n    const file = event.target.files?.[0];\n    if (!file) return;\n\n    event.target.value = '';\n\n    if (!activeApplication?.applicationId) {\n      toast({ title: "Matrix Fault", description: "Application footprint missing. Please refresh.", variant: "destructive" });\n      return;\n    }\n\n    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB\n    const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];\n\n    if (file.size > MAX_FILE_SIZE) {\n      toast({ title: "Payload Too Large", description: "File must be under 10MB.", variant: "destructive" });\n      return;\n    }\n    if (!ALLOWED_TYPES.includes(file.type)) {\n      toast({ title: "Invalid Format", description: "Only PDF, JPG, and PNG are supported.", variant: "destructive" });\n      return;\n    }\n\n    setUploadingDocs(prev => ({ ...prev, [doc.id]: true }));\n\n    try {\n      const { error } = await PrymeAPI.uploadApplicationDocument(activeApplication.applicationId, doc.name, file);\n      \n      if (error) {\n        toast({ title: "Vault Rejected", description: error.message || "Failed to encrypt file.", variant: "destructive" });\n      } else {\n        toast({ title: "Document Secured", description: `${doc.name} successfully encrypted in vault.` });\n        // 🧠 DETERMINISTIC STATE MUTATION: Use both local ID and backend format to guarantee sync\n        setUploadedDocs(prev => ({ \n          ...prev, \n          [doc.id]: true,\n          [normalizeDocName(doc.name)]: true \n        }));\n      }\n    } catch (err: any) {\n      console.error("Upload stream disrupted:", err);\n      toast({ title: "Upload Error", description: "Network stream disrupted.", variant: "destructive" });\n    } finally {\n      setUploadingDocs(prev => ({ ...prev, [doc.id]: false }));\n    }\n  };\n\n  const handleRemoveDocument = async (doc: { id: string; name: string }) => {\n    if (!activeApplication?.applicationId) return;\n    \n    setUploadingDocs(prev => ({ ...prev, [doc.id]: true }));\n    try {\n      const { error } = await PrymeAPI.deleteApplicationDocument(activeApplication.applicationId, normalizeDocName(doc.name));\n      if (error) {\n         toast({ title: "Delete Failed", description: error.message || "Failed to remove document.", variant: "destructive" });\n      } else {\n         setUploadedDocs(prev => {\n            const next = { ...prev };\n            delete next[doc.id];\n            delete next[normalizeDocName(doc.name)];\n            return next;\n         });\n         setConfirmDeleteId(null);\n         toast({ title: "Document Removed", description: `${doc.name} was successfully removed.` });\n      }\n    } catch (err) {\n      toast({ title: "Delete Error", description: "Failed to communicate with vault.", variant: "destructive" });\n    } finally {\n      setUploadingDocs(prev => ({ ...prev, [doc.id]: false }));\n    }\n  };\n\n  const onDragOver = (e: React.DragEvent, id: string) => {\n    e.preventDefault();\n    setDragOverDocId(id);\n  };\n  const onDragLeave = (e: React.DragEvent) => {\n    e.preventDefault();\n    setDragOverDocId(null);\n  };\n  const onDrop = (e: React.DragEvent, doc: { id: string; name: string; required: boolean }) => {\n    e.preventDefault();\n    setDragOverDocId(null);\n    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {\n      const pseudoEvent = { target: { files: e.dataTransfer.files, value: '' } } as any;\n      handleFileUpload(doc, pseudoEvent);\n    }\n  };\n\n  if (authLoading || isDataLoading || viewState === "LOADING") {\n    return (\n      <div className="min-h-screen flex items-center justify-center bg-background">\n        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5">\n          <div className="relative w-10 h-10">\n            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />\n            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />\n          </div>\n          <p className="text-muted-foreground font-medium text-sm tracking-wide">Syncing architecture...</p>\n        </motion.div>\n      </div>\n    );\n  }\n\n  const stages = [\n    { id: 1, label: "Identity Matrix", desc: "Basic KYC Verification" },\n    { id: 2, label: "Document Vault", desc: "Secure File Ingestion" },\n  ];\n\n  return (\n    <>\n      <Helmet><title>Client Portal | PRYME Bank-Grade Solutions</title></Helmet>\n      <div className="min-h-screen flex flex-col bg-[hsl(var(--background))] selection:bg-primary/20">\n        <Header />\n\n        <PageShell className="flex-1">\n          <main className="flex-1 w-full pt-16 md:pt-20 flex flex-col">\n            <AnimatePresence mode="wait">\n            {viewState === "FUNNEL" && (\n              <motion.div \n                key="funnel"\n                initial={{ opacity: 0 }} \n                animate={{ opacity: 1 }} \n                exit={{ opacity: 0 }}\n              >\n                <Section spacing="xl" className="max-w-7xl mx-auto px-4 md:px-8">
                  <Container size="full" className="max-w-[1200px] mx-auto">
                    {/* TOP BANNER */}
                    <div className="bg-white rounded-[24px] p-8 md:p-10 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 mb-8 flex flex-col justify-between min-h-[280px]">
                      {/* Left Content */}
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                           <div className="mb-6">
                             <div className="w-14 h-14 bg-blue-50/80 rounded-[16px] flex items-center justify-center border border-blue-100/50">
                               <FileText className="w-6 h-6 text-blue-600" />
                             </div>
                           </div>
                           <div className="flex items-center gap-2 mb-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                             <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">Your Application</span>
                           </div>
                           <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                             Let's get you funded
                           </h1>
                        </div>
                      </div>
                      
                      {/* Right 3D Illustration area */}
                      <div className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none hidden md:block">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[60px]"></div>
                         <div className="absolute top-1/2 right-12 -translate-y-1/2 flex items-center justify-center">
                            <div className="relative w-40 h-40 bg-white/60 backdrop-blur-md rounded-[20px] border border-white shadow-xl flex items-center justify-center rotate-6">
                               <Shield className="w-16 h-16 text-blue-500/80" />
                               <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg -rotate-6">
                                 <Lock className="w-5 h-5 text-white" />
                               </div>
                               <div className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg -rotate-6">
                                 <CheckCircle2 className="w-5 h-5 text-white" />
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Bottom Progress Bar */}
                      <div className="absolute bottom-0 left-8 right-8 md:left-10 md:right-10 flex items-end h-24">
                         <div className="w-full flex gap-3 pb-8">
                           {stages.map((s, idx) => {
                             const isActive = currentStage === s.id;
                             const isPast = currentStage > s.id;
                             return (
                               <div key={s.id} className="flex-1 flex flex-col gap-2.5">
                                 <div className={`h-1.5 rounded-full ${isActive ? 'bg-blue-600' : isPast ? 'bg-blue-600' : 'bg-slate-100'}`}></div>
                                 <span className={`text-[11px] font-bold ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>{s.label}</span>
                               </div>
                             )
                           })}
                           {/* Dummy steps to match the 5 steps in image visually */}
                           <div className="flex-1 flex flex-col gap-2.5">
                             <div className="h-1.5 rounded-full bg-slate-100"></div>
                             <span className="text-[11px] font-bold text-slate-400">Financial Profile</span>
                           </div>
                           <div className="flex-1 flex flex-col gap-2.5">
                             <div className="h-1.5 rounded-full bg-slate-100"></div>
                             <span className="text-[11px] font-bold text-slate-400">Loan Details</span>
                           </div>
                           <div className="flex-1 flex flex-col gap-2.5">
                             <div className="h-1.5 rounded-full bg-slate-100"></div>
                             <span className="text-[11px] font-bold text-slate-400">Review & Submit</span>
                           </div>
                         </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* LEFT SIDEBAR */}
                      <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100">
                          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">Application Steps</h3>
                          
                          <div className="relative">
                            <div className="absolute left-[23px] top-6 bottom-6 w-[2px] bg-slate-100 z-0"></div>
                            
                            <div className="flex flex-col gap-2 relative z-10">
                              {stages.map((s, idx) => {
                                const isActive = currentStage === s.id;
                                const isCompleted = currentStage > s.id;
                                return (
                                  <div key={s.id} className={`flex items-center p-3 rounded-[16px] cursor-default transition-all ${isActive ? 'bg-slate-50' : 'bg-transparent'}`}>
                                    <div className="flex items-center gap-4 flex-1">
                                      <div className={`w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-white shadow-sm border border-slate-200/60 text-blue-600' : isCompleted ? 'bg-blue-50 text-blue-600 border border-transparent' : 'bg-white border border-slate-200 text-slate-300'}`}>
                                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-bold text-[15px]">{s.id}</span>}
                                      </div>
                                      <div>
                                        <p className={`font-bold text-[14px] ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{s.label}</p>
                                        <p className="text-[12px] font-medium text-slate-400">{s.desc}</p>
                                      </div>
                                    </div>
                                    {isActive && <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />}
                                  </div>
                                );
                              })}
                              
                              {[3, 4, 5].map((dummyId) => {
                                const labels = ["Financial Profile", "Loan Details", "Review & Submit"];
                                const descs = ["Income & bank details", "Loan amount & purpose", "Review and submit application"];
                                return (
                                  <div key={dummyId} className="flex items-center p-3 rounded-[16px] bg-transparent">
                                    <div className="flex items-center gap-4 flex-1">
                                      <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0 bg-white border border-slate-200 text-slate-300">
                                        <span className="font-bold text-[15px]">{dummyId}</span>
                                      </div>
                                      <div>
                                        <p className="font-bold text-[14px] text-slate-400">{labels[dummyId-3]}</p>
                                        <p className="text-[12px] font-medium text-slate-400/70">{descs[dummyId-3]}</p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* MAIN CONTENT */}
                      <div className="lg:col-span-8">
                        <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 relative overflow-hidden h-full flex flex-col">
                          
                          {currentStage === 1 && (
                            <div className="p-8 md:p-10 flex-1 flex flex-col">
                              <div className="mb-10">
                                <h2 className="text-[28px] font-bold text-slate-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>1. Identity & Location</h2>
                                <p className="text-[14px] font-medium text-slate-500">Let's start with some basic information to verify your identity.</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 flex-1">
                                <div className="flex flex-col gap-2.5">
                                  <Label htmlFor="panNumber" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">PAN NUMBER <span className="text-blue-600">*</span></Label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                      <CreditCard className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <Input id="panNumber" value={formData.panNumber} onChange={(e) => handleInputChange("panNumber", e.target.value)} placeholder="ABCDE1234F" className="pl-11 h-14 bg-white border-slate-200 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase rounded-[12px] text-[15px] text-slate-900 font-semibold transition-all hover:border-slate-300" maxLength={10} />
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-2.5">
                                  <Label htmlFor="dob" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">DATE OF BIRTH <span className="text-blue-600">*</span></Label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                      <Calendar className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <Input id="dob" type="date" value={formData.dob} onChange={(e) => handleInputChange("dob", e.target.value)} className="pl-11 pr-4 h-14 bg-white border-slate-200 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-[12px] text-[15px] text-slate-900 font-semibold transition-all hover:border-slate-300 [&::-webkit-calendar-picker-indicator]:opacity-0" />
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-2.5">
                                  <Label htmlFor="currentCity" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">CURRENT CITY <span className="text-blue-600">*</span></Label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                      <MapPin className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <Input id="currentCity" value={formData.currentCity} onChange={(e) => handleInputChange("currentCity", e.target.value)} className="pl-11 h-14 bg-white border-slate-200 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-[12px] text-[15px] text-slate-900 font-semibold transition-all hover:border-slate-300" />
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-2.5">
                                  <Label htmlFor="pinCode" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">PIN CODE <span className="text-blue-600">*</span></Label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                      <Building2 className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <Input id="pinCode" value={formData.pinCode} onChange={(e) => handleInputChange("pinCode", e.target.value.replace(/\D/g, ''))} maxLength={6} className="pl-11 h-14 bg-white border-slate-200 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-[12px] text-[15px] text-slate-900 font-semibold transition-all hover:border-slate-300" />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Bottom Section with button and secure box inline */}
                              <div className="mt-auto flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-[12px] border border-slate-100 flex-1 w-full md:w-auto">
                                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200/60 shrink-0">
                                    <Lock className="w-4 h-4 text-slate-500" />
                                  </div>
                                  <div>
                                    <p className="text-[13px] font-bold text-slate-700">100% Secure & Confidential</p>
                                    <p className="text-[11px] font-medium text-slate-500">Bank-level encryption</p>
                                  </div>
                                </div>
                                
                                <Button 
                                  onClick={handleNextStage} 
                                  disabled={isSaving}
                                  className="w-full md:w-auto h-14 px-10 text-[15px] font-bold bg-[#1A56DB] hover:bg-[#1E40AF] text-white rounded-[12px] shadow-[0_4px_14px_rgba(26,86,219,0.25)] transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex-shrink-0"
                                >
                                  {isSaving ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
                                  ) : (
                                    <>Save & Continue <ArrowRight className="w-4 h-4 ml-2" /></>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}

                          {currentStage === 2 && (
                            <div className="p-8 md:p-10 flex-1 flex flex-col">
                              <div className="mb-8">
                                <h2 className="text-[28px] font-bold text-slate-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>2. Document Vault</h2>
                                <p className="text-[14px] font-medium text-slate-500">Upload your documents securely to complete your application.</p>
                              </div>

                              <div className="flex-1 overflow-y-auto pr-2 mb-8 -mr-2">
                                <Stack gap="var(--space-6)">
                                  {docGroups.map((group) => {
                                    const totalDocs = group.docs.length;
                                    const securedDocs = group.docs.filter(d => uploadedDocs[d.id] || uploadedDocs[normalizeDocName(d.name)]).length;

                                    return (
                                    <div key={group.category} className="mb-2">
                                      <Inline justify="space-between" align="center" className="mb-4 pb-2 border-b border-slate-100">
                                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{group.displayName}</h4>
                                        <span className="text-[11px] font-bold text-slate-400">{securedDocs} / {totalDocs}</span>
                                      </Inline>
                                      <Stack gap="var(--space-3)">
                                        {group.docs.map((doc) => {
                                          const isUploading = uploadingDocs[doc.id];
                                          const isUploaded = uploadedDocs[doc.id] || uploadedDocs[normalizeDocName(doc.name)];
                                          const isConfirmingDelete = confirmDeleteId === doc.id;

                                          return (
                                            <div key={doc.id} className={`flex items-center justify-between p-4 rounded-[16px] border transition-all ${isUploaded ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}>
                                              <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                  {isUploaded && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                                  <span className={`text-[14px] font-bold ${isUploaded ? 'text-emerald-800' : 'text-slate-800'}`}>
                                                    {doc.name} {doc.required && !isUploaded && <span className="text-blue-600 ml-1">*</span>}
                                                  </span>
                                                </div>
                                                {!isUploaded && <span className="text-[12px] text-slate-400 font-medium">PDF, JPG up to 10MB</span>}
                                              </div>
                                              
                                              <div className="flex items-center gap-3">
                                                <input type="file" id={`upload-${doc.id}`} className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(doc, e)} disabled={isUploading || isUploaded} />
                                                
                                                {isUploading && (
                                                  <div className="flex items-center gap-2 text-blue-600 text-[13px] font-bold bg-blue-50 px-4 py-2 rounded-[10px]">
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading
                                                  </div>
                                                )}

                                                {isUploaded && !isUploading && (
                                                  <div className="flex items-center gap-2">
                                                    {isConfirmingDelete ? (
                                                      <div className="flex items-center bg-white shadow-sm border border-red-100 rounded-[10px] p-1">
                                                        <span className="text-[12px] font-bold text-red-600 px-2">Remove?</span>
                                                        <Button size="sm" variant="ghost" className="h-8 text-red-600 hover:bg-red-50 px-3 text-[13px] font-bold rounded-[8px]" onClick={() => handleRemoveDocument(doc)}>Yes</Button>
                                                        <Button size="sm" variant="ghost" className="h-8 hover:bg-slate-100 px-3 text-[13px] font-bold rounded-[8px]" onClick={() => setConfirmDeleteId(null)}>No</Button>
                                                      </div>
                                                    ) : (
                                                      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[10px]" onClick={() => setConfirmDeleteId(doc.id)}>
                                                        <X className="w-4 h-4" />
                                                      </Button>
                                                    )}
                                                  </div>
                                                )}

                                                {!isUploaded && !isUploading && (
                                                  <Label htmlFor={`upload-${doc.id}`} className="flex items-center justify-center h-10 px-5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 rounded-[10px] text-[13px] font-bold cursor-pointer transition-colors shadow-sm">
                                                    <UploadCloud className="w-4 h-4 mr-2" />
                                                    Upload
                                                  </Label>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </Stack>
                                    </div>
                                    )})}
                                </Stack>
                              </div>

                              <div className="mt-auto flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
                                <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-[12px] border border-slate-100 flex-1 w-full md:w-auto">
                                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200/60 shrink-0">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                  </div>
                                  <div>
                                    <p className="text-[13px] font-bold text-slate-700">Bank-Grade Document Storage</p>
                                    <p className="text-[11px] font-medium text-slate-500">Your files are encrypted</p>
                                  </div>
                                </div>
                                
                                <Button 
                                  onClick={handleFinalSubmit} 
                                  disabled={isSaving}
                                  className="w-full md:w-auto h-14 px-10 text-[15px] font-bold bg-[#1A56DB] hover:bg-[#1E40AF] text-white rounded-[12px] shadow-[0_4px_14px_rgba(26,86,219,0.25)] transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex-shrink-0"
                                >
                                  {isSaving ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Securing Data...</>
                                  ) : (
                                    <>Submit to Underwriter <ArrowRight className="w-4 h-4 ml-2" /></>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                          
                        </div>
                      </div>
                    </div>
                  </Container>
                </Section>
                <motion.div>\n            )}\n          </AnimatePresence>\n\n          {(viewState === "DASHBOARD" || viewState === "EMPTY") && (\n            <AnimatePresence mode="wait">\n              <motion.div \n                key="dashboard"\n                initial={{ opacity: 0 }} \n                animate={{ opacity: 1 }} \n                exit={{ opacity: 0 }}\n              >\n                <Surface className="aurora-gradient border-b border-[hsl(var(--border))] mb-[var(--space-section)]">\n                  <Section spacing="lg">\n                    <Container size="expanded">\n                    <Inline justify="space-between" align="end" className="flex-col md:flex-row gap-[var(--space-4)]">\n                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring}>\n                        <h1 className="text-2xl md:text-3xl font-bold text-[hsl(var(--foreground))] mb-[var(--space-2)] tracking-tight">Client Portfolio</h1>\n                        <p className="text-[hsl(var(--muted-foreground))] text-[length:var(--text-large)]">Real-time tracking for your active financial instruments.</p>\n                      </motion.div>\n                      <Inline gap="var(--space-3)" align="center">\n                        {isAdmin && (\n                          <Button onClick={() => navigate("/admin")} variant="outline" className="border-[hsl(var(--border))]">\n                            <Building2 className="w-4 h-4 mr-2" /> Admin Core\n                          </Button>\n                        )}\n                        <Link to="/apply">\n                          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">\n                            New Application <ArrowRight className="w-4 h-4 ml-2" />\n                          </Button>\n                        </Link>\n                      </Inline>\n                    </Inline>\n                    </Container>\n                  </Section>\n                </Surface>\n\n                <Section spacing="none">\n                  <Container size="expanded">\n                  {viewState === "EMPTY" ? (\n                    <Surface className="text-center shadow-sm">\n                      <Section spacing="2xl">\n                        <Container size="full">\n                      <div className="w-20 h-20 bg-[hsl(var(--muted))]/60 rounded-full flex items-center justify-center mx-auto mb-[var(--space-6)] border border-[hsl(var(--border))]/50">\n                        <FileText className="w-8 h-8 text-[hsl(var(--muted-foreground))]" />\n                      </div>\n                      <h3 className="text-[length:var(--text-heading)] font-bold text-[hsl(var(--foreground))] mb-[var(--space-2)]">No Active Instruments</h3>\n                      <p className="text-[hsl(var(--muted-foreground))] mb-[var(--space-8)] max-w-md mx-auto">Your portfolio is empty. Click below to initiate a new loan application and explore our banking partners.</p>\n                      <Link to="/apply"><Button size="lg" className="px-8 bg-blue-600 hover:bg-blue-700 text-white">Initialize Application</Button></Link>\n                        </Container>\n                      </Section>\n                    </Surface>\n                  ) : (\n                    <Stack gap="var(--space-6)">\n                      {myApplications.map((app, index) => {\n                        const config = getStatusConfig(app.status);\n                        const StatusIcon = config.icon;\n                        return (\n                          <motion.div key={app.applicationId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", ...spring, delay: index * 0.1 }}>\n                            <Surface className="overflow-hidden hover:border-primary/20 transition-all shadow-sm">\n                              <div className="p-[var(--space-6)] md:p-[var(--space-8)] flex flex-col md:flex-row gap-[var(--space-6)] md:gap-[var(--space-12)] justify-between">\n                                <Stack gap="var(--space-4)" className="flex-1">\n                                  <Inline gap="var(--space-3)" align="center">\n                                    <span className={cn("inline-flex items-center gap-[var(--space-1)] px-3 py-1 rounded-full text-[length:var(--text-caption)] font-semibold border", config.color)}>\n                                      <StatusIcon className="w-3.5 h-3.5" /> {config.label}\n                                    </span>\n                                    <span className="text-[length:var(--text-small)] font-mono font-medium text-[hsl(var(--muted-foreground))]">{app.applicationId}</span>\n                                  </Inline>\n                                  <div>\n                                    <p className="text-[length:var(--text-caption)] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mb-[var(--space-1)]">{app.loanType?.replace(/_/g, " ") || "PERSONAL LOAN"}</p>\n                                    <h3 className="text-3xl font-bold text-[hsl(var(--foreground))] flex items-center gap-2">\n                                      <Wallet className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />\n                                      ₹{app.requestedAmount?.toLocaleString("en-IN") || "0"}\n                                    </h3>\n                                  </div>\n                                </Stack>\n                                <Stack gap="var(--space-6)" className="flex-1 max-w-sm">\n                                  <div>\n                                    <Inline justify="space-between" align="center" className="text-[length:var(--text-small)] mb-[var(--space-3)] font-medium">\n                                      <span className="text-[hsl(var(--foreground))]">Processing Matrix</span>\n                                      <span className="text-primary tabular-nums">{app.completionPercentage || config.progress}%</span>\n                                    </Inline>\n                                    <Progress value={app.completionPercentage || config.progress} className="h-2 bg-[hsl(var(--muted))] [&>div]:bg-primary" />\n                                  </div>\n                                  <div className="grid grid-cols-2 gap-[var(--space-4)] pt-[var(--space-4)] border-t border-[hsl(var(--border))]">\n                                    <div>\n                                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-widest font-bold mb-[var(--space-1)]">Initiated</p>\n                                      <p className="text-[length:var(--text-small)] font-medium text-[hsl(var(--foreground))]">{app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}</p>\n                                    </div>\n                                    <div>\n                                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-widest font-bold mb-[var(--space-1)]">Assignee</p>\n                                      <p className="text-[length:var(--text-small)] font-medium text-[hsl(var(--foreground))]">{app.assignee || "Evaluating"}</p>\n                                    </div>\n                                  </div>\n                                  <div className="pt-[var(--space-2)] border-t border-[hsl(var(--border))]/50">\n                                    <Button \n                                      variant="ghost" \n                                      className="w-full justify-between hover:bg-blue-500/10 hover:text-blue-600 transition-colors"\n                                      onClick={() => {\n                                        setActiveApplication(app);\n                                        // 🧠 SILICON VALLEY FEATURE: Re-hydrate the form allowing post-submission edits\n                                        if (app.metadata) {\n                                          try {\n                                            const parsedMeta = typeof app.metadata === "string" ? JSON.parse(app.metadata) : app.metadata;\n                                            setFormData(prev => ({ ...prev, ...parsedMeta }));\n                                          } catch(e) { console.error(e); }\n                                        }\n\n                                        if (app.documents && app.documents.length > 0) {\n                                          const loadedDocs: Record<string, boolean> = {};\n                                          app.documents.forEach((d) => {\n                                            if (d.docType) loadedDocs[d.docType] = true;\n                                          });\n                                          setUploadedDocs(loadedDocs);\n                                        }\n\n                                        setViewState("FUNNEL");\n                                        setCurrentStage(1);\n                                        window.scrollTo({ top: 0, behavior: "smooth" });\n                                      }}\n                                    >\n                                      <span className="flex items-center"><Edit2 className="w-4 h-4 mr-2" /> Update Information / Documents</span>\n                                      <ChevronRight className="w-4 h-4" />\n                                    </Button>\n                                  </div>\n                                </Stack>\n                              </div>\n                            </Surface>\n                          </motion.div>\n                        );\n                      })}\n                    </Stack>\n                  )}\n                  </Container>\n                </Section>\n              </motion.div>\n            </AnimatePresence>\n          )}\n          </main>\n        </PageShell>\n        <Footer />\n      </div>\n    </>\n  );\n};\n\nexport default Dashboard;\n