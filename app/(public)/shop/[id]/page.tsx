import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateBaziSellingCopy } from '@/lib/ai-generators';
import { calculateRetailPrice } from '@/lib/pricing';
import { notFound } from 'next/navigation';

// Force dynamic rendering since we might generate AI content on the fly
export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getProduct(id: number) {
    return await prisma.product.findUnique({
        where: { id },
        include: {
            stock: true,
            aiContent: {
                where: { contentType: 'BAZI_SELLING_COPY' },
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        }
    });
}

export default async function ProductPage({ params }: PageProps) {
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);

    if (isNaN(productId)) return notFound();

    let product = await getProduct(productId);

    if (!product) return notFound();

    // If no AI content exists, try to generate it (Server-side generation)
    let aiContent = product.aiContent[0]?.generatedContent as any;

    if (!aiContent) {
        try {
            // Auto-generate content if missing (Demo feature)
            // Note: In production, this should probably be an admin action or async job
            const result = await generateBaziSellingCopy(productId);
            aiContent = result;
        } catch (error) {
            console.error("Failed to auto-generate AI content:", error);
        }
    }

    // Calculate price: Avg Cost * 50g * 150% Markup
    const costPerGram = Number(product.stock?.avgCostPerGram || 0.5);
    const pricing = calculateRetailPrice(costPerGram, 150, 50);

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left Column: Image */}
                <div className="space-y-4">
                    <div className="aspect-square bg-secondary/20 rounded-lg flex items-center justify-center text-muted-foreground text-2xl font-semibold p-8 text-center">
                        {product.baseName}
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-square bg-secondary/10 rounded-md" />
                        ))}
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            {product.baziElement && (
                                <Badge variant="secondary" className="text-sm px-3 py-1">
                                    {product.baziElement} Element
                                </Badge>
                            )}
                            <Badge variant="outline" className="text-sm px-3 py-1">
                                {product.qualityGrade} Quality
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight mb-4">{product.baseName}</h1>
                        <p className="text-3xl font-bold text-primary">
                            ${pricing.totalRetailPrice.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Approx. 50g • ${pricing.retailPerGram.toFixed(2)}/g
                        </p>
                    </div>

                    {/* AI Generated Selling Copy */}
                    {aiContent && (
                        <div className="prose prose-stone dark:prose-invert max-w-none">
                            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                ✨ Crystal Energy
                            </h3>
                            <div className="bg-secondary/10 p-6 rounded-xl border border-secondary/20">
                                <p className="whitespace-pre-wrap leading-relaxed">
                                    {aiContent.selling_copy}
                                </p>

                                <div className="mt-6 grid grid-cols-1 gap-4 border-t border-secondary/20 pt-4">
                                    <div>
                                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-1">
                                            Element Analysis
                                        </h4>
                                        <p className="text-sm">{aiContent.element_analysis}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-1">
                                            Recommended For
                                        </h4>
                                        <p className="text-sm">{aiContent.recommended_for}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add to Cart Section */}
                    <div className="flex gap-4 pt-4 border-t">
                        <Button size="lg" className="w-full md:w-auto px-8 text-lg">
                            Add to Cart
                        </Button>
                        <Button size="lg" variant="outline">
                            Add to Wishlist
                        </Button>
                    </div>

                    {/* Technical Details */}
                    <div className="border rounded-lg p-4 bg-muted/20">
                        <h3 className="font-semibold mb-3">Product Specifications</h3>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <dt className="text-muted-foreground">Size</dt>
                            <dd>{Number(product.sizeMm)} mm</dd>
                            <dt className="text-muted-foreground">Weight (Approx)</dt>
                            <dd>50g</dd>
                            <dt className="text-muted-foreground">SKU</dt>
                            <dd>{product.sku}</dd>
                            <dt className="text-muted-foreground">Stock Status</dt>
                            <dd>
                                {product.stock && product.stock.quantityAvailable > 0
                                    ? `${product.stock.quantityAvailable} available`
                                    : 'Out of Stock'}
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
