import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  FileText, Search, CheckCircle, CreditCard, Clock,
  AlertCircle, Building2, TrendingUp, Activity,
  ShieldCheck, ChevronRight, ArrowRight, Wallet
} from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

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

const getStageStyles = (status: string) => {
  switch (status) {
    case "completed":
      return { circle: "bg-success text-success-foreground", line: "bg-success", text: "text-success" };
    case "current":
      return { circle: "bg-primary text-primary-foreground", line: "bg-border", text: "text-primary" };
    default:
      return { circle: "bg-muted text-muted-foreground", line: "bg-border", text: "text-muted-foreground" };
  }
};

const Dashboard = () => {
  const { user, isLoading: authLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Demo data — replace with PrymeAPI.getMyApplications() when backend is ready
  const mockUserApps = [
    {
      applicationId: "PRY-9042",
      loanType: "Personal Loan",
      requestedAmount: 850000,
      status: "PROCESSING",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      bankAssigned: "HDFC Bank",
      nextStep: "Document Verification pending by RM",
    },
  ];

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        // const data = await PrymeAPI.getMyApplications();
        // setMyApplications(data);
        setTimeout(() => {
          setMyApplications(mockUserApps);
          setIsDataLoading(false);
        }, 800);
      } catch {
        toast({ title: "Connection issue", description: "Could not load your applications.", variant: "destructive" });
        setIsDataLoading(false);
      }
    };

    if (user) fetchMyData();
  }, [user]);

  const activeApp = myApplications[0];
  const currentStageIndex = activeApp
    ? ["SUBMITTED", "PROCESSING", "VERIFIED", "APPROVED"].indexOf(activeApp.status)
    : -1;

  const stages = [
    { id: 1, title: "Application Received", description: "Your application has been submitted successfully", icon: FileText, status: currentStageIndex >= 0 ? "completed" : "pending", timestamp: activeApp ? new Date(activeApp.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Pending" },
    { id: 2, title: "Document Verification", description: "Our team is verifying your documents", icon: Search, status: currentStageIndex >= 1 ? (currentStageIndex === 1 ? "current" : "completed") : "pending", timestamp: currentStageIndex === 1 ? "In Progress" : currentStageIndex > 1 ? "Completed" : "Pending" },
    { id: 3, title: "Credit Assessment", description: "Evaluating your credit profile", icon: AlertCircle, status: currentStageIndex >= 2 ? (currentStageIndex === 2 ? "current" : "completed") : "pending", timestamp: currentStageIndex === 2 ? "In Progress" : currentStageIndex > 2 ? "Completed" : "Pending" },
    { id: 4, title: "Approval", description: "Final approval from our underwriting team", icon: CheckCircle, status: currentStageIndex >= 3 ? "completed" : "pending", timestamp: currentStageIndex >= 3 ? "Approved" : "Pending" },
    { id: 5, title: "Disbursement", description: "Funds transferred to your account", icon: CreditCard, status: "pending", timestamp: "Pending" },
  ];

  const totalAmount = myApplications.reduce((sum, app) => sum + (app.requestedAmount || 0), 0);
  const approvedCount = myApplications.filter((a) => a.status === "APPROVED").length;
  const pendingCount = myApplications.filter((a) => a.status !== "APPROVED" && a.status !== "REJECTED").length;

  const quickStats = [
    { label: "Applications", value: String(myApplications.length), icon: FileText, color: "text-primary" },
    { label: "In Pipeline", value: String(pendingCount), icon: Clock, color: "text-warning" },
    { label: "Approved", value: String(approvedCount), icon: CheckCircle, color: "text-success" },
    { label: "Total Amount", value: totalAmount > 0 ? `₹${(totalAmount / 100000).toFixed(1)}L` : "—", icon: TrendingUp, color: "text-primary" },
  ];

  if (authLoading || isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", ...spring }}
          className="flex flex-col items-center gap-5"
        >
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-medium text-sm tracking-wide">Loading your dashboard</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | PRYME Consulting</title>
        <meta name="description" content="Track your loan application status in real-time with PRYME Consulting." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Page Header */}
          <section className="aurora-gradient py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", ...spring }}
                >
                  <h1 className="text-xl md:text-2xl font-medium text-foreground mb-2" style={{ letterSpacing: "-0.02em" }}>
                    Welcome back, {user?.name || "there"}
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Track the live status of your active applications.
                  </p>
                </motion.div>

                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        onClick={() => navigate("/admin")}
                        className="neo-button border-0 bg-trust text-trust-foreground hover:bg-trust/90"
                      >
                        <Building2 className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Button>
                    </motion.div>
                  )}
                  <Link to="/apply">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                        New Application <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Stats */}
          <section className="py-8 border-b border-border/50">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", ...spring, delay: index * 0.08 }}
                    whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 15 } }}
                    className="bg-card/70 backdrop-blur-sm rounded-2xl border border-border/40 p-6 transition-shadow duration-300 hover:shadow-[0_8px_30px_-12px_hsl(148_62%_42%/0.12)] hover:border-primary/20 cursor-default"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center">
                        <stat.icon className={cn("w-6 h-6", stat.color)} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-medium text-foreground tabular-nums">{stat.value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Application Cards */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto space-y-8">

                {myApplications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", ...spring, delay: 0.3 }}
                    className="bg-card/70 backdrop-blur-sm rounded-2xl border border-border/40 p-12 text-center"
                  >
                    <div className="w-16 h-16 bg-muted/60 rounded-full flex items-center justify-center mx-auto mb-4 border border-border/30">
                      <FileText className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No Active Applications</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      Start your loan journey today — check your eligibility and find the best rates.
                    </p>
                    <Link to="/apply">
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
                        <Button>Check Eligibility Now</Button>
                      </motion.div>
                    </Link>
                  </motion.div>
                ) : (
                  myApplications.map((app, appIndex) => {
                    const config = getStatusConfig(app.status);
                    const StatusIcon = config.icon;

                    return (
                      <motion.div
                        key={app.applicationId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", ...spring, delay: 0.3 + appIndex * 0.1 }}
                        whileHover={{ y: -2, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                        className="bg-card/70 backdrop-blur-sm rounded-2xl border border-border/40 overflow-hidden hover:border-primary/15 transition-all duration-300 hover:shadow-[0_8px_30px_-12px_hsl(148_62%_42%/0.08)]"
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
                              <p className="text-sm text-muted-foreground mb-1">{app.loanType}</p>
                              <h3 className="text-3xl font-semibold text-foreground flex items-center gap-2">
                                <Wallet className="w-6 h-6 text-muted-foreground" />
                                ₹{app.requestedAmount.toLocaleString("en-IN")}
                              </h3>
                            </div>

                            {app.nextStep && (
                              <motion.div
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3 inline-block"
                              >
                                <p className="text-xs font-medium text-amber-800 dark:text-amber-400 flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4" /> {app.nextStep}
                                </p>
                              </motion.div>
                            )}
                          </div>

                          <div className="flex-1 max-w-sm space-y-6">
                            {/* Segmented progress — uses dots instead of a bar */}
                            <div>
                              <div className="flex justify-between text-sm mb-3 font-medium">
                                <span className="text-foreground">Progress</span>
                                <span className="text-primary tabular-nums">{config.progress}%</span>
                              </div>
                              <div className="flex gap-1.5">
                                {[20, 40, 60, 80, 100].map((threshold) => (
                                  <motion.div
                                    key={threshold}
                                    className={cn(
                                      "h-1.5 flex-1 rounded-full",
                                      config.progress >= threshold ? "bg-primary" : "bg-muted/60"
                                    )}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.4 + threshold * 0.005, duration: 0.3 }}
                                    style={{ transformOrigin: "left" }}
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Applied On</p>
                                <p className="text-sm font-medium text-foreground">
                                  {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Partner Bank</p>
                                <p className="text-sm font-medium text-foreground">{app.bankAssigned || "Matching..."}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/30 px-6 py-4 border-t border-border/40 flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">Secured application</p>
                          <motion.div whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                              View Documents <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })
                )}

                {/* Application Timeline */}
                {myApplications.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", ...spring, delay: 0.4 }}
                    className="bg-card/70 backdrop-blur-sm rounded-2xl border border-border/40 p-6"
                  >
                    <h2 className="text-lg font-semibold text-foreground mb-8">Application Progress</h2>

                    <div className="relative">
                      {stages.map((stage, index) => {
                        const styles = getStageStyles(stage.status);
                        const isLast = index === stages.length - 1;

                        return (
                          <motion.div
                            key={stage.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ type: "spring", ...spring, delay: 0.5 + index * 0.08 }}
                            className="relative flex gap-4 pb-8 last:pb-0"
                          >
                            {!isLast && (
                              <div className={cn("absolute left-5 top-10 w-0.5 h-[calc(100%-2rem)]", styles.line)} />
                            )}
                            <div className={cn(
                              "relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-shadow duration-300",
                              styles.circle,
                              stage.status === "current" && "shadow-[0_0_0_4px_hsl(var(--primary)/0.15)]"
                            )}>
                              <stage.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 pt-1">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h3 className={cn("font-medium", styles.text)}>{stage.title}</h3>
                                  <p className="text-sm text-muted-foreground mt-0.5">{stage.description}</p>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{stage.timestamp}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Help */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: "spring", ...spring, delay: 0.5 }}
                  className="bg-muted/40 backdrop-blur-sm p-6 rounded-2xl border border-border/30 text-center"
                >
                  <h3 className="font-medium text-foreground mb-2">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our support team is available to assist you with your application.
                  </p>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
                    <Button variant="outline" className="neo-button border-0">Contact Support</Button>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Dashboard;
