import re

with open("src/components/loan/PrepaymentCalculator.tsx", "r") as f:
    content = f.read()

# Add inputTab state
state_to_add = """
  const [activeTab, setActiveTab] = useState<"recommendation" | "sensitivity" | "schedule">("recommendation");
  const [inputTab, setInputTab] = useState<"loan" | "financials" | "windfalls">("loan");
"""
content = re.sub(r'const \[activeTab, setActiveTab\] = useState[^;]+;', state_to_add.strip(), content)

# Change grid layout
grid_find = r'className={cn\("grid gap-8 items-start", isCompact \? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"\)}'
grid_replace = r'className={cn("grid gap-4 md:gap-6 items-stretch w-full", isCompact ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-12")}'
content = content.replace(grid_find, grid_replace)

# We need to completely rewrite the LEFT COLUMN rendering to use tabs.
# We will use regex or string split to replace everything inside the LEFT COLUMN.

left_col_start = r'{/* LEFT COLUMN: Setup panel */}'
right_col_start = r'{/* RIGHT COLUMN: Optimization results */}'

parts = content.split(left_col_start)
prefix = parts[0]
middle_and_end = parts[1].split(right_col_start)

left_col_new = """{/* LEFT COLUMN: Setup panel */}
        <div className={cn("flex flex-col w-full space-y-4 min-w-0", isCompact ? "" : "lg:col-span-4")}>
          
          {/* Input Tabs */}
          <div className="flex border-b border-border dark:border-white/5 gap-2 md:gap-4 overflow-x-auto hide-scrollbar shrink-0">
            {[
              { id: "loan" as const, label: "Loan Profile", icon: Activity },
              { id: "financials" as const, label: "Financials", icon: Zap },
              { id: "windfalls" as const, label: "Windfalls", icon: Percent }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setInputTab(tab.id)}
                  className={cn(
                    "pb-2 md:pb-3 text-[10px] md:text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap px-1 flex items-center gap-1.5",
                    inputTab === tab.id
                      ? "border-primary text-primary dark:text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="bg-secondary/15 dark:bg-[#0d1829]/35 rounded-2xl p-4 md:p-5 border border-transparent shadow-none transition-all flex-1 min-h-[420px]">
            {inputTab === "loan" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                {/* Loan Amount */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-4 gap-2">
                    <label className="text-[10px] font-bold text-primary dark:text-primary uppercase tracking-wider">Loan Principal (₹)</label>
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="text-sm md:text-base font-bold text-foreground bg-secondary/40 dark:bg-black/10 px-3 py-1.5 rounded-lg border border-transparent shadow-none w-32 text-right focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <Slider
                    value={[loanAmount]}
                    onValueChange={(v) => setLoanAmount(v[0])}
                    min={500000}
                    max={50000000}
                    step={100000}
                    className="py-1 cursor-pointer"
                  />
                  <div className="flex justify-between mt-3">
                    <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">₹5L</span>
                    <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">₹5Cr</span>
                  </div>
                </div>

                {/* Interest Rate */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-4 gap-2">
                    <label className="text-[10px] font-bold text-primary dark:text-primary uppercase tracking-wider">Interest Rate (% p.a.)</label>
                    <input
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="text-sm md:text-base font-bold text-foreground bg-secondary/40 dark:bg-black/10 px-3 py-1.5 rounded-lg border border-transparent shadow-none w-24 text-right focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <Slider
                    value={[interestRate]}
                    onValueChange={(v) => setInterestRate(v[0])}
                    min={6}
                    max={24}
                    step={0.1}
                    className="py-1 cursor-pointer"
                  />
                  <div className="flex justify-between mt-3">
                    <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">6%</span>
                    <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">24%</span>
                  </div>
                </div>

                {/* Tenure */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-4 gap-2">
                    <label className="text-[10px] font-bold text-primary dark:text-primary uppercase tracking-wider">Tenure (Months)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={tenureMonths}
                        onChange={(e) => setTenureMonths(Number(e.target.value))}
                        className="text-sm md:text-base font-bold text-foreground bg-secondary/40 dark:bg-black/10 px-3 py-1.5 rounded-lg border border-transparent shadow-none w-24 text-right focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:inline-block">({(tenureMonths / 12).toFixed(1)} Y)</span>
                    </div>
                  </div>
                  <Slider
                    value={[tenureMonths]}
                    onValueChange={(v) => setTenureMonths(v[0])}
                    min={12}
                    max={360}
                    step={12}
                    className="py-1 cursor-pointer"
                  />
                  <div className="flex justify-between mt-3">
                    <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">1 Yr</span>
                    <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">30 Yrs</span>
                  </div>
                </div>
              </div>
            )}

            {inputTab === "financials" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary dark:text-primary uppercase tracking-wider">Primary Goal Profile</label>
                  <select
                    value={primaryGoal}
                    onChange={(e) => setPrimaryGoal(e.target.value as GoalType)}
                    className="w-full bg-secondary/40 dark:bg-black/10 border border-transparent rounded-lg px-3 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="max-savings">Save Maximum Interest</option>
                    <option value="earliest-payoff">Debt-Free ASAP</option>
                    <option value="preserve-liquidity">Preserve Liquid Reserves</option>
                    <option value="stress-free">Minimize Financial Stress</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary dark:text-primary uppercase tracking-wider">Monthly Income</label>
                    <input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                      className="w-full bg-secondary/40 dark:bg-black/10 border border-transparent rounded-lg p-2.5 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-primary dark:text-primary uppercase tracking-wider">Monthly Expenses</label>
                    <input
                      type="number"
                      value={monthlyExpenses}
                      onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                      className="w-full bg-secondary/40 dark:bg-black/10 border border-transparent rounded-lg p-2.5 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center mb-4 gap-2">
                    <label className="text-[10px] font-bold text-primary dark:text-primary uppercase tracking-wider">Comfortable Extra/Mo</label>
                    <input
                      type="number"
                      value={comfortableExtra}
                      onChange={(e) => setComfortableExtra(Number(e.target.value))}
                      className="text-sm md:text-base font-bold text-foreground bg-secondary/40 dark:bg-black/10 px-3 py-1.5 rounded-lg border border-transparent shadow-none w-28 text-right focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <Slider
                    value={[comfortableExtra]}
                    onValueChange={(v) => setComfortableExtra(v[0])}
                    min={0}
                    max={200000}
                    step={1000}
                    className="py-1 cursor-pointer"
                  />
                  <div className="flex justify-between mt-3">
                    <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">₹0</span>
                    <span className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider">₹2L</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-primary dark:text-primary uppercase tracking-wider">Emergency Reserves</label>
                  <select
                    value={emergencySavings}
                    onChange={(e) => setEmergencySavings(e.target.value as EmergencySavingsTier)}
                    className="w-full bg-secondary/40 dark:bg-black/10 border border-transparent rounded-lg px-3 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="less-3">&lt; 3 Months</option>
                    <option value="3-6">3-6 Months (Safe)</option>
                    <option value="6-12">6-12 Months (Strong)</option>
                    <option value="12-plus">12+ Months</option>
                  </select>
                </div>
              </div>
            )}

            {inputTab === "windfalls" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-4 gap-2">
                    <label className="text-[10px] font-bold text-primary dark:text-primary uppercase tracking-wider">Expected Market Return (%)</label>
                    <input
                      type="number"
                      value={expectedReturn}
                      onChange={(e) => setExpectedReturn(Number(e.target.value))}
                      className="text-sm md:text-base font-bold text-blue-600 dark:text-blue-400 bg-secondary/40 dark:bg-black/10 px-3 py-1.5 rounded-lg border border-transparent shadow-none w-24 text-right focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <Slider
                    value={[expectedReturn]}
                    onValueChange={(v) => setExpectedReturn(v[0])}
                    min={4}
                    max={20}
                    step={0.5}
                    className="py-1 cursor-pointer [&>span]:bg-blue-500"
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-border dark:border-white/5">
                  <label className="text-[10px] font-bold text-primary dark:text-primary uppercase tracking-wider block">Scheduled Bonuses</label>
                  
                  <div className="flex flex-col gap-3 p-3.5 bg-secondary/40 dark:bg-black/10 rounded-xl border border-transparent">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hasAnnualBonus}
                        onChange={(e) => setHasAnnualBonus(e.target.checked)}
                        className="cursor-pointer focus:ring-emerald-500 text-emerald-600 rounded"
                      />
                      <span className="text-xs font-bold text-foreground">Annual Bonus (M12)</span>
                    </div>
                    {hasAnnualBonus && (
                      <input
                        type="number"
                        value={annualBonusAmount}
                        onChange={(e) => setAnnualBonusAmount(Number(e.target.value))}
                        className="w-full bg-background border border-border dark:border-white/10 rounded-lg p-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-3 p-3.5 bg-secondary/40 dark:bg-black/10 rounded-xl border border-transparent">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hasFestivalBonus}
                        onChange={(e) => setHasFestivalBonus(e.target.checked)}
                        className="cursor-pointer focus:ring-emerald-500 text-emerald-600 rounded"
                      />
                      <span className="text-xs font-bold text-foreground">Festival Bonus (M8)</span>
                    </div>
                    {hasFestivalBonus && (
                      <input
                        type="number"
                        value={festivalBonusAmount}
                        onChange={(e) => setFestivalBonusAmount(Number(e.target.value))}
                        className="w-full bg-background border border-border dark:border-white/10 rounded-lg p-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
"""

