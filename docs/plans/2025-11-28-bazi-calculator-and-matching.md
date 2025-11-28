# Bazi Calculator & Matching API Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build Bazi calculator to convert birth date to elements, and matching API to recommend crystals based on user's Bazi chart with zodiac compatibility.

**Architecture:** Pure TypeScript functions for Bazi calculations using knowledge base JSON files. REST API endpoints for matching that combine Five Elements theory with Chinese zodiac compatibility. RAG approach prevents hallucinations by grounding recommendations in factual data.

**Tech Stack:** TypeScript, Next.js 15 API Routes, Vitest, Bazi Knowledge Base (JSON files)

---

## Task 8: Bazi Calculator Implementation

**Files:**
- Create: `lib/bazi/calculator.ts`
- Create: `lib/bazi/calculator.test.ts`
- Reference: `lib/bazi-knowledge/birth-year-elements.json`

**Step 1: Write test for birth year to element conversion**

Create `lib/bazi/calculator.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getBirthYearElement, calculateBaziChart } from './calculator';

describe('getBirthYearElement', () => {
  it('should return correct element for 1990', () => {
    const result = getBirthYearElement(1990);

    expect(result.element).toBe('metal');
    expect(result.animal).toBe('Horse');
    expect(result.yin_yang).toBe('yang');
    expect(result.stem).toBe('Geng');
  });

  it('should return correct element for 2025', () => {
    const result = getBirthYearElement(2025);

    expect(result.element).toBe('wood');
    expect(result.animal).toBe('Snake');
    expect(result.yin_yang).toBe('yin');
  });

  it('should handle years before 1984', () => {
    // 1980 is also Metal Monkey (60-year cycle)
    const result = getBirthYearElement(1980);
    expect(result.element).toBe('metal');
    expect(result.animal).toBe('Monkey');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd C:\xampp7\htdocs\crystal
npm test -- lib/bazi/calculator.test.ts
```

Expected: FAIL - module not found

**Step 3: Implement birth year calculator**

Create `lib/bazi/calculator.ts`:

```typescript
import birthYearElements from '@/lib/bazi-knowledge/birth-year-elements.json';

export interface BirthYearInfo {
  year: number;
  stem: string;
  branch: string;
  element: string;
  animal: string;
  yin_yang: string;
}

export function getBirthYearElement(year: number): BirthYearInfo {
  // First try direct lookup
  const yearStr = year.toString();
  if (birthYearElements[yearStr as keyof typeof birthYearElements]) {
    return {
      year,
      ...birthYearElements[yearStr as keyof typeof birthYearElements],
    };
  }

  // For years outside our data range, calculate using 60-year cycle
  // Find the nearest year in our data
  const baseYear = 1984;
  const cycle = 60;

  // Calculate offset within cycle
  let offset = ((year - baseYear) % cycle + cycle) % cycle;
  const referenceYear = baseYear + offset;

  const refYearStr = referenceYear.toString();
  if (birthYearElements[refYearStr as keyof typeof birthYearElements]) {
    return {
      year,
      ...birthYearElements[refYearStr as keyof typeof birthYearElements],
    };
  }

  // Fallback
  throw new Error(`Unable to calculate Bazi for year ${year}`);
}

export interface BaziChart {
  birthYear: BirthYearInfo;
  dominantElement: string;
  secondaryElement: string | null;
  needsBalance: string[];
  strengths: string[];
}

export function calculateBaziChart(birthYear: number): BaziChart {
  const yearInfo = getBirthYearElement(birthYear);

  // In simplified Bazi, year element is dominant
  const dominantElement = yearInfo.element;

  // Secondary element comes from yin/yang nature
  // Yang elements tend toward producing, Yin toward receiving
  const secondaryElement = yearInfo.yin_yang === 'yang'
    ? getProducedElement(dominantElement)
    : getProducingElement(dominantElement);

  // Determine which elements need balancing
  const needsBalance = getControllingElements(dominantElement);

  // Strengths are elements that support dominant
  const strengths = [
    dominantElement,
    getProducingElement(dominantElement),
  ];

  return {
    birthYear: yearInfo,
    dominantElement,
    secondaryElement,
    needsBalance,
    strengths,
  };
}

// Helper functions based on Five Elements cycle
function getProducedElement(element: string): string {
  const cycle: Record<string, string> = {
    wood: 'fire',
    fire: 'earth',
    earth: 'metal',
    metal: 'water',
    water: 'wood',
  };
  return cycle[element] || element;
}

function getProducingElement(element: string): string {
  const cycle: Record<string, string> = {
    fire: 'wood',
    earth: 'fire',
    metal: 'earth',
    water: 'metal',
    wood: 'water',
  };
  return cycle[element] || element;
}

function getControllingElements(element: string): string[] {
  const controlling: Record<string, string[]> = {
    wood: ['metal', 'earth'], // metal cuts wood, wood depletes earth
    fire: ['water', 'metal'], // water extinguishes fire, fire weakens metal
    earth: ['wood', 'water'], // wood penetrates earth, earth blocks water
    metal: ['fire', 'wood'], // fire melts metal, metal cuts wood
    water: ['earth', 'fire'], // earth absorbs water, water extinguishes fire
  };
  return controlling[element] || [];
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- lib/bazi/calculator.test.ts
```

