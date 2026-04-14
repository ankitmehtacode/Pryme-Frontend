import { useMutation, useQueryClient, UseMutationOptions, QueryKey } from "@tanstack/react-query";
import { generateSafeUUID } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 IDEMPOTENT MUTATION WRAPPER (ANTIGRAVITY ZERO-TRUST)
// ═══════════════════════════════════════════════════════════════════════════════
// Drop-in replacement for useMutation that:
//   1. Auto-generates a unique Idempotency-Key per mutation invocation
//   2. Exposes the key to the caller for audit trail UIs (PolicyAuditModal)
//   3. Optionally invalidates specified query keys on success
//   4. Integrates with the backend's IdempotencyFilter for replay protection
//
// The key is also auto-injected at the fetch level by api.ts, so this
// wrapper primarily provides the KEY TO THE CALLER and invalidation sugar.
// ═══════════════════════════════════════════════════════════════════════════════

interface IdempotentMutationContext {
  idempotencyKey: string;
}

interface UseIdempotentMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> extends UseMutationOptions<TData, TError, TVariables, TContext & IdempotentMutationContext> {
  /**
   * Query keys to automatically invalidate on mutation success.
   * Saves boilerplate onSuccess → queryClient.invalidateQueries chains.
   * Example: invalidateOnSuccess: [["auth", "me"], ["admin", "leads"]]
   */
  invalidateOnSuccess?: QueryKey[];
}

/**
 * Wraps TanStack Query's useMutation with automatic idempotency key generation
 * and optional query invalidation on success.
 *
 * Usage:
 * ```ts
 * const mutation = useIdempotentMutation({
 *   mutationFn: async (data) => PrymeAPI.createAdminBank(data),
 *   invalidateOnSuccess: [["admin", "banks"]],
 * });
 *
 * // Access the generated key for audit display:
 * mutation.context?.idempotencyKey
 * ```
 */
export function useIdempotentMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: UseIdempotentMutationOptions<TData, TError, TVariables, TContext>
) {
  const queryClient = useQueryClient();
  const { invalidateOnSuccess, ...mutationOptions } = options;

  return useMutation<TData, TError, TVariables, TContext & IdempotentMutationContext>({
    ...mutationOptions,

    onMutate: async (variables) => {
      const idempotencyKey = generateSafeUUID();

      // Execute the user's onMutate if provided, merging contexts
      const userContext = options.onMutate
        ? await options.onMutate(variables)
        : ({} as TContext);

      return {
        ...userContext,
        idempotencyKey,
      } as TContext & IdempotentMutationContext;
    },

    onSuccess: async (data, variables, context) => {
      // Auto-invalidate specified query keys
      if (invalidateOnSuccess?.length) {
        await Promise.all(
          invalidateOnSuccess.map((key) =>
            queryClient.invalidateQueries({ queryKey: key })
          )
        );
      }

      // Execute the user's onSuccess if provided
      if (options.onSuccess) {
        await options.onSuccess(data, variables, context);
      }
    },
  });
}
