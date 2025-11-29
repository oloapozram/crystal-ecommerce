import { ProductForm } from "@/components/admin/product-form"
import { prisma } from "@/lib/prisma"

export default async function NewProductPage() {
    const materials = await prisma.crystalMaterial.findMany({
        orderBy: { name: 'asc' }
    })

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">Add New Product</h1>
            <ProductForm materials={materials} />
        </div>
    )
}
