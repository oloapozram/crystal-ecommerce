import { prisma } from "./prisma"
import { BaziElement } from "@prisma/client"
import { AdvancedBaziCalculator } from "./bazi/advanced-calculator"
import { analyzeBaziChart } from "./bazi/analyzer"
import { getBeneficialElementsForConcerns } from "./concern-mappings"
import { generateCrystalMatchExplanation } from "./ai-generators"

export interface CrystalMatchInput {
    birthDate: Date
    birthTime?: { hour: number; minute: number }
    concerns: string[]
    otherConcern?: string
}

export interface CrystalMatch {
    productId: number
    product: any // Full product with relations
    compatibilityScore: number
    reasons: string[]
    aiExplanation: string
}

// Interface for backward compatibility with frontend
export interface LegacyBaziChart {
    yearElement: BaziElement
    dayElement: BaziElement
    dominantElement: BaziElement
    deficientElements: BaziElement[]
    excessElements: BaziElement[]
    animalSign: string
}

/**
 * Main crystal matching function
 * Combines Bazi analysis + user concerns to recommend crystals
 */
export async function matchCrystals(input: CrystalMatchInput): Promise<{
    matches: CrystalMatch[]
    baziChart: LegacyBaziChart
    baziSummary: string
}> {
    // Step 1: Calculate Bazi chart using Advanced Calculator
    const calculator = new AdvancedBaziCalculator()
    const birthHour = input.birthTime ? input.birthTime.hour : 12 // Default to noon if unknown

    // Note: AdvancedBaziCalculator takes Date object for birth date
    // We assume the date passed is correct local date
    const chart = calculator.calculate(input.birthDate, birthHour)
    const analysis = analyzeBaziChart(chart)

    // Create legacy chart structure for frontend and AI generator compatibility
    const legacyChart: LegacyBaziChart = {
        yearElement: chart.year.stemElement,
        dayElement: chart.day.stemElement,
        dominantElement: analysis.dominantElement,
        deficientElements: analysis.missingElements,
        excessElements: [], // Not really used in new logic, empty for now
        animalSign: chart.animalSign
    }

    // Step 2: Get beneficial elements from concerns
    const concernElements = getBeneficialElementsForConcerns(input.concerns)

    // Step 3: Combine Bazi + concern elements (weighted)
    const elementScores = new Map<BaziElement, number>()

    // Bazi beneficial elements get high priority (weight: 3)
    // These include missing elements and balancing elements
    analysis.beneficialElements.forEach(element => {
        elementScores.set(element, (elementScores.get(element) || 0) + 3)
    })

    // Concern elements get medium priority (weight: 2)
    concernElements.forEach(element => {
        elementScores.set(element, (elementScores.get(element) || 0) + 2)
    })

    // Step 4: Query products matching beneficial elements
    const beneficialElementsList = Array.from(elementScores.keys())

    const products = await prisma.product.findMany({
        where: {
            isActive: true,
            baziElement: {
                in: beneficialElementsList
            },
            stock: {
                quantityAvailable: {
                    gt: 0
                }
            }
        },
        include: {
            stock: true,
            mediaFiles: {
                where: { isPrimary: true },
                take: 1
            }
        },
        take: 20 // Get more than we need for scoring
    })

    // Step 5: Calculate compatibility scores
    const scoredMatches = products.map(product => {
        let score = 0
        const reasons: string[] = []

        // Score based on element match
        const elementScore = elementScores.get(product.baziElement!) || 0
        score += elementScore * 20 // Max 60-100 points base

        if (analysis.beneficialElements.includes(product.baziElement!)) {
            if (analysis.missingElements.includes(product.baziElement!)) {
                reasons.push(`Restores your missing ${product.baziElement!.toLowerCase()} energy`)
            } else {
                reasons.push(`Balances your energy profile`)
            }
        }

        if (concernElements.includes(product.baziElement!)) {
            reasons.push(`Supports your intention: ${input.concerns[0]}`)
        }

        // Bonus for high quality
        if (product.qualityGrade === "HIGH") {
            score += 10
            reasons.push("Premium quality crystal")
        } else if (product.qualityGrade === "GOOD") {
            score += 5
        }

        // Bonus for animal sign compatibility (simplified)
        // If product element produces User's Year Animal element? 
        // Let's skip deep compatibility for now to keep it fast

        return {
            productId: product.id,
            product,
            compatibilityScore: Math.min(100, score),
            reasons: [...new Set(reasons)], // Deduplicate
            aiExplanation: "" // Will be filled in next step
        }
    })

    // Step 6: Sort and take top 5
    const topMatches = scoredMatches
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, 5)

    // Step 7: Generate AI explanations for top matches
    const matchesWithAI = await Promise.all(
        topMatches.map(async (match) => {
            try {
                const explanation = await generateCrystalMatchExplanation(
                    match.product,
                    legacyChart,
                    input.concerns
                )
                return {
                    ...match,
                    aiExplanation: explanation
                }
            } catch (error) {
                console.error("AI explanation failed for product", match.productId, error)
                // Fallback to static explanation
                return {
                    ...match,
                    aiExplanation: `This ${match.product.baseName} resonates with your energy profile and supports your journey toward ${input.concerns[0]?.toLowerCase() || 'balance'}.`
                }
            }
        })
    )

    return {
        matches: matchesWithAI,
        baziChart: legacyChart,
        baziSummary: analysis.summary
    }
}
