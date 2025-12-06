'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CONCERN_CATEGORIES } from '@/lib/concern-mappings'
import { CrystalMatchCard } from './crystal-match-card'
import { BaziSummary } from './bazi-summary'

type Step = 'birth' | 'concerns' | 'loading' | 'results'

interface FormData {
    birthDate: string
    birthTime?: string
    concerns: string[]
}

export function CrystalFinderForm() {
    const [step, setStep] = useState<Step>('birth')
    const [formData, setFormData] = useState<FormData>({
        birthDate: '',
        concerns: []
    })
    const [results, setResults] = useState<any>(null)
    const [error, setError] = useState('')

    const handleBirthSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.birthDate) {
            setError('Please enter your birth date')
            return
        }
        setError('')
        setStep('concerns')
    }

    const toggleConcern = (concern: string) => {
        setFormData(prev => ({
            ...prev,
            concerns: prev.concerns.includes(concern)
                ? prev.concerns.filter(c => c !== concern)
                : [...prev.concerns, concern]
        }))
    }

    const handleConcernsSubmit = async () => {
        if (formData.concerns.length === 0) {
            setError('Please select at least one intention')
            return
        }

        setError('')
        setStep('loading')

        try {
            const response = await fetch('/api/crystal-match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    birthDate: formData.birthDate,
                    birthTime: formData.birthTime,
                    concerns: formData.concerns
                })
            })

            if (!response.ok) throw new Error('Failed to find matches')

            const data = await response.json()
            setResults(data)
            setStep('results')
        } catch (err) {
            setError('Something went wrong. Please try again.')
            setStep('concerns')
        }
    }

    const resetForm = () => {
        setStep('birth')
        setFormData({ birthDate: '', concerns: [] })
        setResults(null)
        setError('')
    }

    return (
        <div className="max-w-4xl mx-auto">
            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {/* Step 1: Birth Information */}
            {step === 'birth' && (
                <form onSubmit={handleBirthSubmit} className="space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Tell us about yourself</h2>
                        <p className="text-muted-foreground">
                            We&apos;ll use your birth information to calculate your unique energy profile
                        </p>
                    </div>

                    <div className="space-y-4 max-w-md mx-auto">
                        <div className="space-y-2">
                            <Label htmlFor="birthDate">Birth Date *</Label>
                            <Input
                                id="birthDate"
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="birthTime">
                                Birth Time <span className="text-muted-foreground text-sm">(optional)</span>
                            </Label>
                            <Input
                                id="birthTime"
                                type="time"
                                value={formData.birthTime || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, birthTime: e.target.value }))}
                            />
                            <p className="text-xs text-muted-foreground">
                                Don&apos;t know your birth time? That&apos;s okay! We can still help.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Button type="submit" size="lg" className="px-12">
                            Continue
                        </Button>
                    </div>
                </form>
            )}

            {/* Step 2: Life Intentions */}
            {step === 'concerns' && (
                <div className="space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">What brings you to crystals today?</h2>
                        <p className="text-muted-foreground">
                            Select all that resonate with you
                        </p>
                    </div>

                    <div className="space-y-8">
                        {Object.entries(CONCERN_CATEGORIES).map(([category, concerns]) => (
                            <div key={category}>
                                <h3 className="text-lg font-semibold mb-3 capitalize">
                                    {category.replace('_', ' ')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {concerns.map((concern) => (
                                        <label
                                            key={concern}
                                            className={`
                        flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${formData.concerns.includes(concern)
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-primary/50'
                                                }
                      `}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.concerns.includes(concern)}
                                                onChange={() => toggleConcern(concern)}
                                                className="mr-3 h-4 w-4"
                                            />
                                            <span className="text-sm font-medium">{concern}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center gap-4 pt-6">
                        <Button variant="outline" onClick={() => setStep('birth')}>
                            Back
                        </Button>
                        <Button size="lg" onClick={handleConcernsSubmit} className="px-12">
                            Find My Crystals
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 3: Loading */}
            {step === 'loading' && (
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4"></div>
                    <h2 className="text-2xl font-bold mb-2">Analyzing your energy profile...</h2>
                    <p className="text-muted-foreground">
                        Matching crystals to your unique Bazi chart
                    </p>
                </div>
            )}

            {/* Step 4: Results */}
            {step === 'results' && results && (
                <div className="space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-4">Your Crystal Matches</h2>
                        <BaziSummary
                            chart={results.baziChart}
                            summary={results.baziSummary}
                        />
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-2xl font-semibold">Top Recommendations</h3>
                        {results.matches.map((match: any, index: number) => (
                            <CrystalMatchCard
                                key={match.productId}
                                match={match}
                                rank={index + 1}
                            />
                        ))}
                    </div>

                    <div className="flex justify-center pt-6">
                        <Button variant="outline" onClick={resetForm}>
                            Start Over
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
