import { BaziElement } from "@prisma/client"

export const CONCERN_CATEGORIES = {
    emotional: [
        "Peace & Calm",
        "Emotional Balance",
        "Joy & Positivity",
        "Releasing Worry",
        "Inner Strength"
    ],
    relationships: [
        "Authentic Connections",
        "Healthy Boundaries",
        "Attracting Love",
        "Deepening Friendships",
        "Family Harmony"
    ],
    personal: [
        "Self-Confidence",
        "Self-Love & Acceptance",
        "Mental Clarity",
        "Focus & Productivity",
        "Creative Expression"
    ],
    spiritual: [
        "Spiritual Protection",
        "Intuition & Insight",
        "Grounding & Centering",
        "Energy Cleansing",
        "Manifestation"
    ],
    wellbeing: [
        "Restful Sleep",
        "Vitality & Energy",
        "Gentle Transitions",
        "Overall Wellness"
    ]
} as const

// Map each concern to beneficial Bazi elements
export const CONCERN_ELEMENT_MAP: Record<string, BaziElement[]> = {
    // Emotional
    "Peace & Calm": ["WATER", "EARTH"],
    "Emotional Balance": ["WATER", "EARTH"],
    "Joy & Positivity": ["FIRE", "WOOD"],
    "Releasing Worry": ["WATER", "METAL"],
    "Inner Strength": ["EARTH", "METAL"],

    // Relationships
    "Authentic Connections": ["FIRE", "WOOD"],
    "Healthy Boundaries": ["METAL", "EARTH"],
    "Attracting Love": ["FIRE", "WATER"],
    "Deepening Friendships": ["WOOD", "FIRE"],
    "Family Harmony": ["EARTH", "WATER"],

    // Personal
    "Self-Confidence": ["FIRE", "WOOD"],
    "Self-Love & Acceptance": ["EARTH", "FIRE"],
    "Mental Clarity": ["METAL", "WATER"],
    "Focus & Productivity": ["METAL", "WOOD"],
    "Creative Expression": ["WOOD", "FIRE"],

    // Spiritual
    "Spiritual Protection": ["METAL", "EARTH"],
    "Intuition & Insight": ["WATER", "METAL"],
    "Grounding & Centering": ["EARTH"],
    "Energy Cleansing": ["METAL", "WATER"],
    "Manifestation": ["FIRE", "WOOD"],

    // Wellbeing
    "Restful Sleep": ["WATER", "EARTH"],
    "Vitality & Energy": ["FIRE", "WOOD"],
    "Gentle Transitions": ["WATER", "EARTH"],
    "Overall Wellness": ["EARTH", "WOOD"]
}

// Get all concerns as a flat array
export function getAllConcerns(): string[] {
    return Object.values(CONCERN_CATEGORIES).flat()
}

// Get beneficial elements for a set of concerns
export function getBeneficialElementsForConcerns(concerns: string[]): BaziElement[] {
    const elementCounts = new Map<BaziElement, number>()

    concerns.forEach(concern => {
        const elements = CONCERN_ELEMENT_MAP[concern] || []
        elements.forEach(element => {
            elementCounts.set(element, (elementCounts.get(element) || 0) + 1)
        })
    })

    // Sort by frequency, return most relevant elements
    return Array.from(elementCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([element]) => element)
}