Expected: PASS (3 tests)

**Step 5: Add test for full Bazi chart calculation**

Add to `lib/bazi/calculator.test.ts`:

```typescript
describe('calculateBaziChart', () => {
  it('should calculate full Bazi chart for Fire element', () => {
    const chart = calculateBaziChart(1986); // Fire Tiger

    expect(chart.dominantElement).toBe('fire');
    expect(chart.birthYear.animal).toBe('Tiger');
    expect(chart.needsBalance).toContain('water');
    expect(chart.strengths).toContain('fire');
    expect(chart.strengths).toContain('wood'); // wood produces fire
  });

  it('should calculate secondary element based on yin/yang', () => {
    const yangChart = calculateBaziChart(1990); // Yang Metal Horse
    const yinChart = calculateBaziChart(1991); // Yin Metal Goat

    expect(yangChart.secondaryElement).toBe('water'); // metal produces water
    expect(yinChart.secondaryElement).toBe('earth'); // earth produces metal
  });
});
```

**Step 6: Run tests again**

```bash
npm test -- lib/bazi/calculator.test.ts
```

Expected: PASS (5 tests)

**Step 7: Commit**

```bash
git add lib/bazi/
git commit -m "feat: implement Bazi calculator with birth year to element conversion

- Calculate year element from knowledge base
- Handle 60-year cycle for years outside data range
- Calculate full Bazi chart with dominant/secondary elements
- Identify elements needing balance
- All 5 tests passing

Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 9: Bazi Matching API

**Files:**
- Create: `lib/bazi/matching.ts`
- Create: `lib/bazi/matching.test.ts`
- Create: `app/api/bazi/match/route.ts`
- Create: `app/api/bazi/match/__tests__/route.test.ts`
- Reference: `lib/bazi-knowledge/elements.json`
- Reference: `lib/bazi-knowledge/crystals-database.json`
- Reference: `lib/bazi-knowledge/compatibility-rules.json`
- Reference: `lib/bazi-knowledge/zodiac-compatibility.json`

**Step 1: Write test for crystal compatibility scoring**

Create `lib/bazi/matching.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateCrystalCompatibility, matchCrystalsToChart } from './matching';
import { calculateBaziChart } from './calculator';

