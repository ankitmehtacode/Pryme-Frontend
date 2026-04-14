import { z } from "zod";

// 1. Defines the metadata for the field we are editing
export const FieldMetadataSchema = z.object({
  fieldKey: z.string(), // e.g., "min_cibil"
  displayName: z.string(),
  fieldType: z.enum(["NUMERIC_RANGE", "PERCENTAGE", "INTEGER", "BOOLEAN", "TEXT", "ENUM_LIST"]),
  absoluteLowerBound: z.number().nullable(),
  absoluteUpperBound: z.number().nullable(),
  allowedValues: z.string().nullable(), // Comma separated for ENUM_LIST
  requiresReason: z.boolean(),
  unit: z.string().nullable()
});
export type FieldMetadata = z.infer<typeof FieldMetadataSchema>;

// 2. The exact payload sent to the Java Backend
export const PolicyPatchSchema = z.object({
  entityType: z.string(), // e.g., "LOAN_PRODUCT"
  entityId: z.string(),   // The unique ID (e.g., HDFC Home Loan ID)
  fieldKey: z.string(),   // The specific field chosen
  oldValue: z.string().or(z.number()).or(z.boolean()), 
  newValue: z.string().or(z.number()).or(z.boolean()),
  auditReason: z.string().min(10, "Audit reason must be detailed (min 10 chars)."),
  idempotencyKey: z.string().uuid() // 🧠 200 IQ: Prevents double-clicks creating duplicate audit logs
});
export type PolicyPatchPayload = z.infer<typeof PolicyPatchSchema>;
