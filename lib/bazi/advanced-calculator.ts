import { BaziElement } from "@prisma/client"
import {
    HEAVENLY_STEMS,
    EARTHLY_BRANCHES,
    STEM_ELEMENTS,
    BRANCH_ELEMENTS,
    SOLAR_TERMS,
    HIDDEN_STEMS
} from "./constants"

export interface Pillar {
    stem: string
    branch: string
    stemElement: BaziElement
    branchElement: BaziElement
    hiddenStems: string[]
}

export interface FullBaziChart {
    year: Pillar
    month: Pillar
    day: Pillar
    hour: Pillar
    animalSign: string
}

// Reference date for Day Pillar calculation: Jan 1, 1900
// Jan 1, 1900 was a Jia Xu (Wood Dog) day
// Jia is index 0 in Stems, Xu is index 10 in Branches
const REF_DATE = new Date(1900, 0, 1) // Jan 1, 1900
const REF_STEM_IDX = 0 // Jia
const REF_BRANCH_IDX = 10 // Xu

/**
 * Advanced Bazi Calculator implementing 4-Pillar calculation
 */
export class AdvancedBaziCalculator {

    /**
     * Calculate the full 4-pillar chart
     * @param date Date of birth
     * @param hour Hour of birth (0-23)
     */
    public calculate(date: Date, hour: number = 12): FullBaziChart {
        // 1. Adjust date for Year/Month calculations based on Solar Terms
        const adjustedDatetimes = this.getSolarDate(date)

        // 2. Calculate Pillars
        const yearPillar = this.calculateYearPillar(adjustedDatetimes.year)
        const monthPillar = this.calculateMonthPillar(adjustedDatetimes.year, adjustedDatetimes.monthIndex, yearPillar.stem)
        const dayPillar = this.calculateDayPillar(date) // Day pillar depends on actual calendar day
        const hourPillar = this.calculateHourPillar(dayPillar.stem, hour)

        return {
            year: yearPillar,
            month: monthPillar,
            day: dayPillar,
            hour: hourPillar,
            animalSign: EARTHLY_BRANCHES[(adjustedDatetimes.year - 4) % 12] // Simplified zodiac
        }
    }

    /**
     * Determine the solar year and solar month index
     */
    private getSolarDate(date: Date): { year: number, monthIndex: number } {
        let year = date.getFullYear()
        const month = date.getMonth() + 1 // 1-12
        const day = date.getDate()

        // Check if before Li Chun (Start of Spring, usually Feb 4)
        // If before Li Chun, it belongs to the previous solar year
        const liChun = SOLAR_TERMS.find(t => t.name === "LiChun")!
        const isBeforeLiChun = (month < liChun.month) || (month === liChun.month && day < liChun.day)

        if (isBeforeLiChun) {
            year -= 1
        }

        // Determine the solar month index (0-11, where 0 is Tiger/Feb, 11 is Ox/Jan)
        // We iterate through terms to find which term the current date falls into
        let solarMonthIndex = 0

        // Solar terms start from Tiger (Feb), index 0
        // We map month/day to the solar term index
        // Simplified logic: Check if date is >= Term Date.

        // Convert current date to a comparable value (e.g. Month * 100 + Day)
        const dateVal = month * 100 + day

        // Tiger starts at LiChun (Feb 4)
        // Iterate through simplified terms to find the current solar month
        // Note: This matches the array order in constants.ts (LiChun is 0)
        for (let i = 0; i < SOLAR_TERMS.length; i++) {
            const term = SOLAR_TERMS[i]
            const termVal = term.month * 100 + term.day

            // Special case for XiaoHan (Jan) which is next year in Gregorian but end of cycle in Solar
            if (term.name === "XiaoHan" && month === 1) {
                if (dateVal >= termVal) {
                    solarMonthIndex = 11 // Ox
                } else {
                    solarMonthIndex = 10 // Rat (still in previous term DaXue)
                }
                break
            }

            // Normal progression
            if (i === SOLAR_TERMS.length - 1) {
                // Last one checked
                solarMonthIndex = i
            } else {
                const nextTerm = SOLAR_TERMS[i + 1]
                const nextTermVal = nextTerm.month * 100 + nextTerm.day

                // Handle year wrap for terms (Dec -> Jan)
                if (nextTerm.month < term.month) {
                    if (dateVal >= termVal || dateVal < nextTermVal) {
                        solarMonthIndex = i
                        break
                    }
                } else {
                    if (dateVal >= termVal && dateVal < nextTermVal) {
                        solarMonthIndex = i
                        break
                    }
                }
            }
        }

        // Fallback if not caught (e.g., date before LiChun in Jan/Feb is caught by isBeforeLiChun logic for year,
        // but month index needs to be Ox)
        if (month < 2 || (month === 2 && day < 4)) {
            // It's Ox month (last of previous year)
            solarMonthIndex = 11
        }

        return { year, monthIndex: solarMonthIndex }
    }

