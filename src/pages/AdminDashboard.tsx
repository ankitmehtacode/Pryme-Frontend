import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Users, FileText, Building2, Settings, 
  LogOut, Bell, Search, LayoutGrid, CreditCard, 
  ShieldCheck, Clock, CheckCircle2, ChevronRight,
  Activity, BarChart3, Mail, Calendar, Plus, Power, 
  Percent, ExternalLink, Shield, Link as LinkIcon, 
  X, Loader2, MessageCircle, FileCheck, History, 
  Sparkles, LayoutList, Wallet, Moon, Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { PrymeAPI } from "@/lib/api"; 

// Enterprise Charting Integration
import { 
  Area, AreaChart, CartesianGrid, Cell, Legend, 
  Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, 
  XAxis, YAxis, BarChart, Bar
} from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // UI & Navigation States
  const [activeTab, setActiveTab] = useState("applications"); 
  const [crmView, setCrmView] = useState<"list" | "kanban">("list");
  const [leadFilter, setLeadFilter] = useState<"all" | "queue">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false); // 🧠 Dark Mode State
  
  // Modal & Drawer States
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<"details" | "documents" | "timeline">("details");
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Data States
  const [applications, setApplications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, pendingApplications: 0, approvedLoans: 0, totalDisbursed: 0 });

  // --- MOCK CONFIG DATA ---
  const employees = [
    { id: "EMP001", name: "Rahul Sharma (RM)" },
    { id: "EMP002", name: "Priya Desai (RM)" },
    { id: "EMP003", name: "Amit Patel (Sr. RM)" },
    { id: "UNASSIGNED", name: "Unassigned" }
  ];
  
  const pipelineStages = ["SUBMITTED", "PROCESSING", "VERIFIED", "APPROVED", "DISBURSED", "REJECTED"];

  // 🧠 HYPER-REALISTIC MOCK DATA (10 Customers for Demo)
  const fallbackMockData = [
    { id: "101", applicationId: "PRY-9001", applicant: { name: "Aarav Gupta" }, loanType: "Personal Loan", requestedAmount: 500000, declaredCibilScore: 780, status: "SUBMITTED", assignee: "UNASSIGNED", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: "102", applicationId: "PRY-9002", applicant: { name: "Meera Reddy" }, loanType: "Home Loan", requestedAmount: 7500000, declaredCibilScore: 810, status: "PROCESSING", assignee: "EMP001", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: "103", applicationId: "PRY-9003", applicant: { name: "Vikram Singh" }, loanType: "Business Loan", requestedAmount: 2500000, declaredCibilScore: 690, status: "VERIFIED", assignee: "EMP002", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
    { id: "104", applicationId: "PRY-9004", applicant: { name: "Neha Joshi" }, loanType: "Personal Loan", requestedAmount: 300000, declaredCibilScore: 740, status: "APPROVED", assignee: "EMP001", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
    { id: "105", applicationId: "PRY-9005", applicant: { name: "Rohan Patel" }, loanType: "LAP", requestedAmount: 4000000, declaredCibilScore: 650, status: "REJECTED", assignee: "EMP003", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString() },
    { id: "106", applicationId: "PRY-9006", applicant: { name: "Ananya Iyer" }, loanType: "Home Loan", requestedAmount: 5500000, declaredCibilScore: 765, status: "SUBMITTED", assignee: "UNASSIGNED", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString() },
    { id: "107", applicationId: "PRY-9007", applicant: { name: "Kabir Das" }, loanType: "Business Loan", requestedAmount: 1200000, declaredCibilScore: 710, status: "PROCESSING", assignee: "EMP002", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
    { id: "108", applicationId: "PRY-9008", applicant: { name: "Sanya Mehta" }, loanType: "Personal Loan", requestedAmount: 800000, declaredCibilScore: 820, status: "DISBURSED", assignee: "EMP001", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString() },
    { id: "109", applicationId: "PRY-9009", applicant: { name: "Aditya Verma" }, loanType: "LAP", requestedAmount: 3500000, declaredCibilScore: 680, status: "VERIFIED", assignee: "EMP003", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString() },
    { id: "110", applicationId: "PRY-9010", applicant: { name: "Kiara Sharma" }, loanType: "Personal Loan", requestedAmount: 200000, declaredCibilScore: 790, status: "SUBMITTED", assignee: "UNASSIGNED", createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  ];

  const revenueTrendData = [
    { month: "Oct", target: 4.0, volume: 2.4 }, { month: "Nov", target: 4.5, volume: 3.8 },
    { month: "Dec", target: 5.0, volume: 5.2 }, { month: "Jan", target: 5.5, volume: 4.1 },
    { month: "Feb", target: 6.0, volume: 6.8 }, { month: "Mar", target: 7.0, volume: 8.5 },
  ];

  const portfolioData = [
    { name: "Personal Loan", value: 45, color: "#2aac64" }, { name: "Business Loan", value: 30, color: "#3b82f6" },
    { name: "Home Loan", value: 15, color: "#8b5cf6" }, { name: "LAP", value: 10, color: "#f59e0b" },
  ];

  const partnerBanks = [
    { id: "1", name: "HDFC Bank", code: "HDFC", status: "Active", uptime: "99.9%", integration: "API v2", rate: "10.25" },
    { id: "2", name: "State Bank of India", code: "SBI", status: "Active", uptime: "98.5%", integration: "API v1", rate: "10.85" },
    { id: "3", name: "ICICI Bank", code: "ICICI", status: "Maintenance", uptime: "85.0%", integration: "API v2", rate: "11.10" },
  ];

  const activeOffers = [
    { id: "1", title: "Zero Processing Fee", type: "Fee Waiver", bank: "HDFC Bank", validity: "Valid till Dec 31, 2026", status: "Active" },
    { id: "2", title: "Festival Cashback", type: "Cashback", bank: "All Banks", validity: "Valid till Nov 15, 2026", status: "Active" },
  ];

  // --- INIT DATA ---
  useEffect(() => {
    const token = localStorage.getItem("pryme_token");
    if (!token) { navigate("/auth"); return; }
    
    // Check local storage for dark mode preference
    if (localStorage.getItem("pryme_theme") === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
    
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      let apps = await PrymeAPI.getApplications();
      // 🧠 If DB is empty, use the hyper-realistic mock data for the demo
      if (!apps || apps.length === 0) {
        apps = fallbackMockData;
      }

      const augmentedApps = apps.map((app: any) => ({ ...app, assignee: app.assignee || "UNASSIGNED" }))
        .sort((a: any, b: any) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime());
      
      setApplications(augmentedApps);
      setStats({
        totalUsers: 142, 
        pendingApplications: augmentedApps.filter((a: any) => ['SUBMITTED', 'PENDING', 'PROCESSING'].includes(a.status)).length,
        approvedLoans: augmentedApps.filter((a: any) => ['APPROVED', 'DISBURSED'].includes(a.status)).length,
        totalDisbursed: augmentedApps.reduce((sum: number, app: any) => sum + (app.requestedAmount || 0), 0),
      });
      setUsers([
        { id: "1", email: "admin@pryme.com", full_name: "Super Admin", created_at: new Date().toISOString(), role: "SUPER_ADMIN" },
        { id: "2", email: "rahul.s@pryme.com", full_name: "Rahul Sharma", created_at: new Date().toISOString(), role: "RM" },
        { id: "3", email: "priya.d@pryme.com", full_name: "Priya Desai", created_at: new Date().toISOString(), role: "RM" }
      ]);
    } catch (error) {
      toast({ title: "Using Offline Demo Mode", description: "Database connection failed. Mock data loaded.", variant: "default" });
      setApplications(fallbackMockData);
      setStats({
        totalUsers: 142, pendingApplications: 5, approvedLoans: 2, totalDisbursed: 14000000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- 🧠 LIVE SEARCH & FILTER LOGIC ---
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            app.loanType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesQueue = leadFilter === "all" || (leadFilter === "queue" && app.assignee !== "UNASSIGNED");
      return matchesSearch && matchesQueue;
    });
  }, [applications, searchQuery, leadFilter]);

  // --- 🧠 FUNCTIONAL ACTIONS ---
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

  const handleAssignLead = async (appId: string, employeeId: string) => {
    setApplications(prev => prev.map(app => app.applicationId === appId ? { ...app, assignee: employeeId } : app));
    if (selectedApp?.applicationId === appId) setSelectedApp({ ...selectedApp, assignee: employeeId });
    try { await PrymeAPI.assignLead(appId, employeeId); toast({ title: "Lead Assigned" }); } catch { toast({ title: "Offline mode: Assignment simulated locally." }); }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    setApplications(prev => prev.map(app => app.applicationId === appId ? { ...app, status: newStatus } : app));
    if (selectedApp?.applicationId === appId) setSelectedApp({ ...selectedApp, status: newStatus });
    try { await PrymeAPI.updateStatus(appId, newStatus); toast({ title: "Pipeline Updated" }); } catch { toast({ title: "Offline mode: Status simulated locally." }); }
  };

  const handleExportCSV = () => {
    if (applications.length === 0) return toast({ title: "Export Failed", variant: "destructive" });
    const headers = "Application ID,Loan Type,Amount,CIBIL,Status,Assignee,Date\n";
    const csvRows = applications.map(app => `${app.applicationId},${app.loanType},${app.requestedAmount},${app.declaredCibilScore},${app.status},${app.assignee},${new Date(app.createdAt).toISOString()}`).join("\n");
    const blob = new Blob([headers + csvRows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `pryme_pipeline_${new Date().getTime()}.csv`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleWhatsApp = (e: React.MouseEvent) => { e.stopPropagation(); window.open("https://wa.me/919876543210?text=Hi,%20this%20is%20your%20RM%20from%20PRYME.", "_blank"); };
  const handleEmail = (e: React.MouseEvent) => { e.stopPropagation(); window.location.href = "mailto:client@example.com?subject=Update%20on%20your%20PRYME%20Application"; };
  
  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    setTimeout(() => { setIsSavingSettings(false); toast({ title: "Settings Saved", description: "Configurations updated." }); }, 1200);
  };

  const handleSignOut = () => { localStorage.clear(); navigate("/auth"); };
  const formatCurrency = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800", 
      PROCESSING: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800", 
      VERIFIED: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800", 
      APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800", 
      DISBURSED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800", 
      REJECTED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800", 
      Active: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800", 
      Maintenance: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
    };
    return map[status] || "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border", getStatusColor(status))}>{status}</span>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4"><Loader2 className="w-8 h-8 text-[#2aac64] animate-spin" /><p className="text-slate-500 font-medium text-sm">Booting CRM Workspace...</p></div>
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
      <Helmet><title>PRYME Admin - Ultimate CRM</title></Helmet>

      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
        
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col hidden lg:flex fixed h-full z-20 transition-colors duration-300">
          <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#2aac64] rounded-lg flex items-center justify-center shadow-sm"><ShieldCheck className="w-5 h-5 text-white" /></div>
              <span className="font-medium text-slate-900 dark:text-white tracking-tight">PRYME<span className="text-slate-400 dark:text-slate-500 font-normal ml-1">Admin</span></span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            <p className="px-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Workspace</p>
            {sidebarItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group active:scale-[0.98]", activeTab === item.id ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-700" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent")}>
                <item.icon className={cn("w-4 h-4 transition-colors", activeTab === item.id ? "text-[#2aac64]" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />{item.label}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm"><span className="text-xs font-medium text-[#2aac64]">AD</span></div>
              <div className="flex-1 text-left"><p className="text-sm font-semibold text-slate-900 dark:text-white truncate">Super Admin</p></div>
            </div>
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors active:scale-[0.98]"><LogOut className="w-4 h-4" /> Sign Out</button>
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="flex-1 lg:pl-64 flex flex-col h-screen overflow-hidden">
          <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-medium"><span>{sidebarItems.find(i => i.id === activeTab)?.label}</span></div>
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block group">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#2aac64] transition-colors" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search PRY-ID or Type..." 
                  className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-lg text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-[#2aac64]/30 focus:ring-4 focus:ring-[#2aac64]/10 outline-none transition-all w-72 text-slate-900 dark:text-white placeholder:text-slate-400" 
                />
              </div>
              {/* 🧠 Dark Mode Toggle */}
              <button onClick={toggleTheme} className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => toast({title: "Notifications", description: "No new alerts at this time."})} className="relative p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Bell className="w-4 h-4" /></button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-xl font-medium text-slate-900 dark:text-white tracking-tight">{sidebarItems.find(i => i.id === activeTab)?.label}</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">Intelligent workflow and pipeline management.</p>
                </div>
                <div className="flex gap-2">
                  {activeTab === "applications" && <Button onClick={handleExportCSV} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 shadow-sm transition-transform active:scale-95">Export CSV</Button>}
                  {activeTab === "banks" && <Button onClick={() => setIsPartnerModalOpen(true)} className="bg-[#2aac64] text-white hover:bg-emerald-600 transition-transform active:scale-95"><Plus className="w-4 h-4 mr-2"/> Add Partner</Button>}
                  {activeTab === "offers" && <Button onClick={() => setIsOfferModalOpen(true)} className="bg-[#2aac64] text-white hover:bg-emerald-600 transition-transform active:scale-95"><Plus className="w-4 h-4 mr-2"/> Create Offer</Button>}
                </div>
              </div>

              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[{ label: "Total Volume", value: formatCurrency(stats.totalDisbursed), icon: Wallet }, { label: "Active Leads", value: stats.pendingApplications, icon: Activity }, { label: "Approvals", value: stats.approvedLoans, icon: CheckCircle2 }, { label: "User Base", value: stats.totalUsers, icon: Users }].map((metric, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 group cursor-default">
                        <div className="flex justify-between items-start mb-4"><div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:bg-[#2aac64]/10 transition-colors"><metric.icon className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-[#2aac64]" /></div></div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{metric.label}</p><p className="text-2xl font-medium text-slate-900 dark:text-white mt-1">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><h3 className="font-medium text-slate-900 dark:text-white mb-6">Disbursement Trend (Cr)</h3><div className="h-[300px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><defs><linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2aac64" stopOpacity={0.3}/><stop offset="95%" stopColor="#2aac64" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#e2e8f0'} /><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#64748b'}} dy={10} /><YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: isDarkMode ? '#94a3b8' : '#64748b'}} /><RechartsTooltip contentStyle={{ borderRadius: '8px', border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', color: isDarkMode ? '#f8fafc' : '#0f172a' }} formatter={(value) => [`₹${value} Cr`, undefined]} /><Area type="monotone" dataKey="volume" stroke="#2aac64" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" /></AreaChart></ResponsiveContainer></div></div>
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col"><h3 className="font-medium text-slate-900 dark:text-white mb-6">Portfolio Mix</h3><div className="flex-1 min-h-[250px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={portfolioData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value">{portfolioData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><RechartsTooltip contentStyle={{backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`}} formatter={(value) => [`${value}%`, 'Share']} /><Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: isDarkMode ? '#f8fafc' : '#0f172a' }}/></PieChart></ResponsiveContainer></div></div>
                  </div>
                </div>
              )}

              {/* 🧠 THE MASTER CRM: APPLICATIONS TAB */}
              {activeTab === "applications" && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[calc(100vh-180px)] relative animate-in fade-in slide-in-from-bottom-2">
                  
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                    <div className="flex gap-2">
                      <Button onClick={() => setLeadFilter("all")} variant={leadFilter === "all" ? "default" : "outline"} size="sm" className={cn("h-8 text-xs font-medium shadow-sm transition-all", leadFilter === "all" && "bg-slate-900 dark:bg-white text-white dark:text-slate-900", leadFilter !== "all" && "dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800")}>All Leads</Button>
                      <Button onClick={() => setLeadFilter("queue")} variant={leadFilter === "queue" ? "default" : "ghost"} size="sm" className={cn("h-8 text-xs font-medium transition-all", leadFilter === "queue" && "bg-slate-900 dark:bg-white text-white dark:text-slate-900", leadFilter !== "queue" && "dark:text-slate-400 dark:hover:text-slate-200")}>Active Queue</Button>
                    </div>
                    <div className="flex bg-slate-200/50 dark:bg-slate-950 p-1 rounded-lg">
                      <button onClick={() => setCrmView("list")} className={cn("p-1.5 rounded-md transition-all", crmView === "list" ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white scale-105" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}><LayoutList className="w-4 h-4" /></button>
                      <button onClick={() => setCrmView("kanban")} className={cn("p-1.5 rounded-md transition-all", crmView === "kanban" ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white scale-105" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}><LayoutGrid className="w-4 h-4" /></button>
                    </div>
                  </div>
                  
                  {/* VIEW 1: List View */}
                  {crmView === "list" && (
                    <div className="flex-1 overflow-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-white dark:bg-slate-900 shadow-[0_1px_0_0_#e2e8f0] dark:shadow-[0_1px_0_0_#1e293b] z-10">
                          <tr className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
                            <th className="px-6 py-4">Application</th><th className="px-6 py-4">Client Profile</th>
                            <th className="px-6 py-4">CRM Assignment</th><th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Contact</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                          {filteredApplications.length === 0 ? (
                            <tr><td colSpan={5} className="p-12 text-center"><div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 border dark:border-slate-700 flex items-center justify-center mx-auto mb-3"><LayoutGrid className="w-5 h-5 text-slate-300 dark:text-slate-500" /></div><p className="text-slate-500 dark:text-slate-400">No applications match your filter.</p></td></tr>
                          ) : (
                            filteredApplications.map((app, idx) => (
                              <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer animate-in fade-in" style={{ animationDelay: `${idx * 50}ms` }} onClick={() => setSelectedApp(app)}>
                                <td className="px-6 py-4 align-top">
                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#2aac64]/10 text-[#2aac64] flex items-center justify-center font-medium text-xs mt-1 border border-[#2aac64]/20 group-hover:bg-[#2aac64] group-hover:text-white transition-colors">{app.loanType?.substring(0, 2).toUpperCase() || "PL"}</div>
                                    <div><p className="font-medium text-slate-900 dark:text-white text-sm group-hover:text-[#2aac64] transition-colors">{app.applicationId}</p><p className="font-semibold text-slate-700 dark:text-slate-300 mt-1">{formatCurrency(app.requestedAmount)}</p></div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 align-top">
                                  <div className="space-y-2 text-xs">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Activity className="w-3.5 h-3.5" /><span>CIBIL: <strong className={app.declaredCibilScore >= 750 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>{app.declaredCibilScore}</strong></span></div>
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Calendar className="w-3.5 h-3.5" /><span>{new Date(app.createdAt || Date.now()).toLocaleDateString()}</span></div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 align-top" onClick={(e) => e.stopPropagation()}>
                                  <select value={app.assignee} onChange={(e) => handleAssignLead(app.applicationId, e.target.value)} className={cn("text-xs font-medium px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer transition-all w-40 hover:shadow-sm dark:bg-slate-800", app.assignee === "UNASSIGNED" ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700")}>
                                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                  </select>
                                </td>
                                <td className="px-6 py-4 align-top" onClick={(e) => e.stopPropagation()}>
                                  <select value={app.status} onChange={(e) => handleUpdateStatus(app.applicationId, e.target.value)} className={cn("text-xs font-medium px-3 py-1.5 rounded-full border outline-none cursor-pointer transition-all appearance-none text-center hover:shadow-sm", getStatusColor(app.status))}>
                                    {pipelineStages.map(stage => <option key={stage} value={stage}>{stage}</option>)}
                                  </select>
                                </td>
                                <td className="px-6 py-4 align-top text-right" onClick={(e) => e.stopPropagation()}>
                                  <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button onClick={handleWhatsApp} className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-100 hover:scale-110 transition-all"><MessageCircle className="w-4 h-4" /></button>
                                    <button onClick={handleEmail} className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 hover:scale-110 transition-all"><Mail className="w-4 h-4" /></button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* VIEW 2: Kanban Board */}
                  {crmView === "kanban" && (
                    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-slate-50/50 dark:bg-slate-950/50">
                      <div className="flex gap-6 h-full items-start w-max">
                        {pipelineStages.map((stage) => (
                          <div key={stage} className="w-80 flex flex-col max-h-full">
                            <div className="flex items-center justify-between mb-4 px-2">
                              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">{stage}</h3>
                              <span className="text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full shadow-inner">
                                {filteredApplications.filter(a => a.status === stage).length}
                              </span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 p-2">
                              {filteredApplications.filter(a => a.status === stage).map(app => (
                                <div key={app.id} onClick={() => setSelectedApp(app)} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border-l-4" style={{ borderLeftColor: stage === 'APPROVED' ? '#2aac64' : '#cbd5e1' }}>
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{app.applicationId}</span>
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium">{app.loanType}</span>
                                  </div>
                                  <p className="text-lg font-medium text-slate-900 dark:text-white mb-3">{formatCurrency(app.requestedAmount)}</p>
                                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                                    <span className={cn("flex items-center gap-1 font-medium", app.declaredCibilScore >= 750 ? "text-emerald-600 dark:text-emerald-400" : "")}><Activity className="w-3 h-3"/> {app.declaredCibilScore}</span>
                                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-medium text-slate-600 dark:text-slate-300 shadow-sm">
                                      {employees.find(e=>e.id===app.assignee)?.name.substring(0,2).toUpperCase()}
                                    </div>
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

              {/* USERS TAB */}
              {activeTab === "users" && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700"><tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold"><th className="px-6 py-4">User</th><th className="px-6 py-4">Access Role</th><th className="px-6 py-4">Joined</th></tr></thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm">
                                {u.full_name?.substring(0, 2).toUpperCase() || "US"}
                              </div>
                              <div><p className="font-semibold text-slate-900 dark:text-white">{u.full_name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p></div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 border dark:border-slate-700">{u.role}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>

      {/* 🧠 SALESFORCE-TIER 360 PROFILE DRAWER */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-all">
          <div className="w-[500px] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right border-l border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50 dark:bg-slate-950">
              <div>
                <div className="flex items-center gap-2 mb-1"><h2 className="text-xl font-medium text-slate-900 dark:text-white">{selectedApp.applicationId}</h2><StatusBadge status={selectedApp.status} /></div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Applied: {new Date(selectedApp.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-2 bg-white dark:bg-slate-800 rounded-full border dark:border-slate-700 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all"><X className="w-4 h-4 text-slate-900 dark:text-white"/></button>
            </div>

            <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-4 gap-6 bg-slate-50 dark:bg-slate-950">
              {[
                { id: "details", label: "Details", icon: FileText },
                { id: "documents", label: "KYC & Docs", icon: FileCheck },
                { id: "timeline", label: "Timeline", icon: History },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveDrawerTab(tab.id as any)} className={cn("pb-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-all", activeDrawerTab === tab.id ? "border-[#2aac64] text-[#2aac64]" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300")}>
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto bg-white dark:bg-slate-900">
              {activeDrawerTab === "details" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 flex gap-3 items-start">
                    <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mt-0.5" />
                    <div><h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-300">AI Risk Insight</h4><p className="text-xs text-indigo-700 dark:text-indigo-400/80 mt-1">High probability of instant approval. Applicant's declared CIBIL is in the top 15% percentile for this product line.</p></div>
                  </div>
                  <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl grid grid-cols-2 gap-6">
                    <div><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Requested Amount</p><p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(selectedApp.requestedAmount)}</p></div>
                    <div><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Product Line</p><p className="font-semibold text-slate-900 dark:text-white">{selectedApp.loanType}</p></div>
                    <div><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">CIBIL Score</p><p className={cn("font-semibold", selectedApp.declaredCibilScore >= 750 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>{selectedApp.declaredCibilScore}</p></div>
                    <div><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Applicant Name</p><p className="font-semibold text-slate-900 dark:text-white truncate">{selectedApp.applicant?.name || 'Unknown'}</p></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleEmail} className="w-full text-slate-600 dark:text-slate-300 shadow-sm hover:bg-white dark:hover:bg-slate-800 active:scale-95 transition-all dark:border-slate-700"><Mail className="w-4 h-4 mr-2"/> Email Client</Button>
              <Button onClick={() => { handleUpdateStatus(selectedApp.applicationId, "VERIFIED"); setSelectedApp(null); }} className="w-full bg-[#2aac64] hover:bg-emerald-600 text-white shadow-sm active:scale-95 transition-all">Mark Verified</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;