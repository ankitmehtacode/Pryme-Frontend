import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, formatIndianCommas, numberToIndianWords } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export const ValidatedInput = React.forwardRef<HTMLInputElement, any>(
  ({ label, error, isValid, icon: Icon, className: _className, formatAsCurrency, type, value, onChange, ...props }, ref) => {
    const isEmpty = value === "" || value === undefined || value === null;
    const words = formatAsCurrency && !isEmpty ? numberToIndianWords(Number(value)) : "";
    const handleChange = formatAsCurrency
      ? (e: React.ChangeEvent<HTMLInputElement>) => {
          const digitsOnly = e.target.value.replace(/[^0-9]/g, "");
          onChange?.({ target: { value: digitsOnly } } as React.ChangeEvent<HTMLInputElement>);
        }
      : onChange;

    return (
      <div className="relative group w-full">
        <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80 dark:text-[#103783]/80 ml-1 mb-1 block">{label}</Label>
        <div className="relative">
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <Icon className="w-4 h-4 text-muted-foreground/50" />
            </div>
          )}
          <Input
            ref={ref}
            type={formatAsCurrency ? "text" : type}
            inputMode={formatAsCurrency ? "numeric" : undefined}
            value={formatAsCurrency ? (isEmpty ? "" : formatIndianCommas(Number(value))) : value}
            onChange={handleChange}
            {...props}
            className={cn(
              "w-full bg-secondary/50 dark:bg-white/[0.03] border border-border dark:border-white/[0.06] rounded-xl h-14 px-4 text-sm font-medium text-foreground outline-none transition-all duration-200 group-hover:border-primary/20 dark:group-hover:border-white/15 focus:border-primary/60 dark:focus:border-[#103783]/50 focus:ring-2 focus:ring-inset focus:ring-primary/10 dark:focus:ring-[#103783]/10",
              Icon && "pl-11",
              error && "border-red-500/30 focus:ring-red-500/10 focus:border-red-500/50",
              isValid && !error && "border-primary/20 dark:border-[#103783]/20"
            )}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {error && (
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
                <XCircle className="w-4 h-4 text-red-500/80" />
              </motion.div>
            )}
            {isValid && !error && (
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
                <CheckCircle2 className="w-4 h-4 text-primary dark:text-[#103783]" />
              </motion.div>
            )}
          </div>
        </div>
        {words && (
          <p className="text-[10px] font-semibold text-primary/60 dark:text-[#103783]/60 ml-1 mt-1">{words}</p>
        )}
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 font-medium ml-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {error}
          </motion.p>
        )}
      </div>
    );
  }
);
ValidatedInput.displayName = "ValidatedInput";

export const StyledSelect = ({
  label, icon: Icon, value, onValueChange, placeholder, children, error
}: {
  label: string; icon?: any; value?: string; onValueChange: (v: string) => void;
  placeholder: string; children: React.ReactNode; error?: string;
}) => (
  <div className="group w-full">
    <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80 dark:text-[#103783]/80 ml-1 mb-1 block">{label}</Label>
    <Select value={value || ""} onValueChange={onValueChange}>
      <SelectTrigger className={cn(
        "relative w-full bg-secondary/50 dark:bg-white/[0.03] border border-border dark:border-white/[0.06] rounded-xl h-14 px-4 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/20 dark:hover:border-white/15 focus:border-primary/60 dark:focus:border-[#103783]/50 focus:ring-2 focus:ring-inset focus:ring-primary/10 dark:focus:ring-[#103783]/10",
        Icon && "pl-11",
        error && "border-red-500/30"
      )}>
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon className="w-4 h-4 text-muted-foreground/50" />
          </div>
        )}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-card dark:bg-[#0d1829] border-border dark:border-white/[0.06] rounded-xl">
        {children}
      </SelectContent>
    </Select>
    {error && (
      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 font-medium ml-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> {error}
      </motion.p>
    )}
  </div>
);

export const PillSelector = <T extends string>({
  label, options, value, onChange, icon: Icon
}: {
  label: string; options: { value: T; label: string; icon?: any }[];
  value: T | null; onChange: (v: T) => void; icon?: any;
}) => (
  <div className="w-full">
    <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/80 dark:text-[#103783]/80 ml-1 mb-2 flex items-center gap-2">
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </Label>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        const OptIcon = opt.icon;
        return (
          <motion.button
            key={opt.value}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(opt.value)}
            className={cn(
              "py-3.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 border flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50",
              isSelected
                ? "bg-primary dark:bg-[#103783] text-white border-primary dark:border-[#103783] shadow-lg shadow-primary/20 dark:shadow-[#103783]/20"
                : "bg-secondary/50 dark:bg-white/[0.03] text-muted-foreground border-border dark:border-white/[0.06] hover:text-foreground hover:border-primary/20 dark:hover:border-white/15"
            )}
          >
            {OptIcon && <OptIcon className="w-3.5 h-3.5" />}
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  </div>
);

export const ToggleSwitch = ({
  label, description, icon: Icon, checked, onChange
}: {
  label: string; description?: string; icon?: any; checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <motion.button
    type="button"
    whileTap={{ scale: 0.98 }}
    onClick={() => onChange(!checked)}
    className={cn(
      "w-full flex items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-300",
      checked
        ? "bg-primary/5 dark:bg-[#103783]/5 border-primary/20 dark:border-[#103783]/20"
        : "bg-secondary/30 dark:bg-white/[0.02] border-border dark:border-white/[0.06] hover:border-primary/10 dark:hover:border-white/[0.1]"
    )}
  >
    <div className="flex items-center gap-3">
      {Icon && (
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
          checked ? "bg-primary/10 dark:bg-[#103783]/10" : "bg-secondary dark:bg-white/[0.05]"
        )}>
          <Icon className={cn(
            "w-4 h-4 transition-colors",
            checked ? "text-primary dark:text-[#103783]" : "text-muted-foreground/50"
          )} />
        </div>
      )}
      <div className="text-left">
        <p className={cn(
          "text-sm font-semibold transition-colors",
          checked ? "text-foreground" : "text-muted-foreground"
        )}>{label}</p>
        {description && (
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">{description}</p>
        )}
      </div>
    </div>
    <div className={cn(
      "w-11 h-6 rounded-full relative transition-colors duration-300",
      checked ? "bg-primary dark:bg-[#103783]" : "bg-border dark:bg-white/[0.1]"
    )}>
      <motion.div
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ left: checked ? 24 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  </motion.button>
);
