# Find Your Crystal - Bazi Matching Tool Frontend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive "Find Your Crystal" page where users enter their birth year, see their Bazi chart, and get personalized crystal recommendations with compatibility scores.

**Architecture:** Next.js App Router page with React Server Components for initial load, Client Components for interactive form. Calls `/api/bazi/match` endpoint. Uses shadcn/ui for form components. Displays Bazi chart visualization, top 10 crystal matches with element badges, compatibility scores, and explanations. Mobile-first responsive design with Tailwind CSS.

**Tech Stack:** Next.js 15, TypeScript, React, Tailwind CSS, shadcn/ui, Lucide React icons

---

## Task 11: Install shadcn/ui Components

**Files:**
- Create: `components.json`
- Install: shadcn/ui CLI and components

**Step 1: Initialize shadcn/ui**

```bash
cd C:\xampp7\htdocs\crystal
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes
- Tailwind config: tailwind.config.ts
- Import alias: @/components
- React Server Components: Yes

Expected: Creates `components.json` and `components/ui/` directory

**Step 2: Install required UI components**

```bash
npx shadcn@latest add button card input label badge
```

Expected: Creates component files in `components/ui/`

**Step 3: Verify installation**

```bash
ls components/ui/
```

Expected: Shows button.tsx, card.tsx, input.tsx, label.tsx, badge.tsx

**Step 4: Commit**

```bash
git add components/ components.json lib/utils.ts
git commit -m "chore: initialize shadcn/ui with required components

- Add button, card, input, label, badge components
- Configure with Slate color scheme
- Set up utility helpers

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 12: Create Bazi Chart Display Component

**Files:**
- Create: `components/bazi/BaziChart.tsx`
- Create: `components/bazi/ElementBadge.tsx`

**Step 1: Create ElementBadge component**

Create `components/bazi/ElementBadge.tsx`:

```tsx
import { Badge } from '@/components/ui/badge';

interface ElementBadgeProps {
  element: string;
}

const elementColors: Record<string, string> = {
  wood: 'bg-green-100 text-green-800 border-green-300',
  fire: 'bg-red-100 text-red-800 border-red-300',
  earth: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  metal: 'bg-gray-100 text-gray-800 border-gray-300',
  water: 'bg-blue-100 text-blue-800 border-blue-300',
};

export function ElementBadge({ element }: ElementBadgeProps) {
  const colorClass = elementColors[element.toLowerCase()] || 'bg-gray-100';

  return (
    <Badge variant="outline" className={`${colorClass} capitalize`}>
      {element}
    </Badge>
  );
}
```

**Step 2: Create BaziChart component**

Create `components/bazi/BaziChart.tsx`:

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ElementBadge } from './ElementBadge';

interface BaziChartData {
  birthYear: number;
  animal: string;
  element: string;
  dominantElement: string;
  secondaryElement: string | null;
  needsBalance: string[];
  strengths: string[];
}

interface BaziChartProps {
  data: BaziChartData;
}

