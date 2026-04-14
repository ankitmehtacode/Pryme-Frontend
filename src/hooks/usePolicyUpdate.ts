import { useIdempotentMutation } from "@/hooks/useIdempotentMutation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

export const usePolicyUpdate = () => {
  const queryClient = useQueryClient();

  return useIdempotentMutation({
    mutationFn: async ({ id, key, value, auditReason }: { id: string, key: string, value: any, auditReason?: string }) => {
      return api.patch(`/admin/policies/${id}`, { key, value, auditReason });
    },
    // ANTIGRAVITY MAGIC: Instantly update the cache before network resolves
    onMutate: async (newUpdate) => {
      await queryClient.cancelQueries({ queryKey: ["admin_policies"] });
      const previousPolicies = queryClient.getQueryData(["admin_policies"]);
      
      queryClient.setQueryData(["admin_policies"], (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        
        return old.map((policy: any) => {
          if (policy.id === newUpdate.id) {
            return {
              ...policy,
              [newUpdate.key]: newUpdate.value
            };
          }
          return policy;
        });
      });
      
      return { previousPolicies };
    },
    // ROLLBACK ON FAILURE
    onError: (err, newUpdate, context) => {
      if (context?.previousPolicies) {
        queryClient.setQueryData(["admin_policies"], context.previousPolicies);
      }
      toast({ 
        title: "Matrix Sync Failed", 
        description: "Rolling back interface.", 
        variant: "destructive" 
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_policies"] });
    },
  });
};
