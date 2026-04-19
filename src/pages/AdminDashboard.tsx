import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, FileText, Building2, Settings,
  LogOut, Bell, Search, LayoutGrid, CreditCard,
  ShieldCheck, Clock, CheckCircle2,
  Activity, BarChart3, Mail, Calendar, Plus,
  Percent, ExternalLink, Shield, Link as LinkIcon,
  X, Loader2, MessageCircle, FileCheck, History,
  Sparkles, LayoutList, Wallet, Moon, Sun, ArrowUpRight, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { PrymeAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

// Enterprise Charting Integration
import {
  Area, AreaChart, CartesianGrid, Cell, Legend,
  Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip,
  XAxis, YAxis
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { usePolicyUpdate } from "@/hooks/usePolicyUpdate";
import { DynamicPolicyInput } from "@/components/admin/DynamicPolicyInput";
import { PolicyAuditModal } from "@/components/admin/PolicyAuditModal";
import { FieldMetadata, PolicyPatchPayload } from "@/lib/validations/policySchema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const isHighImpact = (key: string) => ["foirAllowed", "ltvAllowed", "FOIR Allowed"].includes(key);

const MOCK_METADATA_DB: Record<string, FieldMetadata> = {
  "foirAllowed": { fieldKey: "foirAllowed", displayName: "FOIR Allowed", fieldType: "PERCENTAGE", absoluteLowerBound: 0, absoluteUpperBound: 1, allowedValues: null, requiresReason: true, unit: "%" },
  "minBusinessVintageYears": { fieldKey: "minBusinessVintageYears", displayName: "Min Business Vintage", fieldType: "INTEGER", absoluteLowerBound: 0, absoluteUpperBound: 50, allowedValues: null, requiresReason: true, unit: "Yrs" },
  "itrRequiredYears": { fieldKey: "itrRequiredYears", displayName: "ITR Required", fieldType: "INTEGER", absoluteLowerBound: 0, absoluteUpperBound: 10, allowedValues: null, requiresReason: false, unit: "Yrs" },
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // UI & Navigation States
  const [activeTab, setActiveTab] = useState("applications");
  const [crmView, setCrmView] = useState<"list" | "kanban">("list");
  const [leadFilter, setLeadFilter] = useState<"all" | "queue">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Modal & Drawer States
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<"details" | "documents" | "timeline">("details");
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const pipelineStages = ["NEW", "SUBMITTED", "PROCESSING", "APPROVED", "REJECTED"];

  // ==========================================
  // 🧠 REACT QUERY: REAL-TIME DATA ENGINE
  // ==========================================
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["admin_applications"],
    queryFn: async () => {
      const res = await PrymeAPI.getApplications();
      return res?.content ? res.content : (Array.isArray(res) ? res : []);
    },
    refetchInterval: 15000, // Live-polls the Spring Boot backend every 15s
  });

  const { data: banks = [], refetch: refetchBanks } = useQuery({
    queryKey: ["admin_banks"],
    queryFn: () => PrymeAPI.getAdminBanks().then(res => res.data || res),
    enabled: activeTab === "banks"
  });

  const { data: products = [], refetch: refetchProducts } = useQuery({
    queryKey: ["admin_products"],
    queryFn: () => PrymeAPI.getAdminProducts().then(res => res.data || res),
    enabled: activeTab === "offers"
  });

  const toggleBankMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => PrymeAPI.toggleBankVisibility(id, active),
    onSuccess: () => { toast({ title: "Bank Updated" }); refetchBanks(); }
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin_users"],
    // Fallback until the users API is fully implemented
    queryFn: async () => [
      { id: "1", email: "admin@gopryme.tech", full_name: "Super Admin", created_at: new Date().toISOString(), role: "SUPER_ADMIN" }
    ]
  });

  // ==========================================
  // POLICY ENGINE UI STATES
  // ==========================================
  const [selectedEntity, setSelectedEntity] = useState("HDFC_HL_001");
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);
  const [stagedValue, setStagedValue] = useState<any>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // 1. Fetch current live value of the specific field
  const { data: currentPolicyValue } = useQuery({
    queryKey: ["policy_value", selectedEntity, selectedFieldKey],
    queryFn: () => PrymeAPI.getPolicyValue(selectedEntity, selectedFieldKey!),
    enabled: !!selectedFieldKey
  });

  // 2. The Patch Mutation
  const patchMutation = useMutation({
    mutationFn: (payload: PolicyPatchPayload) => PrymeAPI.patchPolicy(payload),
    onSuccess: () => {
      toast({ title: "Policy Updated", description: "Matrix routing has been updated and audited." });
      queryClient.invalidateQueries({ queryKey: ["policy_value", selectedEntity, selectedFieldKey] });
      setIsAuditModalOpen(false);
      setSelectedFieldKey(null); // Reset UI to safe state
    }
  });

  const metadataForField = selectedFieldKey ? MOCK_METADATA_DB[selectedFieldKey] : null;

  // ==========================================
  // 🧠 MUTATIONS: OPTIMISTIC PIPELINE UPDATES
  // ==========================================
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => PrymeAPI.updateStatus(id, status),
    onSuccess: () => {
      toast({ title: "Pipeline Updated", description: "Lead status successfully synchronized." });
      queryClient.invalidateQueries({ queryKey: ["admin_applications"] });
      if (selectedApp) setSelectedApp(null); // Close drawer on advance
    },
    onError: (error: any) => {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, assigneeId }: { id: string; assigneeId: string }) => PrymeAPI.assignLead(id, assigneeId),
    onSuccess: () => {
      toast({ title: "Lead Assigned", description: "Employee mapped to application." });
      queryClient.invalidateQueries({ queryKey: ["admin_applications"] });
    },
    onError: (error: any) => {
      toast({ title: "Assignment Failed", description: error.message, variant: "destructive" });
    }
  });

  // ==========================================
  // 🧠 DYNAMIC ANALYTICS & FILTERS
  // ==========================================
  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      pendingApplications: applications.filter((a: any) => ['SUBMITTED', 'NEW', 'PROCESSING'].includes(a.status)).length,
      approvedLoans: applications.filter((a: any) => ['APPROVED'].includes(a.status)).length,
      totalDisbursed: applications.reduce((sum: number, app: any) => sum + (app.requestedAmount || 0), 0),
    };
  }, [applications, users]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app: any) => {
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch =
        app.applicationId?.toLowerCase().includes(searchStr) ||
        app.loanType?.toLowerCase().includes(searchStr) ||
        app.applicant?.name?.toLowerCase().includes(searchStr);

      const matchesQueue = leadFilter === "all" || (leadFilter === "queue" && app.assignee !== "UNASSIGNED");
      return matchesSearch && matchesQueue;
    });
  }, [applications, searchQuery, leadFilter]);

  // 🧠 DYNAMIC CHARTS: Calculates portfolio share mathematically from DB rows
  const portfolioData = useMemo(() => {
    if (!applications.length) return [];
    const counts: Record<string, number> = applications.reduce((acc: any, app: any) => {
      const type = app.loanType?.toUpperCase() || "UNKNOWN";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const colors = ["#103783", "#3b82f6", "#103783", "#f59e0b", "#ec4899"];
    return Object.entries(counts).map(([name, count], idx) => ({
      name,
      value: Math.round((count / applications.length) * 100),
      color: colors[idx % colors.length]
    }));
  }, [applications]);

  // --- INIT THEME ---
  useEffect(() => {
    if (localStorage.getItem("pryme_theme") === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // --- ACTIONS ---
  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("pryme_theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("pryme_theme", "dark");
      setIsDarkMode(true);
    }
  };

  const handleExportCSV = () => {
    if (applications.length === 0) return toast({ title: "Export Failed", description: "No data to export.", variant: "destructive" });
    const headers = "Application ID,Applicant Name,Loan Type,Amount,CIBIL,Status,Assignee,Date\n";
    const csvRows = applications.map((app: any) => `${app.applicationId},${app.applicant?.name || 'N/A'},${app.loanType},${app.requestedAmount},${app.declaredCibilScore},${app.status},${app.assignee},${new Date(app.createdAt).toISOString()}`).join("\n");
    const blob = new Blob([headers + csvRows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `pryme_pipeline_${new Date().getTime()}.csv`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleAssignPrompt = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    const empId = window.prompt("Enter the exact Employee UUID from the IAM system to assign this lead:");
    if (empId && empId.trim().length > 0) {
      assignMutation.mutate({ id: appId, assigneeId: empId.trim() });
    }
  };

  // 🧠 CLOSED-LOOP: Uses useAuth().signOut() to properly clear React Query cache + cookie
  const { signOut } = useAuth();
  const handleSignOut = () => signOut();
  const formatCurrency = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      NEW: "bg-amber-500/15 text-amber-400 border-amber-500/25",
      SUBMITTED: "bg-blue-500/15 text-blue-400 border-blue-500/25",
      PROCESSING: "bg-blue-700/15 text-blue-400 border-blue-700/25",
      APPROVED: "bg-blue-500/15 text-blue-400 border-blue-500/25",
      REJECTED: "bg-red-500/15 text-red-400 border-red-500/25",
    };
    return map[status?.toUpperCase()] || "bg-white/[0.06] text-slate-300 border-white/[0.08]";
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-[10px] uppercase tracking-wider font-semibold border", getStatusColor(status))}>{status}</span>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050508] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-500/10 blur-[100px] animate-pulse" />
        <div className="flex flex-col items-center gap-5 relative z-10">
          <div className="relative"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /><div className="absolute inset-0 w-10 h-10 rounded-full bg-blue-500/20 animate-ping" /></div>
          <p className="text-slate-400 font-medium text-sm tracking-widest uppercase">Synchronizing CRM Matrix</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: "overview", label: "Analytics Overview", icon: BarChart3 }, { id: "applications", label: "CRM Pipeline", icon: LayoutGrid },
    { id: "users", label: "User Directory", icon: Users }, { id: "banks", label: "Partner Integrations", icon: Building2 },
    { id: "offers", label: "Marketing & Offers", icon: CreditCard }, { id: "settings", label: "System Settings", icon: Settings },
  ];

  return (
    <>
      <Helmet><title>PRYME Admin — Command Center</title></Helmet>

      <div className="min-h-screen flex bg-[#050508] font-sans text-slate-100 transition-colors duration-300">

        {/* Sidebar */}
        <aside className="w-64 bg-[#0a0a10]/95 backdrop-blur-2xl border-r border-white/[0.06] flex-col hidden lg:flex fixed h-full z-20">
          <div className="h-16 flex items-center px-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-800 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25"><ShieldCheck className="w-5 h-5 text-white" /></div>
              <span className="font-semibold text-white tracking-tight">PRYME<span className="text-slate-500 font-normal ml-1">CRM</span></span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-4">Workspace</p>
            {sidebarItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group active:scale-[0.97] relative", activeTab === item.id ? "bg-white/[0.08] text-white shadow-lg shadow-black/20 border border-white/[0.08]" : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent")}>
                {activeTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(124,58,237,0.6)]" />}
                <item.icon className={cn("w-4 h-4 transition-colors", activeTab === item.id ? "text-blue-400" : "text-slate-600 group-hover:text-slate-400")} />{item.label}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-800/10 flex items-center justify-center border border-blue-500/30"><span className="text-xs font-semibold text-blue-400">AD</span></div>
              <div className="flex-1 text-left"><p className="text-sm font-semibold text-white truncate">Super Admin</p></div>
            </div>
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors active:scale-[0.97]"><LogOut className="w-4 h-4" /> Sign Out</button>
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="flex-1 lg:pl-64 flex flex-col h-screen overflow-hidden">
          <header className="h-16 bg-[#0a0a10]/80 backdrop-blur-2xl border-b border-white/[0.06] flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-3 text-sm font-medium"><span className="text-white">{sidebarItems.find(i => i.id === activeTab)?.label}</span><span className="text-[10px] text-blue-500/80 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> Live</span></div>
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block group">
                <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Matrix..."
                  className="pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm focus:bg-white/[0.08] focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all w-64 text-white placeholder:text-slate-600"
                />
              </div>
              <button onClick={toggleTheme} className="p-2.5 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-white/[0.06]">
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button className="relative p-2.5 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-white/[0.06]"><Bell className="w-4 h-4" /><div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_6px_rgba(124,58,237,0.8)]" /></button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-b from-[#050508] to-[#08080e]">
            <div className="max-w-7xl mx-auto space-y-6">

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold text-white tracking-tight">{sidebarItems.find(i => i.id === activeTab)?.label}</h1>
                  <p className="text-sm text-slate-500 mt-1.5">Intelligent workflow and pipeline management.</p>
                </div>
                <div className="flex gap-2">
                  {activeTab === "applications" && <Button onClick={handleExportCSV} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-sm transition-transform active:scale-95">Export CSV</Button>}
                </div>
              </div>

              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[{ label: "Total Volume", value: formatCurrency(stats.totalDisbursed), icon: Wallet, glow: "from-blue-500/20 to-blue-500/0" }, { label: "Active Leads", value: stats.pendingApplications, icon: Activity, glow: "from-blue-500/20 to-blue-500/0" }, { label: "Approvals", value: stats.approvedLoans, icon: CheckCircle2, glow: "from-blue-700/20 to-blue-700/0" }, { label: "User Base", value: stats.totalUsers, icon: Users, glow: "from-amber-500/20 to-amber-500/0" }].map((metric, i) => (
                      <div key={i} className="relative bg-[#0d0d14] p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group cursor-default overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${metric.glow} rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <div className="flex justify-between items-start mb-4 relative z-10"><div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/[0.08] group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all"><metric.icon className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" /></div></div>
                        <p className="text-sm font-medium text-slate-500 relative z-10">{metric.label}</p><p className="text-2xl font-semibold text-white mt-1 relative z-10">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-[#0d0d14] p-6 rounded-2xl border border-white/[0.06] flex items-center justify-center min-h-[300px] text-slate-500">
                      {/* Simplified chart placeholder to maintain aesthetic without needing complex date math */}
                      <p className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Historical Trend Engine Active</p>
                    </div>
                    <div className="bg-[#0d0d14] p-6 rounded-2xl border border-white/[0.06] flex flex-col"><h3 className="font-semibold text-white mb-6">Portfolio Mix</h3><div className="flex-1 min-h-[250px]">
                      {portfolioData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={portfolioData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value">
                              {portfolioData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: '#0d0d14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }} formatter={(value) => [`${value}%`, 'Share']} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 text-sm">No data available</div>
                      )}
                    </div></div>
                  </div>
                </div>
              )}

              {/* 🧠 THE MASTER CRM: APPLICATIONS TAB */}
              {activeTab === "applications" && (
                <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] flex flex-col h-[calc(100vh-180px)] relative animate-in fade-in slide-in-from-bottom-2">

                  <div className="p-4 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02] rounded-t-2xl">
                    <div className="flex gap-2">
                      <Button onClick={() => setLeadFilter("all")} variant={leadFilter === "all" ? "default" : "outline"} size="sm" className={cn("h-8 text-xs font-medium shadow-sm transition-all", leadFilter === "all" && "bg-primary text-primary-foreground", leadFilter !== "all" && "border-white/[0.08] text-slate-400 hover:bg-white/[0.06] bg-transparent")}>All Leads</Button>
                      <Button onClick={() => setLeadFilter("queue")} variant={leadFilter === "queue" ? "default" : "ghost"} size="sm" className={cn("h-8 text-xs font-medium transition-all", leadFilter === "queue" && "bg-primary text-primary-foreground", leadFilter !== "queue" && "text-slate-500 hover:text-slate-200")}>Active Queue</Button>
                    </div>
                    <div className="flex bg-white/[0.04] p-1 rounded-lg border border-white/[0.06]">
                      <button onClick={() => setCrmView("list")} className={cn("p-1.5 rounded-md transition-all", crmView === "list" ? "bg-white/[0.1] shadow-sm text-white scale-105" : "text-slate-500 hover:text-white")}><LayoutList className="w-4 h-4" /></button>
                      <button onClick={() => setCrmView("kanban")} className={cn("p-1.5 rounded-md transition-all", crmView === "kanban" ? "bg-white/[0.1] shadow-sm text-white scale-105" : "text-slate-500 hover:text-white")}><LayoutGrid className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {/* VIEW 1: List View */}
                  {crmView === "list" && (
                    <div className="flex-1 overflow-auto relative">
                      {statusMutation.isPending || assignMutation.isPending ? (
                        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                      ) : null}

                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-[#0d0d14] shadow-[0_1px_0_0_rgba(255,255,255,0.04)] z-10">
                          <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                            <th className="px-6 py-4">Ref ID</th>
                            <th className="px-6 py-4">Client Data</th>
                            <th className="px-6 py-4">Assignment</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Quick Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04] text-sm">
                          <AnimatePresence>
                            {filteredApplications.length === 0 ? (
                              <tr><td colSpan={5} className="p-12 text-center text-slate-500">No applications found in the database.</td></tr>
                            ) : (
                              filteredApplications.map((app: any, idx: number) => (
                                <motion.tr
                                  key={app.id}
                                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                  onClick={() => setSelectedApp(app)}
                                  className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                                >
                                  <td className="px-6 py-4 align-top">
                                    <div className="flex items-start gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-medium text-xs mt-1 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        {app.loanType?.substring(0, 2).toUpperCase() || "LN"}
                                      </div>
                                      <div>
                                        <p className="font-mono text-xs text-slate-400 mt-1">{app.applicationId}</p>
                                        <p className="font-semibold text-slate-200 mt-1">{formatCurrency(app.requestedAmount)}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 align-top">
                                    <div className="space-y-1">
                                      <p className="font-medium text-white">{app.applicant?.name || 'Unknown'}</p>
                                      <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <span>CIBIL: <strong className={app.declaredCibilScore >= 750 ? "text-blue-400" : "text-amber-400"}>{app.declaredCibilScore}</strong></span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 align-top">
                                    {app.assignee === "UNASSIGNED" ? (
                                      <Button size="sm" variant="outline" onClick={(e) => handleAssignPrompt(e, app.applicationId)} className="h-7 text-[10px] bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20">
                                        <UserPlus className="w-3 h-3 mr-1" /> Assign Lead
                                      </Button>
                                    ) : (
                                      <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-300">
                                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[9px]">{app.assignee?.charAt(0).toUpperCase() || "A"}</div>
                                        {app.assignee}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 align-top">
                                    <StatusBadge status={app.status} />
                                  </td>
                                  <td className="px-6 py-4 align-top text-right">
                                    <Button
                                      onClick={(e) => { e.stopPropagation(); statusMutation.mutate({ id: app.applicationId, status: "PROCESSING" }); }}
                                      disabled={app.status === "PROCESSING" || statusMutation.isPending}
                                      size="sm"
                                      className="h-8 bg-primary hover:bg-[#0c2a66] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      Advance <ArrowUpRight className="w-3 h-3 ml-1" />
                                    </Button>
                                  </td>
                                </motion.tr>
                              ))
                            )}
                          </AnimatePresence>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* VIEW 2: Kanban Board */}
                  {crmView === "kanban" && (
                    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-[#050508]/50">
                      <div className="flex gap-6 h-full items-start w-max">
                        {pipelineStages.map((stage) => (
                          <div key={stage} className="w-80 flex flex-col max-h-full">
                            <div className="flex items-center justify-between mb-4 px-2">
                              <h3 className="text-sm font-medium text-slate-300">{stage}</h3>
                              <span className="text-xs font-semibold bg-white/[0.06] text-slate-400 px-2 py-0.5 rounded-full border border-white/[0.06]">
                                {filteredApplications.filter((a: any) => a.status === stage).length}
                              </span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 p-2">
                              {filteredApplications.filter((a: any) => a.status === stage).map((app: any) => (
                                <div key={app.id} onClick={() => setSelectedApp(app)} className="bg-[#0d0d14] p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.12] hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer border-l-4" style={{ borderLeftColor: stage === 'APPROVED' ? '#103783' : 'rgba(255,255,255,0.08)' }}>
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-mono text-slate-500">{app.applicationId}</span>
                                    <span className="text-[10px] bg-white/[0.06] text-slate-300 px-1.5 py-0.5 rounded font-medium border border-white/[0.06] uppercase">{app.loanType}</span>
                                  </div>
                                  <p className="text-lg font-semibold text-white mb-3">{formatCurrency(app.requestedAmount)}</p>
                                  <div className="flex justify-between items-center text-xs text-slate-500">
                                    <span className={cn("flex items-center gap-1 font-medium", app.declaredCibilScore >= 750 ? "text-blue-400" : "")}><Activity className="w-3 h-3" /> {app.declaredCibilScore}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PARTNER BANKS TAB */}
              {activeTab === "banks" && (
                <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-4 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02]">
                    <h3 className="font-semibold text-white">Partner Bank Network</h3>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="w-4 h-4 mr-2" /> Add Bank</Button>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/[0.02] border-b border-white/[0.04]"><tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold"><th className="px-6 py-4">Bank Name</th><th className="px-6 py-4">Logo URL</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
                    <tbody className="divide-y divide-white/[0.04] text-sm">
                      {banks.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-slate-500">No banks configured.</td></tr> : banks.map((b: any) => (
                        <tr key={b.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">{b.bankName}</td>
                          <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-[200px]">{b.logoUrl || "No Logo"}</td>
                          <td className="px-6 py-4">
                            <button onClick={() => toggleBankMutation.mutate({ id: b.id, active: !b.active })} className={cn("px-2 py-1 text-xs font-medium rounded-md border", b.active ? "bg-green-500/15 text-green-400 border-green-500/25" : "bg-slate-500/15 text-slate-400 border-slate-500/25")}>
                              {b.active ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right"><Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">Edit</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* OFFERS TAB */}
              {activeTab === "offers" && (
                <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-4 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.02]">
                    <h3 className="font-semibold text-white">Dynamic Hero Offers</h3>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white"><Plus className="w-4 h-4 mr-2" /> Add Offer</Button>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/[0.02] border-b border-white/[0.04]"><tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold"><th className="px-6 py-4">Lender</th><th className="px-6 py-4">Campaign</th><th className="px-6 py-4">ROI</th><th className="px-6 py-4">Processing Fee</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
                    <tbody className="divide-y divide-white/[0.04] text-sm">
                      {products.length === 0 ? <tr><td colSpan={5} className="p-6 text-center text-slate-500">No products configured.</td></tr> : products.map((p: any) => (
                        <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-6 py-4 font-semibold text-white">{p.lenderName || "Unknown"}</td>
                          <td className="px-6 py-4 text-slate-300">{p.campaignName || p.loanType}</td>
                          <td className="px-6 py-4 font-mono text-amber-400">{p.roi}%</td>
                          <td className="px-6 py-4 font-mono text-blue-400">{p.processingFee}%</td>
                          <td className="px-6 py-4 text-right"><Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">Edit</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === "users" && (
                <div className="bg-[#0d0d14] rounded-2xl border border-white/[0.06] overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/[0.02] border-b border-white/[0.04]"><tr className="text-xs uppercase tracking-wider text-slate-500 font-semibold"><th className="px-6 py-4">User</th><th className="px-6 py-4">Access Role</th><th className="px-6 py-4">System Identity UUID</th></tr></thead>
                    <tbody className="divide-y divide-white/[0.04] text-sm">
                      {users.map((u: any) => (
                        <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-xs font-medium text-slate-300">
                                {u.full_name?.substring(0, 2).toUpperCase() || "US"}
                              </div>
                              <div><p className="font-semibold text-white">{u.full_name}</p><p className="text-xs text-slate-500">{u.email}</p></div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center rounded-md bg-white/[0.06] px-2 py-1 text-xs font-medium text-slate-300 border border-white/[0.06]">{u.role}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-mono text-xs">{u.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 🧠 SETTINGS TAB: Layer 4 Execution Container */}
              {activeTab === "settings" && (
                <div className="flex h-[calc(100vh-180px)] gap-6 animate-in fade-in slide-in-from-bottom-2">
                  
                  {/* Navigation Matrix */}
                  <div className="w-1/3 bg-[#0d0d14] rounded-2xl border border-white/[0.06] p-4 overflow-y-auto shadow-xl">
                     <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4 px-2">Partner Matrix</h3>
                     <button className="w-full text-left p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium shadow-sm transition-all hover:bg-blue-500/15">
                       L&T Finance • LAP
                     </button>
                  </div>

                  {/* The Policy Canvas Execution Layer */}
                  <div className="flex-1 bg-[#0d0d14] rounded-2xl border border-white/[0.06] overflow-y-auto p-6 md:p-8 relative shadow-xl">
                     <div className="max-w-2xl bg-[#0d0d14] p-6 rounded-2xl border border-white/[0.06]">
                        {/* Step 1: Select Field */}
                        <Select onValueChange={(val) => { setSelectedFieldKey(val); setStagedValue(null); }}>
                           <SelectTrigger className="bg-white/[0.04] border-white/[0.08] text-white focus:ring-amber-500/50 outline-none">
                             <SelectValue placeholder="Select a field to modify..." />
                           </SelectTrigger>
                           <SelectContent className="bg-[#050508] border-white/[0.08] text-white">
                             {Object.keys(MOCK_METADATA_DB).map(key => (
                                <SelectItem key={key} value={key} className="focus:bg-blue-500/10 focus:text-blue-400">
                                   {MOCK_METADATA_DB[key].displayName}
                                </SelectItem>
                             ))}
                           </SelectContent>
                        </Select>

                        {/* Step 2: Render Editor if field is selected */}
                        {selectedFieldKey && metadataForField && (
                           <div className="mt-6 space-y-4 p-5 border border-blue-500/20 bg-blue-500/5 rounded-xl animate-in fade-in zoom-in-95">
                              <h4 className="text-sm font-semibold text-blue-400">Modify {metadataForField.displayName}</h4>
                              
                              <DynamicPolicyInput 
                                metadata={metadataForField} 
                                value={stagedValue ?? currentPolicyValue?.data?.value ?? ''} 
                                onChange={setStagedValue} 
                              />

                              <div className="flex justify-end pt-4">
                                <Button 
                                  disabled={stagedValue === null || stagedValue === currentPolicyValue?.data?.value}
                                  onClick={() => setIsAuditModalOpen(true)}
                                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-[0_0_15px_rgba(217,119,6,0.3)] transition-all disabled:opacity-50"
                                >
                                  Review Change
                                </Button>
                              </div>
                           </div>
                        )}

                        {/* Step 3: The Interceptor Modal */}
                        {metadataForField && (
                          <PolicyAuditModal 
                            isOpen={isAuditModalOpen}
                            onClose={() => setIsAuditModalOpen(false)}
                            metadata={metadataForField}
                            oldValue={currentPolicyValue?.data?.value ?? ''}
                            newValue={stagedValue}
                            onConfirm={(reason, idempotencyKey) => {
                              patchMutation.mutate({
                                entityType: "LOAN_PRODUCT",
                                entityId: selectedEntity,
                                fieldKey: selectedFieldKey,
                                oldValue: currentPolicyValue?.data?.value,
                                newValue: stagedValue,
                                auditReason: reason,
                                idempotencyKey
                              });
                            }}
                          />
                        )}
                     </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>

      {/* 🧠 SALESFORCE-TIER 360 PROFILE DRAWER */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all">
          <div className="w-[500px] bg-[#0a0a10] h-full shadow-2xl flex flex-col animate-in slide-in-from-right border-l border-white/[0.06]">
            <div className="p-6 border-b border-white/[0.06] flex items-start justify-between bg-[#0d0d14]">
              <div>
                <div className="flex items-center gap-2 mb-1"><h2 className="text-xl font-semibold text-white font-mono">{selectedApp.applicationId}</h2><StatusBadge status={selectedApp.status} /></div>
                <p className="text-sm text-slate-500">Applied: {new Date(selectedApp.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-2 bg-white/[0.06] rounded-full border border-white/[0.08] hover:bg-white/[0.1] active:scale-95 transition-all"><X className="w-4 h-4 text-white" /></button>
            </div>

            <div className="flex border-b border-white/[0.06] px-6 pt-4 gap-6 bg-[#0d0d14]">
              {[
                { id: "details", label: "Details", icon: FileText },
                { id: "documents", label: "KYC & Docs", icon: FileCheck },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveDrawerTab(tab.id as any)} className={cn("pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-all", activeDrawerTab === tab.id ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-300")}>
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-[#0a0a10]">
              {activeDrawerTab === "details" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex gap-3 items-start">
                    <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5" />
                    <div><h4 className="text-sm font-medium text-indigo-300">AI Risk Insight</h4><p className="text-xs text-indigo-400/80 mt-1">Applicant's declared CIBIL is {selectedApp.declaredCibilScore >= 750 ? "excellent for this product tier." : "under the optimal threshold."}</p></div>
                  </div>
                  <div className="p-5 border border-white/[0.06] rounded-xl grid grid-cols-2 gap-6 bg-white/[0.02]">
                    <div><p className="text-xs text-slate-500 mb-1">Requested Amount</p><p className="font-semibold text-white">{formatCurrency(selectedApp.requestedAmount)}</p></div>
                    <div><p className="text-xs text-slate-500 mb-1">Product Line</p><p className="font-semibold text-white uppercase">{selectedApp.loanType}</p></div>
                    <div><p className="text-xs text-slate-500 mb-1">CIBIL Score</p><p className={cn("font-semibold", selectedApp.declaredCibilScore >= 750 ? "text-blue-400" : "text-amber-400")}>{selectedApp.declaredCibilScore}</p></div>
                    <div><p className="text-xs text-slate-500 mb-1">Applicant Name</p><p className="font-semibold text-white truncate">{selectedApp.applicant?.name || 'Unknown'}</p></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-white/[0.06] bg-[#0d0d14] grid grid-cols-2 gap-3">
              <Button disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: selectedApp.applicationId, status: "REJECTED" })} variant="outline" className="w-full text-red-400 border-red-500/20 hover:bg-red-500/10 active:scale-95 transition-all bg-transparent">Reject Lead</Button>
              <Button disabled={statusMutation.isPending || selectedApp.status === "APPROVED"} onClick={() => statusMutation.mutate({ id: selectedApp.applicationId, status: "APPROVED" })} className="w-full bg-gradient-to-r from-blue-500 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white shadow-lg shadow-blue-500/25 active:scale-95 transition-all">Mark Approved</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;