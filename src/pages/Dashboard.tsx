import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FileText, Search, CheckCircle, CreditCard, Clock,
  AlertCircle, Building2, TrendingUp, Activity,
  ShieldCheck, ChevronRight, ArrowRight, Wallet,
  UploadCloud, CheckCircle2, Circle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { DOCUMENT_CHECKLIST_MATRIX, LoanCategory, EmploymentType } from "@/lib/documentData";

const spring = { stiffness: 120, damping: 28, mass: 0.8 };

const getStatusConfig = (status: string) => {
  switch (status) {
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
      return { color: "text-slate-600 bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700/50 dark:text-slate-400", icon: Clock, progress: 0, label: status || "Pending" };
  }
};

const Dashboard = () => {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // 🧠 Lead Salvage Engine State
  const [localPendingApp, setLocalPendingApp] = useState<{loanType: LoanCategory, empType: EmploymentType, loanAmount: number} | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/dashboard");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch real applications from the Java Backend
        const response = await api.get("/applications/me");
        setMyApplications(response.data);

        // 2. Check for a pending application that just passed the Auth Gate
        const savedApp = localStorage.getItem("pryme_pending_application");
        if (savedApp) {
          const parsed = JSON.parse(savedApp);
          setLocalPendingApp({
            loanType: parsed.loanType as LoanCategory,
            empType: parsed.employmentType as EmploymentType,
            loanAmount: parsed.loanAmount
          });
        }
      } catch (error) {
        toast({ title: "Connection Issue", description: "Could not load your applications securely.", variant: "destructive" });
      } finally {
        setIsDataLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user]);

  if (authLoading || isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-5">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium text-sm tracking-wide">Securing your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // 🧠 Determine which view to show. 
  // If they have a pending app in local storage but NO real application in the DB yet, show the Document Upload (Progressive Profiling).
  // Otherwise, show the standard tracking dashboard.
  const showDocumentFunnel = localPendingApp && myApplications.length === 0;

  return (
    <>
      <Helmet>
        <title>Client Portal | PRYME Bank-Grade Solutions</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
        <Header />

        <main className="flex-1 pb-24">
          {/* ==============================================================
              VIEW 1: THE PROGRESSIVE PROFILING FUNNEL (New Leads)
              ============================================================== */}
          {showDocumentFunnel ? (
            <div className="pt-24 px-8 max-w-5xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
                <div className="bg-slate-900 text-white rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                  <h1 className="text-3xl font-bold tracking-tight mb-2">Application Matrix</h1>
                  <p className="text-slate-400 text-lg">You are exactly 2 steps away from final disbursement.</p>
                  
                  <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-medium text-slate-300">Overall Progress</span>
                      <span className="text-sm font-bold text-white">50% Complete</span>
                    </div>
                    <Progress value={50} className="h-2 bg-slate-700 [&>div]:bg-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Tracking Sidebar */}
                  <div className="lg:col-span-4">
                    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sticky top-24">
                      <h3 className="font-bold text-foreground mb-6">Approval Stages</h3>
                      <div className="space-y-6">
                        {[
                          { step: 1, title: "Basic Information", desc: "Lead parameters captured", state: "done" },
                          { step: 2, title: "Identity Verification", desc: "Secure Auth Complete", state: "done" },
                          { step: 3, title: "Complex Profiling", desc: "Income & property data", state: "active" },
                          { step: 4, title: "Underwriting", desc: "Final Bank Approval", state: "pending" },
                        ].map((s) => (
                          <div key={s.step} className="flex gap-4">
                            <div className="mt-1">
                              {s.state === "done" ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : 
                               s.state === "active" ? <Circle className="w-6 h-6 text-blue-500 fill-blue-500/10" /> : 
                               <Circle className="w-6 h-6 text-slate-300 dark:text-slate-700" />}
                            </div>
                            <div>
                              <p className={`font-semibold ${s.state === "active" ? "text-blue-500" : s.state === "pending" ? "text-slate-400" : "text-foreground"}`}>{s.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Relational Document Engine */}
                  <div className="lg:col-span-8">
                    <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
                      <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                        <div className="bg-blue-500/10 p-2 rounded-lg"><FileText className="w-5 h-5 text-blue-500"/></div>
                        <div>
                          <h2 className="text-xl font-bold text-foreground">Required Documentation</h2>
                          <p className="text-sm text-muted-foreground">Based on your {localPendingApp.empType.replace("_", " ")} profile.</p>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <div>
                          <h4 className="text-sm font-bold tracking-wider text-foreground uppercase mb-4">Financial & Income</h4>
                          <div className="space-y-3">
                            {DOCUMENT_CHECKLIST_MATRIX[localPendingApp.loanType]?.[localPendingApp.empType]?.income?.map(doc => (
                              <div key={doc.id} className="group flex items-center justify-between p-4 rounded-xl border border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
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

                        {DOCUMENT_CHECKLIST_MATRIX[localPendingApp.loanType]?.[localPendingApp.empType]?.property && (
                          <div>
                            <h4 className="text-sm font-bold tracking-wider text-foreground uppercase mb-4">Property Records</h4>
                            <div className="space-y-3">
                              {DOCUMENT_CHECKLIST_MATRIX[localPendingApp.loanType]?.[localPendingApp.empType]?.property?.map(doc => (
                                <div key={doc.id} className="group flex items-center justify-between p-4 rounded-xl border border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                                  <span className="font-medium text-foreground text-sm">
                                    {doc.name} {doc.required && <span className="text-red-500 ml-1">*</span>}
                                  </span>
                                  <Button variant="outline" size="sm" className="group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <UploadCloud className="w-4 h-4 mr-2" /> Upload
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-10 pt-6 border-t border-border flex justify-end">
                        <Button className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                          Submit Documents <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : 

          /* ==============================================================
             VIEW 2: THE STANDARD TRACKING DASHBOARD (Existing Applications)
             ============================================================== */
          (
            <>
              <section className="aurora-gradient pt-24 pb-12">
                <div className="container mx-auto px-4 max-w-6xl">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">
                        Client Portfolio
                      </h1>
                      <p className="text-muted-foreground text-lg">
                        Real-time tracking for your active financial instruments.
                      </p>
                    </motion.div>

                    <div className="flex items-center gap-3">
                      {isAdmin && (
                        <Button onClick={() => navigate("/admin")} className="neo-button border-0 bg-slate-900 text-white hover:bg-slate-800">
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
                  {myApplications.length === 0 ? (
                    <div className="bg-card rounded-3xl border border-border p-16 text-center shadow-sm">
                      <div className="w-20 h-20 bg-muted/60 rounded-full flex items-center justify-center mx-auto mb-6 border border-border/50">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">No Active Instruments</h3>
                      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        Your portfolio is currently empty. Initiate a new application to explore our banking partners.
                      </p>
                      <Link to="/apply">
                        <Button size="lg" className="px-8">Initialize Application</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {myApplications.map((app, index) => {
                        const config = getStatusConfig(app.status);
                        const StatusIcon = config.icon;

                        return (
                          <motion.div
                            key={app.applicationId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", ...spring, delay: index * 0.1 }}
                            className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/20 transition-all duration-300 shadow-sm"
                          >
                            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-12 justify-between">
                              <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-3">
                                  <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border", config.color)}>
                                    <StatusIcon className="w-3.5 h-3.5" /> {config.label}
                                  </span>
                                  <span className="text-sm font-mono font-medium text-muted-foreground">{app.applicationId}</span>
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">{app.loanType.replace("_", " ")}</p>
                                  <h3 className="text-3xl font-bold text-foreground flex items-center gap-2">
                                    <Wallet className="w-6 h-6 text-muted-foreground" />
                                    ₹{app.requestedAmount.toLocaleString("en-IN")}
                                  </h3>
                                </div>
                              </div>

                              <div className="flex-1 max-w-sm space-y-6">
                                <div>
                                  <div className="flex justify-between text-sm mb-3 font-medium">
                                    <span className="text-foreground">Processing Matrix</span>
                                    <span className="text-primary tabular-nums">{app.completionPercentage || config.progress}%</span>
                                  </div>
                                  <Progress value={app.completionPercentage || config.progress} className="h-2 bg-muted" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                                  <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Initiated</p>
                                    <p className="text-sm font-medium text-foreground">
                                      {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Assignee</p>
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