import { z } from "zod"

export const productSchema = z.object({
    baseName: z.string().min(2, "Name must be at least 2 characters"),
    materialId: z.coerce.number().int().positive().optional(),
    variety: z.string().optional(),
    sizeMm: z.coerce.number().min(0, "Size must be positive"),
    qualityGrade: z.enum(["NORMAL", "GOOD", "HIGH"]),
    sku: z.string().min(3, "SKU is required"),
    baziElement: z.enum(["WOOD", "FIRE", "EARTH", "METAL", "WATER"]).optional(),
    description: z.string().optional(),
    metaphysicalProperties: z.string().optional(), // Comma separated string for input
    // Initial stock fields (optional, for creation only)
    initialQuantity: z.coerce.number().int().min(0).optional(),
    initialWeightGrams: z.coerce.number().min(0).optional(),
    initialCostPerGram: z.coerce.number().min(0).optional(),
})

export type ProductFormValues = z.infer<typeof productSchema>
