import { BaziElement } from "@prisma/client"
import { FullBaziChart } from "./advanced-calculator"
import { STEM_ELEMENTS, BRANCH_ELEMENTS, HIDDEN_STEMS } from "./constants"

export interface ElementFrequencies {
    WOOD: number
    FIRE: number
    EARTH: number
    METAL: number
    WATER: number
}

export interface BaziAnalysis {
    chart: FullBaziChart
    scores: ElementFrequencies
    dominantElement: BaziElement
    weakestElements: BaziElement[]
    missingElements: BaziElement[]
    beneficialElements: BaziElement[]
    summary: string
}

// Weights for element strength calculation
const WEIGHTS = {
    YEAR_STEM: 10,
    YEAR_BRANCH: 10,
    MONTH_STEM: 10,
    MONTH_BRANCH: 40, // Month branch (Season) is most important command (30-40%)
    DAY_STEM: 20,     // Day Master (Self) - represented in chart but often excluded from strength calc of self. 
    // However, for "overall chart atmosphere" we count it.
    // For "Day Master Strength" we compare Day Master to others.
    // Here we are calculating "Overall Elemental Distribution" to recommend balancing crystals.
    DAY_BRANCH: 15,
    HOUR_STEM: 10,
    HOUR_BRANCH: 10
}

/**
 * Analyze a full Bazi chart to determine element strengths and beneficial elements
 */
export function analyzeBaziChart(chart: FullBaziChart): BaziAnalysis {
    const scores: ElementFrequencies = {
        WOOD: 0, FIRE: 0, EARTH: 0, METAL: 0, WATER: 0
    }

    // Helper to add score
    const addScore = (element: BaziElement, points: number) => {
        scores[element] += points
    }

    // Year
    addScore(chart.year.stemElement, WEIGHTS.YEAR_STEM)
    addScore(chart.year.branchElement, WEIGHTS.YEAR_BRANCH)

    // Month
    addScore(chart.month.stemElement, WEIGHTS.MONTH_STEM)
    addScore(chart.month.branchElement, WEIGHTS.MONTH_BRANCH)

    // Day
    addScore(chart.day.stemElement, WEIGHTS.DAY_STEM)
    addScore(chart.day.branchElement, WEIGHTS.DAY_BRANCH)

    // Hour
    addScore(chart.hour.stemElement, WEIGHTS.HOUR_STEM)
    addScore(chart.hour.branchElement, WEIGHTS.HOUR_BRANCH)

    // Identify missing elements (Score 0)
    const missingElements = (Object.keys(scores) as BaziElement[])
        .filter(e => scores[e] === 0)

    // Sort elements by score
    const sortedElements = (Object.entries(scores) as [BaziElement, number][])
        .sort((a, b) => b[1] - a[1])

    const dominantElement = sortedElements[0][0]

    // Identify weakest elements (bottom 2, or score < threshold)
    // For now, just take the bottom 2 (or all missing)
    const weakestElements = sortedElements.slice(-2).map(e => e[0])

    // Determine beneficial elements
    // Simplified logic: Weakest elements + elements that control the dominant (if dominant is too strong - >40% of score)
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
    const dominantRatio = scores[dominantElement] / totalScore

    const beneficialElements = new Set<BaziElement>([...missingElements])

    // If dominant is overpowering (>40%), add Controlling element
    if (dominantRatio > 0.40) {
        const controller = getControllingElement(dominantElement)
        beneficialElements.add(controller)
    }

    // Also add weakest present element to support it
    // (unless it's the one being controlled by dominant, in which case we might want to bridge it)
    if (missingElements.length < 2) {
        // Add the weakest non-zero element too
        const weakestPresent = sortedElements.slice().reverse().find(e => e[1] > 0)
        if (weakestPresent) {
            beneficialElements.add(weakestPresent[0])
        }
    }

    // Generate Summary
    const beneficialNames = Array.from(beneficialElements).map(toTitleCase).join(" and ")
    const summary = `Your chart shows a strong influence of ${toTitleCase(dominantElement)} energy. ` +
        (missingElements.length > 0
            ? `You are missing ${missingElements.map(toTitleCase).join(", ")} elements.`
            : `Your energy profile is relatively distributed.`) +
        ` To balance your energy, we recommend crystals rich in ${beneficialNames}.`

    return {
        chart,
        scores,
        dominantElement,
        weakestElements,
        missingElements,
        beneficialElements: Array.from(beneficialElements),
        summary
    }
}

function getControllingElement(e: BaziElement): BaziElement {
    switch (e) {
        case "WOOD": return "METAL"
        case "FIRE": return "WATER"
        case "EARTH": return "WOOD"
        case "METAL": return "FIRE"
        case "WATER": return "EARTH"
    }
}

function toTitleCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
