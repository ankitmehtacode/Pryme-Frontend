import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Users, FileText, Building2, Settings, 
  LogOut, Bell, Search, LayoutGrid, CreditCard, 
  ShieldCheck, Clock, CheckCircle2, ChevronRight,
  MoreVertical, ArrowUpRight, Wallet, UserPlus, 
  Activity, BarChart3, Mail, Phone, Calendar, Plus, Power, Percent, ExternalLink, Shield, Link
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { PrymeAPI } from "@/lib/api"; 

interface DashboardStats {
  totalUsers: number;
  pendingApplications: number;
  approvedLoans: number;
  totalDisbursed: number;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  role?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  
  const [applications, setApplications] = useState<any[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingApplications: 0,
    approvedLoans: 0,
    totalDisbursed: 0,
  });

  // Mock Employee List for Lead Assignment
  const employees = [
    { id: "EMP001", name: "Rahul Sharma (RM)" },
    { id: "EMP002", name: "Priya Desai (RM)" },
    { id: "EMP003", name: "Amit Patel (Sr. RM)" },
    { id: "UNASSIGNED", name: "Unassigned" }
  ];

  // Analytics: Custom Tailwind Graphs Data
  const volumeTrend = [
    { month: "Oct", volume: 120, label: "1.2Cr" },
    { month: "Nov", volume: 180, label: "1.8Cr" },
    { month: "Dec", volume: 240, label: "2.4Cr" },
    { month: "Jan", volume: 210, label: "2.1Cr" },
    { month: "Feb", volume: 350, label: "3.5Cr" },
    { month: "Mar", volume: 480, label: "4.8Cr" }, // Current
  ];
  const maxVolume = Math.max(...volumeTrend.map(v => v.volume));

  const pipelineFunnel = [
    { stage: "Submitted", count: 142, color: "bg-blue-500" },
    { stage: "Processing", count: 86, color: "bg-purple-500" },
    { stage: "Verified", count: 64, color: "bg-indigo-500" },
    { stage: "Approved", count: 48, color: "bg-[#2aac64]" },
  ];
  const maxFunnel = Math.max(...pipelineFunnel.map(f => f.count));

  // Partner Banks Mock Data
  const partnerBanks = [
    { id: "1", name: "HDFC Bank", code: "HDFC", status: "Active", uptime: "99.9%", integration: "API v2", rate: "1.25%" },
    { id: "2", name: "State Bank of India", code: "SBI", status: "Active", uptime: "98.5%", integration: "API v1", rate: "0.85%" },
    { id: "3", name: "ICICI Bank", code: "ICICI", status: "Maintenance", uptime: "85.0%", integration: "API v2", rate: "1.10%" },
    { id: "4", name: "Axis Bank", code: "AXIS", status: "Active", uptime: "99.9%", integration: "API v2", rate: "1.30%" },
  ];

  // Offers Mock Data
  const activeOffers = [
    { id: "1", title: "Zero Processing Fee", type: "Fee Waiver", bank: "HDFC Bank", validity: "Valid till Dec 31, 2026", status: "Active" },
    { id: "2", title: "Festival Cashback", type: "Cashback", bank: "All Banks", validity: "Valid till Nov 15, 2026", status: "Active" },
    { id: "3", title: "Pre-approved PL Boost", type: "Rate Discount", bank: "ICICI Bank", validity: "Expired", status: "Inactive" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("pryme_token");
    const role = localStorage.getItem("pryme_role");

    if (!token || (role !== "SUPER_ADMIN" && role !== "ADMIN")) {
      navigate("/auth");
      return;
    }
    
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const apps = await PrymeAPI.getApplications();
      
      const augmentedApps = apps.map((app: any) => ({
        ...app,
        assignee: app.assignee || "UNASSIGNED",
      })).sort((a: any, b: any) => 
        new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime()
      );
      
      setApplications(augmentedApps);

      const pendingCount = augmentedApps.filter((a: any) => a.status === 'SUBMITTED' || a.status === 'PENDING').length;
      const approvedCount = augmentedApps.filter((a: any) => a.status === 'APPROVED' || a.status === 'DISBURSED').length;
      const totalVolume = augmentedApps.reduce((sum: number, app: any) => sum + (app.requestedAmount || 0), 0);

      setStats({
        totalUsers: 1, 
        pendingApplications: pendingCount,
        approvedLoans: approvedCount,
        totalDisbursed: totalVolume,
      });

      setUsers([
        { id: "1", email: "admin@pryme.com", full_name: "Super Admin", created_at: new Date().toISOString(), role: "SUPER_ADMIN" }
      ]);
    } catch (error) {
      toast({ title: "Sync Error", description: "Running in offline mode.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // --- CRM ACTIONS ---
// --- CRM ACTIONS (Now wired to Java Backend) ---
  const handleAssignLead = async (appId: string, employeeId: string) => {
    // Optimistic UI Update (instant feel)
    setApplications(prev => prev.map(app => 
      app.applicationId === appId ? { ...app, assignee: employeeId } : app
    ));
    
    try {
      await PrymeAPI.assignLead(appId, employeeId);
      const empName = employees.find(e => e.id === employeeId)?.name || "Unassigned";
      toast({
        title: "Lead Assigned",
        description: `Application ${appId} routed to ${empName}.`,
      });
    } catch (error) {
      toast({
        title: "Assignment Failed",
        description: "Could not save assignment to the database.",
        variant: "destructive"
      });
      fetchDashboardData(); // Revert UI on failure
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    // Optimistic UI Update
    setApplications(prev => prev.map(app => 
      app.applicationId === appId ? { ...app, status: newStatus } : app
    ));

    try {
      await PrymeAPI.updateStatus(appId, newStatus);
      toast({
        title: "Pipeline Updated",
        description: `Status for ${appId} successfully changed to ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not save status to the database.",
        variant: "destructive"
      });
      fetchDashboardData(); // Revert UI on failure
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/auth");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      SUBMITTED: "bg-blue-50 text-blue-700 ring-blue-600/20 border-blue-200",
      PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20 border-amber-200",
      PROCESSING: "bg-purple-50 text-purple-700 ring-purple-600/20 border-purple-200",
      VERIFIED: "bg-indigo-50 text-indigo-700 ring-indigo-600/20 border-indigo-200",
      APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 border-emerald-200",
      DISBURSED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 border-emerald-200",
      REJECTED: "bg-red-50 text-red-700 ring-red-600/20 border-red-200",
    };
    return map[status] || "bg-slate-50 text-slate-700 ring-slate-600/20 border-slate-200";
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      Active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      Maintenance: "bg-amber-50 text-amber-700 ring-amber-600/20",
      Inactive: "bg-slate-100 text-slate-600 ring-slate-500/20",
    };
    return (
      <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset", styles[status] || getStatusColor(status))}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#2aac64] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500 tracking-wide">Initializing CRM Engine...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: "overview", label: "Analytics Overview", icon: BarChart3 },
    { id: "applications", label: "CRM Pipeline", icon: LayoutGrid },
    { id: "users", label: "User Directory", icon: Users },
    { id: "banks", label: "Partner Integrations", icon: Building2 },
    { id: "offers", label: "Marketing & Offers", icon: CreditCard },
    { id: "settings", label: "System Settings", icon: Settings },
  ];

  return (
    <>
      <Helmet><title>PRYME Admin - Analytics & CRM</title></Helmet>

      <div className="min-h-screen flex bg-slate-50 font-sans selection:bg-[#2aac64]/20 selection:text-[#2aac64]">
        
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex-col hidden lg:flex fixed h-full z-20">
          <div className="h-16 flex items-center px-6 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#2aac64] rounded-lg flex items-center justify-center shadow-sm shadow-[#2aac64]/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight">PRYME<span className="text-slate-400 font-normal ml-1">Admin</span></span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Workspace</p>
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  activeTab === item.id
                    ? "bg-slate-100 text-slate-900 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                )}
              >
                <item.icon className={cn("w-4 h-4 transition-colors", activeTab === item.id ? "text-[#2aac64]" : "text-slate-400 group-hover:text-slate-600")} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-[#2aac64]">AD</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-slate-900 truncate">{localStorage.getItem("pryme_name") || "Admin"}</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Super Admin</p>
              </div>
            </div>
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="flex-1 lg:pl-64 flex flex-col h-screen overflow-hidden">
          <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
              <span>{sidebarItems.find(i => i.id === activeTab)?.label}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block group">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-[#2aac64] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search PRY-ID or Name..." 
                  className="pl-9 pr-4 py-2 bg-slate-100 border border-transparent rounded-lg text-sm focus:bg-white focus:border-[#2aac64]/30 focus:ring-4 focus:ring-[#2aac64]/10 outline-none transition-all w-72 text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <button className="relative p-2.5 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200">
                <Bell className="w-4 h-4" />
                {stats.pendingApplications > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                    {sidebarItems.find(i => i.id === activeTab)?.label}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1.5">
                    {activeTab === "overview" && "Real-time analytics and platform performance metrics."}
                    {activeTab === "applications" && "Assign leads, update statuses, and manage the loan lifecycle."}
                    {activeTab === "users" && "Manage registered clients and permissions."}
                    {activeTab === "banks" && "Monitor banking APIs and commission structures."}
                    {activeTab === "offers" && "Configure promotional campaigns and rewards."}
                    {activeTab === "settings" && "Manage global platform configurations."}
                  </p>
                </div>
                {activeTab === "applications" && (
                  <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-medium px-4 py-2 shadow-sm">
                    Export Pipeline
                  </Button>
                )}
                {activeTab === "banks" && (
                  <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-medium px-4 py-2 shadow-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Partner
                  </Button>
                )}
                {activeTab === "offers" && (
                  <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-medium px-4 py-2 shadow-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create Offer
                  </Button>
                )}
              </div>

              {/* OVERVIEW TAB: Analytics Powerhouse */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Volume", value: formatCurrency(stats.totalDisbursed), trend: "+12.5%", icon: Wallet },
                      { label: "Active Leads", value: stats.pendingApplications, trend: "+4.2%", icon: Activity },
                      { label: "Approvals", value: stats.approvedLoans, trend: "+8.1%", icon: CheckCircle2 },
                      { label: "User Base", value: stats.totalUsers, trend: "+2.4%", icon: Users },
                    ].map((metric, i) => (
                      <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-[#2aac64]/10 group-hover:border-[#2aac64]/20 transition-colors">
                            <metric.icon className="w-5 h-5 text-slate-400 group-hover:text-[#2aac64] transition-colors" />
                          </div>
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            <ArrowUpRight className="w-3 h-3" /> {metric.trend}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">{metric.label}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{metric.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                      <div className="flex justify-between items-center mb-8">
                        <div>
                          <h3 className="font-bold text-slate-900">Disbursement Volume</h3>
                          <p className="text-xs text-slate-500 mt-1">Last 6 Months (in Crores)</p>
                        </div>
                      </div>
                      <div className="flex-1 flex items-end gap-3 h-48 mt-auto">
                        {volumeTrend.map((data, i) => {
                          const heightPct = (data.volume / maxVolume) * 100;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center group relative">
                              <div className="absolute -top-10 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                {data.label}
                              </div>
                              <div className="w-full bg-slate-50 rounded-t-md border border-slate-100 relative flex items-end justify-center h-full overflow-hidden">
                                <div 
                                  className="w-full bg-gradient-to-t from-[#2aac64] to-[#45c97f] rounded-t-sm transition-all duration-700 ease-out group-hover:opacity-80" 
                                  style={{ height: `${heightPct}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium text-slate-400 mt-3">{data.month}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                      <div className="mb-6">
                        <h3 className="font-bold text-slate-900">Pipeline Funnel</h3>
                        <p className="text-xs text-slate-500 mt-1">Application conversion stages</p>
                      </div>
                      <div className="flex-1 flex flex-col justify-center gap-5">
                        {pipelineFunnel.map((stage, i) => {
                          const widthPct = (stage.count / maxFunnel) * 100;
                          return (
                            <div key={i} className="relative group">
                              <div className="flex justify-between text-xs font-medium mb-1.5">
                                <span className="text-slate-600">{stage.stage}</span>
                                <span className="text-slate-900 font-bold">{stage.count}</span>
                              </div>
                              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full rounded-full transition-all duration-1000 ease-out", stage.color)}
                                  style={{ width: `${widthPct}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* APPLICATIONS TAB: The Mini CRM */}
              {activeTab === "applications" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-220px)]">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="bg-white h-8 text-xs font-medium border-slate-200 shadow-sm">All Leads</Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-slate-500">My Queue</Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-slate-500">Requires Action</Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-white shadow-[0_1px_0_0_#e2e8f0] z-10">
                        <tr className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                          <th className="px-6 py-4 font-semibold">Application</th>
                          <th className="px-6 py-4 font-semibold">Client Profile</th>
                          <th className="px-6 py-4 font-semibold">CRM Assignment</th>
                          <th className="px-6 py-4 font-semibold">Pipeline Status</th>
                          <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {applications.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-50/80 transition-colors group">
                            
                            <td className="px-6 py-4 align-top">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#2aac64]/10 text-[#2aac64] flex items-center justify-center font-bold text-xs mt-1 border border-[#2aac64]/20">
                                  {app.loanType?.substring(0, 2).toUpperCase() || "PL"}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-sm">{app.applicationId}</p>
                                  <p className="font-semibold text-slate-700 mt-1">{formatCurrency(app.requestedAmount)}</p>
                                  <p className="text-xs text-slate-400 mt-0.5 capitalize">{app.loanType?.toLowerCase()}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 align-top">
                              <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                                  <span>CIBIL: <strong className="text-slate-900">{app.declaredCibilScore}</strong></span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{new Date(app.createdAt || Date.now()).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 align-top">
                              <select 
                                value={app.assignee}
                                onChange={(e) => handleAssignLead(app.applicationId, e.target.value)}
                                className={cn(
                                  "text-xs font-medium px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer transition-all w-40",
                                  app.assignee === "UNASSIGNED" 
                                    ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100" 
                                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                )}
                              >
                                {employees.map(emp => (
                                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                              </select>
                            </td>

                            <td className="px-6 py-4 align-top">
                              <select
                                value={app.status}
                                onChange={(e) => handleUpdateStatus(app.applicationId, e.target.value)}
                                className={cn(
                                  "text-xs font-bold px-3 py-1.5 rounded-full border outline-none cursor-pointer transition-all appearance-none text-center text-center-last",
                                  getStatusColor(app.status)
                                )}
                              >
                                <option value="SUBMITTED">SUBMITTED</option>
                                <option value="PROCESSING">PROCESSING</option>
                                <option value="VERIFIED">VERIFIED</option>
                                <option value="APPROVED">APPROVED</option>
                                <option value="DISBURSED">DISBURSED</option>
                                <option value="REJECTED">REJECTED</option>
                              </select>
                            </td>

                            <td className="px-6 py-4 align-top text-right">
                              <Button variant="outline" size="sm" className="h-8 text-xs font-medium bg-white shadow-sm border-slate-200 hover:border-[#2aac64] hover:text-[#2aac64] transition-colors">
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                        
                        {applications.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-16 text-center">
                              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 mb-3 border border-slate-100">
                                <LayoutGrid className="w-5 h-5 text-slate-300" />
                              </div>
                              <p className="text-sm font-medium text-slate-900">Pipeline is Empty</p>
                              <p className="text-xs text-slate-500 mt-1">Applications submitted will appear here for CRM routing.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === "users" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <th className="px-6 py-4">User</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                {u.full_name?.substring(0, 2).toUpperCase() || "US"}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{u.full_name}</p>
                                <p className="text-xs text-slate-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {new Date(u.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PARTNER BANKS TAB */}
              {activeTab === "banks" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {partnerBanks.map((bank) => (
                    <div key={bank.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative group">
                      <div className="absolute top-6 right-6">
                        <StatusBadge status={bank.status} />
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                        <Building2 className="w-6 h-6 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{bank.name}</h3>
                      <p className="text-sm text-slate-500 mb-6">Integration: {bank.integration}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Activity className="w-3 h-3" /> Uptime</div>
                          <div className="font-semibold text-slate-900">{bank.uptime}</div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1"><Percent className="w-3 h-3" /> Base Rate</div>
                          <div className="font-semibold text-slate-900">{bank.rate}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 text-xs font-medium border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">Configure</Button>
                        <Button variant="outline" className="w-10 px-0 border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 shadow-sm">
                          <Power className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* OFFERS & REWARDS TAB */}
              {activeTab === "offers" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                        <th className="px-6 py-4">Campaign Name</th>
                        <th className="px-6 py-4">Target Bank</th>
                        <th className="px-6 py-4">Validity</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {activeOffers.map((offer) => (
                        <tr key={offer.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900">{offer.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{offer.type}</p>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700">{offer.bank}</td>
                          <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> {offer.validity}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={offer.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 text-slate-400 hover:text-[#2aac64] transition-colors rounded-lg hover:bg-emerald-50">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === "settings" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex overflow-hidden min-h-[500px]">
                  <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col gap-1">
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-white text-slate-900 shadow-sm border border-slate-200">
                      <Settings className="w-4 h-4 text-slate-500" /> General
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all border border-transparent">
                      <Shield className="w-4 h-4 text-slate-400" /> Security
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all border border-transparent">
                      <Link className="w-4 h-4 text-slate-400" /> Webhooks
                    </button>
                  </div>
                  
                  <div className="flex-1 p-8 max-w-3xl">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">General Configurations</h3>
                    
                    <div className="space-y-6">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-900">Platform Name</label>
                        <input type="text" defaultValue="PRYME Consulting" className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2aac64]/20 focus:border-[#2aac64] transition-all" />
                      </div>
                      
                      <div className="grid gap-2">
                        <label className="text-sm font-medium text-slate-900">Support Email</label>
                        <input type="email" defaultValue="support@pryme.com" className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2aac64]/20 focus:border-[#2aac64] transition-all" />
                      </div>

                      <hr className="border-slate-200" />

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">Auto-assign Leads</p>
                          <p className="text-xs text-slate-500">Automatically route incoming applications to available RMs.</p>
                        </div>
                        <div className="w-10 h-6 bg-[#2aac64] rounded-full relative cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">Strict CIBIL Checking</p>
                          <p className="text-xs text-slate-500">Reject applications immediately if declared CIBIL is below 650.</p>
                        </div>
                        <div className="w-10 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                          <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1 shadow-sm"></div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <Button className="bg-[#2aac64] hover:bg-emerald-600 text-white font-medium px-6 py-2 rounded-lg shadow-sm">
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;