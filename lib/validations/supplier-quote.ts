import { z } from "zod"

export const supplierQuoteSchema = z.object({
  supplierId: z.number().int().positive("Supplier ID must be a positive integer"),
  productId: z.number().int().positive("Product ID must be a positive integer"),
  quotedPricePerGram: z.number().positive("Price per gram must be positive"),
  minimumOrderGrams: z.number().positive("Minimum order must be positive"),
  estimatedQualityRating: z.number().min(1).max(5).optional(),
  quoteDate: z.string().optional(),
  expiresAt: z.string().optional(),
  notes: z.string().optional(),
})

export const supplierQuoteUpdateSchema = z.object({
  quotedPricePerGram: z.number().positive().optional(),
  minimumOrderGrams: z.number().positive().optional(),
  estimatedQualityRating: z.number().min(1).max(5).optional(),
  quoteDate: z.string().optional(),
  expiresAt: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "EXPIRED"]).optional(),
})

export type SupplierQuoteFormValues = z.infer<typeof supplierQuoteSchema>
export type SupplierQuoteUpdateValues = z.infer<typeof supplierQuoteUpdateSchema>
