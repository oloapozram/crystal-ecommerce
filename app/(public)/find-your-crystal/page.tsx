'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BaziChart } from '@/components/bazi/BaziChart';
import { CrystalRecommendation } from '@/components/bazi/CrystalRecommendation';
import { Sparkles, Loader2 } from 'lucide-react';

interface BaziChartData {
    birthYear: number;
    animal: string;
    element: string;
    dominantElement: string;
    secondaryElement: string | null;
    needsBalance: string[];
    strengths: string[];
}

interface CrystalMatch {
    productId: number;
    productName: string;
    crystalType: string;
    element: string;
    compatibilityScore: {
        totalScore: number;
        elementScore: number;
        zodiacScore: number;
        explanation: string;
        warnings: string[];
        recommendations: string[];
    };
    price: number;
    inStock: boolean;
}

interface MatchResponse {
    baziChart: BaziChartData;
    recommendations: CrystalMatch[];
    totalMatches: number;
}

export default function FindYourCrystalPage() {
    const [birthYear, setBirthYear] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState<MatchResponse | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const year = parseInt(birthYear);
            if (isNaN(year) || year < 1900 || year > 2100) {
                setError('Please enter a valid birth year between 1900 and 2100');
                setLoading(false);
                return;
            }

            const response = await fetch('/api/bazi/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ birthYear: year }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch recommendations');
            }

            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-purple-900">
                    Find Your Perfect Crystal
                </h1>
                <p className="text-lg text-gray-600">
                    Discover crystals that resonate with your unique energy based on Chinese Bazi astrology
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Enter Your Birth Year
                    </CardTitle>
                    <CardDescription>
                        We'll calculate your Bazi chart and recommend crystals that harmonize with your elemental energy
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="birthYear">Birth Year</Label>
                            <Input
                                id="birthYear"
                                type="number"
                                placeholder="1990"
                                value={birthYear}
                                onChange={(e) => setBirthYear(e.target.value)}
                                min="1900"
                                max="2100"
                                required
                            />
                            <p className="text-xs text-gray-500">
                                Enter any year between 1900 and 2100
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Finding Your Crystals...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Find My Crystals
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {results && (
                <>
                    <BaziChart data={results.baziChart} />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-purple-900">
                                Your Crystal Matches
                            </h2>
                            <p className="text-sm text-gray-500">
                                {results.totalMatches} crystals analyzed
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {results.recommendations.map((crystal, idx) => (
                                <CrystalRecommendation
                                    key={crystal.productId}
                                    crystal={crystal}
                                    rank={idx + 1}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
