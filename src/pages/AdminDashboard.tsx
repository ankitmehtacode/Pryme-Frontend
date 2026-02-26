import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Users, FileText, Building2, TrendingUp, Settings, 
  LogOut, Bell, Search, BarChart3, CreditCard, 
  Shield, Clock, CheckCircle, XCircle, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

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
  const { user, isAdmin, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingApplications: 12,
    approvedLoans: 45,
    totalDisbursed: 25000000,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!isLoading && user && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [user, isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data);
      setStats(prev => ({ ...prev, totalUsers: data.length }));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "applications", label: "Applications", icon: FileText },
    { id: "banks", label: "Partner Banks", icon: Building2 },
    { id: "offers", label: "Offers & Rewards", icon: CreditCard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
    { label: "Pending Applications", value: stats.pendingApplications, icon: Clock, color: "text-trust" },
    { label: "Approved Loans", value: stats.approvedLoans, icon: CheckCircle, color: "text-success" },
    { label: "Total Disbursed", value: formatCurrency(stats.totalDisbursed), icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - PYRME Consulting</title>
        <meta name="description" content="Admin dashboard for PYRME Consulting loan management." />
      </Helmet>

      <div className="min-h-screen flex bg-background">
        {/* Sidebar */}
        <aside className="w-64 neo-card border-r border-border min-h-screen p-4 hidden lg:block">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl neo-card-inset flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">PYRME</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  activeTab === item.id
                    ? "neo-card-inset text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "users" && "User Management"}
                {activeTab === "applications" && "Loan Applications"}
                {activeTab === "banks" && "Partner Banks"}
                {activeTab === "offers" && "Offers & Rewards"}
                {activeTab === "settings" && "Settings"}
              </h1>
              <p className="text-muted-foreground">
                Welcome back, Admin
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  placeholder="Search..."
                  className="neo-input border-0 pl-10 w-64"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              <Button variant="ghost" size="icon" className="neo-card">
                <Bell className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2 neo-card px-3 py-2 rounded-xl">
                <Shield className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-foreground">Admin</span>
              </div>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                  <div key={index} className="neo-card p-6 card-hover">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className={cn("w-12 h-12 rounded-xl neo-card-inset flex items-center justify-center", stat.color)}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Applications */}
              <div className="neo-card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Applications</h3>
                <div className="space-y-3">
                  {[
                    { name: "Rahul Sharma", amount: 500000, status: "pending", bank: "HDFC Bank" },
                    { name: "Priya Singh", amount: 750000, status: "approved", bank: "ICICI Bank" },
                    { name: "Amit Kumar", amount: 300000, status: "rejected", bank: "SBI" },
                    { name: "Sneha Patel", amount: 1000000, status: "pending", bank: "Axis Bank" },
                  ].map((app, index) => (
                    <div key={index} className="flex items-center justify-between p-4 neo-card-inset rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full neo-card flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{app.name}</p>
                          <p className="text-sm text-muted-foreground">{app.bank}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatCurrency(app.amount)}</p>
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full",
                          app.status === "approved" && "bg-success/10 text-success",
                          app.status === "pending" && "bg-trust/10 text-trust",
                          app.status === "rejected" && "bg-destructive/10 text-destructive"
                        )}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="neo-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">All Users</h3>
                <Button className="neo-button border-0 bg-primary">
                  Add User
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((profile) => (
                      <tr key={profile.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full neo-card-inset flex items-center justify-center">
                              <Users className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium text-foreground">
                              {profile.full_name || "No Name"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">{profile.email}</td>
                        <td className="py-4 px-4 text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {!["overview", "users"].includes(activeTab) && (
            <div className="neo-card p-12 text-center">
              <div className="w-16 h-16 mx-auto neo-card-inset rounded-full flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">
                This section is under development.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
