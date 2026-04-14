import { z } from "zod";

// Maps directly to your General Policies CSV
export const GeneralPolicySchema = z.object({
  id: z.string(),
  bankName: z.string(), // e.g., "L&T Finance"
  productType: z.enum(["HL", "LAP", "BL", "PL", "CC"]),
  propertyType: z.string(), // e.g., "Residential"
  ltvAllowed: z.number().min(0.1).max(1.0), // Enforces 10% to 100%
  emiNotObligatedMonths: z.number().int().min(0),
});

// Maps directly to your Surrogate Policies CSV
export const SurrogateProgramSchema = z.object({
  id: z.string(),
  programName: z.enum(["NIP", "Banking", "GST", "Cash Flow", "SENP"]),
  minBusinessVintageYears: z.number().min(0),
  itrRequiredYears: z.number().min(0),
  foirAllowed: z.number().max(2.0), // Handles 1.81 for Cash Flow
  formula: z.string(), // e.g., "PAT+Depreciation+Interest"
  deviationAllowed: z.string().optional(),
});

export type GeneralPolicy = z.infer<typeof GeneralPolicySchema>;
export type SurrogateProgram = z.infer<typeof SurrogateProgramSchema>;
