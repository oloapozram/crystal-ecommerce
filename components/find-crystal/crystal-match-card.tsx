import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CrystalMatchCardProps {
    match: {
        productId: number
        product: any
        compatibilityScore: number
        reasons: string[]
        aiExplanation: string
    }
    rank: number
}

export function CrystalMatchCard({ match, rank }: CrystalMatchCardProps) {
    const { product, compatibilityScore, aiExplanation } = match

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="grid md:grid-cols-[200px_1fr] gap-6">
                {/* Image Section */}
                <div className="aspect-square bg-secondary/20 flex items-center justify-center p-6">
                    <div className="text-center">
                        <div className="text-4xl mb-2">💎</div>
                        <p className="text-sm font-medium">{product.baseName}</p>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                    <CardHeader className="p-0 mb-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl font-bold text-primary">#{rank}</span>
                                    {product.baziElement && (
                                        <Badge variant="secondary" className="capitalize">
                                            {product.baziElement.toLowerCase()} Element
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-2xl">{product.baseName}</CardTitle>
                            </div>

                            {/* Compatibility Score */}
                            <div className="text-center">
                                <div className="text-3xl font-bold text-primary">
                                    {compatibilityScore}%
                                </div>
                                <div className="text-xs text-muted-foreground">Match</div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 space-y-4">
                        {/* AI Explanation */}
                        <p className="text-base leading-relaxed">
                            {aiExplanation}
                        </p>

                        {/* Quality Badge */}
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{product.qualityGrade} Quality</Badge>
                            <span className="text-sm text-muted-foreground">
                                {product.sizeMm}mm
                            </span>
                        </div>

                        {/* CTA */}
                        <Link href={`/shop/${product.id}`}>
                            <Button className="w-full md:w-auto">
                                View in Shop →
                            </Button>
                        </Link>
                    </CardContent>
                </div>
            </div>
        </Card>
    )
}
