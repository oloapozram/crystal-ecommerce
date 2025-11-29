import { prisma } from "./prisma"
import { BaziElement } from "@prisma/client"
import { calculateBaziChart, analyzeBaziBalance, SimplifiedBaziChart } from "./bazi-calculator"
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

/**
 * Main crystal matching function
 * Combines Bazi analysis + user concerns to recommend crystals
 */
export async function matchCrystals(input: CrystalMatchInput): Promise<{
    matches: CrystalMatch[]
    baziChart: SimplifiedBaziChart
    baziSummary: string
}> {
    // Step 1: Calculate Bazi chart
    const baziChart = calculateBaziChart(input.birthDate)
    const baziAnalysis = analyzeBaziBalance(baziChart)

    // Step 2: Get beneficial elements from concerns
    const concernElements = getBeneficialElementsForConcerns(input.concerns)

    // Step 3: Combine Bazi + concern elements (weighted)
    const elementScores = new Map<BaziElement, number>()

    // Bazi deficient elements get high priority (weight: 3)
    baziAnalysis.beneficialElements.forEach(element => {
        elementScores.set(element, (elementScores.get(element) || 0) + 3)
    })

    // Concern elements get medium priority (weight: 2)
    concernElements.forEach(element => {
        elementScores.set(element, (elementScores.get(element) || 0) + 2)
    })

    // Step 4: Query products matching beneficial elements
    const beneficialElements = Array.from(elementScores.keys())

    const products = await prisma.product.findMany({
        where: {
            isActive: true,
            baziElement: {
                in: beneficialElements
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
        score += elementScore * 20 // Max 60 points from element

        if (baziChart.deficientElements.includes(product.baziElement!)) {
            reasons.push(`Balances your ${product.baziElement!.toLowerCase()} deficiency`)
        }

        if (concernElements.includes(product.baziElement!)) {
            reasons.push(`Supports your intentions`)
        }

        // Bonus for high quality
        if (product.qualityGrade === "HIGH") {
            score += 10
            reasons.push("Premium quality")
        } else if (product.qualityGrade === "GOOD") {
            score += 5
        }

        return {
            productId: product.id,
            product,
            compatibilityScore: Math.min(100, score),
            reasons,
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
                    baziChart,
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
        baziChart,
        baziSummary: baziAnalysis.summary
    }
}
