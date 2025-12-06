import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { calculateRetailPrice } from '@/lib/pricing';
import { AddToCartButton } from '@/components/products/add-to-cart-button';

export const metadata = {
  title: 'Shop Crystals | Crystal E-Commerce',
  description: 'Browse our collection of authentic, energized crystals.',
};

async function getProducts() {
  return await prisma.product.findMany({
    where: { isActive: true },
    include: {
      stock: true,
      mediaFiles: {
        where: { isPrimary: true },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Crystal Collection</h1>
          <p className="text-muted-foreground">
            Discover authentic crystals for your spiritual journey.
          </p>
        </div>
        {/* Filters will go here later */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          // Calculate estimated price for a standard 50g piece
          // Default markup 150% (2.5x) for retail if not tracked per purchase here
          const costPerGram = Number(product.stock?.avgCostPerGram || 0.5);
          const pricing = calculateRetailPrice(costPerGram, 150, 50);

          return (
            <Link key={product.id} href={`/shop/${product.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden group border-none bg-secondary/10">
                <div className="aspect-square relative overflow-hidden bg-muted">
                  {/* Placeholder for product image since we don't have real images yet */}
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-secondary/20 group-hover:scale-105 transition-transform duration-500 text-center p-4">
                    {product.baseName}
                  </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold line-clamp-1">
                      {product.baseName}
                    </CardTitle>
                    {product.baziElement && (
                      <Badge variant="outline" className="capitalize text-xs">
                        {product.baziElement.toLowerCase()}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm text-muted-foreground line-clamp-2">
                  Authentic {product.qualityGrade.toLowerCase()} quality {product.baseName}.
                </CardContent>
                <CardFooter className="p-4 pt-2 flex flex-col gap-2">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-lg">
                      ${pricing.totalRetailPrice.toFixed(2)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {product.stock?.quantityAvailable || 0} in stock
                    </Badge>
                  </div>
                  <AddToCartButton
                    product={{
                      id: product.id,
                      sku: product.sku,
                      name: `${product.baseName} ${product.sizeMm}mm ${product.qualityGrade}`,
                      baseName: product.baseName,
                      size: Number(product.sizeMm),
                      quality: product.qualityGrade,
                      element: product.baziElement,
                      retailPrice: pricing.totalRetailPrice,
                      stockAvailable: product.stock?.quantityAvailable || 0,
                      primaryImage: product.mediaFiles[0]?.filePath || null,
                    }}
                  />
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-2xl font-semibold mb-2">No crystals found</h3>
          <p className="text-muted-foreground">
            Check back soon for our new collection.
          </p>
        </div>
      )}
    </div>
  );
}
