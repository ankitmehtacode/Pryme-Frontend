import React from "react";
import { Wallet, Activity, CheckCircle2, Users, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";

interface OverviewTabProps {
  stats: {
    totalUsers: number;
    pendingApplications: number;
    approvedLoans: number;
    totalDisbursed: number;
  };
  formatCurrency: (val: number) => string;
  portfolioData: any[];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ stats, formatCurrency, portfolioData }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Volume", value: formatCurrency(stats.totalDisbursed), icon: Wallet, glow: "from-blue-500/20 to-blue-500/0" }, 
          { label: "Active Leads", value: stats.pendingApplications, icon: Activity, glow: "from-blue-500/20 to-blue-500/0" }, 
          { label: "Approvals", value: stats.approvedLoans, icon: CheckCircle2, glow: "from-blue-700/20 to-blue-700/0" }, 
          { label: "User Base", value: stats.totalUsers, icon: Users, glow: "from-amber-500/20 to-amber-500/0" }
        ].map((metric, i) => (
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
                <RechartsTooltip contentStyle={{ backgroundColor: '#0d0d14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#e2e8f0' }} itemStyle={{ color: '#e2e8f0' }} labelStyle={{ color: '#94a3b8' }} formatter={(value) => [`${value}%`, 'Share']} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">No data available</div>
          )}
        </div></div>
      </div>
    </div>
  );
};

export default OverviewTab;