# Modify Right Col slightly to remove isCompact checks that mess up the layout since now it's responsive.
# We also want the outer container to match EMICalculator.
outer_replace_old = r'"w-full bg-[#edf4ff] dark:bg-[#0b1021] rounded-[2rem] border border-slate-200/80 dark:border-[#103783]/20 shadow-xl overflow-hidden",'
outer_replace_new = r'"bg-card text-card-foreground border border-transparent dark:bg-[#080d1e] dark:border-transparent rounded-2xl md:rounded-[2rem] p-4 md:p-6 lg:p-7 shadow-xl dark:shadow-2xl relative overflow-hidden transition-all flex flex-col min-w-0 w-full",'

right_col_new = middle_and_end[1]
# Fix the right col classes to fill space and look good in both modes
right_col_new = right_col_new.replace(
    """<div className={cn("space-y-4 md:space-y-6", isCompact ? "" : "lg:col-span-8")}>""",
    """{/* RIGHT COLUMN: Optimization results */}
        <div className={cn("flex flex-col space-y-4 md:space-y-6 min-w-0 w-full", isCompact ? "" : "lg:col-span-8")}>"""
)
# Match right col box background with EMI left col bg (if we want) or keep it as is.
# Let's just put it together.

new_content = prefix + left_col_new + right_col_new
new_content = new_content.replace(outer_replace_old, outer_replace_new)
new_content = new_content.replace('isCompact ? "p-4 md:p-6" : "", // The full page doesn\'t need its own box usually, but we will make it clean', '""')

with open("src/components/loan/PrepaymentCalculator.tsx", "w") as f:
    f.write(new_content)

print("Updated successfully")
