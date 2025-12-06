import { ProductForm } from "@/components/admin/product-form"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: PageProps) {
    const { id } = await params
    const productId = parseInt(id)

    if (isNaN(productId)) {
        notFound()
    }

    const [product, materials] = await Promise.all([
        prisma.product.findUnique({
            where: { id: productId }
        }),
        prisma.crystalMaterial.findMany({
            orderBy: { name: 'asc' }
        })
    ])

    const typedMaterials = materials.map(m => ({
        ...m,
        defaultProperties: Array.isArray(m.defaultProperties)
            ? m.defaultProperties as string[]
            : []
    }))

    if (!product) {
        notFound()
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
            <ProductForm materials={typedMaterials} product={product} />
        </div>
    )
}
