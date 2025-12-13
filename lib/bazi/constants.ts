import { BaziElement } from "@prisma/client"

export const HEAVENLY_STEMS = [
    "Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"
] as const

export const EARTHLY_BRANCHES = [
    "Zi", "Chou", "Yin", "Mao", "Chen", "Si", "Wu", "Wei", "Shen", "You", "Xu", "Hai"
] as const

export const STEM_ELEMENTS: Record<string, BaziElement> = {
    "Jia": "WOOD", "Yi": "WOOD",
    "Bing": "FIRE", "Ding": "FIRE",
    "Wu": "EARTH", "Ji": "EARTH",
    "Geng": "METAL", "Xin": "METAL",
    "Ren": "WATER", "Gui": "WATER"
}

export const BRANCH_ELEMENTS: Record<string, BaziElement> = {
    "Zi": "WATER", "Chou": "EARTH", "Yin": "WOOD", "Mao": "WOOD",
    "Chen": "EARTH", "Si": "FIRE", "Wu": "FIRE", "Wei": "EARTH",
    "Shen": "METAL", "You": "METAL", "Xu": "EARTH", "Hai": "WATER"
}

// Hidden stems in branches (initial energy, middle energy, residual energy)
export const HIDDEN_STEMS: Record<string, string[]> = {
    "Zi": ["Gui"],
    "Chou": ["Ji", "Gui", "Xin"],
    "Yin": ["Jia", "Bing", "Wu"],
    "Mao": ["Yi"],
    "Chen": ["Wu", "Yi", "Gui"],
    "Si": ["Bing", "Wu", "Geng"],
    "Wu": ["Ding", "Ji"],
    "Wei": ["Ji", "Ding", "Yi"],
    "Shen": ["Geng", "Ren", "Wu"],
    "You": ["Xin"],
    "Xu": ["Wu", "Xin", "Ding"],
    "Hai": ["Ren", "Jia"]
}

// Solar terms (approximate dates, simplified for MVP but better than before)
// In a full implementation, we'd calculate the exact solar longitude
export const SOLAR_TERMS = [
    { name: "LiChun", month: 2, day: 4 },      // Start of Spring (Tiger)
    { name: "JingZhe", month: 3, day: 6 },     // Awakening of Insects (Rabbit)
    { name: "QingMing", month: 4, day: 5 },    // Pure Brightness (Dragon)
    { name: "LiXia", month: 5, day: 6 },       // Start of Summer (Snake)
    { name: "MangZhong", month: 6, day: 6 },   // Grain in Ear (Horse)
    { name: "XiaoShu", month: 7, day: 7 },     // Minor Heat (Goat)
    { name: "LiQiu", month: 8, day: 8 },       // Start of Autumn (Monkey)
    { name: "BaiLu", month: 9, day: 8 },       // White Dew (Rooster)
    { name: "HanLu", month: 10, day: 8 },      // Cold Dew (Dog)
    { name: "LiDong", month: 11, day: 7 },     // Start of Winter (Pig)
    { name: "DaXue", month: 12, day: 7 },      // Major Snow (Rat)
    { name: "XiaoHan", month: 1, day: 6 },     // Minor Cold (Ox)
]
