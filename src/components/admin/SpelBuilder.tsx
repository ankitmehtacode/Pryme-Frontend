import React, { useState, useEffect } from "react";
import { Plus, Trash2, Code, LayoutList, Info } from "lucide-react";

const SPEL_FIELDS = [
  { id: "cibilScore", label: "CIBIL Score", type: "number" },
  { id: "loanAmount", label: "Loan Amount", type: "number" },
  { id: "propertyValue", label: "Property Value", type: "number" },
  { id: "existingEmiTotal", label: "Existing EMI Total", type: "number" },
  { id: "requestedTenureMonths", label: "Tenure (Months)", type: "number" },
  { id: "applicantAge", label: "Applicant Age", type: "number" },
  { id: "cityTier", label: "City Tier", type: "string" },
  { id: "propertyType", label: "Property Type", type: "string" },
  { id: "businessAgeYears", label: "Business Vintage", type: "number" },
  { id: "workExpYears", label: "Work Experience", type: "number" },
  { id: "employmentType", label: "Employment Type", type: "string" },
];

const OPERATORS = [
  { id: "==", label: "Equals (==)" },
  { id: "!=", label: "Not Equals (!=)" },
  { id: ">", label: "Greater Than (>)" },
  { id: ">=", label: "Greater/Equal (>=)" },
  { id: "<", label: "Less Than (<)" },
  { id: "<=", label: "Less/Equal (<=)" },
];

interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface SpelBuilderProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
}

export const SpelBuilder: React.FC<SpelBuilderProps> = ({ value, onChange, label, placeholder }) => {
  const [isVisualMode, setIsVisualMode] = useState(true);
  const [rules, setRules] = useState<Rule[]>([]);
  const [localRawValue, setLocalRawValue] = useState(value);

  // Parse DB string into Visual Rules on mount or value change
  useEffect(() => {
    setLocalRawValue(value || "");
    
    if (!value || value.trim() === "") {
      setRules([]);
      setIsVisualMode(true);
      return;
    }

    const trimmed = value.trim();
    if (!trimmed.toUpperCase().startsWith("SPEL:")) {
      setIsVisualMode(false); // It's a text memo or list
      return;
    }

    try {
      const content = trimmed.substring(5).trim();
      if (!content) {
        setRules([]);
        setIsVisualMode(true);
        return;
      }

      const ruleBlocks = content.split("&&").map(s => s.trim());
      const parsedRules: Rule[] = [];

      for (const block of ruleBlocks) {
        // Improved Regex: Allows optional spaces around operators (e.g., #loanAmount>5000)
        const match = block.match(/^#(\w+)\s*(==|!=|>|>=|<|<=)\s*(.+)$/);
        if (!match) {
          setIsVisualMode(false); // Complex SpEL, fallback to raw
          return;
        }
        
        const field = match[1];
        const operator = match[2];
        let val = match[3];

        if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1);
        }

        parsedRules.push({
          id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
          field,
          operator,
          value: val
        });
      }

      setRules(parsedRules);
      setIsVisualMode(true);
    } catch (e) {
      setIsVisualMode(false);
    }
  }, [value]);

  const updateParentFromRules = (newRules: Rule[]) => {
    if (newRules.length === 0) {
      onChange("");
      return;
    }

    const blocks = newRules.map(r => {
      const fieldDef = SPEL_FIELDS.find(f => f.id === r.field);
      let formattedVal = r.value;
      if (fieldDef?.type === "string") {
        formattedVal = `'${r.value}'`;
      }
      return `#${r.field} ${r.operator} ${formattedVal}`;
    });

    onChange(`SPEL: ${blocks.join(" && ")}`);
  };

  const addRule = () => {
    const newRules = [
      ...rules,
      { 
        id: typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9), 
        field: "loanAmount", 
        operator: ">", 
        value: "" 
      }
    ];
    setRules(newRules);
    updateParentFromRules(newRules);
  };

  const updateRule = (id: string, key: keyof Rule, val: string) => {
    const newRules = rules.map(r => r.id === id ? { ...r, [key]: val } : r);
    setRules(newRules);
    updateParentFromRules(newRules);
  };

  const removeRule = (id: string) => {
    const newRules = rules.filter(r => r.id !== id);
    setRules(newRules);
    updateParentFromRules(newRules);
  };

  const handleRawChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalRawValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-slate-400">{label}</label>
        <button
          type="button"
          onClick={() => setIsVisualMode(!isVisualMode)}
          className="flex items-center gap-1.5 px-2 py-1 bg-[#103783]/20 hover:bg-[#103783]/40 rounded text-[10px] font-medium text-blue-400 transition-colors"
        >
          {isVisualMode ? (
            <><Code className="w-3 h-3" /> Raw / Memo Mode</>
          ) : (
            <><LayoutList className="w-3 h-3" /> Visual Builder</>
          )}
        </button>
      </div>

      <div className="bg-[#0d0d14] border border-[#103783]/20 rounded-lg overflow-hidden">
        {isVisualMode ? (
          <div className="p-3 space-y-3">
            {rules.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-[#103783]/30 rounded-lg bg-slate-900/20">
                <p className="text-xs text-slate-500 mb-3">No formulas added. This rule currently passes everyone.</p>
                <button
                  type="button"
                  onClick={addRule}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-medium transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Formula Rule
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {rules.map((rule, index) => (
                  <div key={rule.id} className="flex items-center gap-2 relative">
                    {index > 0 && (
                      <div className="absolute -left-3 -top-3 bottom-1/2 w-2 border-l border-b border-[#103783]/40 rounded-bl-lg" />
                    )}
                    {index > 0 && <span className="text-[10px] font-bold text-blue-500 uppercase px-1">AND</span>}
                    
                    <select
                      value={rule.field}
                      onChange={(e) => updateRule(rule.id, "field", e.target.value)}
                      className="bg-slate-900 border border-[#103783]/30 rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500 min-w-[140px]"
                    >
                      {SPEL_FIELDS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>

                    <select
                      value={rule.operator}
                      onChange={(e) => updateRule(rule.id, "operator", e.target.value)}
                      className="bg-slate-900 border border-[#103783]/30 rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                    >
                      {OPERATORS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>

                    <input
                      type={SPEL_FIELDS.find(f => f.id === rule.field)?.type === "number" ? "number" : "text"}
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, "value", e.target.value)}
                      placeholder="Value"
                      className="flex-1 bg-slate-900 border border-[#103783]/30 rounded px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() => removeRule(rule.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={addRule}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add AND condition
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <textarea
              value={localRawValue}
              onChange={handleRawChange}
              rows={3}
              className="w-full bg-transparent border-0 px-3 py-3 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-blue-500 custom-scrollbar resize-y min-h-[80px]"
              placeholder={placeholder || "Enter SPEL: #loanAmount > 100000 or raw text memo"}
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 text-[10px] text-slate-500 bg-[#0d0d14] px-2 py-0.5 rounded">
              <Info className="w-3 h-3" />
              <span>Memo / Raw SpEL Mode</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
