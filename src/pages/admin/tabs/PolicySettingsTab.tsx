import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PrymeAPI } from "@/lib/api";
import { FieldMetadata } from "@/lib/validations/policySchema";
import { DynamicPolicyInput } from "@/components/admin/DynamicPolicyInput";
import { PolicyAuditModal } from "@/components/admin/PolicyAuditModal";
import { usePolicyUpdate } from "@/hooks/usePolicyUpdate";
import { Loader2, Save, FileText, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PolicyEntity {
  id: string; // e.g., "LNT_LAP_GST"
  name: string; // e.g., "L&T Finance -> LAP -> GST Program"
  entityType: string;
}

// 🧠 INDIVIDUAL FIELD CONTROLLER
// Independently queries its own value and manages local unsaved state.
const PolicyFieldEditor = ({
  entityId,
  entityType,
  metadata,
  onStageChange,
}: {
  entityId: string;
  entityType: string;
  metadata: FieldMetadata;
  onStageChange: (metadata: FieldMetadata, oldVal: string, newVal: string) => void;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["policy_value", entityId, metadata.fieldKey],
    queryFn: async () => PrymeAPI.getPolicyValue(entityId, metadata.fieldKey),
  });

  const [localValue, setLocalValue] = useState<any>(undefined);

  // Hydrate local state once data arrives
  React.useEffect(() => {
    if (data?.value !== undefined && localValue === undefined) {
      setLocalValue(data.value);
    }
  }, [data?.value, localValue]);

  const valueToDisplay = localValue !== undefined ? localValue : data?.value;
  const isDirty = data?.value !== undefined && String(localValue) !== String(data?.value);

  if (isLoading) return <div className="h-[72px] w-full animate-pulse bg-[#0a1530] rounded-lg border border-[#103783]/20/50" />;

  return (
    <div className={`flex items-end gap-4 p-5 rounded-lg border transition-colors ${isDirty ? 'bg-blue-950/20 border-blue-900/50' : 'bg-[#0A0A0F] border-[#103783]/20/50'}`}>
      <div className="flex-1">
        <DynamicPolicyInput
          metadata={metadata}
          value={valueToDisplay ?? ""}
          onChange={setLocalValue}
        />
      </div>
      <Button
        disabled={!isDirty}
        onClick={() => onStageChange(metadata, String(data?.value), String(localValue))}
        size="sm"
        className="bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-none h-10"
      >
        <Save className="w-4 h-4 mr-2" />
        Stage
      </Button>
    </div>
  );
};

export const PolicySettingsTab = () => {
  const [selectedEntity, setSelectedEntity] = useState<PolicyEntity | null>(null);
  const [auditMetadata, setAuditMetadata] = useState<FieldMetadata | null>(null);
  const [auditOldVal, setAuditOldVal] = useState<string>("");
  const [auditNewVal, setAuditNewVal] = useState<string>("");

  const policyMutation = usePolicyUpdate();

  // LEFT COLUMN: Fetch Combinations
  const { data: entities, isLoading: isLoadingEntities } = useQuery({
    queryKey: ["policy_entities"],
    queryFn: async () => PrymeAPI.getPolicyEntities() as Promise<PolicyEntity[]>,
  });

  // RIGHT COLUMN: Fetch Definitions for the selected entity type
  const { data: fieldDefinitions, isLoading: isLoadingDefs } = useQuery({
    queryKey: ["field_definitions", selectedEntity?.entityType],
    queryFn: async () => PrymeAPI.getFieldDefinitions(selectedEntity!.entityType) as Promise<FieldMetadata[]>,
    enabled: !!selectedEntity,
  });

  const handleStageChange = (metadata: FieldMetadata, oldVal: string, newVal: string) => {
    setAuditMetadata(metadata);
    setAuditOldVal(oldVal);
    setAuditNewVal(newVal);
  };

  const handleCommitToMatrix = (reason: string) => {
    if (!selectedEntity || !auditMetadata) return;

    policyMutation.mutate({
      entityType: selectedEntity.entityType,
      entityId: selectedEntity.id,
      fieldKey: auditMetadata.fieldKey,
      newValue: auditNewVal,
      reason,
    });

    setAuditMetadata(null); // Close modal
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[70vh] gap-6 p-6">
      {/* LEFT COLUMN: Entity Selector */}
      <div className="w-full md:w-1/3 flex flex-col gap-4 border-r border-[#103783]/20 pr-6">
        <div className="flex items-center gap-2 pb-4 border-b border-[#103783]/20">
          <FileText className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-bold text-slate-100 tracking-tight">Policy Matrix</h2>
        </div>

        {isLoadingEntities ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-2 pr-2">
            {entities?.map((entity) => (
              <button
                key={entity.id}
                onClick={() => setSelectedEntity(entity)}
                className={`text-left p-4 rounded-lg border transition-all duration-200 ${
                  selectedEntity?.id === entity.id
                    ? "bg-blue-600/10 border-blue-500/30 text-blue-400"
                    : "bg-[#0a1530] border-[#103783]/20 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                <div className="text-sm font-semibold">{entity.name}</div>
                <div className="text-xs mt-1 opacity-60">Type: {entity.entityType}</div>
              </button>
            ))}
            {(!entities || entities.length === 0) && (
              <div className="text-sm text-slate-500 py-4 text-center">No matrix entities found.</div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Field Editors */}
      <div className="w-full md:w-2/3 flex flex-col gap-4">
        {!selectedEntity ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-[#103783]/20 rounded-xl bg-slate-900/20">
            <Activity className="w-10 h-10 mb-4 opacity-50 text-blue-500" />
            <p>Select a bank/product combination to view and modify its matrix parameters.</p>
          </div>
        ) : (
          <>
            <div className="pb-4 border-b border-[#103783]/20 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-100">{selectedEntity.name}</h3>
                <p className="text-sm text-slate-500">Modify active parameters below. Changes are audited.</p>
              </div>
            </div>

            {isLoadingDefs ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-slate-500 animate-spin" />
              </div>
            ) : fieldDefinitions?.length === 0 ? (
              <Alert className="bg-[#0a1530] border-[#103783]/20">
                <AlertTitle className="text-slate-200 font-semibold">No Definitions</AlertTitle>
                <AlertDescription className="text-slate-400">
                  No configurable fields found for {selectedEntity.entityType}.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 gap-4 pr-2">
                {fieldDefinitions?.map((meta) => (
                  <PolicyFieldEditor
                    key={meta.fieldKey}
                    entityId={selectedEntity.id}
                    entityType={selectedEntity.entityType}
                    metadata={meta}
                    onStageChange={handleStageChange}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* BLAST RADIUS INTERCEPTOR */}
      <PolicyAuditModal
        isOpen={!!auditMetadata}
        onClose={() => setAuditMetadata(null)}
        onConfirm={handleCommitToMatrix}
        metadata={auditMetadata}
        oldValue={auditOldVal}
        newValue={auditNewVal}
      />
    </div>
  );
};
