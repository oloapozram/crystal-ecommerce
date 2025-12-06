import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
    product: {
        id: number
        baseName: string
        sizeMm: number
        qualityGrade: string
        baziElement: string | null
        price: number
        image?: string | null
    }
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Card className="overflow-hidden group">
            <div className="aspect-square relative bg-secondary/20">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.baseName}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-4xl">
                        💎
                    </div>
                )}
            </div>
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold truncate pr-2">{product.baseName}</h3>
                    {product.baziElement && (
                        <Badge variant="outline" className="text-xs shrink-0">
                            {product.baziElement}
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                    {product.sizeMm}mm • {product.qualityGrade}
                </p>
                <p className="font-bold text-lg">${product.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Link href={`/shop/${product.id}`} className="w-full">
                    <Button className="w-full">View Details</Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
