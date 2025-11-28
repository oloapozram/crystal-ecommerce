import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ElementBadge } from './ElementBadge';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface CompatibilityScore {
  totalScore: number;
  elementScore: number;
  zodiacScore: number;
  explanation: string;
  warnings: string[];
  recommendations: string[];
}

interface CrystalMatch {
  productId: number;
  productName: string;
  crystalType: string;
  element: string;
  compatibilityScore: CompatibilityScore;
  price: number;
  inStock: boolean;
}

interface CrystalRecommendationProps {
  crystal: CrystalMatch;
  rank: number;
}

export function CrystalRecommendation({ crystal, rank }: CrystalRecommendationProps) {
  const { compatibilityScore } = crystal;
  const scoreColor = compatibilityScore.totalScore >= 75
    ? 'text-green-600'
    : compatibilityScore.totalScore >= 50
    ? 'text-blue-600'
    : 'text-yellow-600';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">#{rank}</Badge>
              <CardTitle className="text-xl">{crystal.crystalType}</CardTitle>
            </div>
            <CardDescription className="mt-1">
              {crystal.productName}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${scoreColor}`}>
              {compatibilityScore.totalScore}
            </p>
            <p className="text-xs text-gray-500">Compatibility</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <ElementBadge element={crystal.element} />
          {crystal.inStock ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              In Stock
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
              Out of Stock
            </Badge>
          )}
          <span className="text-sm font-medium ml-auto">
            ${crystal.price.toFixed(2)}
          </span>
        </div>

        {compatibilityScore.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              {compatibilityScore.explanation}
            </p>
          </div>
        )}

        {compatibilityScore.recommendations.length > 0 && (
          <div className="space-y-2">
            {compatibilityScore.recommendations.map((rec, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        )}

        {compatibilityScore.warnings.length > 0 && (
          <div className="space-y-2">
            {compatibilityScore.warnings.map((warning, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">{warning}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div>
            <p className="text-xs text-gray-500">Element Score</p>
            <p className="text-sm font-medium">
              {compatibilityScore.elementScore > 0 ? '+' : ''}
              {compatibilityScore.elementScore}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Zodiac Score</p>
            <p className="text-sm font-medium">
              {compatibilityScore.zodiacScore > 0 ? '+' : ''}
              {compatibilityScore.zodiacScore}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
