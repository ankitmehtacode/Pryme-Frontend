import React from "react";
import { FieldMetadata } from "@/lib/validations/policySchema";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DynamicPolicyInputProps {
  metadata: FieldMetadata;
  value: any;
  onChange: (newValue: any) => void;
}

export const DynamicPolicyInput: React.FC<DynamicPolicyInputProps> = ({
  metadata,
  value,
  onChange,
}) => {
  // Safe clamping function for numerics
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value;
    
    // Allow empty string to let user backspace
    if (rawVal === "") {
      onChange(rawVal);
      return;
    }

    let numericVal = parseFloat(rawVal);
    if (isNaN(numericVal)) return;

    if (metadata.fieldType === "INTEGER") {
      numericVal = Math.floor(numericVal);
    }

    // Failproof Guardrail: Clamping
    if (metadata.absoluteUpperBound !== null && metadata.absoluteUpperBound !== undefined) {
      if (numericVal > metadata.absoluteUpperBound) numericVal = metadata.absoluteUpperBound;
    }
    if (metadata.absoluteLowerBound !== null && metadata.absoluteLowerBound !== undefined) {
      if (numericVal < metadata.absoluteLowerBound) numericVal = metadata.absoluteLowerBound;
    }

    onChange(numericVal.toString());
  };

  const renderInput = () => {
    switch (metadata.fieldType) {
      case "BOOLEAN":
        return (
          <Switch
            checked={value === "true" || value === true}
            onCheckedChange={(checked) => onChange(checked ? "true" : "false")}
          />
        );

      case "ENUM_LIST":
        return (
          <Select value={value?.toString()} onValueChange={onChange}>
            <SelectTrigger className="w-full bg-slate-950 border-[#103783]/20 text-slate-100">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="bg-[#0a1530] border-[#103783]/20 text-slate-100">
              {metadata.options?.map((opt) => (
                <SelectItem key={opt} value={opt} className="focus:bg-slate-800 focus:text-slate-100">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "PERCENTAGE":
      case "NUMERIC_RANGE":
      case "INTEGER":
      default:
        return (
          <div className="relative">
            <Input
              type="number"
              value={value}
              onChange={handleNumericChange}
              className="pr-8 bg-slate-950 border-[#103783]/20 text-slate-100 focus-visible:ring-blue-500 w-full"
              step={metadata.fieldType === "INTEGER" ? "1" : "0.01"}
            />
            {metadata.fieldType === "PERCENTAGE" && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                %
              </span>
            )}
            {metadata.unit && metadata.fieldType !== "PERCENTAGE" && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">
                {metadata.unit}
              </span>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium text-slate-300">
        {metadata.displayName}
      </Label>
      {renderInput()}
    </div>
  );
};