    private calculateYearPillar(solarYear: number): Pillar {
        // 1984 was Start of Cycle (Jia Zi)
        // or easier: year ending in 4 is Jia (0)

        const stemIndex = (solarYear - 4) % 10
        const branchIndex = (solarYear - 4) % 12

        // Handle negative modulo
        const safeStemIndex = stemIndex < 0 ? stemIndex + 10 : stemIndex
        const safeBranchIndex = branchIndex < 0 ? branchIndex + 12 : branchIndex

        return this.createPillar(safeStemIndex, safeBranchIndex)
    }

    private calculateMonthPillar(solarYear: number, monthIndex: number, yearStem: string): Pillar {
        // Five Tigers Hunting Month
        // Year Stem determines the Stem of the first month (Tiger)
        // Jia/Ji (0/5) -> Bing (2)
        // Yi/Geng (1/6) -> Wu (4)
        // Bing/Xin (2/7) -> Geng (6)
        // Ding/Ren (3/8) -> Ren (8)
        // Wu/Gui (4/9) -> Jia (0)

        const yearStemIdx = HEAVENLY_STEMS.indexOf(yearStem as any)
        const lookup = [2, 4, 6, 8, 0] // Offsets for pairs
        const startStemIdx = lookup[yearStemIdx % 5]

        const monthStemIdx = (startStemIdx + monthIndex) % 10
        const monthBranchIdx = (2 + monthIndex) % 12 // 0=Tiger (index 2 in standard list)

        // Wait, my Constants have Zi (Rat) as 0. 
        // Tiger is index 2.
        // solarMonthIndex 0 -> Tiger (2)

        return this.createPillar(monthStemIdx, monthBranchIdx)
    }

    private calculateDayPillar(date: Date): Pillar {
        // Number of days since reference date
        const oneDay = 24 * 60 * 60 * 1000
        // Use UTC to avoid DST issues
        const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
        const utcRef = Date.UTC(REF_DATE.getFullYear(), REF_DATE.getMonth(), REF_DATE.getDate())

        const diffDays = Math.round((utcDate - utcRef) / oneDay)

        const stemIdx = (REF_STEM_IDX + diffDays) % 10
        const branchIdx = (REF_BRANCH_IDX + diffDays) % 12

        const safeStemIdx = stemIdx < 0 ? stemIdx + 10 : stemIdx
        const safeBranchIdx = branchIdx < 0 ? branchIdx + 12 : branchIdx

        return this.createPillar(safeStemIdx, safeBranchIdx)
    }

    private calculateHourPillar(dayStem: string, hour: number): Pillar {
        // Five Rats Hunting Hour
        // Day Stem determines the Stem of the first hour (Rat, 23:00-01:00)
        // Jia/Ji -> Jia (0)
        // Yi/Geng -> Bing (2)
        // Bing/Xin -> Wu (4)
        // Ding/Ren -> Geng (6)
        // Wu/Gui -> Ren (8)

        const dayStemIdx = HEAVENLY_STEMS.indexOf(dayStem as any)
        const lookup = [0, 2, 4, 6, 8]
        const startStemIdx = lookup[dayStemIdx % 5]

        // Branch index calculation
        // 23-1 -> Rat (0)
        // 1-3 -> Ox (1)
        // ...
        // (Hour + 1) / 2
        let hourBranchIdx = Math.floor((hour + 1) / 2) % 12

        const hourStemIdx = (startStemIdx + hourBranchIdx) % 10

        return this.createPillar(hourStemIdx, hourBranchIdx)
    }

    private createPillar(stemIdx: number, branchIdx: number): Pillar {
        const stem = HEAVENLY_STEMS[stemIdx]
        const branch = EARTHLY_BRANCHES[branchIdx]

        return {
            stem,
            branch,
            stemElement: STEM_ELEMENTS[stem],
            branchElement: BRANCH_ELEMENTS[branch],
            hiddenStems: HIDDEN_STEMS[branch]
        }
    }
}
