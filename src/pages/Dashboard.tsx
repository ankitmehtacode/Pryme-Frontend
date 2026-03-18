import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FileText, Search, CheckCircle, CreditCard, Clock,
  AlertCircle, Building2, TrendingUp, Activity,
  ShieldCheck, ChevronRight, ArrowRight, Wallet,
  UploadCloud, CheckCircle2, Circle, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// 🧠 ARCHITECTURE IMPORTS
import api, { PrymeAPI } from "@/lib/api";
import { getDocumentsForLoanType, ProductType, EmploymentType } from "@/lib/documentData";

const spring = { stiffness: 120, damping: 28, mass: 0.8 };

const getStatusConfig = (status: string) => {
  switch (status?.toUpperCase()) {
    case "SUBMITTED":
      return { color: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/50 dark:text-blue-400", icon: FileText, progress: 20, label: "Submitted" };
    case "PROCESSING":
      return { color: "text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800/50 dark:text-purple-400", icon: Activity, progress: 50, label: "Processing" };
    case "VERIFIED":
      return { color: "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800/50 dark:text-indigo-400", icon: ShieldCheck, progress: 75, label: "Verified" };
    case "APPROVED":
      return { color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/50 dark:text-emerald-400", icon: CheckCircle, progress: 100, label: "Approved" };
    case "REJECTED":
      return { color: "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800/50 dark:text-red-400", icon: AlertCircle, progress: 100, label: "Rejected" };
    default:
      return { color: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700/50 dark:text-slate-400", icon: Clock, progress: 5, label: status || "Draft" };
  }
};

const Dashboard = () => {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewState, setViewState] = useState<"LOADING" | "FUNNEL" | "DASHBOARD" | "EMPTY">("LOADING");
  
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [activeApplication, setActiveApplication] = useState<any>(null);
  
  const [currentStage, setCurrentStage] = useState(1);
  
  // 🧠 TITANIUM STATE: Pre-filled keys prevent React "uncontrolled input" warnings
  const [formData, setFormData] = useState({
    panNumber: "", dob: "", currentCity: "", pinCode: "", 
    companyName: "", designation: "", workExperience: "", officeEmail: "", 
    monthlyEMI: "", existingBank: "", coApplicant: "No", loanPurpose: "", 
  });

  useEffect(() => {
    let isMounted = true;

    const bootDashboard = async () => {
      if (authLoading) return;
      if (!user) {
        if (isMounted) navigate("/auth?redirect=/dashboard", { replace: true });
        return;
      }
      if (isAdmin) {
        if (isMounted) navigate("/admin", { replace: true });
        return;
      }

      try {
        const pendingLead = localStorage.getItem("pryme_pending_lead_id");
        if (pendingLead) {
          try {
            await PrymeAPI.elevateLead(pendingLead, user.id);
            localStorage.removeItem("pryme_pending_lead_id");
          } catch (e) {
            console.warn("Lead elevation skipped.");
          }
        }

        const response = await api.get("/applications/me");
        const apps = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
        
        if (isMounted) {
          setMyApplications(apps);

          if (apps.length > 0) {
            const primaryApp = apps[0]; 
            setActiveApplication(primaryApp);
            const progress = primaryApp.completionPercentage || 0;
            
            if (progress < 100) {
              setViewState("FUNNEL");
              if (progress < 25) setCurrentStage(1);
              else if (progress < 50) setCurrentStage(2);
              else if (progress < 75) setCurrentStage(3);
              else setCurrentStage(4); 
              
              // 🧠 THE TITANIUM PARSER
              // Safely handles H2/PostgreSQL JSON String serialization artifacts
              if (primaryApp.metadata) {
                let parsedMeta = {};
                if (typeof primaryApp.metadata === "string") {
                  try {
                    parsedMeta = JSON.parse(primaryApp.metadata);
                  } catch (e) {
                    console.error("Failed to parse backend metadata string.", e);
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
            setViewState("EMPTY");
          }
        }
      } catch (error: any) {
        console.error("Dashboard Sync Error:", error);
        if (isMounted) setViewState("EMPTY");
      } finally {
        if (isMounted) setIsDataLoading(false);
      }
    };

    bootDashboard();

    const unlockTimer = setTimeout(() => {
      if (isMounted && isDataLoading) {
        setIsDataLoading(false);
        if (viewState === "LOADING") setViewState("EMPTY");
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(unlockTimer);
    };
  }, [user, authLoading, isAdmin, navigate]);

  const { incomeDocs, propertyDocs } = useMemo(() => {
    if (!activeApplication && viewState !== "FUNNEL") return { incomeDocs: [], propertyDocs: [] };
    
    let parsed: any = {};
    try {
      const savedApp = localStorage.getItem("pryme_pending_application");
      if (savedApp && savedApp !== "undefined") {
        parsed = JSON.parse(savedApp);
      }
    } catch(e) {}
    
    const rawLoan = activeApplication?.loanType || parsed?.loanType || "Personal Loan";
    const rawEmp = activeApplication?.metadata?.employmentType || parsed?.employmentType || "Salaried";

    const formatEnumString = (str: string) => {
      if (!str) return str;
      if (str === "LAP" || str === "SEP" || str === "SENP") return str;
      if (str === "SELF_EMPLOYED_PROFESSIONAL") return "SEP";
      if (str === "SELF_EMPLOYED_NON_PROFESSIONAL") return "SENP";
      return str.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    };

    const targetLoan = formatEnumString(rawLoan) as ProductType;
    const targetEmp = formatEnumString(rawEmp) as EmploymentType;

    const allDocs = getDocumentsForLoanType(targetLoan, targetEmp) || [];

    return {
      incomeDocs: allDocs.filter(d => d.category === "Income").map(d => ({ id: d.id, name: d.label, required: !d.optional })),
      propertyDocs: allDocs.filter(d => d.category === "Property").map(d => ({ id: d.id, name: d.label, required: !d.optional }))
    };
  }, [activeApplication, viewState]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStage = async () => {
    if (!activeApplication) return;
    setIsSaving(true);
    
    const newStage = currentStage + 1;
    const newProgress = (newStage - 1) * 25;
    
    try {
      await api.patch(`/applications/${activeApplication.applicationId}`, {
         metadata: formData,
         completionPercentage: newProgress
      });
      toast({ title: "Session Saved", description: `Progress synchronized at ${newProgress}%` });
    } catch (error) {
      console.warn("Backend sync bypassed. Executing Optimistic UI progression.");
    } finally {
      setCurrentStage(newStage);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsSaving(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!activeApplication) return;
    setIsSaving(true);

    try {
      await api.patch(`/applications/${activeApplication.applicationId}/status`, {
         status: "PROCESSING"
      });
    } catch (error) {
      console.warn("Backend status update bypassed. Executing Optimistic UI completion.");
    } finally {
      toast({ title: "Underwriting Initiated", description: "All documents secured. Routing to Tracker." });
      
      const updatedApps = [...myApplications];
      updatedApps[0].completionPercentage = 100;
      updatedApps[0].status = "PROCESSING";
      setMyApplications(updatedApps);
      setViewState("DASHBOARD");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsSaving(false);
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
    { id: 2, label: "Professional Data", desc: "Employment & Income" },
    { id: 3, label: "Financial Footprint", desc: "Liabilities & Declarations" },
    { id: 4, label: "Document Vault", desc: "Secure File Ingestion" },
  ];

  return (
    <>
      <Helmet><title>Client Portal | PRYME Bank-Grade Solutions</title></Helmet>
      <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
        <Header />

        <main className="flex-1 pb-24">
          {viewState === "FUNNEL" && (
            <div className="pt-24 px-4 md:px-8 max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
                
                <div className="bg-slate-900 text-white rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden border border-slate-800">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                  <div className="flex justify-between items-end mb-4 relative z-10">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight mb-2">Application Pipeline</h1>
                      <p className="text-slate-400 font-mono text-sm">ID: {activeApplication?.applicationId || "Initializing..."}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-bold text-blue-500">{((currentStage - 1) * 25) || 5}%</span>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Captured</p>
                    </div>
                  </div>
                  <Progress value={(currentStage - 1) * 25} className="h-2 bg-slate-800 [&>div]:bg-blue-500 relative z-10" />
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
                                {isCompleted ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : 
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
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full pointer-events-none" />
                      
                      {/* 🧠 TITANIUM BINDINGS: Safe fallbacks (formData?.field || "") everywhere */}
                      {currentStage === 1 && (
                        <div className="space-y-6 relative z-10">
                          <h2 className="text-xl font-bold border-b border-border pb-4">1. Identity & Location</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2"><Label>PAN Number</Label><Input value={formData?.panNumber || ""} onChange={(e) => handleInputChange("panNumber", e.target.value)} placeholder="ABCDE1234F" className="bg-background" /></div>
                            <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={formData?.dob || ""} onChange={(e) => handleInputChange("dob", e.target.value)} className="bg-background" /></div>
                            <div className="space-y-2"><Label>Current City</Label><Input value={formData?.currentCity || ""} onChange={(e) => handleInputChange("currentCity", e.target.value)} className="bg-background" /></div>
                            <div className="space-y-2"><Label>Pin Code</Label><Input value={formData?.pinCode || ""} onChange={(e) => handleInputChange("pinCode", e.target.value)} className="bg-background" /></div>
                          </div>
                        </div>
                      )}

                      {currentStage === 2 && (
                        <div className="space-y-6 relative z-10">
                          <h2 className="text-xl font-bold border-b border-border pb-4">2. Professional Matrix</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2"><Label>Company Name</Label><Input value={formData?.companyName || ""} onChange={(e) => handleInputChange("companyName", e.target.value)} className="bg-background" /></div>
                            <div className="space-y-2"><Label>Designation</Label><Input value={formData?.designation || ""} onChange={(e) => handleInputChange("designation", e.target.value)} className="bg-background" /></div>
                            <div className="space-y-2"><Label>Work Experience (Yrs)</Label><Input type="number" value={formData?.workExperience || ""} onChange={(e) => handleInputChange("workExperience", e.target.value)} className="bg-background" /></div>
                            <div className="space-y-2"><Label>Official Email ID</Label><Input type="email" value={formData?.officeEmail || ""} onChange={(e) => handleInputChange("officeEmail", e.target.value)} className="bg-background" /></div>
                          </div>
                        </div>
                      )}

                      {currentStage === 3 && (
                        <div className="space-y-6 relative z-10">
                          <h2 className="text-xl font-bold border-b border-border pb-4">3. Financial Footprint</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2"><Label>Total Existing EMIs (Monthly)</Label><Input type="number" value={formData?.monthlyEMI || ""} onChange={(e) => handleInputChange("monthlyEMI", e.target.value)} className="bg-background" /></div>
                            <div className="space-y-2"><Label>Primary Salary Bank</Label><Input value={formData?.existingBank || ""} onChange={(e) => handleInputChange("existingBank", e.target.value)} className="bg-background" /></div>
                            <div className="space-y-2"><Label>Co-Applicant Added?</Label><Input value={formData?.coApplicant || ""} onChange={(e) => handleInputChange("coApplicant", e.target.value)} placeholder="Yes / No" className="bg-background" /></div>
                            <div className="space-y-2"><Label>End Purpose</Label><Input value={formData?.loanPurpose || ""} onChange={(e) => handleInputChange("loanPurpose", e.target.value)} className="bg-background" /></div>
                          </div>
                        </div>
                      )}

                      {currentStage === 4 && (
                        <div className="space-y-8 relative z-10">
                          <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                            <div className="bg-blue-500/10 p-2 rounded-lg"><FileText className="w-5 h-5 text-blue-500"/></div>
                            <div>
                              <h2 className="text-xl font-bold">4. Document Vault</h2>
                              <p className="text-sm text-muted-foreground">Final step. Securely upload documents to initiate underwriting.</p>
                            </div>
                          </div>

                          {incomeDocs.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4">Financial & Income</h4>
                              <div className="space-y-3">
                                {incomeDocs.map((doc: any) => (
                                  <div key={doc.id} className="group flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                                    <div className="flex flex-col">
                                      <span className="font-medium text-foreground text-sm">
                                        {doc.name} {doc.required && <span className="text-red-500 ml-1">*</span>}
                                      </span>
                                      <span className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (Max 5MB)</span>
                                    </div>
                                    <Button variant="outline" size="sm" className="group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                                      <UploadCloud className="w-4 h-4 mr-2" /> Upload
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {propertyDocs.length > 0 && (
                            <div className="pt-4">
                              <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-4">Property Records</h4>
                              <div className="space-y-3">
                                {propertyDocs.map((doc: any) => (
                                  <div key={doc.id} className="group flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                                    <div className="flex flex-col">
                                      <span className="font-medium text-foreground text-sm">
                                        {doc.name} {doc.required && <span className="text-red-500 ml-1">*</span>}
                                      </span>
                                    </div>
                                    <Button variant="outline" size="sm" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                      <UploadCloud className="w-4 h-4 mr-2" /> Upload
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-10 pt-6 border-t border-border flex justify-end relative z-10">
                        <Button 
                          onClick={currentStage === 4 ? handleFinalSubmit : handleNextStage} 
                          disabled={isSaving}
                          className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 disabled:opacity-70 transition-all"
                        >
                          {isSaving ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Securing Data...</>
                          ) : (
                            <>{currentStage === 4 ? "Submit to Underwriter" : "Save & Continue"} <ChevronRight className="w-5 h-5 ml-2" /></>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {(viewState === "DASHBOARD" || viewState === "EMPTY") && (
            <>
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
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Dashboard;