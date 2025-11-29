# Task 17: Find Your Crystal Tool - Implementation Plan

## Goal
Create an interactive, personalized crystal recommendation tool that combines full Bazi birth chart analysis with life concerns/intentions to recommend the most suitable crystals for each user.

## User Experience Flow

### Step 1: Birth Information
- Collect full birth date (Year, Month, Day) - **required**
- Collect birth time (Hour, Minute) - **optional**
- Clean, welcoming UI with "Don't know your birth time? That's okay!"

### Step 2: Life Intentions
- Multi-select checkboxes for concerns/intentions
- Organized into 5 categories (Emotional, Relationships, Personal, Spiritual, Wellbeing)
- ~20 positive, aspirational options
- Optional "Other" text field

### Step 3: Calculating (Loading State)
- Animated element symbols or crystal visuals
- "Analyzing your energy profile..."

### Step 4: Results
- Bazi element summary (simple explanation)
- Top 5 crystal recommendations (cards with images)
- AI-generated personalized explanation for each
- "Shop Now" buttons linking to product pages

## Technical Architecture

### Data Models

**User Input:**
```typescript
interface CrystalMatchInput {
  birthDate: Date;
  birthTime?: { hour: number; minute: number };
  concerns: string[]; // Array of selected concern keys
  otherConcern?: string;
}
```

**Bazi Chart (Simplified for MVP):**
```typescript
interface SimplifiedBaziChart {
  yearElement: BaziElement;
  dayElement: BaziElement;
  dominantElement: BaziElement;
  deficientElements: BaziElement[];
  excessElements: BaziElement[];
}
```

**Match Result:**
```typescript
interface CrystalMatch {
  productId: number;
  product: Product;
  compatibilityScore: number; // 0-100
  reasons: string[]; // ["Balances your Fire energy", "Supports emotional calm"]
  aiExplanation: string; // Personalized paragraph from Gemini
}
```

## Implementation Steps

### Phase 1: Data & Logic Layer

**Step 1.1: Create Concern Mappings**
File: `lib/concern-mappings.ts`
- Define `CONCERN_CATEGORIES` object (5 categories, ~20 concerns)
- Define `CONCERN_ELEMENT_MAP` (map each concern to beneficial elements)
- Define `CONCERN_PROPERTIES_MAP` (map concerns to metaphysical properties)

**Step 1.2: Create Simplified Bazi Calculator**
File: `lib/bazi-calculator.ts`
- Function: `calculateYearElement(year: number): BaziElement`
  - Use Chinese zodiac cycle (12-year + 10 stems = 60-year cycle)
- Function: `calculateDayElement(date: Date): BaziElement`
  - Simplified day pillar calculation
- Function: `analyzeBaziBalance(chart: SimplifiedBaziChart): ElementAnalysis`
  - Identify dominant, deficient, excess elements
  - Return which elements would be beneficial

**Step 1.3: Create Crystal Matcher**
File: `lib/crystal-matcher.ts`
- Function: `matchCrystals(input: CrystalMatchInput): Promise<CrystalMatch[]>`
  - Calculate Bazi chart
  - Determine beneficial elements from chart
  - Map concerns to beneficial elements
  - Query products matching beneficial elements
  - Calculate compatibility scores
  - Generate AI explanations for top 5
  - Return sorted matches

### Phase 2: AI Integration

**Step 2.1: Create Match Explanation Generator**
File: `lib/ai-generators.ts` (add new function)
- Function: `generateCrystalMatchExplanation(product, baziChart, concerns): Promise<string>`
  - Construct prompt with Bazi chart, concerns, and crystal properties
  - Call Gemini API
  - Return personalized explanation (2-3 sentences)

**Prompt Template:**
```
You are a Bazi and crystal healing expert. Generate a warm, personalized explanation (2-3 sentences) for why this crystal is recommended.

User's Bazi Profile:
- Dominant Element: {dominantElement}
- Needs: {deficientElements}
- Concerns: {concerns}

Crystal: {crystalName}
- Element: {crystalElement}
- Properties: {metaphysicalProperties}

Explain how this crystal supports their unique energy profile and intentions. Use "you/your" language. Be specific to their chart, not generic.
```

### Phase 3: UI Components

**Step 3.1: Create Multi-Step Form Component**
File: `components/find-crystal/crystal-finder-form.tsx`
- Client component with state management
- Step 1: Date/Time inputs with validation
- Step 2: Concern checkboxes (grouped by category)
- Step 3: Loading animation
- Step 4: Results display
- Use `react-hook-form` for validation

**Step 3.2: Create Results Components**
File: `components/find-crystal/crystal-match-card.tsx`
- Display product image, name, element badge
- Compatibility score (visual indicator)
- AI explanation
- "Shop Now" button

File: `components/find-crystal/bazi-summary.tsx`
- Simple visual representation of user's element
- 1-2 sentence explanation

### Phase 4: Page & API

**Step 4.1: Create Find Your Crystal Page**
File: `app/(public)/find-your-crystal/page.tsx`
- Server component that renders the form
- SEO metadata
- Hero section with value proposition

**Step 4.2: Create API Route or Server Action**
File: `app/api/crystal-match/route.ts` OR use Server Action
- Validate input
- Call `matchCrystals()`
- Return results
- Consider caching for identical inputs

### Phase 5: Testing & Polish

**Step 5.1: Test with Sample Data**
- Test with various birth dates (different elements)
- Test with different concern combinations
- Verify AI explanations are personalized

**Step 5.2: Add Loading States & Error Handling**
- Graceful degradation if AI fails
- Fallback to static explanations
- Form validation errors

**Step 5.3: Responsive Design**
- Mobile-first approach
- Touch-friendly checkboxes
- Smooth transitions between steps

## Concern Categories (Final List)

```typescript
const CONCERN_CATEGORIES = {
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
}
```

## Element-Concern Mapping (Sample)

```typescript
const CONCERN_ELEMENT_MAP = {
  "Peace & Calm": ["WATER", "EARTH"],
  "Emotional Balance": ["WATER", "EARTH"],
  "Joy & Positivity": ["FIRE", "WOOD"],
  "Releasing Worry": ["WATER", "METAL"],
  "Inner Strength": ["EARTH", "METAL"],
  "Authentic Connections": ["FIRE", "WOOD"],
  "Healthy Boundaries": ["METAL", "EARTH"],
  "Attracting Love": ["FIRE", "WATER"],
  "Self-Confidence": ["FIRE", "WOOD"],
  "Mental Clarity": ["METAL", "WATER"],
  "Spiritual Protection": ["METAL", "EARTH"],
  "Grounding & Centering": ["EARTH"],
  "Restful Sleep": ["WATER", "EARTH"],
  "Vitality & Energy": ["FIRE", "WOOD"],
  // ... etc
}
```

## Verification Checklist

- [ ] Can enter birth date and get element calculation
- [ ] Can select multiple concerns
- [ ] Receives 5 personalized crystal recommendations
- [ ] AI explanations reference user's specific Bazi + concerns
- [ ] Can click through to shop product
- [ ] Works on mobile
- [ ] Graceful error handling

## Future Enhancements (Post-MVP)

- Full 4-pillar Bazi chart (Year, Month, Day, Hour)
- Location-based solar calendar conversion
- Visual Bazi chart diagram
- Save/email results
- Social sharing
- A/B test different concern lists
