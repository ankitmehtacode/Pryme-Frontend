import React, { useMemo, useState } from "react";
import { Wallet, Activity, CheckCircle2, Users, LogIn, Banknote, XCircle, TrendingUp, TrendingDown, ArrowUpRight, CalendarDays } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from "recharts";

interface OverviewTabProps {
  stats: {
    totalUsers: number;
    pendingApplications: number;
    approvedLoans: number;
    totalDisbursed: number;
    assignedCases: number;
    loggedIn: number;
    sanctioned: number;
    disbursed: number;
    rejected: number;
  };
  formatCurrency: (val: number) => string;
  portfolioData: any[];
  applications?: any[];
  // Jumps to another sidebar tab, optionally pre-filling that tab's search
  // with a term (used by Portfolio Mix segments to pre-filter the CRM
  // Pipeline down to one loan type).
  onNavigate?: (tabId: string, searchTerm?: string) => void;
  // Employee Console gets a pipeline-stage KPI breakdown instead of the
  // admin's user-base/approval metrics -- admins manage the whole org,
  // employees work their own assigned case queue.
  isEmployee?: boolean;
}

// ── Trend Time Ranges ────────────────────────────────────────────────────
type TrendRange = "7d" | "30d" | "90d" | "all";
const RANGE_OPTIONS: { label: string; value: TrendRange }[] = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "All", value: "all" },
];

// ── Date Utility ─────────────────────────────────────────────────────────
const getDaysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatShortDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
};

