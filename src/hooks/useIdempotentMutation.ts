import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { generateSafeUUID } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// 🧠 IDEMPOTENT MUTATION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════
// Drop-in replacement for useMutation that auto-generates a unique
// Idempotency-Key per mutation invocation. The key is injected into the
// mutation context and can be consumed by the mutationFn.
//
// NOTE: Since api.ts now auto-injects the Idempotency-Key header at the
// fetch level, this wrapper primarily serves as a semantic contract and
// provides the key to the caller for audit trail purposes (PolicyAuditModal).
// ═══════════════════════════════════════════════════════════════════════════════

interface IdempotentMutationContext {
  idempotencyKey: string;
}

/**
 * Wraps TanStack Query's useMutation with automatic idempotency key generation.
 * 
 * Usage:
 * ```ts
 * const mutation = useIdempotentMutation({
 *   mutationFn: async (data) => api.post("/endpoint", data),
 * });
 * ```
 */
export function useIdempotentMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext & IdempotentMutationContext>
) {
  const queryClient = useQueryClient();

  return useMutation<TData, TError, TVariables, TContext & IdempotentMutationContext>({
    ...options,
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
  });
}
