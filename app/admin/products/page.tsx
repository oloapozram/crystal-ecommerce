import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DeleteProductButton } from "@/components/admin/product-actions"

export default async function AdminProductsPage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            stock: true
        }
    })

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Products</h1>
                <Link href="/admin/products/new">
                    <Button>Add New Product</Button>
                </Link>
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Element</TableHead>
                            <TableHead>Quality</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.baseName}</TableCell>
                                <TableCell>{product.sku}</TableCell>
                                <TableCell>
                                    {product.baziElement && (
                                        <Badge variant="outline" className="capitalize">
                                            {product.baziElement.toLowerCase()}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>{product.qualityGrade}</TableCell>
                                <TableCell>
                                    {product.stock?.quantityAvailable || 0}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Link href={`/admin/products/${product.id}`}>
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </Link>
                                    <DeleteProductButton id={product.id} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {products.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    No products found. Add your first crystal!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
