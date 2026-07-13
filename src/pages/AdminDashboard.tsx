import React, { useState, useEffect, useMemo, useRef, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, FileText, Building2, Settings,
  LogOut, Bell, Search, LayoutGrid,
  ShieldCheck, Clock, CheckCircle2,
  Activity, BarChart3, Mail, Calendar, Plus,
  Percent, ExternalLink, Shield, Link as LinkIcon,
  X, Loader2, MessageCircle, FileCheck, History,
  Sparkles, LayoutList, Wallet, ArrowUpRight, UserPlus,
  Trash2, Upload, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import prymeLogo from "@/assets/pryme-typo-logo.svg";
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
import { AdminProductModal } from "@/components/admin/AdminProductModal";
import { AdminBankModal } from "@/components/admin/AdminBankModal";
import { AdminEligibilityModal } from "@/components/admin/AdminEligibilityModal";
import { FieldMetadata, PolicyPatchPayload } from "@/lib/validations/policySchema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// Lazy-loaded tab components
const OverviewTab = lazy(() => import("./admin/tabs/OverviewTab"));
const ApplicationsTab = lazy(() => import("./admin/tabs/ApplicationsTab"));
const LeadsTab = lazy(() => import("./admin/tabs/LeadsTab"));
const BanksTab = lazy(() => import("./admin/tabs/BanksTab"));
// OffersTab is now rendered as a sub-section inside SettingsTab (Policy Matrix)
const UsersTab = lazy(() => import("./admin/tabs/UsersTab"));
const CompanyTab = lazy(() => import("./admin/tabs/CompanyTab"));
const MarketingTab = lazy(() => import("./admin/tabs/MarketingTab"));
const SettingsTab = lazy(() => import("./admin/tabs/SettingsTab"));

const isHighImpact = (key: string) => ["foirAllowed", "ltvAllowed", "FOIR Allowed"].includes(key);

// MOCK_METADATA_DB removed (using dynamic backend definitions)

// 🧠 DOCUMENT VAULT PANEL: Inline sub-component to fetch & display KYC docs from the backend
const DocumentsPanel = ({ applicationId }: { applicationId: string }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["app_documents", applicationId],
    queryFn: async () => {
      const res = await PrymeAPI.getApplicationDocuments(applicationId);
      return res?.content ? res.content : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
    },
    enabled: !!applicationId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const docType = file.name.split('.')[0].toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 30);
      const res = await PrymeAPI.uploadApplicationDocument(applicationId, docType, file);
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Document uploaded successfully.");
      queryClient.invalidateQueries({ queryKey: ["app_documents", applicationId] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to upload document.")
  });

  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      const res = await PrymeAPI.deleteDocument(docId);
      if (res && typeof res === 'object' && 'error' in res && res.error) {
        throw new Error((res.error as any).message);
      }
      return res;
    },
    onSuccess: () => {
      toast.success("Document deleted.");
      queryClient.invalidateQueries({ queryKey: ["app_documents", applicationId] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to delete document.")
  });

  const handleDownload = async (docId: string, filename: string, action: 'view' | 'download' = 'view') => {
    try {
      const res = await PrymeAPI.viewDocument(docId);
      const url = typeof res === "string" ? res : (res?.url || res?.data?.url);
      if (url) {
        if (action === 'view') {
          window.open(url, "_blank");
        } else {
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to access document.");
    }
  };

  if (isLoading) return <div className="flex items-center justify-center p-12 text-slate-500"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading documents...</div>;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
        <h3 className="text-sm font-medium text-slate-300">Application Documents</h3>
        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            uploadMutation.mutate(e.target.files[0]);
          }
        }} />
        <Button size="sm" variant="outline" className="h-8 border-white/[0.08]" onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
          {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
          Upload
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-white/[0.02] rounded-xl border border-white/[0.06]">
          <FileCheck className="w-8 h-8 text-slate-600 mb-2" />
          <p className="text-sm text-slate-500 font-medium">No documents found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc: any) => (
            <div key={doc.id || doc.documentId} className="flex items-center justify-between p-3 border border-white/[0.06] rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{doc.docType || doc.documentType || "Document"}</p>
                  <p className="text-xs text-slate-500">{doc.originalFilename || doc.fileName || "Unknown file"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 text-blue-400 hover:text-blue-300 px-2" onClick={() => handleDownload(doc.id || doc.documentId, doc.originalFilename || "document", "view")}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-green-400 hover:text-green-300 px-2" onClick={() => handleDownload(doc.id || doc.documentId, doc.originalFilename || "document", "download")}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(doc.id || doc.documentId)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // UI & Navigation States
  const [activeTab, setActiveTab] = useState("applications");
  const [crmView, setCrmView] = useState<"list" | "kanban">("list");
  const [leadFilter, setLeadFilter] = useState<"all" | "queue">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // 🧠 Reset search query when switching workspace tabs to keep search context scoped
  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  useEffect(() => {
    // Failsafe to prevent body background color showing as white/light-grey
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#050508";

    // Set zoom to 100% (1) exclusively for the CRM layout, bypassing global site scale
    const originalZoom = (document.documentElement.style as any).zoom;
    (document.documentElement.style as any).zoom = "1";

    return () => {
      document.body.style.backgroundColor = originalBg;
      (document.documentElement.style as any).zoom = originalZoom;
    };
  }, []);


  // 🧠 Active/Inactive filter states for entity management
  const [bankStatusFilter, setBankStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [productStatusFilter, setProductStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [ruleStatusFilter, setRuleStatusFilter] = useState<"all" | "active" | "inactive">("active");

  // Modal & Drawer States
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState<any>({});
  const [activeDrawerTab, setActiveDrawerTab] = useState<"details" | "documents" | "timeline">("details");
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<any | null>(null);
  const [selectedSnapshotRuleId, setSelectedSnapshotRuleId] = useState<number | null>(null);

  // Notifications State & Click Outside Hook
  interface AdminNotification {
    id: string;
    title: string;
    message: string;
    time: string;
  }

  const [notifications, setNotifications] = useState<AdminNotification[]>([
    {
      id: "1",
      title: "System Update",
      message: "Policy Matrix and engine rules have been successfully compiled.",
      time: "10m ago"
    },
    {
      id: "2",
      title: "Bank Partner Added",
      message: "New API integration for Bank of Baroda is now live.",
      time: "1h ago"
    },
    {
      id: "3",
      title: "Underwriter Performance",
      message: "Lead distribution queue updated for regional underwriters.",
      time: "2h ago"
    }
  ]);

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
    queryFn: async () => {
      const res = await PrymeAPI.getAdminBanks();
      return res?.content ? res.content : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
    },
    enabled: activeTab === "banks" || activeTab === "settings"
  });

  const { data: products = [], refetch: refetchProducts } = useQuery({
    queryKey: ["admin_products"],
    queryFn: async () => {
      const res = await PrymeAPI.getAdminProducts();
      return res?.data?.content ? res.data.content : (res?.content ? res.content : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])));
    },
    enabled: activeTab === "settings"
  });

  const toggleBankMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => PrymeAPI.toggleBankVisibility(id, active),
    onSuccess: () => { toast.success("Bank visibility updated."); refetchBanks(); },
    onError: (error: any) => { toast.error(error.message || "Failed to update bank."); }
  });

  const toggleProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => PrymeAPI.updateAdminProduct(id, data),
    onSuccess: () => { toast.success("Product visibility updated."); refetchProducts(); },
    onError: (error: any) => { toast.error(error.message || "Failed to update product."); }
  });

  const { data: allUsers = [], refetch: refetchUsers } = useQuery({
    queryKey: ["admin_users"],
    queryFn: async () => {
      const res = await PrymeAPI.getAdminUsers();
      return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
    },
    enabled: activeTab === "overview" || activeTab === "users" || activeTab === "company"
  });

  // 🧠 ARCHITECTURAL SPLIT: Customers vs Team Members
  const users = useMemo(() => allUsers.filter((u: any) => u.role === "USER"), [allUsers]);
  const teamMembers = useMemo(() => allUsers.filter((u: any) => u.role !== "USER"), [allUsers]);

  // 🧠 ROLE MUTATION: Wired to PATCH /admin/users/{userId}/role
  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => PrymeAPI.updateUserRole(userId, role),
    onSuccess: () => {
      toast.success("Role updated. IAM change reflected in database.");
      refetchUsers();
    },
    onError: (error: any) => {
      toast.error(error.message || "Role update failed.");
    }
  });

  // 🧠 DELETE USER MUTATION: Wired to DELETE /admin/users/{userId}
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => PrymeAPI.deleteUser(userId),
    onSuccess: () => {
      toast.success("Team member deleted. User session and footprint purged.");
      refetchUsers();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete team member.");
    }
  });

  // ==========================================
  // POLICY ENGINE UI STATES
  // ==========================================
  const [selectedEntity, setSelectedEntity] = useState("HDFC_HL_001");
  const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);
  const [stagedValue, setStagedValue] = useState<any>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // ==========================================
  // ENGINE RULES DATA (Eligibility Rules)
  // ==========================================
  const { data: eligibilityRules = [], refetch: refetchEligibilityRules } = useQuery({
    queryKey: ["eligibility_rules"],
    queryFn: async () => {
      const res = await PrymeAPI.getEligibilityRules();
      return res?.content ? res.content : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
    },
    enabled: activeTab === "settings"
  });

  // 🧠 Filtered data per entity — driven by dropdown
  // NOTE: These must be declared AFTER the useQuery hooks that provide banks/products/eligibilityRules
  const filteredBanks = useMemo(() => {
    if (bankStatusFilter === "all") return banks;
    return banks.filter((b: any) => bankStatusFilter === "active" ? (b.active ?? b.isActive) : !(b.active ?? b.isActive));
  }, [banks, bankStatusFilter]);

  const filteredProducts = useMemo(() => {
    if (productStatusFilter === "all") return products;
    return products.filter((p: any) => productStatusFilter === "active" ? (p.active ?? p.isActive) : !(p.active ?? p.isActive));
  }, [products, productStatusFilter]);

  // rule.ltvAllowed and a "rule.foirMax" field the Policy Matrix table used to
  // read are almost never populated -- the real LTV lives in rule.ltvGrid
  // (JSON, either the new flat per-subtype format or the legacy loan-amount-
  // tiered format), and FOIR isn't a per-condition field at all -- it's a
  // matrix keyed by product+employment+income-band (product_foir_matrix),
  // which isn't loaded into this admin view. Derive the best available
  // summary from what IS loaded: scan ltvGrid for its percentage range, and
  // fall back through ltvAllowed -> the linked product's flat ltv/FOIR
  // ceiling, rather than silently rendering 0%.
  const deriveLtvDisplay = (rule: any, product: any): string => {
    if (rule.ltvGrid) {
      try {
        const parsed = typeof rule.ltvGrid === "string" ? JSON.parse(rule.ltvGrid) : rule.ltvGrid;
        const percents: number[] = [];
        const walk = (node: any) => {
          if (node == null) return;
          if (typeof node === "string" && /^\d+(\.\d+)?%$/.test(node.trim())) {
            percents.push(parseFloat(node));
          } else if (typeof node === "object") {
            Object.values(node).forEach(walk);
          }
        };
        walk(parsed);
        if (percents.length > 0) {
          const min = Math.min(...percents);
          const max = Math.max(...percents);
          return min === max ? `${min}%` : `${min}–${max}%`;
        }
      } catch {
        // fall through to scalar sources below
      }
    }
    if (rule.ltvAllowed) return `${(rule.ltvAllowed * 100).toFixed(0)}%`;
    if (product?.ltv) {
      const n = Number(product.ltv);
      return `${(n < 1 ? n * 100 : n).toFixed(0)}%`;
    }
    return "—";
  };

  const deriveFoirDisplay = (product: any): string => {
    if (product?.maxEmiNmiRatio == null) return "—";
    const n = Number(product.maxEmiNmiRatio);
    return `≤${(n < 1 ? n * 100 : n).toFixed(0)}%`;
  };

  const filteredEligibilityRules = useMemo(() => {
    const resolvedRules = eligibilityRules.map((rule: any) => {
      const matchingProduct = products.find((p: any) => p.productCode === rule.productCode);
      const resolvedBankName = (!rule.bankName || rule.bankName.trim() === "")
        ? matchingProduct?.lenderName
        : rule.bankName;
      return {
        ...rule,
        bankName: resolvedBankName,
        ltvDisplay: deriveLtvDisplay(rule, matchingProduct),
        foirDisplay: deriveFoirDisplay(matchingProduct),
      };
    });

    if (ruleStatusFilter === "all") return resolvedRules;
    return resolvedRules.filter((r: any) => ruleStatusFilter === "active" ? (r.active ?? r.isActive) : !(r.active ?? r.isActive));
  }, [eligibilityRules, products, ruleStatusFilter]);

  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = useState(false);
  const [editingEligibilityRule, setEditingEligibilityRule] = useState<any>(null);

  const createEligibilityRuleMutation = useMutation({
    mutationFn: (data: any) => PrymeAPI.createEligibilityRule(data),
    onSuccess: () => {
      toast.success("Engine Rule created successfully.");
      refetchEligibilityRules();
      setIsEligibilityModalOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to create rule")
  });

  const updateEligibilityRuleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number, data: any }) => PrymeAPI.updateEligibilityRule(id, data),
    onSuccess: () => {
      toast.success("Engine Rule updated successfully.");
      refetchEligibilityRules();
      setIsEligibilityModalOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to update rule")
  });

  const deleteEligibilityRuleMutation = useMutation({
    mutationFn: (id: string | number) => PrymeAPI.deleteEligibilityRule(id),
    onSuccess: () => {
      toast.success("Engine Rule deleted successfully.");
      refetchEligibilityRules();
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete rule")
  });

  const handleEligibilitySubmit = (data: any) => {
    if (data.id) updateEligibilityRuleMutation.mutate({ id: data.id, data });
    else createEligibilityRuleMutation.mutate(data);
  };

  const { data: rawLeads = [], isLoading: isLoadingLeads } = useQuery({
    queryKey: ["admin_leads"],
    queryFn: async () => {
      const res = await PrymeAPI.getAdminLeads();
      return res?.content ? res.content : (Array.isArray(res) ? res : []);
    },
    enabled: activeTab === "leads",
    refetchInterval: 15000,
  });

  // 1. Fetch current live value of the specific field
  const { data: currentPolicyValue } = useQuery({
    queryKey: ["policy_value", selectedEntity, selectedFieldKey],
    queryFn: () => PrymeAPI.getPolicyValue(selectedEntity, selectedFieldKey!),
    enabled: !!selectedFieldKey
  });

  // Fetch full policy snapshot for Engine Rules Tab
  const { data: policySnapshot, isLoading: isLoadingSnapshot } = useQuery({
    queryKey: ["policy_snapshot", selectedSnapshotRuleId],
    queryFn: () => PrymeAPI.getPolicySnapshot(selectedSnapshotRuleId!),
    enabled: selectedSnapshotRuleId !== null,
  });

  // 2. The Patch Mutation
  const patchMutation = useMutation({
    mutationFn: (payload: PolicyPatchPayload) => PrymeAPI.patchPolicy(payload),
    onSuccess: () => {
      toast.success("Policy updated. Matrix routing has been audited.");
      queryClient.invalidateQueries({ queryKey: ["policy_value", selectedEntity, selectedFieldKey] });
      setIsAuditModalOpen(false);
      setSelectedFieldKey(null);
    },
    onError: (error: any) => { toast.error(error.message || "Policy update failed."); }
  });

  // metadataForField removed

  // ==========================================
  // 🧠 MUTATIONS: OPTIMISTIC PIPELINE UPDATES
  // ==========================================
  const statusMutation = useMutation({
    mutationFn: ({ id, status, version }: { id: string; status: string; version?: number }) => PrymeAPI.updateStatus(id, status, version),
    onSuccess: () => {
      toast.success("Pipeline updated. Lead status synchronized.");
      queryClient.invalidateQueries({ queryKey: ["admin_applications"] });
      if (selectedApp) setSelectedApp(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Status update failed.");
    }
  });

  const leadStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => PrymeAPI.updateLeadStatus(id, status),
    onSuccess: () => {
      toast.success("Lead status updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin_leads"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update lead status.");
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => PrymeAPI.updateLeadProfile(id, payload),
    onSuccess: (data: any) => {
      toast.success("Lead profile updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin_applications"] });
      setSelectedApp(data.application || data);
      setIsEditingProfile(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to update profile")
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, assigneeId }: { id: string; assigneeId: string }) => PrymeAPI.assignLead(id, assigneeId),
    onSuccess: () => {
      toast.success("Lead assigned. Employee mapped to application.");
      queryClient.invalidateQueries({ queryKey: ["admin_applications"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Assignment failed.");
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
      const searchStr = searchQuery.toLowerCase().trim();
      if (!searchStr) {
        const matchesQueue = leadFilter === "all" || (leadFilter === "queue" && app.assignedTo !== null && app.assignedTo !== undefined);
        return matchesQueue;
      }
      const matchesSearch =
        app.applicationId?.toLowerCase().includes(searchStr) ||
        app.loanType?.toLowerCase().includes(searchStr) ||
        app.applicant?.name?.toLowerCase().includes(searchStr) ||
        app.applicant?.fullName?.toLowerCase().includes(searchStr) ||
        app.applicant?.email?.toLowerCase().includes(searchStr) ||
        app.applicant?.phoneNumber?.toLowerCase().includes(searchStr);

      const matchesQueue = leadFilter === "all" || (leadFilter === "queue" && app.assignedTo !== null && app.assignedTo !== undefined);
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

    const colors = ["#103783", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];
    return Object.entries(counts).map(([name, count], idx) => ({
      name,
      value: Math.round((count / applications.length) * 100),
      color: colors[idx % colors.length]
    }));
  }, [applications]);



  const handleExportCSV = () => {
    if (applications.length === 0) { toast.error("No data to export."); return; }
    const headers = "Application ID,Applicant Name,Loan Type,Amount,CIBIL,Status,Assignee,Date\n";
    const csvRows = applications.map((app: any) => `${app.applicationId},${app.applicant?.fullName || app.applicant?.name || 'N/A'},${app.loanType},${app.requestedAmount},${app.declaredCibilScore},${app.status},${app.assignedTo || 'UNASSIGNED'},${new Date(app.createdAt).toISOString()}`).join("\n");
    const blob = new Blob([headers + csvRows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `pryme_pipeline_${new Date().getTime()}.csv`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast.success(`Exported ${applications.length} records to CSV.`);
  };

  // 🧠 INTELLIGENT PIPELINE ADVANCEMENT: Calculates the next logical stage
  const getNextStage = (currentStatus: string): string | null => {
    const flow: Record<string, string> = { NEW: "SUBMITTED", SUBMITTED: "PROCESSING", PROCESSING: "APPROVED" };
    return flow[currentStatus?.toUpperCase()] || null;
  };

  // (Logic moved to inline Dropdown)
  const handleAssignPrompt = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
  };

  // 🧠 CLOSED-LOOP: Uses useAuth().signOut() to properly clear React Query cache + cookie
  const { signOut, user: authUser } = useAuth();
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-blue-500/10 transform-gpu animate-pulse" />
        <div className="flex flex-col items-center gap-5 relative z-10">
          <div className="relative"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /><div className="absolute inset-0 w-10 h-10 rounded-full bg-blue-500/20 animate-ping" /></div>
          <p className="text-slate-400 font-medium text-sm tracking-widest uppercase">Synchronizing CRM Matrix</p>
        </div>
      </div>
    );
  }

  const isSuperAdmin = authUser?.role === "SUPER_ADMIN";
  const isEmployee = authUser?.role === "EMPLOYEE";

  const sidebarItems = [
    { id: "overview", label: "Analytics Overview", icon: BarChart3 }, { id: "applications", label: "CRM Pipeline", icon: LayoutGrid },
    { id: "leads", label: "Raw Inquiries", icon: LayoutList },
    { id: "users", label: "User Directory", icon: Users }, { id: "company", label: "Company Team", icon: ShieldCheck },
    { id: "banks", label: "Partner Integrations", icon: Building2 },
    { id: "marketing", label: "Marketing & Offers", icon: Percent },
    { id: "settings", label: "Policy Matrix", icon: Settings },
  ];

  return (
    <>
      <Helmet><title>PRYME Admin — Command Center</title></Helmet>

      <div className="min-h-screen flex-1 flex bg-[#050508] font-sans text-slate-100 transition-colors duration-300">

        {/* Sidebar */}
        <aside className="w-64 bg-[#0a0a10]/95 backdrop-blur-2xl border-r border-white/[0.06] flex-col hidden lg:flex fixed inset-y-0 left-0 z-20">
          <div className="h-16 flex items-center px-6 border-b border-white/[0.06]">
            <Link to="/" className="flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]">
              <img src={prymeLogo} alt="PRYME" className="h-7 w-auto object-contain" />
              <span className="text-slate-400 font-medium text-[10px] tracking-wide uppercase border border-white/10 bg-white/5 px-1.5 py-0.5 rounded shrink-0">CRM</span>
            </Link>
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
                  placeholder="Search by name, ref ID, or email…"
                  className="pl-9 pr-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm focus:bg-white/[0.08] focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all w-72 text-white placeholder:text-slate-600"
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="relative p-2.5 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-white/[0.06] focus:outline-none"
                  >
                    <Bell className="w-4 h-4" />
                    {notifications.length > 0 && (
                      <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_6px_rgba(59,130,246,0.8)] border border-[#0a0a10]" />
                    )}
                  </button>
                </PopoverTrigger>

                <PopoverContent 
                  align="end" 
                  className="w-80 bg-[#0d0d14]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl p-4 flex flex-col gap-3 text-left"
                >
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <span className="font-semibold text-white text-xs uppercase tracking-wider">Notifications</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => setNotifications([])}
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                      <Bell className="w-8 h-8 text-slate-600 animate-pulse" />
                      <p className="text-xs font-medium text-slate-400">No notifications available</p>
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.04] pr-1">
                      {notifications.map((note) => (
                        <div
                          key={note.id}
                          className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 group/item"
                        >
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-white">{note.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{note.message}</p>
                            <span className="text-[9px] text-slate-600 font-medium block mt-1">{note.time}</span>
                          </div>
                          <button
                            onClick={() => setNotifications(prev => prev.filter(n => n.id !== note.id))}
                            className="text-slate-600 hover:text-slate-400 opacity-0 group-hover/item:opacity-100 transition-opacity p-1 shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </header>

          <div className="flex-1 flex flex-col p-8 bg-gradient-to-b from-[#050508] to-[#08080e] overflow-y-auto min-h-0 w-full">
            <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col min-h-0 space-y-6">

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-xl font-semibold text-white tracking-tight">{sidebarItems.find(i => i.id === activeTab)?.label}</h1>
                  <p className="text-sm text-slate-500 mt-1.5">Intelligent workflow and pipeline management.</p>
                </div>
                <div className="flex gap-2">
                  {activeTab === "applications" && <Button onClick={handleExportCSV} className="bg-[#0a1530] dark:bg-white text-white dark:text-[#0a1530] hover:bg-slate-800 dark:hover:bg-slate-200 shadow-sm transition-transform active:scale-95">Export CSV</Button>}
                </div>
              </div>

              {/* MAIN CONTENT AREA */}
              <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>}>
                {activeTab === "overview" && (
                  <OverviewTab stats={stats} formatCurrency={formatCurrency} portfolioData={portfolioData} applications={applications} />
                )}

                {activeTab === "applications" && (
                  <ApplicationsTab 
                    leadFilter={leadFilter} setLeadFilter={setLeadFilter}
                    crmView={crmView} setCrmView={setCrmView}
                    statusMutation={statusMutation} assignMutation={assignMutation}
                    filteredApplications={filteredApplications} pipelineStages={pipelineStages}
                    setSelectedApp={setSelectedApp} formatCurrency={formatCurrency}
                    getNextStage={getNextStage} teamMembers={teamMembers}
                    StatusBadge={StatusBadge} isEmployee={isEmployee}
                  />
                )}

                {activeTab === "leads" && (
                  <LeadsTab 
                    isLoadingLeads={isLoadingLeads} rawLeads={rawLeads} 
                    formatCurrency={formatCurrency} StatusBadge={StatusBadge} 
                    onUpdateStatus={(id, status) => leadStatusMutation.mutate({ id, status })}
                    isUpdating={leadStatusMutation.isPending}
                  />
                )}

                {activeTab === "banks" && (
                  <BanksTab 
                    bankStatusFilter={bankStatusFilter} setBankStatusFilter={setBankStatusFilter}
                    banks={banks} filteredBanks={filteredBanks}
                    toggleBankMutation={toggleBankMutation} refetchBanks={refetchBanks}
                    onAddBank={() => { setEditingBank(null); setIsBankModalOpen(true); }}
                    onEditBank={(bank) => { setEditingBank(bank); setIsBankModalOpen(true); }}
                    onDeleteBank={(bank) => {
                      if (!window.confirm(`Delete ${bank.bankName}? This is irreversible.`)) return;
                      PrymeAPI.deleteAdminBank(bank.id)
                        .then(() => { toast.success("Bank deleted."); refetchBanks(); })
                        .catch((e: any) => toast.error(e.message));
                    }}
                  />
                )}



                {activeTab === "users" && (
                  <UsersTab 
                    users={users} isSuperAdmin={isSuperAdmin} 
                    authUser={authUser} roleMutation={roleMutation} 
                  />
                )}

                {activeTab === "company" && (
                  <CompanyTab 
                    teamMembers={teamMembers} isSuperAdmin={isSuperAdmin} 
                    authUser={authUser} roleMutation={roleMutation} 
                    deleteUserMutation={deleteUserMutation}
                  />
                )}

                {activeTab === "marketing" && (
                  <MarketingTab />
                )}

                {activeTab === "settings" && (
                  <>
                    <SettingsTab 
                      ruleStatusFilter={ruleStatusFilter} setRuleStatusFilter={setRuleStatusFilter}
                      eligibilityRules={eligibilityRules} filteredEligibilityRules={filteredEligibilityRules}
                      isSuperAdmin={isSuperAdmin} authUser={authUser}
                      setEditingEligibilityRule={setEditingEligibilityRule} setIsEligibilityModalOpen={setIsEligibilityModalOpen}
                      updateEligibilityRuleMutation={updateEligibilityRuleMutation}
                      deleteEligibilityRuleMutation={deleteEligibilityRuleMutation}
                      onViewSnapshot={(ruleId) => setSelectedSnapshotRuleId(ruleId)}
                      productStatusFilter={productStatusFilter} setProductStatusFilter={setProductStatusFilter}
                      products={products} filteredProducts={filteredProducts}
                      setSelectedProduct={setSelectedProduct} setIsOfferModalOpen={setIsOfferModalOpen}
                      toggleProductMutation={toggleProductMutation} refetchProducts={refetchProducts}
                      searchQuery={searchQuery}
                    />
                    <AdminEligibilityModal 
                      isOpen={isEligibilityModalOpen}
                      onClose={() => { setIsEligibilityModalOpen(false); setEditingEligibilityRule(null); }}
                      initialData={editingEligibilityRule}
                      onSubmit={handleEligibilitySubmit}
                    />
                  </>
                )}
              </Suspense>

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
                  <div className="flex justify-between items-center">
                    <h3 className="text-white font-medium">Application Overview</h3>
                    {!isEditingProfile && !isEmployee && (
                      <Button size="sm" variant="outline" className="h-8 border-white/[0.08] text-slate-300 hover:text-white" onClick={() => {
                        setEditProfileData({
                          fullName: selectedApp.applicant?.fullName || "",
                          phone: selectedApp.applicant?.phoneNumber || "",
                          email: selectedApp.applicant?.email || "",
                          city: selectedApp.applicant?.city || "",
                          state: selectedApp.applicant?.state || "",
                          loanType: selectedApp.loanType || "",
                          requestedAmount: selectedApp.requestedAmount || 0,
                          declaredCibilScore: selectedApp.declaredCibilScore || 0,
                          metadata: selectedApp.metadata ? { ...selectedApp.metadata } : {}
                        });
                        setIsEditingProfile(true);
                      }}>
                        Edit Details
                      </Button>
                    )}
                  </div>

                  <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex gap-3 items-start">
                    <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5" />
                    <div><h4 className="text-sm font-medium text-indigo-300">AI Risk Insight</h4><p className="text-xs text-indigo-400/80 mt-1">Applicant's declared CIBIL is {selectedApp.declaredCibilScore >= 750 ? "excellent for this product tier." : "under the optimal threshold."}</p></div>
                  </div>

                  {isEditingProfile ? (
                    <div className="p-5 border border-blue-500/30 rounded-xl space-y-4 bg-blue-500/5">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Applicant Name</label>
                        <input type="text" value={editProfileData.fullName} onChange={e => setEditProfileData({ ...editProfileData, fullName: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg p-2 text-white text-sm focus:outline-none focus:border-blue-500/40" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Email</label>
                          <input type="email" value={editProfileData.email} onChange={e => setEditProfileData({ ...editProfileData, email: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg p-2 text-white text-sm focus:outline-none focus:border-blue-500/40" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Phone</label>
                          <input type="text" value={editProfileData.phone} onChange={e => setEditProfileData({ ...editProfileData, phone: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg p-2 text-white text-sm focus:outline-none focus:border-blue-500/40" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">City</label>
                          <input type="text" value={editProfileData.city} onChange={e => setEditProfileData({ ...editProfileData, city: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg p-2 text-white text-sm focus:outline-none focus:border-blue-500/40" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">State</label>
                          <input type="text" value={editProfileData.state} onChange={e => setEditProfileData({ ...editProfileData, state: e.target.value })} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg p-2 text-white text-sm focus:outline-none focus:border-blue-500/40" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Loan Type</label>
                          <select value={editProfileData.loanType} onChange={e => setEditProfileData({ ...editProfileData, loanType: e.target.value })} className="w-full bg-[#0d0d14] border border-white/[0.08] rounded-lg p-2 text-white text-sm focus:outline-none focus:border-blue-500/40">
                            <option value="personal">Personal</option>
                            <option value="business">Business</option>
                            <option value="home">Home</option>
                            <option value="lap">LAP</option>
                            <option value="auto">Auto</option>
                            <option value="education">Education</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">Amount</label>
                          <input type="number" value={editProfileData.requestedAmount} onChange={e => setEditProfileData({ ...editProfileData, requestedAmount: Number(e.target.value) })} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg p-2 text-white text-sm focus:outline-none focus:border-blue-500/40" />
                        </div>
                        <div>
                          <label className="text-xs text-slate-400 mb-1 block">CIBIL</label>
                          <input type="number" min="-1" max="900" value={editProfileData.declaredCibilScore} onChange={e => setEditProfileData({ ...editProfileData, declaredCibilScore: Number(e.target.value) })} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg p-2 text-white text-sm focus:outline-none focus:border-blue-500/40" />
                        </div>
                      </div>

                      {/* 🧠 DYNAMIC METADATA KEY-VALUE MATRIX EDITOR */}
                      <div className="border-t border-white/[0.06] pt-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Form Metadata</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newKey = prompt("Enter metadata key name (e.g. companyName, grossSalary, existingEMI):");
                              if (newKey) {
                                const camelKey = newKey.replace(/\s+/g, "");
                                if (!camelKey) return;
                                
                                const normalizedNew = camelKey.toLowerCase();
                                const exists = Object.keys(editProfileData.metadata || {}).some(
                                  (k) => k.toLowerCase() === normalizedNew
                                );
                                
                                if (exists) {
                                  toast.error("A field with this name already exists.");
                                  return;
                                }

                                setEditProfileData({
                                  ...editProfileData,
                                  metadata: {
                                    ...editProfileData.metadata,
                                    [camelKey]: ""
                                  }
                                });
                              }
                            }}
                            className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors"
                          >
                            + Add Field
                          </button>
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                          {Object.entries(editProfileData.metadata || {}).map(([key, val]) => (
                            <div key={key} className="flex gap-2 items-end group/item">
                              <div className="flex-1 min-w-0">
                                <label className="text-[10px] text-slate-500 block mb-0.5 truncate capitalize" title={key}>
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </label>
                                <input
                                  type={typeof val === 'number' ? 'number' : 'text'}
                                  value={val === null || val === undefined ? '' : String(val)}
                                  onChange={(e) => {
                                    const rawVal = e.target.value;
                                    const newVal = rawVal !== "" && !isNaN(Number(rawVal)) && typeof val === 'number' ? Number(rawVal) : rawVal;
                                    setEditProfileData({
                                      ...editProfileData,
                                      metadata: {
                                        ...editProfileData.metadata,
                                        [key]: newVal
                                      }
                                    });
                                  }}
                                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg p-1.5 text-white text-xs focus:outline-none focus:border-blue-500/40"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedMeta = { ...editProfileData.metadata };
                                  delete updatedMeta[key];
                                  setEditProfileData({
                                    ...editProfileData,
                                    metadata: updatedMeta
                                  });
                                }}
                                className="p-1.5 bg-red-500/10 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors shrink-0 mb-0.5 opacity-0 group-hover/item:opacity-100"
                                title="Delete field"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.06]">
                        <Button size="sm" variant="ghost" onClick={() => setIsEditingProfile(false)} className="text-slate-400">Cancel</Button>
                        <Button size="sm" onClick={() => updateProfileMutation.mutate({ id: selectedApp.applicationId, payload: editProfileData })} disabled={updateProfileMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-5 border border-white/[0.06] rounded-xl grid grid-cols-2 gap-6 bg-white/[0.02]">
                        <div><p className="text-xs text-slate-500 mb-1">Requested Amount</p><p className="font-semibold text-white">{formatCurrency(selectedApp.requestedAmount)}</p></div>
                        <div><p className="text-xs text-slate-500 mb-1">Product Line</p><p className="font-semibold text-white uppercase">{selectedApp.loanType}</p></div>
                        <div><p className="text-xs text-slate-500 mb-1">CIBIL Score</p><p className={cn("font-semibold", selectedApp.declaredCibilScore === -1 ? "text-slate-400" : (selectedApp.declaredCibilScore >= 750 ? "text-blue-400" : "text-amber-400"))}>{selectedApp.declaredCibilScore === -1 ? "No History" : selectedApp.declaredCibilScore}</p></div>
                        <div><p className="text-xs text-slate-500 mb-1">Applicant Name</p><p className="font-semibold text-white truncate">{selectedApp.applicant?.fullName || selectedApp.applicant?.name || 'Unknown'}</p></div>
                        {selectedApp.applicant?.email && <div><p className="text-xs text-slate-500 mb-1">Email</p><p className="font-semibold text-white truncate">{selectedApp.applicant.email}</p></div>}
                        {selectedApp.applicant?.phoneNumber && <div><p className="text-xs text-slate-500 mb-1">Phone</p><p className="font-semibold text-white truncate">{selectedApp.applicant.phoneNumber}</p></div>}
                        {selectedApp.applicant?.city && <div><p className="text-xs text-slate-500 mb-1">Location</p><p className="font-semibold text-white truncate">{selectedApp.applicant.city}{selectedApp.applicant.state ? `, ${selectedApp.applicant.state}` : ''}</p></div>}
                      </div>

                      {selectedApp.metadata && Object.keys(selectedApp.metadata).length > 0 && (
                        <div className="p-5 border border-white/[0.06] rounded-xl bg-white/[0.02]">
                          <h4 className="text-sm font-medium text-slate-300 mb-4 border-b border-white/[0.06] pb-2">Application Form Details</h4>
                          <div className="grid grid-cols-2 gap-6">
                            {Object.entries(selectedApp.metadata).map(([key, value]) => (
                              <div key={key}>
                                <p className="text-xs text-slate-500 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <p className="font-semibold text-white truncate">{String(value)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {activeDrawerTab === "documents" && (
                <DocumentsPanel applicationId={selectedApp.applicationId} />
              )}
            </div>

            <div className="p-5 border-t border-white/[0.06] bg-[#0d0d14] grid grid-cols-2 gap-3">
              <Button disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: selectedApp.applicationId, status: "REJECTED", version: selectedApp.version })} variant="outline" className="w-full text-red-400 border-red-500/20 hover:bg-red-500/10 active:scale-95 transition-all bg-transparent">Reject Lead</Button>
              <Button disabled={statusMutation.isPending || selectedApp.status === "APPROVED"} onClick={() => statusMutation.mutate({ id: selectedApp.applicationId, status: "APPROVED", version: selectedApp.version })} className="w-full bg-gradient-to-r from-blue-500 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white shadow-lg shadow-blue-500/25 active:scale-95 transition-all">Mark Approved</Button>
            </div>
          </div>
        </div>
      )}
      
      {/* 🧠 DYNAMIC POLICY MODAL */}
      <AdminProductModal 
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        initialData={selectedProduct}
        banks={banks}
        onSubmit={(data) => {
          const apiCall = selectedProduct?.id 
            ? PrymeAPI.updateAdminProduct(selectedProduct.id, data)
            : PrymeAPI.createAdminProduct(data);
            
          apiCall
            .then(() => {
              toast.success(`Policy Entity ${selectedProduct?.id ? 'updated' : 'created'} successfully.`);
              setIsOfferModalOpen(false);
              refetchProducts();
              // Invalidate policy cache if Matrix Engine depends on it
              queryClient.invalidateQueries({ queryKey: ["policy_entities"] }); 
            })
            .catch((e: any) => toast.error(e.message || "Failed to commit entity to database."));
        }}
      />

      {/* 🧠 BANK PARTNER MODAL — Logo Upload + Crop */}
      <AdminBankModal
        isOpen={isBankModalOpen}
        onClose={() => { setIsBankModalOpen(false); setEditingBank(null); }}
        initialData={editingBank}
        onSubmit={(data) => {
          const apiCall = editingBank?.id
            ? PrymeAPI.updateAdminBank(editingBank.id, data)
            : PrymeAPI.createAdminBank(data);

          apiCall
            .then(() => {
              toast.success(`${data.bankName} ${editingBank?.id ? 'updated' : 'added to partner network'}.`);
              setIsBankModalOpen(false);
              setEditingBank(null);
              refetchBanks();
            })
            .catch((e: any) => toast.error(e.message || "Failed to save bank."));
        }}
      />

      {/* 🧠 POLICY SNAPSHOT DRAWER */}
      {selectedSnapshotRuleId !== null && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all">
          <div className="w-[600px] bg-[#0a0a10] h-full shadow-2xl flex flex-col animate-in slide-in-from-right border-l border-white/[0.06]">
            {/* Header */}
            <div className="p-6 border-b border-white/[0.06] flex items-start justify-between bg-[#0d0d14]">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-500" /> Policy 360° Snapshot
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Rule ID: {selectedSnapshotRuleId} {policySnapshot?.productCode ? `| Product: ${policySnapshot.productCode}` : ""}
                </p>
              </div>
              <button 
                onClick={() => setSelectedSnapshotRuleId(null)} 
                className="p-2 bg-white/[0.06] rounded-full border border-white/[0.08] hover:bg-white/[0.1] active:scale-95 transition-all"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 flex-1 overflow-y-auto bg-[#0a0a10] space-y-6 custom-scrollbar text-xs">
              {isLoadingSnapshot ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p>Merging eligibility rules and product database snapshot...</p>
                </div>
              ) : !policySnapshot ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  Failed to fetch merged snapshot.
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 1. Rule Identity */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-500 border-b border-white/[0.06] pb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Rule Identity
                    </h3>
                    <div className="grid grid-cols-2 gap-4 bg-slate-900/30 p-3 rounded-lg border border-white/5">
                      <div><span className="text-slate-500 block mb-0.5">Bank Partner</span><span className="text-slate-200 font-semibold">{policySnapshot.bankName || "Any Bank"}</span></div>
                      <div><span className="text-slate-500 block mb-0.5">Product Type</span><span className="text-slate-200 font-semibold">{policySnapshot.loanType || "None"}</span></div>
                      <div><span className="text-slate-500 block mb-0.5">Product Code</span><span className="text-slate-200 font-mono font-semibold">{policySnapshot.productCode}</span></div>
                      <div><span className="text-slate-500 block mb-0.5">Lender Name</span><span className="text-slate-200 font-semibold">{policySnapshot.lenderName || "N/A"}</span></div>
                    </div>
                  </div>

                  {/* 2. Applicant Gates */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-500 border-b border-white/[0.06] pb-1.5 flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> Applicant Gates
                    </h3>
                    <div className="grid grid-cols-2 gap-4 bg-slate-900/30 p-3 rounded-lg border border-white/5">
                      <div><span className="text-slate-500 block mb-0.5">Employment Type</span><span className="text-slate-200 font-medium">{policySnapshot.employmentType}</span></div>
                      <div><span className="text-slate-500 block mb-0.5">Income Type</span><span className="text-slate-200 font-medium">{policySnapshot.incomeType}</span></div>
                      <div><span className="text-slate-500 block mb-0.5">Age Limits</span><span className="text-slate-200">{policySnapshot.minAge || 0} - {policySnapshot.maxAge || 0} Years</span></div>
                      <div><span className="text-slate-500 block mb-0.5">Min Income</span><span className="text-slate-200">₹{policySnapshot.minIncome?.toLocaleString()}</span></div>
                      <div><span className="text-slate-500 block mb-0.5">Work Exp / Vintage</span><span className="text-slate-200">{policySnapshot.workExpYears || 0} Yrs (Biz: {policySnapshot.businessAgeYears || 0} Yrs)</span></div>
                      <div><span className="text-slate-500 block mb-0.5">Surrogate Type</span><span className="text-slate-200 font-semibold text-blue-400">{policySnapshot.surrogate || "None"}</span></div>
                    </div>
                  </div>

                  {/* 3. Financial Limits & Product Parameters */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-500 border-b border-white/[0.06] pb-1.5 flex items-center gap-1.5">
                      <Activity className="w-4 h-4" /> Limits & Product Parameters
                    </h3>
                    <div className="grid grid-cols-2 gap-4 bg-slate-900/30 p-3 rounded-lg border border-white/5">
                      <div><span className="text-slate-500 block mb-0.5">Allowed LTV (Rule)</span><span className="text-emerald-400 font-mono font-semibold">{((policySnapshot.ltvAllowed || 0) * 100).toFixed(2)}%</span></div>
                      <div><span className="text-slate-500 block mb-0.5">Allowed FOIR (Rule)</span><span className="text-emerald-400 font-mono font-semibold">{((policySnapshot.foirMax || 0) * 100).toFixed(2)}%</span></div>
                      <div><span className="text-slate-500 block mb-0.5">Product ROI (ROI)</span><span className="text-slate-200 font-mono">{policySnapshot.roi ? `${((policySnapshot.roi) * 100).toFixed(2)}%` : "N/A"}</span></div>
                      <div><span className="text-slate-500 block mb-0.5">Processing Fee</span><span className="text-slate-200 font-mono">{policySnapshot.processingFee ? `${((policySnapshot.processingFee) * 100).toFixed(2)}%` : "N/A"}</span></div>
                      <div><span className="text-slate-500 block mb-0.5">Tenure Range</span><span className="text-slate-200">{policySnapshot.minTenureMonths || 0} - {policySnapshot.maxTenureMonths || 0} Months</span></div>
                      <div><span className="text-slate-500 block mb-0.5">Loan Amount Range</span><span className="text-slate-200">₹{policySnapshot.minLoanAmount?.toLocaleString()} - ₹{policySnapshot.maxLoanAmount?.toLocaleString()}</span></div>
                    </div>
                  </div>

                  {/* 4. Documentation & Verifications */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-500 border-b border-white/[0.06] pb-1.5 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" /> Documentation Requirements
                    </h3>
                    <div className="grid grid-cols-2 gap-4 bg-slate-900/30 p-3 rounded-lg border border-white/5">
                      <div><span className="text-slate-500 block mb-0.5">KYC Requirements</span><span className="text-slate-200">{policySnapshot.kycRequirement || "Standard"}</span></div>
                      <div><span className="text-slate-500 block mb-0.5">Income Proof</span><span className="text-slate-200">{policySnapshot.incomeProof || "Standard"}</span></div>
                      <div><span className="text-slate-500 block mb-0.5">Bank Statement</span><span className="text-slate-200">{policySnapshot.bankStatementMonths || 0} Months</span></div>
                      <div><span className="text-slate-500 block mb-0.5">ITR Required</span><span className="text-slate-200">{policySnapshot.itrRequiredYears || 0} Yrs (Product: {policySnapshot.itrRequirementYears || 0} Yrs)</span></div>
                      <div><span className="text-slate-500 block mb-0.5">Salary Slips Required</span><span className="text-slate-200">{policySnapshot.salarySlipMonths || 0} Months</span></div>
                      <div><span className="text-slate-500 block mb-0.5">GST Required</span><span className="text-slate-200">{policySnapshot.gstRequiredMonths || 0} Months</span></div>
                    </div>
                  </div>

                  {/* 5. Risk, Restrictions & Property Rules */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-red-500 border-b border-white/[0.06] pb-1.5 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /> Risk, Restrictions & Property Rules
                    </h3>
                    <div className="grid grid-cols-2 gap-4 bg-slate-900/30 p-3 rounded-lg border border-white/5">
                      <div><span className="text-slate-500 block mb-0.5">Min CIBIL Score</span><span className="text-slate-200 font-semibold">{policySnapshot.cibilMin || "N/A"}</span></div>
                      <div><span className="text-slate-500 block mb-0.5">City Tier</span><span className="text-slate-200 font-semibold">{policySnapshot.cityTier || "All"}</span></div>
                      <div><span className="text-slate-500 block mb-0.5">PF Mandatory</span><span className="text-slate-200 font-semibold">{policySnapshot.providentFundMandatory ? "Yes" : "No"}</span></div>
                      <div><span className="text-slate-500 block mb-0.5">Allowed Property Types</span><span className="text-slate-200">{policySnapshot.propertyType || "All"}</span></div>
                      <div className="col-span-2"><span className="text-slate-500 block mb-0.5">Negative Employer Type</span><span className="text-slate-200 font-mono break-all">{policySnapshot.negativeEmployerType || "None"}</span></div>
                      <div className="col-span-2"><span className="text-slate-500 block mb-0.5">Negative Salary Mode</span><span className="text-slate-200 font-mono break-all">{policySnapshot.negativeSalaryMode || "None"}</span></div>
                      <div className="col-span-2"><span className="text-slate-500 block mb-0.5">Margin By Occupation</span><span className="text-slate-200 font-mono break-all">{policySnapshot.marginByOccupation || "None"}</span></div>
                      <div className="col-span-2"><span className="text-slate-500 block mb-0.5">Negative Property Deny-List</span><span className="text-slate-200 break-all">{policySnapshot.negativeProperty || "None"}</span></div>
                    </div>
                  </div>

                  {/* 6. Campaign & Details */}
                  {(policySnapshot.campaignName || policySnapshot.offerType) && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-500 border-b border-white/[0.06] pb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> Campaign & Special Offers
                      </h3>
                      <div className="grid grid-cols-2 gap-4 bg-slate-900/30 p-3 rounded-lg border border-white/5">
                        <div><span className="text-slate-500 block mb-0.5">Campaign Name</span><span className="text-purple-400 font-semibold">{policySnapshot.campaignName}</span></div>
                        <div><span className="text-slate-500 block mb-0.5">Offer Type</span><span className="text-purple-400 font-semibold">{policySnapshot.offerType}</span></div>
                        <div className="col-span-2"><span className="text-slate-500 block mb-0.5">Offer Details</span><span className="text-slate-200">{policySnapshot.offerDetails}</span></div>
                      </div>
                    </div>
                  )}

                  {/* 7. Internal Deviations */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-pink-500 border-b border-white/[0.06] pb-1.5 flex items-center gap-1.5">
                      <Shield className="w-4 h-4" /> Internal & Deviations
                    </h3>
                    <div className="space-y-3 bg-[#0d0d14]/60 p-4 rounded-lg border border-white/5">
                      <div>
                        <span className="text-slate-500 block mb-1">Deviation Formulae</span>
                        <pre className="p-2 bg-black/40 border border-white/5 rounded-md font-mono text-[11px] text-cyan-400 overflow-x-auto whitespace-pre-wrap">{policySnapshot.deviationFormulae || "None"}</pre>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">Rule Conditions</span>
                        <pre className="p-2 bg-black/40 border border-white/5 rounded-md font-mono text-[11px] text-purple-400 overflow-x-auto whitespace-pre-wrap">{policySnapshot.conditions || "None"}</pre>
                      </div>
                      {policySnapshot.notes && (
                        <div>
                          <span className="text-slate-500 block mb-1">Internal Memos / Notes</span>
                          <p className="text-slate-300 italic">{policySnapshot.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/[0.06] bg-[#0d0d14] flex justify-end gap-3 shrink-0">
              <Button onClick={() => setSelectedSnapshotRuleId(null)} className="bg-gradient-to-r from-blue-500 to-blue-800 hover:from-blue-800 hover:to-blue-900 text-white font-medium px-6 shadow-md">
                Close Snapshot
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;