import { BaziElement } from "@prisma/client"

// Simplified Bazi calculator for MVP
// Uses Year and Day pillars only (not full 4-pillar chart)

const HEAVENLY_STEMS = [
    "WOOD", "WOOD",   // Jia (Yang Wood), Yi (Yin Wood)
    "FIRE", "FIRE",   // Bing (Yang Fire), Ding (Yin Fire)
    "EARTH", "EARTH", // Wu (Yang Earth), Ji (Yin Earth)
    "METAL", "METAL", // Geng (Yang Metal), Xin (Yin Metal)
    "WATER", "WATER"  // Ren (Yang Water), Gui (Yin Water)
] as const

const EARTHLY_BRANCHES_ELEMENTS = [
    "WOOD",  // Rat (Zi) - Water, but we simplify
    "EARTH", // Ox (Chou)
    "WOOD",  // Tiger (Yin)
    "WOOD",  // Rabbit (Mao)
    "EARTH", // Dragon (Chen)
    "FIRE",  // Snake (Si)
    "FIRE",  // Horse (Wu)
    "EARTH", // Goat (Wei)
    "METAL", // Monkey (Shen)
    "METAL", // Rooster (You)
    "EARTH", // Dog (Xu)
    "WATER"  // Pig (Hai)
] as const

export interface SimplifiedBaziChart {
    yearElement: BaziElement
    dayElement: BaziElement
    dominantElement: BaziElement
    deficientElements: BaziElement[]
    excessElements: BaziElement[]
}

export interface ElementAnalysis {
    beneficialElements: BaziElement[]
    summary: string
}

/**
 * Calculate Year Pillar element from birth year
 */
export function calculateYearElement(year: number): BaziElement {
    // Heavenly Stem cycles every 10 years
    const stemIndex = (year - 4) % 10 // 4 AD = Jia (first stem)
    return HEAVENLY_STEMS[stemIndex] as BaziElement
}

/**
 * Calculate Day Pillar element (simplified using day of year)
 */
export function calculateDayElement(date: Date): BaziElement {
    // Simplified: use day of year mod 10 for stem
    const startOfYear = new Date(date.getFullYear(), 0, 1)
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
    const stemIndex = dayOfYear % 10
    return HEAVENLY_STEMS[stemIndex] as BaziElement
}

/**
 * Calculate simplified Bazi chart from birth date
 */
export function calculateBaziChart(birthDate: Date): SimplifiedBaziChart {
    const yearElement = calculateYearElement(birthDate.getFullYear())
    const dayElement = calculateDayElement(birthDate)

    // Count element occurrences (simplified - just year + day)
    const elementCounts = new Map<BaziElement, number>()
    elementCounts.set(yearElement, (elementCounts.get(yearElement) || 0) + 1)
    elementCounts.set(dayElement, (elementCounts.get(dayElement) || 0) + 1)

    // Determine dominant element
    const sortedElements = Array.from(elementCounts.entries())
        .sort((a, b) => b[1] - a[1])
    const dominantElement = sortedElements[0][0]

    // Identify deficient elements (not present in chart)
    const allElements: BaziElement[] = ["WOOD", "FIRE", "EARTH", "METAL", "WATER"]
    const presentElements = new Set(elementCounts.keys())
    const deficientElements = allElements.filter(e => !presentElements.has(e))

    // Excess elements (appears more than once in our simplified 2-pillar chart)
    const excessElements = sortedElements
        .filter(([_, count]) => count > 1)
        .map(([element]) => element)

    return {
        yearElement,
        dayElement,
        dominantElement,
        deficientElements,
        excessElements
    }
}

/**
 * Analyze Bazi balance and determine beneficial elements
 */
export function analyzeBaziBalance(chart: SimplifiedBaziChart): ElementAnalysis {
    const beneficial: BaziElement[] = []

    // Add deficient elements (need to be strengthened)
    beneficial.push(...chart.deficientElements)

    // Add elements that support the dominant element (productive cycle)
    const productiveCycle: Record<BaziElement, BaziElement> = {
        WOOD: "WATER",   // Water produces Wood
        FIRE: "WOOD",    // Wood produces Fire
        EARTH: "FIRE",   // Fire produces Earth
        METAL: "EARTH",  // Earth produces Metal
        WATER: "METAL"   // Metal produces Water
    }

    const supportElement = productiveCycle[chart.dominantElement]
    if (!beneficial.includes(supportElement)) {
        beneficial.push(supportElement)
    }

    // Generate summary
    const elementNames = {
        WOOD: "Wood",
        FIRE: "Fire",
        EARTH: "Earth",
        METAL: "Metal",
        WATER: "Water"
    }

    const summary = `Your chart is dominated by ${elementNames[chart.dominantElement]} energy. ` +
        (chart.deficientElements.length > 0
            ? `You would benefit from ${chart.deficientElements.map(e => elementNames[e]).join(" and ")} elements to create balance.`
            : `Your elements are well-balanced.`)

    return {
        beneficialElements: beneficial,
        summary
    }
}
