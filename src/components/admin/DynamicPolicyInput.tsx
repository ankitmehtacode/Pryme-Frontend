import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldMetadata } from "@/lib/validations/policySchema";

interface Props {
  metadata: FieldMetadata;
  value: any;
  onChange: (val: any) => void;
}

export const DynamicPolicyInput = ({ metadata, value, onChange }: Props) => {
  // 🧠 FAILPROOF: Enforce boundaries before the user can even type invalid data
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (metadata.absoluteUpperBound && val > metadata.absoluteUpperBound) val = metadata.absoluteUpperBound;
    if (metadata.absoluteLowerBound && val < metadata.absoluteLowerBound) val = metadata.absoluteLowerBound;
    onChange(val);
  };

  switch (metadata.fieldType) {
    case "BOOLEAN":
      return <Switch checked={Boolean(value)} onCheckedChange={onChange} />;
      
    case "ENUM_LIST":
      const options = metadata.allowedValues?.split(",") || [];
      return (
        <Select value={String(value)} onValueChange={onChange}>
          <SelectTrigger className="w-full bg-white/[0.04] border-white/[0.08] text-white">
            <SelectValue placeholder="Select rule..." />
          </SelectTrigger>
          <SelectContent>
            {options.map(opt => (
              <SelectItem key={opt} value={opt}>{opt.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      
    case "PERCENTAGE":
    case "NUMERIC_RANGE":
    case "INTEGER":
      return (
        <div className="relative">
          <Input 
            type="number" 
            value={value || ''} 
            onChange={handleNumberChange}
            className="bg-white/[0.04] border-white/[0.08] text-white pr-12 font-mono"
            step={metadata.fieldType === "PERCENTAGE" ? "0.01" : "1"}
          />
          {metadata.unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium">
              {metadata.unit}
            </span>
          )}
        </div>
      );
      
    default:
      return <Input value={value || ''} onChange={(e) => onChange(e.target.value)} />;
  }
};