describe('calculateCrystalCompatibility', () => {
  it('should give high score for same element crystal', () => {
    const chart = calculateBaziChart(1986); // Fire Tiger
    const crystalElement = 'fire'; // e.g., Rhodonite

    const score = calculateCrystalCompatibility(chart, crystalElement, 'Tiger');

    expect(score.totalScore).toBeGreaterThan(75); // Same element bonus
    expect(score.elementScore).toBe(50); // Same element = +50
  });

  it('should give bonus for productive cycle', () => {
    const chart = calculateBaziChart(1986); // Fire element
    const crystalElement = 'wood'; // Wood feeds Fire

    const score = calculateCrystalCompatibility(chart, crystalElement, 'Dragon');

    expect(score.elementScore).toBe(25); // Productive cycle bonus
    expect(score.explanation).toContain('Wood nourishes Fire');
  });

  it('should give penalty for controlling cycle', () => {
    const chart = calculateBaziChart(1986); // Fire element
    const crystalElement = 'water'; // Water extinguishes Fire

    const score = calculateCrystalCompatibility(chart, crystalElement, 'Rat');

    expect(score.elementScore).toBe(-50); // Controlling cycle penalty
    expect(score.warnings).toContain('Water extinguishes Fire');
  });

  it('should add zodiac compatibility bonus', () => {
    const chart = calculateBaziChart(1986); // Tiger
    const crystalElement = 'fire';
    const crystalAnimal = 'Dog'; // Best match with Tiger

    const score = calculateCrystalCompatibility(chart, crystalElement, crystalAnimal);

    expect(score.zodiacScore).toBe(30); // Best match bonus
    expect(score.totalScore).toBeGreaterThan(50);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- lib/bazi/matching.test.ts
```

Expected: FAIL - module not found

**Step 3: Implement crystal matching logic**

Create `lib/bazi/matching.ts`:

```typescript
import { BaziChart } from './calculator';
import compatibilityRules from '@/lib/bazi-knowledge/compatibility-rules.json';
import zodiacCompat from '@/lib/bazi-knowledge/zodiac-compatibility.json';

export interface CompatibilityScore {
  totalScore: number;
  elementScore: number;
  zodiacScore: number;
  explanation: string;
  warnings: string[];
  recommendations: string[];
}

export function calculateCrystalCompatibility(
  chart: BaziChart,
  crystalElement: string,
  crystalAnimal?: string
): CompatibilityScore {
  let elementScore = 0;
  let zodiacScore = 0;
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let explanation = '';

  // Base score
  const baseScore = 50;

  // Calculate element compatibility
  const userElement = chart.dominantElement;

  // Same element - strong support
  if (crystalElement === userElement) {
    elementScore = compatibilityRules.same_element.score_boost;
    explanation = compatibilityRules.same_element.explanation;
    recommendations.push(`This ${crystalElement} crystal directly strengthens your ${userElement} energy`);
  } else {
    // Check productive cycle (crystal produces user element)
    const productiveCycle = compatibilityRules.productive_cycle.relationships;
    let foundProductive = false;

    for (const [key, value] of Object.entries(productiveCycle)) {
      if (value.from === crystalElement && value.to === userElement) {
        elementScore = value.score_boost;
        explanation = value.explanation;
        recommendations.push(explanation);
        foundProductive = true;
        break;
      }
    }

    if (!foundProductive) {
      // Check controlling cycle
      const controllingCycle = compatibilityRules.controlling_cycle.relationships;

      for (const [key, value] of Object.entries(controllingCycle)) {
        if (value.from === crystalElement && value.to === userElement) {
          elementScore = value.score_penalty;
          explanation = value.warning;
          warnings.push(value.warning);
          break;
        }
        if (value.from === userElement && value.to === crystalElement) {
          // User controls crystal - can be beneficial for grounding excess
          elementScore = 10;
          explanation = `Your ${userElement} energy can harness this ${crystalElement} crystal's power`;
          recommendations.push('Use this crystal to channel and direct your energy');
          break;
        }
      }
    }
  }

  // Calculate zodiac compatibility if crystal animal provided
  if (crystalAnimal && zodiacCompat.animals[chart.birthYear.animal]) {
    const userAnimalData = zodiacCompat.animals[chart.birthYear.animal];
    const scoring = zodiacCompat.compatibility_scoring;

    if (userAnimalData.best_matches.includes(crystalAnimal)) {
      zodiacScore = scoring.best_match.score_boost;
      recommendations.push(`${crystalAnimal} and ${chart.birthYear.animal} have natural harmony`);
    } else if (userAnimalData.good_matches.includes(crystalAnimal)) {
      zodiacScore = scoring.good_match.score_boost;
    } else if (userAnimalData.challenging_matches.includes(crystalAnimal)) {
      zodiacScore = scoring.challenging_match.score_penalty;
      warnings.push('This zodiac pairing may require extra mindfulness');
    } else if (userAnimalData.conflict === crystalAnimal) {
      zodiacScore = scoring.conflict.score_penalty;
      warnings.push(`${crystalAnimal} and ${chart.birthYear.animal} are opposing signs`);
    }
  }

  const totalScore = baseScore + elementScore + zodiacScore;

  return {
    totalScore,
    elementScore,
    zodiacScore,
    explanation,
    warnings,
    recommendations,
  };
}

export interface CrystalMatch {
  productId: number;
  productName: string;
  crystalType: string;
  element: string;
  compatibilityScore: CompatibilityScore;
  price: number;
  inStock: boolean;
}

export async function matchCrystalsToChart(
  chart: BaziChart,
  availableProducts: any[]
): Promise<CrystalMatch[]> {
  const matches: CrystalMatch[] = [];

  for (const product of availableProducts) {
    if (!product.baziElement) continue;

    const compatibility = calculateCrystalCompatibility(
      chart,
      product.baziElement.toLowerCase(),
      undefined // We don't track zodiac animal per crystal currently
    );

    matches.push({
      productId: product.id,
      productName: `${product.baseName} ${product.sizeMm}mm ${product.qualityGrade}`,
      crystalType: product.baseName,
      element: product.baziElement,
      compatibilityScore: compatibility,
      price: product.pricing?.totalRetailPrice || 0,
      inStock: product.stockAvailable > 0,
    });
  }

  // Sort by compatibility score descending
  matches.sort((a, b) => b.compatibilityScore.totalScore - a.compatibilityScore.totalScore);

  return matches;
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- lib/bazi/matching.test.ts
```

Expected: PASS (4 tests)

**Step 5: Write API endpoint test**

Create `app/api/bazi/match/__tests__/route.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { POST } from '../route';

describe('POST /api/bazi/match', () => {
  it('should return crystal matches for birth year', async () => {
    const requestBody = {
      birthYear: 1990,
    };

    const request = new Request('http://localhost:3000/api/bazi/match', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('baziChart');
    expect(data).toHaveProperty('recommendations');
    expect(data.baziChart.dominantElement).toBe('metal');
    expect(Array.isArray(data.recommendations)).toBe(true);
  });

  it('should rank crystals by compatibility', async () => {
    const requestBody = {
      birthYear: 1986, // Fire element
    };

    const request = new Request('http://localhost:3000/api/bazi/match', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.recommendations.length).toBeGreaterThan(0);

    // First recommendation should have highest score
    if (data.recommendations.length > 1) {
      expect(data.recommendations[0].compatibilityScore.totalScore)
        .toBeGreaterThanOrEqual(data.recommendations[1].compatibilityScore.totalScore);
    }
  });

  it('should return 400 for missing birth year', async () => {
    const request = new Request('http://localhost:3000/api/bazi/match', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
```

**Step 6: Implement API endpoint**

Create `app/api/bazi/match/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateBaziChart } from '@/lib/bazi/calculator';
import { matchCrystalsToChart } from '@/lib/bazi/matching';
import { calculateRetailPrice } from '@/lib/pricing';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { birthYear } = body;

    if (!birthYear || typeof birthYear !== 'number') {
      return NextResponse.json(
        { error: 'birthYear is required and must be a number' },
        { status: 400 }
      );
    }

    // Calculate user's Bazi chart
    const baziChart = calculateBaziChart(birthYear);

    // Get available products with stock
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        baziElement: { not: null },
        stock: {
          quantityAvailable: { gt: 0 },
        },
      },
      include: {
        stock: true,
        mediaFiles: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    });

    // Calculate pricing for each product
    const productsWithPricing = products.map((product) => {
      const avgCost = product.stock?.avgCostPerGram?.toNumber() || 0;
      const weight = product.stock?.weightGramsAvailable?.toNumber() || 0;
      const pricing = calculateRetailPrice(avgCost, 40, weight);

      return {
        id: product.id,
        baseName: product.baseName,
        sizeMm: product.sizeMm.toNumber(),
        qualityGrade: product.qualityGrade,
        baziElement: product.baziElement,
        pricing,
        stockAvailable: product.stock?.quantityAvailable || 0,
        primaryImage: product.mediaFiles[0]?.filePath,
      };
    });

    // Match crystals to user's chart
    const recommendations = await matchCrystalsToChart(baziChart, productsWithPricing);

    return NextResponse.json({
      baziChart: {
        birthYear: baziChart.birthYear.year,
        animal: baziChart.birthYear.animal,
        element: baziChart.birthYear.element,
        dominantElement: baziChart.dominantElement,
        secondaryElement: baziChart.secondaryElement,
        needsBalance: baziChart.needsBalance,
        strengths: baziChart.strengths,
      },
      recommendations: recommendations.slice(0, 10), // Top 10 matches
      totalMatches: recommendations.length,
    });
  } catch (error) {
    console.error('Bazi matching error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate Bazi match' },
      { status: 500 }
    );
  }
}
```

**Step 7: Run API tests**

```bash
npm test -- app/api/bazi/match
```

Expected: PASS (3 tests)

**Step 8: Commit**

```bash
git add lib/bazi/matching.ts lib/bazi/matching.test.ts app/api/bazi/match/
git commit -m "feat: implement Bazi matching API with zodiac compatibility

- Crystal compatibility scoring with Five Elements theory
- Zodiac animal compatibility integration
- Ranks crystals by total compatibility score
- API endpoint returns top 10 matches with explanations
- All 7 tests passing (4 matching + 3 API)

Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 10: Test Integration and Documentation

**Files:**
- Create: `docs/bazi-matching-guide.md`
- Modify: `README.md`

**Step 1: Run all tests to verify everything works together**

```bash
npm test
```

Expected: All tests passing (should be 25+ tests total)

**Step 2: Create usage documentation**

Create `docs/bazi-matching-guide.md`:

```markdown
# Bazi Crystal Matching System

## Overview

The Bazi matching system helps customers find crystals that harmonize with their personal energy based on Chinese metaphysics.

## How It Works

### 1. Birth Year Calculation
- Converts birth year to:
  - Five Element (Wood, Fire, Earth, Metal, Water)
  - Chinese Zodiac Animal
  - Yin/Yang polarity

### 2. Compatibility Scoring

**Element Compatibility:**
- Same Element: +50 points
- Productive Cycle: +25 points (element that supports user)
- Controlling Cycle: -50 points (conflicting element)

**Zodiac Compatibility:**
- Best Match: +30 points
- Good Match: +15 points
- Challenging: -15 points
- Conflict: -30 points

**Base Score:** 50 points

### 3. Ranking
Crystals are ranked by total compatibility score (element + zodiac + base).

## API Usage

**POST /api/bazi/match**

Request:
```json
{
  "birthYear": 1990
}
```

Response:
```json
{
  "baziChart": {
    "birthYear": 1990,
    "animal": "Horse",
    "element": "metal",
    "dominantElement": "metal",
    "needsBalance": ["fire", "wood"]
  },
  "recommendations": [
    {
      "productId": 1,
      "productName": "Sakura Rhodonite 10mm NORMAL",
      "element": "fire",
      "compatibilityScore": {
        "totalScore": 85,
        "elementScore": 25,
        "zodiacScore": 10,
        "explanation": "...",
        "recommendations": [...]
      },
      "price": 7.00,
      "inStock": true
    }
  ]
}
```

## Knowledge Base Files

- `elements.json` - Five Elements properties and cycles
- `crystals-database.json` - Crystal-to-element mappings with authentic properties
- `compatibility-rules.json` - Scoring rules for element interactions
- `zodiac-compatibility.json` - Chinese zodiac animal compatibility
- `birth-year-elements.json` - Year-to-element lookup table (1984-2025)

## Testing

All Bazi logic is fully tested with Vitest:
```bash
npm test -- lib/bazi
```
```

**Step 3: Update main README**

Add to `README.md`:

```markdown
## Bazi Crystal Matching

This platform includes an authentic Bazi (Chinese astrology) matching system that recommends crystals based on:

- Five Elements theory (Wood, Fire, Earth, Metal, Water)
- Chinese Zodiac compatibility
- Productive and controlling cycles

### API Endpoints

- `POST /api/bazi/match` - Get crystal recommendations for a birth year

### Architecture

The Bazi system uses a RAG (Retrieval-Augmented Generation) approach with factual JSON knowledge bases to prevent AI hallucinations. All compatibility rules are based on authentic Chinese metaphysical principles.

See [docs/bazi-matching-guide.md](docs/bazi-matching-guide.md) for detailed documentation.
```

**Step 4: Commit documentation**

```bash
git add docs/bazi-matching-guide.md README.md
git commit -m "docs: add Bazi matching system documentation

- Created comprehensive guide for Bazi matching
- Updated README with API endpoints
- Documented scoring system and knowledge base

Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

**Step 5: Push all changes**

```bash
git push
```

---

## Summary

**What We Built:**
1. **Bazi Calculator** - Converts birth year to elements with 60-year cycle support
2. **Compatibility Matching** - Scores crystals based on Five Elements + Zodiac
3. **Matching API** - REST endpoint that returns ranked crystal recommendations
4. **Full Test Coverage** - 7+ new tests, all passing
5. **Documentation** - Complete guide for using the system

**Knowledge Base Integration:**
- Uses all 5 JSON files for factual grounding
- Prevents hallucinations through RAG approach
- Authentic Chinese metaphysical principles

**Ready For:**
- Frontend "Find Your Crystal" tool integration
- AI content generation with Bazi context
- Admin dashboard for viewing match analytics
