import re

with open("src/components/loan/PrepaymentCalculator.tsx", "r") as f:
    content = f.read()

# 1. Hide Explainability bullet points
exp_start = r'{/* Explainability bullet points */}'
exp_code = r"""{/* Explainability bullet points */}
                {!isCompact && (
                <div className="space-y-4 mt-6 border-t border-border/50 pt-4">
                  <div>
                    <h5 className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Decision Explainability</h5>
                    <p className="text-[10px] md:text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/25 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                      {best.explainability.whyText}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Trade-offs & Constraints</h5>
                    <ul className="text-[10px] md:text-xs space-y-1.5 pl-4 list-disc text-slate-500 dark:text-slate-400 font-medium">
                      {best.explainability.tradeoffs.map((to, i) => (
                        <li key={i}>{to}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                )}"""

content = re.sub(
    r'\{\/\* Explainability bullet points \*\/\}[\s\S]*?(?=<\/div>\s*\{\/\* Prepayment vs Investment Trade-off Box \*\/})',
    exp_code + '\n              ',
    content
)

# 2. Hide Prepayment vs Investment Trade-off Box
tradeoff_start = r'{/* Prepayment vs Investment Trade-off Box */}'
tradeoff_code = r"""{/* Prepayment vs Investment Trade-off Box */}
              {!isCompact && (
              <div className="bg-white dark:bg-[#0b1224] rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 dark:border-white/5">
                <h4 className="text-[10px] md:text-xs font-bold text-[#0B1530] dark:text-white uppercase tracking-wider mb-2 md:mb-3">Prepayment vs. Investment Trade-Off</h4>
                <div className={cn("p-3 md:p-4 rounded-xl border text-[10px] md:text-xs font-medium leading-relaxed mb-1", investmentDecision.color)}>
                  {investmentDecision.text}
                </div>
              </div>
              )}"""

content = re.sub(
    r'\{\/\* Prepayment vs Investment Trade-off Box \*\/\}[\s\S]*?(?=<\/div>\s*\{\/\* Scenario Engine Comparison Matrix \*\/})',
    tradeoff_code + '\n\n              ',
    content
)

# 3. Hide Scenario Engine Comparison Matrix
matrix_start = r'{/* Scenario Engine Comparison Matrix */}'
content = content.replace(
    matrix_start,
    '{/* Scenario Engine Comparison Matrix */}\n              {!isCompact && ('
)
# The matrix ends right before "Dynamic Insights list"
content = re.sub(
    r'(<\/div>\s*)(?=\{\/\* Dynamic Insights list \*\/})',
    r'\1)}\n\n              ',
    content
)

# 4. Hide Dynamic Insights list
insights_start = r'{/* Dynamic Insights list */}'
content = content.replace(
    insights_start,
    '{/* Dynamic Insights list */}\n              {!isCompact && ('
)
# The insights list ends right before the closing div of "activeTab === recommendation"
content = re.sub(
    r'(<\/div>\s*)(?=\s*<\/div>\s*\}\)\s*\{\/\* TAB CONTENT: SENSITIVITY ANALYSIS \*\/})',
    r'\1)}\n\n            ',
    content
)


with open("src/components/loan/PrepaymentCalculator.tsx", "w") as f:
    f.write(content)

print("Updated successfully")