// ── Custom Tooltip ───────────────────────────────────────────────────────
const TrendTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111118]/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 shadow-2xl shadow-black/40">
      <p className="text-[11px] font-medium text-slate-400 mb-2">{formatShortDate(label)}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-300">{entry.name}:</span>
          <span className="text-white font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export const OverviewTab: React.FC<OverviewTabProps> = ({ stats, formatCurrency, portfolioData, applications = [], onNavigate, isEmployee = false }) => {
  const [trendRange, setTrendRange] = useState<TrendRange>("30d");

  // ── Aggregate applications into daily time-series ──────────────────────
  const { trendData, trendMetrics } = useMemo(() => {
    if (!applications.length) {
      return { trendData: [], trendMetrics: { velocity: 0, conversionRate: 0, avgTicket: 0, trend: "flat" as const } };
    }

    // Determine date cutoff
    const now = new Date();
    let cutoff: Date;
    switch (trendRange) {
      case "7d":  cutoff = getDaysAgo(7);  break;
      case "30d": cutoff = getDaysAgo(30); break;
      case "90d": cutoff = getDaysAgo(90); break;
      default:    cutoff = new Date(0);    break;
    }

    // Filter to range
    const rangedApps = applications.filter((a: any) => {
      const d = new Date(a.createdAt);
      return d >= cutoff && d <= now;
    });

    // Bucket by day
    const buckets: Record<string, { leads: number; approved: number; rejected: number; volume: number }> = {};
    rangedApps.forEach((app: any) => {
      const day = new Date(app.createdAt).toISOString().split("T")[0];
      if (!buckets[day]) buckets[day] = { leads: 0, approved: 0, rejected: 0, volume: 0 };
      buckets[day].leads += 1;
      if (["SANCTIONED", "DISBURSED"].includes(app.status)) {
        buckets[day].approved += 1;
        buckets[day].volume += app.requestedAmount || 0;
      }
      if (["REJECTED", "DECLINED"].includes(app.status)) {
        buckets[day].rejected += 1;
      }
    });

    // Fill gaps — generate a continuous date series
    const sortedDays = Object.keys(buckets).sort();
    if (sortedDays.length === 0) {
      return { trendData: [], trendMetrics: { velocity: 0, conversionRate: 0, avgTicket: 0, trend: "flat" as const } };
    }

    const startDate = trendRange === "all" ? new Date(sortedDays[0]) : cutoff;
    const endDate = now;
    const filledData: { date: string; Leads: number; Approved: number; Rejected: number; volume: number }[] = [];

    const cursor = new Date(startDate);
    while (cursor <= endDate) {
      const key = cursor.toISOString().split("T")[0];
      const bucket = buckets[key] || { leads: 0, approved: 0, rejected: 0, volume: 0 };
      filledData.push({
        date: key,
        Leads: bucket.leads,
        Approved: bucket.approved,
        Rejected: bucket.rejected,
        volume: bucket.volume,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    // Compute trend metrics
    const totalLeads = filledData.reduce((s, d) => s + d.Leads, 0);
    const totalApproved = filledData.reduce((s, d) => s + d.Approved, 0);
    const totalVolume = filledData.reduce((s, d) => s + d.volume, 0);
    const activeDays = filledData.filter(d => d.Leads > 0).length || 1;
    const velocity = Math.round((totalLeads / activeDays) * 10) / 10;
    const conversionRate = totalLeads > 0 ? Math.round((totalApproved / totalLeads) * 1000) / 10 : 0;
    const avgTicket = totalApproved > 0 ? Math.round(totalVolume / totalApproved) : 0;

    // Trend direction: compare first half vs second half lead counts
    const mid = Math.floor(filledData.length / 2);
    const firstHalf = filledData.slice(0, mid).reduce((s, d) => s + d.Leads, 0);
    const secondHalf = filledData.slice(mid).reduce((s, d) => s + d.Leads, 0);
    const trend = secondHalf > firstHalf * 1.1 ? "up" as const : secondHalf < firstHalf * 0.9 ? "down" as const : "flat" as const;

    return {
      trendData: filledData,
      trendMetrics: { velocity, conversionRate, avgTicket, trend },
    };
  }, [applications, trendRange]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      {/* Employee Console gets a 6-card pipeline-stage breakdown (its own
          assigned case queue); Admin keeps the 4-card org-wide summary. */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${isEmployee ? "xl:grid-cols-6" : ""}`}>
        {(isEmployee ? [
          { label: "Total Volume", value: formatCurrency(stats.totalDisbursed), icon: Wallet, glow: "from-blue-500/20 to-blue-500/0", tab: "applications" },
          { label: "Assigned Cases", value: stats.assignedCases, icon: Activity, glow: "from-blue-500/20 to-blue-500/0", tab: "applications" },
          { label: "Logged In", value: stats.loggedIn, icon: LogIn, glow: "from-blue-700/20 to-blue-700/0", tab: "applications" },
          { label: "Sanctioned", value: stats.sanctioned, icon: CheckCircle2, glow: "from-emerald-500/20 to-emerald-500/0", tab: "applications" },
          { label: "Disbursed", value: stats.disbursed, icon: Banknote, glow: "from-amber-500/20 to-amber-500/0", tab: "applications" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, glow: "from-red-500/20 to-red-500/0", tab: "applications" },
        ] : [
          { label: "Total Volume", value: formatCurrency(stats.totalDisbursed), icon: Wallet, glow: "from-blue-500/20 to-blue-500/0", tab: "applications" },
          { label: "Active Leads", value: stats.pendingApplications, icon: Activity, glow: "from-blue-500/20 to-blue-500/0", tab: "applications" },
          { label: "Approvals", value: stats.approvedLoans, icon: CheckCircle2, glow: "from-blue-700/20 to-blue-700/0", tab: "applications" },
          { label: "User Base", value: stats.totalUsers, icon: Users, glow: "from-amber-500/20 to-amber-500/0", tab: "users" }
        ]).map((metric, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onNavigate?.(metric.tab)}
            className="relative bg-[#0d0d14] p-5 rounded-2xl border border-white/[0.06] hover:border-white/[0.12] hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group cursor-pointer overflow-hidden text-left w-full"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${metric.glow} rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/[0.08] group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all"><metric.icon className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" /></div>
              <ArrowUpRight className="w-4 h-4 text-slate-700 opacity-0 group-hover:opacity-100 group-hover:text-blue-400 transition-all duration-300 relative z-10" />
            </div>
            <p className="text-sm font-medium text-slate-500 relative z-10 truncate">{metric.label}</p>
            <p
              className="text-xl xl:text-lg 2xl:text-2xl font-semibold text-white mt-1 relative z-10 truncate"
              title={String(metric.value)}
            >
              {metric.value}
            </p>
          </button>
        ))}
      </div>

      {/* ── Trend Chart + Portfolio ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Historical Trend Engine */}
        <div className="lg:col-span-2 bg-[#0d0d14] rounded-2xl border border-white/[0.06] flex flex-col overflow-hidden">
          {/* Chart Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-400" />
                Pipeline Activity
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Lead intake, approvals & rejections over time</p>
            </div>
            {/* Range Selector */}
            <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
              {RANGE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTrendRange(opt.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                    trendRange === opt.value
                      ? "bg-blue-500/20 text-blue-400 shadow-sm shadow-blue-500/10"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Area */}
          <div className="flex-1 px-4 pb-4 min-h-[260px]">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradRejected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickFormatter={(v) => {
                      const d = new Date(v);
                      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
                    }}
                    interval={trendRange === "7d" ? 0 : trendRange === "30d" ? 4 : trendRange === "90d" ? 13 : "preserveStartEnd"}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip content={<TrendTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
                  <Area type="monotone" dataKey="Leads" stroke="#3b82f6" strokeWidth={2} fill="url(#gradLeads)" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: '#3b82f6', fill: '#0d0d14' }} />
                  <Area type="monotone" dataKey="Approved" stroke="#10b981" strokeWidth={1.5} fill="url(#gradApproved)" dot={false} activeDot={{ r: 3, strokeWidth: 2, stroke: '#10b981', fill: '#0d0d14' }} />
                  <Area type="monotone" dataKey="Rejected" stroke="#ef4444" strokeWidth={1.5} fill="url(#gradRejected)" dot={false} activeDot={{ r: 3, strokeWidth: 2, stroke: '#ef4444', fill: '#0d0d14' }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                <p>No application data in this range</p>
              </div>
            )}
          </div>

          {/* Trend Metrics Bar */}
          <div className="grid grid-cols-3 border-t border-white/[0.06]">
            {[
              {
                label: "Lead Velocity",
                value: `${trendMetrics.velocity}/day`,
                icon: trendMetrics.trend === "up" ? TrendingUp : trendMetrics.trend === "down" ? TrendingDown : ArrowUpRight,
                color: trendMetrics.trend === "up" ? "text-emerald-400" : trendMetrics.trend === "down" ? "text-red-400" : "text-slate-400",
              },
              {
                label: "Conversion Rate",
                value: `${trendMetrics.conversionRate}%`,
                icon: CheckCircle2,
                color: trendMetrics.conversionRate >= 30 ? "text-emerald-400" : trendMetrics.conversionRate >= 15 ? "text-amber-400" : "text-red-400",
              },
              {
                label: "Avg Ticket",
                value: formatCurrency(trendMetrics.avgTicket),
                icon: Wallet,
                color: "text-blue-400",
              }
            ].map((m, i) => (
              <div key={i} className={`flex items-center gap-2.5 px-5 py-3.5 ${i < 2 ? "border-r border-white/[0.06]" : ""}`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{m.label}</p>
                  <p className={`text-sm font-semibold ${m.color}`}>{m.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Mix */}
        <div className="bg-[#0d0d14] p-6 rounded-2xl border border-white/[0.06] flex flex-col">
          <h3 className="font-semibold text-white mb-4">Portfolio Mix</h3>
          <div className="flex-1">
          {portfolioData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  cursor="pointer"
                  onClick={(entry: any) => onNavigate?.("applications", entry.name)}
                  label={({ name, value, count, cx, cy, midAngle, outerRadius: oR }: any) => {
                    const RADIAN = Math.PI / 180;
                    const radius = oR + 18;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text x={x} y={y} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fill="#94a3b8" fontSize={11} fontWeight={500}>
                        {count} ({value}%)
                      </text>
                    );
                  }}
                  labelLine={false}
                >
                  {portfolioData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />)}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#e2e8f0', fontSize: '12px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value: any, name: any, props: any) => [`${props.payload.count} (${value}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">No data available</div>
          )}
          </div>
          {/* Custom legend below chart */}
          {portfolioData.length > 0 && (
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 pt-2 border-t border-white/[0.04]">
              {portfolioData.map((entry, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onNavigate?.("applications", entry.name)}
                  className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-slate-400">{entry.name}</span>
                  <span className="text-xs text-slate-600">{entry.count} ({entry.value}%)</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
