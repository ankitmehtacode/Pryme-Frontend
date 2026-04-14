import { useIdempotentMutation } from "@/hooks/useIdempotentMutation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { PrymeAPI } from "@/lib/api";

/**
 * 🧠 CONSOLIDATED POLICY UPDATE HOOK
 *
 * Uses PrymeAPI.patchPolicy() → PATCH /api/v1/policies (PolicyAdminController)
 * Payload matches the backend's PolicyPatchRequest record exactly:
 *   { entityType, entityId, fieldKey, newValue, reason, idempotencyKey }
 */
export const usePolicyUpdate = () => {
  const queryClient = useQueryClient();

  return useIdempotentMutation({
    mutationFn: async ({
      entityType,
      entityId,
      fieldKey,
      newValue,
      reason,
    }: {
      entityType: string;
      entityId: string;
      fieldKey: string;
      newValue: string;
      reason?: string;
    }) => {
      return PrymeAPI.patchPolicy({ entityType, entityId, fieldKey, newValue, reason });
    },
    // Optimistic update: Instantly update the cache before network resolves
    onMutate: async (newUpdate) => {
      await queryClient.cancelQueries({ queryKey: ["policy_value", newUpdate.entityId, newUpdate.fieldKey] });
      const previousValue = queryClient.getQueryData(["policy_value", newUpdate.entityId, newUpdate.fieldKey]);

      queryClient.setQueryData(
        ["policy_value", newUpdate.entityId, newUpdate.fieldKey],
        (old: any) => ({
          ...old,
          value: newUpdate.newValue,
        })
      );

      return { previousValue };
    },
    // ROLLBACK ON FAILURE
    onError: (_err, newUpdate, context) => {
      if (context?.previousValue) {
        queryClient.setQueryData(
          ["policy_value", newUpdate.entityId, newUpdate.fieldKey],
          context.previousValue
        );
      }
      toast({
        title: "Matrix Sync Failed",
        description: "Rolling back interface.",
        variant: "destructive",
      });
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["policy_value", variables.entityId, variables.fieldKey],
      });
    },
  });
};
