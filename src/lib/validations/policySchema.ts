import { z } from "zod";

export const FieldTypeEnum = z.enum([
  "NUMERIC_RANGE",
  "PERCENTAGE",
  "INTEGER",
  "BOOLEAN",
  "ENUM_LIST",
]);

export const FieldMetadataSchema = z.object({
  fieldKey: z.string(),
  displayName: z.string(),
  fieldType: FieldTypeEnum,
  absoluteLowerBound: z.number().nullable().optional(),
  absoluteUpperBound: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  options: z.array(z.string()).optional(), // Handled if ENUM_LIST
});

export type FieldType = z.infer<typeof FieldTypeEnum>;
export type FieldMetadata = z.infer<typeof FieldMetadataSchema>;

export const PolicyPatchSchema = z.object({
  entityType: z.string(),
  entityId: z.string(),
  fieldKey: z.string(),
  oldValue: z.string(),
  newValue: z.string(),
  auditReason: z.string().min(10, "Audit reason must be at least 10 characters long."),
  idempotencyKey: z.string().uuid(),
});

export type PolicyPatchPayload = z.infer<typeof PolicyPatchSchema>;