export function BaziChart({ data }: BaziChartProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Your Bazi Chart</CardTitle>
        <CardDescription>
          Born in {data.birthYear} - Year of the {data.animal}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Zodiac Animal</p>
            <p className="text-lg font-semibold">{data.animal}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Year Element</p>
            <ElementBadge element={data.element} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Dominant Element</p>
            <ElementBadge element={data.dominantElement} />
          </div>
          {data.secondaryElement && (
            <div>
              <p className="text-sm font-medium text-gray-500">Secondary Element</p>
              <ElementBadge element={data.secondaryElement} />
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Strengths</p>
          <div className="flex gap-2 flex-wrap">
            {data.strengths.map((element) => (
              <ElementBadge key={element} element={element} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 mb-2">Needs Balance</p>
          <div className="flex gap-2 flex-wrap">
            {data.needsBalance.map((element) => (
              <ElementBadge key={element} element={element} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 3: Verify components render**

Create test file to verify (will delete after):

```bash
echo "import { BaziChart } from '@/components/bazi/BaziChart';
const testData = {
  birthYear: 1990,
  animal: 'Horse',
  element: 'metal',
  dominantElement: 'metal',
  secondaryElement: 'water',
  needsBalance: ['fire', 'wood'],
  strengths: ['metal', 'earth']
};
console.log('Components created successfully');" > test-components.ts
```

```bash
npx tsx test-components.ts
rm test-components.ts
```

Expected: "Components created successfully"

**Step 4: Commit**

```bash
git add components/bazi/
git commit -m "feat: add Bazi chart display components

- BaziChart component shows zodiac animal and elements
- ElementBadge component with color coding
- Responsive grid layout for chart data

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 13: Create Crystal Recommendation Card Component

**Files:**
- Create: `components/bazi/CrystalRecommendation.tsx`

**Step 1: Create CrystalRecommendation component**

Create `components/bazi/CrystalRecommendation.tsx`:

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ElementBadge } from './ElementBadge';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface CompatibilityScore {
  totalScore: number;
  elementScore: number;
  zodiacScore: number;
  explanation: string;
  warnings: string[];
  recommendations: string[];
}

interface CrystalMatch {
  productId: number;
  productName: string;
  crystalType: string;
  element: string;
  compatibilityScore: CompatibilityScore;
  price: number;
  inStock: boolean;
}

interface CrystalRecommendationProps {
  crystal: CrystalMatch;
  rank: number;
}

export function CrystalRecommendation({ crystal, rank }: CrystalRecommendationProps) {
  const { compatibilityScore } = crystal;
  const scoreColor = compatibilityScore.totalScore >= 75
    ? 'text-green-600'
    : compatibilityScore.totalScore >= 50
    ? 'text-blue-600'
    : 'text-yellow-600';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">#{rank}</Badge>
              <CardTitle className="text-xl">{crystal.crystalType}</CardTitle>
            </div>
            <CardDescription className="mt-1">
              {crystal.productName}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${scoreColor}`}>
              {compatibilityScore.totalScore}
            </p>
            <p className="text-xs text-gray-500">Compatibility</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <ElementBadge element={crystal.element} />
          {crystal.inStock ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              In Stock
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
              Out of Stock
            </Badge>
          )}
          <span className="text-sm font-medium ml-auto">
            ${crystal.price.toFixed(2)}
          </span>
        </div>

        {compatibilityScore.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              {compatibilityScore.explanation}
            </p>
          </div>
        )}

        {compatibilityScore.recommendations.length > 0 && (
          <div className="space-y-2">
            {compatibilityScore.recommendations.map((rec, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{rec}</p>
              </div>
            ))}
          </div>
        )}

        {compatibilityScore.warnings.length > 0 && (
          <div className="space-y-2">
            {compatibilityScore.warnings.map((warning, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">{warning}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2 border-t">
          <div>
            <p className="text-xs text-gray-500">Element Score</p>
            <p className="text-sm font-medium">
              {compatibilityScore.elementScore > 0 ? '+' : ''}
              {compatibilityScore.elementScore}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Zodiac Score</p>
            <p className="text-sm font-medium">
              {compatibilityScore.zodiacScore > 0 ? '+' : ''}
              {compatibilityScore.zodiacScore}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Commit**

```bash
git add components/bazi/CrystalRecommendation.tsx
git commit -m "feat: add crystal recommendation card component

- Display compatibility score with color coding
- Show element badges and stock status
- Include recommendations and warnings
- Break down element and zodiac scores

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 14: Create Find Your Crystal Page with Form

**Files:**
- Create: `app/(public)/find-your-crystal/page.tsx`
- Create: `app/(public)/layout.tsx`

**Step 1: Create public layout**

Create `app/(public)/layout.tsx`:

```tsx
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-purple-900">Crystal Essence</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```

**Step 2: Create Find Your Crystal page**

Create `app/(public)/find-your-crystal/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BaziChart } from '@/components/bazi/BaziChart';
import { CrystalRecommendation } from '@/components/bazi/CrystalRecommendation';
import { Sparkles, Loader2 } from 'lucide-react';

interface BaziChartData {
  birthYear: number;
  animal: string;
  element: string;
  dominantElement: string;
  secondaryElement: string | null;
  needsBalance: string[];
  strengths: string[];
}

interface CrystalMatch {
  productId: number;
  productName: string;
  crystalType: string;
  element: string;
  compatibilityScore: {
    totalScore: number;
    elementScore: number;
    zodiacScore: number;
    explanation: string;
    warnings: string[];
    recommendations: string[];
  };
  price: number;
  inStock: boolean;
}

interface MatchResponse {
  baziChart: BaziChartData;
  recommendations: CrystalMatch[];
  totalMatches: number;
}

export default function FindYourCrystalPage() {
  const [birthYear, setBirthYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<MatchResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const year = parseInt(birthYear);
      if (isNaN(year) || year < 1900 || year > 2100) {
        setError('Please enter a valid birth year between 1900 and 2100');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/bazi/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthYear: year }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch recommendations');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-purple-900">
          Find Your Perfect Crystal
        </h1>
        <p className="text-lg text-gray-600">
          Discover crystals that resonate with your unique energy based on Chinese Bazi astrology
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Enter Your Birth Year
          </CardTitle>
          <CardDescription>
            We'll calculate your Bazi chart and recommend crystals that harmonize with your elemental energy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="birthYear">Birth Year</Label>
              <Input
                id="birthYear"
                type="number"
                placeholder="1990"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                min="1900"
                max="2100"
                required
              />
              <p className="text-xs text-gray-500">
                Enter any year between 1900 and 2100
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finding Your Crystals...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Find My Crystals
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results && (
        <>
          <BaziChart data={results.baziChart} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-purple-900">
                Your Crystal Matches
              </h2>
              <p className="text-sm text-gray-500">
                {results.totalMatches} crystals analyzed
              </p>
            </div>

            <div className="grid gap-4">
              {results.recommendations.map((crystal, idx) => (
                <CrystalRecommendation
                  key={crystal.productId}
                  crystal={crystal}
                  rank={idx + 1}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

**Step 3: Update root page to link to new page**

Modify `app/page.tsx`:

```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-purple-50 to-white">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl font-bold text-purple-900">Crystal Essence</h1>
        <p className="text-xl text-gray-600">
          Discover crystals that resonate with your unique energy
        </p>
        <p className="text-lg text-gray-500">
          Using authentic Chinese Bazi astrology to find your perfect crystal match
        </p>
        <Link href="/find-your-crystal">
          <Button size="lg" className="mt-4">
            <Sparkles className="w-5 h-5 mr-2" />
            Find Your Crystal
          </Button>
        </Link>
      </div>
    </main>
  );
}
```

**Step 4: Test the page manually**

```bash
npm run dev
```

1. Open http://localhost:3000
2. Click "Find Your Crystal" button
3. Enter birth year (e.g., 1990)
4. Submit form
5. Verify Bazi chart displays
6. Verify crystal recommendations display

Expected: Full flow works, API returns data, UI renders correctly

**Step 5: Commit**

```bash
git add app/
git commit -m "feat: add Find Your Crystal page with Bazi matching UI

- Interactive birth year form with validation
- Displays Bazi chart with element visualization
- Shows top 10 crystal recommendations sorted by compatibility
- Responsive design with loading states
- Error handling for invalid years and API errors
- Updated homepage with link to finder tool

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 15: Add Lucide React Icons

**Files:**
- Modify: `package.json`

**Step 1: Install lucide-react**

```bash
npm install lucide-react
```

Expected: Package installed successfully

**Step 2: Verify installation**

```bash
npm list lucide-react
```

Expected: Shows lucide-react version

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add lucide-react for icons

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Task 16: Final Integration Testing

**Step 1: Run all tests**

```bash
npm test
```

Expected: All 12 Bazi tests still passing

**Step 2: Manual testing checklist**

Start dev server:
```bash
npm run dev
```

Test flow:
- [ ] Homepage loads at http://localhost:3000
- [ ] Click "Find Your Crystal" navigates to /find-your-crystal
- [ ] Enter valid birth year (1990) and submit
- [ ] Bazi chart displays with correct animal (Horse) and element (Metal)
- [ ] 10 crystal recommendations display
- [ ] Compatibility scores show (should have crystals with 75+ scores)
- [ ] Element badges have correct colors
- [ ] Stock status displays correctly
- [ ] Try invalid year (1980) - should show error about unmappable year
- [ ] Try year < 1900 - should show validation error
- [ ] Mobile responsive - resize browser to 375px width

**Step 3: Fix any issues found**

If any issues found during manual testing, fix before proceeding.

**Step 4: Take screenshots for documentation**

Create `docs/screenshots/` directory and capture:
1. Homepage
2. Find Your Crystal form
3. Bazi chart result
4. Crystal recommendations

**Step 5: Final commit**

```bash
git add docs/screenshots/
git commit -m "docs: add screenshots of Bazi matching tool

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Summary

**Files Created:**
- `components.json` - shadcn/ui configuration
- `components/ui/*.tsx` - UI component library (5 components)
- `components/bazi/ElementBadge.tsx` - Element color badges
- `components/bazi/BaziChart.tsx` - Bazi chart display
- `components/bazi/CrystalRecommendation.tsx` - Crystal match cards
- `app/(public)/layout.tsx` - Public pages layout
- `app/(public)/find-your-crystal/page.tsx` - Main finder page

**Files Modified:**
- `app/page.tsx` - Updated homepage with CTA
- `package.json` - Added lucide-react

**Features Implemented:**
- ✅ Interactive birth year form with validation
- ✅ Bazi chart visualization with elements and zodiac
- ✅ Top 10 crystal recommendations sorted by compatibility
- ✅ Color-coded compatibility scores
- ✅ Element badges with proper styling
- ✅ Recommendations and warnings display
- ✅ Stock status and pricing
- ✅ Responsive mobile-first design
- ✅ Loading and error states
- ✅ Professional UI with shadcn/ui components

**Total Commits:** 6 commits covering installation, components, page, and testing
