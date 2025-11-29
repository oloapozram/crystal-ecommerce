'use server'

import { prisma } from "@/lib/prisma"
import { productSchema } from "@/lib/validations/product"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createProduct(prevState: any, formData: FormData) {
    const rawData = Object.fromEntries(formData.entries())
    const validatedFields = productSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return { error: "Invalid fields", issues: validatedFields.error.flatten() }
    }

    const {
        baseName, materialId, variety, sizeMm, qualityGrade, sku, baziElement, description, metaphysicalProperties,
        initialQuantity, initialWeightGrams, initialCostPerGram
    } = validatedFields.data

    // Parse metaphysical properties
    const propsArray = metaphysicalProperties
        ? metaphysicalProperties.split(',').map(s => s.trim()).filter(Boolean)
        : []

    try {
        const product = await prisma.product.create({
            data: {
                baseName,
                materialId: materialId || null,
                variety: variety || null,
                sizeMm,
                qualityGrade,
                sku,
                baziElement: baziElement as any,
                description,
                metaphysicalProperties: propsArray,
                isActive: true,
            }
        })

        // Create initial stock if provided
        if (initialQuantity && initialQuantity > 0) {
            const weightGrams = initialWeightGrams || (initialQuantity * 5)

            await prisma.inventoryStock.create({
                data: {
                    productId: product.id,
                    quantityAvailable: initialQuantity,
                    weightGramsAvailable: weightGrams,
                    avgCostPerGram: initialCostPerGram || 0,
                    lastRestockDate: new Date()
                }
            })
        }

        revalidatePath("/admin/products")
        revalidatePath("/shop")
    } catch (error) {
        console.error(error)
        return { error: "Failed to create product. SKU might be duplicate." }
    }

    redirect("/admin/products")
}

export async function deleteProduct(id: number) {
    try {
        await prisma.product.delete({ where: { id } })
        revalidatePath("/admin/products")
        revalidatePath("/shop")
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete product" }
    }
}
