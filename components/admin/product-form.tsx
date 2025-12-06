'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, ProductFormValues } from "@/lib/validations/product"
import { createProduct, updateProduct } from "@/app/admin/products/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

interface CrystalMaterial {
    id: number
    name: string
    baziElement: string
    defaultProperties: any // JsonValue from Prisma
    chakra: string | null
    color: string | null
}

interface ProductFormProps {
    materials: CrystalMaterial[]
    product?: any // TODO: Type this properly with Prisma types
}

export function ProductForm({ materials, product }: ProductFormProps) {
    const [error, setError] = useState<string>("")
    const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            baseName: product?.baseName || "",
            materialId: product?.materialId ? Number(product.materialId) : undefined,
            variety: product?.variety || "",
            sizeMm: product?.sizeMm ? Number(product.sizeMm) : undefined,
            qualityGrade: product?.qualityGrade || "NORMAL",
            sku: product?.sku || "",
            baziElement: product?.baziElement || undefined,
            metaphysicalProperties: product?.metaphysicalProperties?.join(", ") || "",
            description: product?.description || "",
            initialQuantity: 0,
            initialWeightGrams: 0,
            initialCostPerGram: 0,
        } as ProductFormValues
    })

    // Watch material selection
    const watchedMaterialId = watch("materialId")

    // Auto-populate when material is selected
    useEffect(() => {
        if (watchedMaterialId) {
            const material = materials.find(m => m.id === Number(watchedMaterialId))
            if (material) {
                setValue("baziElement", material.baziElement as any)
                setValue("metaphysicalProperties", material.defaultProperties.join(", "))
                setSelectedMaterialId(material.id)
            }
        }
    }, [watchedMaterialId, materials, setValue])

    const onSubmit = async (data: ProductFormValues) => {
        setError("")
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value.toString())
            }
        })

        let result
        if (product) {
            result = await updateProduct(product.id, null, formData)
        } else {
            result = await createProduct(null, formData)
        }

        if (result?.error) {
            setError(result.error)
        }
    }

    const selectedMaterial = materials.find(m => m.id === selectedMaterialId)

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
            {error && (
                <div className="p-3 bg-red-100 text-red-600 rounded-md text-sm">
                    {error}
                </div>
            )}

            {/* Material Selection Section */}
            <div className="p-6 bg-secondary/10 rounded-lg border border-secondary/20">
                <h3 className="text-lg font-semibold mb-4">Crystal Material</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="materialId">Material *</Label>
                        <select
                            id="materialId"
                            {...register("materialId")}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="">Select a crystal material...</option>
                            {materials.map((material) => (
                                <option key={material.id} value={material.id}>
                                    {material.name} ({material.baziElement})
                                </option>
                            ))}
                        </select>
                        {errors.materialId && <p className="text-sm text-red-500">{errors.materialId.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="variety">
                            Variety <span className="text-muted-foreground text-sm">(optional)</span>
                        </Label>
                        <Input
                            id="variety"
                            {...register("variety")}
                            placeholder="e.g. Dream, Bolivian, Chevron"
                        />
                        <p className="text-xs text-muted-foreground">
                            Leave blank for standard {selectedMaterial?.name || 'crystal'}
                        </p>
                    </div>
                </div>

                {selectedMaterial && (
                    <div className="mt-4 p-4 bg-primary/5 rounded-md border border-primary/20">
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">{selectedMaterial.baziElement === 'FIRE' ? '🔥' : selectedMaterial.baziElement === 'WATER' ? '💧' : selectedMaterial.baziElement === 'EARTH' ? '⛰️' : selectedMaterial.baziElement === 'METAL' ? '⚙️' : '🌳'}</div>
                            <div className="flex-1">
                                <h4 className="font-semibold mb-1">{selectedMaterial.name}</h4>
                                <p className="text-sm text-muted-foreground mb-2">
                                    {selectedMaterial.color && `Color: ${selectedMaterial.color}`}
                                    {selectedMaterial.chakra && ` • Chakra: ${selectedMaterial.chakra}`}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(selectedMaterial.defaultProperties) && selectedMaterial.defaultProperties.map((prop: string, i: number) => (
                                        <span key={i} className="text-xs px-2 py-1 bg-background rounded-full border">
                                            {prop}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="baseName">Product Name *</Label>
                    <Input id="baseName" {...register("baseName")} placeholder="e.g. Dream Amethyst" />
                    {errors.baseName && <p className="text-sm text-red-500">{errors.baseName.message}</p>}
                    <p className="text-xs text-muted-foreground">
                        Tip: Use format &quot;[Variety] [Material]&quot; or just &quot;[Material]&quot;
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input id="sku" {...register("sku")} placeholder="e.g. AMY-10-NORM" />
                    {errors.sku && <p className="text-sm text-red-500">{errors.sku.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sizeMm">Size (mm) *</Label>
                    <Input id="sizeMm" type="number" step="0.1" {...register("sizeMm")} />
                    {errors.sizeMm && <p className="text-sm text-red-500">{errors.sizeMm.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="qualityGrade">Quality Grade *</Label>
                    <select
                        id="qualityGrade"
                        {...register("qualityGrade")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="NORMAL">Normal</option>
                        <option value="GOOD">Good</option>
                        <option value="HIGH">High</option>
                    </select>
                    {errors.qualityGrade && <p className="text-sm text-red-500">{errors.qualityGrade.message}</p>}
                </div>
            </div>

            {/* Auto-populated fields (can be overridden) */}
            <div className="p-6 bg-secondary/10 rounded-lg border border-secondary/20">
                <h3 className="text-lg font-semibold mb-4">
                    Element & Properties
                    {selectedMaterial && <span className="text-sm font-normal text-muted-foreground ml-2">(auto-filled, can edit)</span>}
                </h3>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="baziElement">Bazi Element</Label>
                        <select
                            id="baziElement"
                            {...register("baziElement")}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="">None</option>
                            <option value="WOOD">Wood</option>
                            <option value="FIRE">Fire</option>
                            <option value="EARTH">Earth</option>
                            <option value="METAL">Metal</option>
                            <option value="WATER">Water</option>
                        </select>
                        {errors.baziElement && <p className="text-sm text-red-500">{errors.baziElement.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="metaphysicalProperties">Metaphysical Properties (comma separated)</Label>
                        <Input
                            id="metaphysicalProperties"
                            {...register("metaphysicalProperties")}
                            placeholder="Calming, Healing, Protection"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                    id="description"
                    {...register("description")}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            {/* Initial Inventory - Only show when creating new product */}
            {!product && (
                <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-medium mb-4">Initial Inventory (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="initialQuantity">Initial Quantity</Label>
                            <Input id="initialQuantity" type="number" {...register("initialQuantity")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="initialWeightGrams">Weight (grams)</Label>
                            <Input id="initialWeightGrams" type="number" step="0.1" {...register("initialWeightGrams")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="initialCostPerGram">Cost Per Gram ($)</Label>
                            <Input id="initialCostPerGram" type="number" step="0.01" {...register("initialCostPerGram")} />
                        </div>
                    </div>
                </div>
            )}

            <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? "Saving..." : (product ? "Update Product" : "Create Product")}
            </Button>
        </form>
    )
}
