# Supplier Quotes Feature - Implementation Plan Addendum

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans OR superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add prospect supplier quotes feature to track potential suppliers and their quoted prices, allowing comparison between actual supplier performance and prospect quotes for best value analysis.

**Architecture:** Extends existing Prisma schema with `SupplierQuote` model and `QuoteStatus` enum. API endpoints for CRUD operations on quotes and enhanced supplier comparison that includes both actual purchases and prospect quotes.

**Tech Stack:** Prisma 5, MySQL, Next.js 15 API Routes, TypeScript

---

## Task 6A: Add Supplier Quotes Schema

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/XXXXXX_add_supplier_quotes/migration.sql` (auto-generated)

**Step 1: Update Prisma schema with SupplierQuote model**

Schema already updated with:
- `SupplierQuote` model with fields: quotedPricePerGram, minimumOrderGrams, estimatedQualityRating, status, expiresAt
- `QuoteStatus` enum: PENDING, ACCEPTED, REJECTED, EXPIRED
- Relations: Supplier hasMany quotes, Product hasMany quotes
- Conversion tracking: convertedPurchaseId links quote to actual purchase

**Step 2: Verify MySQL is running**

```bash
"C:\xampp7\mysql\bin\mysql.exe" -u root -e "SELECT 1"
```

Expected: Connection successful

**Step 3: Generate Prisma client**

```bash
cd C:\xampp7\htdocs\crystal
npx prisma generate
```

Expected: Client generated with SupplierQuote model

**Step 4: Create and run migration**

```bash
npx prisma migrate dev --name add_supplier_quotes
```

Expected: Migration created and applied successfully

**Step 5: Verify in database**

```bash
"C:\xampp7\mysql\bin\mysql.exe" -u root crystal_ecommerce -e "SHOW TABLES LIKE 'supplier_quotes';"
```

Expected: Table exists

**Step 6: Add sample quote data to seed**

Modify `prisma/seed.ts` - add after supplier creation, before products:

```typescript
// Create prospect quotes
const quote1 = await prisma.supplierQuote.create({
  data: {
    supplierId: fafa.id,
    productId: 1, // Will reference Sakura Rhodonite after products created
    quotedPricePerGram: 0.20,
    minimumOrderGrams: 50.00,
    estimatedQualityRating: 4,
    quoteDate: new Date('2025-11-25'),
    expiresAt: new Date('2025-12-25'),
    status: 'PENDING',
    notes: 'Bulk discount available for 100g+',
  },
});

console.log('✓ Prospect quotes created');
```

**Note:** Move this after product creation in seed file

**Step 7: Run seed to add quote data**

```bash
npx prisma db seed
```

Expected: Quote data inserted

**Step 8: Commit**

```bash
git add prisma/
git commit -m "feat: add SupplierQuote model and QuoteStatus enum to schema"
```

---

## Task 6B: Create Supplier Quotes API

**Files:**
- Create: `app/api/suppliers/quotes/route.ts`
- Create: `app/api/suppliers/quotes/[id]/route.ts`
- Create: `app/api/suppliers/quotes/__tests__/route.test.ts`

**Step 1: Write test for quotes list endpoint**

Create `app/api/suppliers/quotes/__tests__/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';

describe('GET /api/suppliers/quotes', () => {
  it('should return all pending quotes', async () => {
    const request = new Request('http://localhost:3000/api/suppliers/quotes');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('should filter by status query param', async () => {
    const request = new Request('http://localhost:3000/api/suppliers/quotes?status=PENDING');
    const response = await GET(request);
    const data = await response.json();

    expect(data.every((q: any) => q.status === 'PENDING')).toBe(true);
  });

  it('should filter by productId query param', async () => {
    const request = new Request('http://localhost:3000/api/suppliers/quotes?productId=1');
    const response = await GET(request);
    const data = await response.json();

    expect(data.every((q: any) => q.productId === 1)).toBe(true);
  });
});

describe('POST /api/suppliers/quotes', () => {
  it('should create new quote', async () => {
    const quoteData = {
      supplierId: 1,
      productId: 1,
      quotedPricePerGram: 0.30,
      minimumOrderGrams: 25.00,
      estimatedQualityRating: 5,
      expiresAt: '2025-12-31',
      notes: 'Premium grade quote'
    };

    const request = new Request('http://localhost:3000/api/suppliers/quotes', {
      method: 'POST',
      body: JSON.stringify(quoteData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.quotedPricePerGram).toBe('0.3000');
    expect(data.status).toBe('PENDING');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL - module not found

**Step 3: Implement quotes list endpoint**

Create `app/api/suppliers/quotes/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const productId = searchParams.get('productId');
  const supplierId = searchParams.get('supplierId');

  const quotes = await prisma.supplierQuote.findMany({
    where: {
      ...(status && { status: status as any }),
      ...(productId && { productId: parseInt(productId) }),
      ...(supplierId && { supplierId: parseInt(supplierId) }),
    },
    include: {
      supplier: {
        select: { id: true, name: true, contactEmail: true },
      },
      product: {
        select: { id: true, baseName: true, sizeMm: true, qualityGrade: true, sku: true },
      },
      convertedPurchase: {
        select: { id: true, purchaseDate: true, costTotal: true },
      },
    },
    orderBy: { quoteDate: 'desc' },
  });

  return NextResponse.json(quotes);
}

export async function POST(request: Request) {
  const body = await request.json();

  const quote = await prisma.supplierQuote.create({
    data: {
      supplierId: body.supplierId,
      productId: body.productId,
      quotedPricePerGram: body.quotedPricePerGram,
      minimumOrderGrams: body.minimumOrderGrams,
      estimatedQualityRating: body.estimatedQualityRating,
      quoteDate: body.quoteDate ? new Date(body.quoteDate) : new Date(),
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      notes: body.notes,
    },
    include: {
      supplier: true,
      product: true,
    },
  });

  return NextResponse.json(quote, { status: 201 });
}
```

**Step 4: Run test to verify it passes**

```bash
npm test
```

Expected: PASS

**Step 5: Create single quote endpoint**

Create `app/api/suppliers/quotes/[id]/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const quote = await prisma.supplierQuote.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      supplier: true,
      product: true,
      convertedPurchase: true,
    },
  });

  if (!quote) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  }

  return NextResponse.json(quote);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  const quote = await prisma.supplierQuote.update({
    where: { id: parseInt(params.id) },
    data: {
      ...body,
      ...(body.expiresAt && { expiresAt: new Date(body.expiresAt) }),
    },
    include: {
      supplier: true,
      product: true,
    },
  });

  return NextResponse.json(quote);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.supplierQuote.delete({
    where: { id: parseInt(params.id) },
  });

  return NextResponse.json({ success: true });
}
```

**Step 6: Test endpoints**

```bash
# List quotes
curl http://localhost:3000/api/suppliers/quotes

# Get single quote
curl http://localhost:3000/api/suppliers/quotes/1

# Create quote
curl -X POST http://localhost:3000/api/suppliers/quotes \
  -H "Content-Type: application/json" \
  -d '{"supplierId":1,"productId":1,"quotedPricePerGram":0.28}'
```

Expected: All endpoints working

**Step 7: Commit**

```bash
git add app/api/suppliers/quotes/
git commit -m "feat: add supplier quotes CRUD API endpoints with tests"
```

---

## Task 6C: Enhanced Supplier Comparison with Quotes

**Files:**
- Modify: `app/api/suppliers/comparison/route.ts`
- Create: `app/api/suppliers/comparison/__tests__/route.test.ts`

**Step 1: Write test for comparison with quotes**

Create `app/api/suppliers/comparison/__tests__/route.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { GET } from '../route';

describe('GET /api/suppliers/comparison', () => {
  it('should return comparison with both purchases and quotes', async () => {
    const request = new Request('http://localhost:3000/api/suppliers/comparison?productId=1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('actualPerformance');
    expect(data[0]).toHaveProperty('prospectQuotes');
  });

  it('should rank by value score', async () => {
    const request = new Request('http://localhost:3000/api/suppliers/comparison?productId=1');
    const response = await GET(request);
    const data = await response.json();

    for (let i = 1; i < data.length; i++) {
      const prevScore = data[i - 1].actualPerformance?.valueScore || 0;
      const currScore = data[i].actualPerformance?.valueScore || 0;
      expect(prevScore).toBeGreaterThanOrEqual(currScore);
    }
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL - structure doesn't match

**Step 3: Implement enhanced comparison endpoint**

Create `app/api/suppliers/comparison/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json(
      { error: 'productId query parameter required' },
      { status: 400 }
    );
  }

  const prodId = parseInt(productId);

  // Get actual purchase history
  const purchases = await prisma.inventoryPurchase.findMany({
    where: { productId: prodId },
    include: { supplier: true },
  });

  // Get prospect quotes
  const quotes = await prisma.supplierQuote.findMany({
    where: {
      productId: prodId,
      status: { in: ['PENDING', 'ACCEPTED'] },
    },
    include: { supplier: true },
  });

  // Group purchases by supplier
  const purchaseStats = purchases.reduce((acc, purchase) => {
    const sid = purchase.supplierId;

    if (!acc[sid]) {
      acc[sid] = {
        supplierId: sid,
        supplierName: purchase.supplier.name,
        purchases: [],
        totalCost: 0,
        totalWeight: 0,
        qualityRatings: [],
      };
    }

    acc[sid].purchases.push(purchase);
    acc[sid].totalCost += purchase.costTotal.toNumber();
    acc[sid].totalWeight += purchase.weightGrams.toNumber();

    if (purchase.qualityRating) {
      acc[sid].qualityRatings.push(purchase.qualityRating);
    }

    return acc;
  }, {} as Record<number, any>);

  // Group quotes by supplier
  const quoteStats = quotes.reduce((acc, quote) => {
    const sid = quote.supplierId;

    if (!acc[sid]) {
      acc[sid] = {
        supplierId: sid,
        supplierName: quote.supplier.name,
        quotes: [],
      };
    }

    acc[sid].quotes.push({
      id: quote.id,
      quotedPricePerGram: quote.quotedPricePerGram.toNumber(),
      estimatedQualityRating: quote.estimatedQualityRating,
      minimumOrderGrams: quote.minimumOrderGrams?.toNumber(),
      expiresAt: quote.expiresAt,
      status: quote.status,
      notes: quote.notes,
    });

    return acc;
  }, {} as Record<number, any>);

  // Merge and calculate comparison
  const allSupplierIds = new Set([
    ...Object.keys(purchaseStats).map(Number),
    ...Object.keys(quoteStats).map(Number),
  ]);

  const comparison = Array.from(allSupplierIds).map((supplierId) => {
    const purchaseStat = purchaseStats[supplierId];
    const quoteStat = quoteStats[supplierId];

    let actualPerformance = null;
    if (purchaseStat) {
      const avgCostPerGram = purchaseStat.totalCost / purchaseStat.totalWeight;
      const avgQuality = purchaseStat.qualityRatings.length > 0
        ? purchaseStat.qualityRatings.reduce((sum: number, r: number) => sum + r, 0) /
          purchaseStat.qualityRatings.length
        : null;

      const valueScore = avgQuality ? avgQuality / avgCostPerGram : 0;

      actualPerformance = {
        purchaseCount: purchaseStat.purchases.length,
        avgCostPerGram: parseFloat(avgCostPerGram.toFixed(4)),
        avgQuality: avgQuality ? parseFloat(avgQuality.toFixed(2)) : null,
        valueScore: parseFloat(valueScore.toFixed(2)),
      };
    }

    const prospectQuotes = quoteStat?.quotes || [];

    // Calculate best prospect value if quotes exist
    let bestProspectValue = null;
    if (prospectQuotes.length > 0) {
      const validQuotes = prospectQuotes.filter(
        (q: any) => q.estimatedQualityRating && q.quotedPricePerGram
      );

      if (validQuotes.length > 0) {
        const prospectScores = validQuotes.map((q: any) => ({
          pricePerGram: q.quotedPricePerGram,
          estimatedQuality: q.estimatedQualityRating,
          prospectValueScore: q.estimatedQualityRating / q.quotedPricePerGram,
        }));

        const best = prospectScores.reduce((prev, curr) =>
          curr.prospectValueScore > prev.prospectValueScore ? curr : prev
        );

        bestProspectValue = {
          quotedPricePerGram: best.pricePerGram,
          estimatedQuality: best.estimatedQuality,
          prospectValueScore: parseFloat(best.prospectValueScore.toFixed(2)),
        };
      }
    }

    return {
      supplierId,
      supplierName: purchaseStat?.supplierName || quoteStat?.supplierName,
      actualPerformance,
      prospectQuotes,
      bestProspectValue,
      // Overall score for ranking (prefer actual, fallback to prospect)
      overallScore: actualPerformance?.valueScore || bestProspectValue?.prospectValueScore || 0,
    };
  });

  // Sort by overall score descending
  comparison.sort((a, b) => b.overallScore - a.overallScore);

  return NextResponse.json(comparison);
}
```

**Step 4: Run test to verify it passes**

```bash
npm test
```

Expected: PASS

**Step 5: Test comparison endpoint**

```bash
curl "http://localhost:3000/api/suppliers/comparison?productId=1"
```

Expected: JSON showing suppliers with both actual performance and prospect quotes

**Step 6: Commit**

```bash
git add app/api/suppliers/comparison/
git commit -m "feat: enhance supplier comparison to include prospect quotes"
```

---

## Task 6D: Update Seed with More Quote Examples

**Files:**
- Modify: `prisma/seed.ts`

**Step 1: Add comprehensive quote examples**

Add to `prisma/seed.ts` after products are created:

```typescript
// Create prospect supplier quotes
console.log('Creating prospect quotes...');

// New supplier with only quotes (no purchases yet)
const newSupplier = await prisma.supplier.create({
  data: {
    name: 'Crystal Direct Wholesale',
    contactEmail: 'quotes@crystaldirect.com',
    notes: 'New supplier, competitive pricing, no purchase history yet',
  },
});

// Quote from new supplier - better price than fafa
await prisma.supplierQuote.create({
  data: {
    supplierId: newSupplier.id,
    productId: sakuraRhod10Normal.id,
    quotedPricePerGram: 0.20, // vs fafa's actual 0.25
    minimumOrderGrams: 50.00,
    estimatedQualityRating: 4, // same as fafa's actual
    quoteDate: new Date('2025-11-25'),
    expiresAt: new Date('2025-12-31'),
    status: 'PENDING',
    notes: 'Bulk discount - 100g+ gets 0.18/gram',
  },
});

// Quote from existing supplier (pandora) for different product
await prisma.supplierQuote.create({
  data: {
    supplierId: pandora.id,
    productId: blueMoon8Normal.id,
    quotedPricePerGram: 0.38, // vs fafa's actual 0.40
    minimumOrderGrams: 30.00,
    estimatedQualityRating: 5, // higher than fafa's 4
    quoteDate: new Date('2025-11-27'),
    expiresAt: new Date('2026-01-15'),
    status: 'PENDING',
    notes: 'Premium grade blue flash, AAA quality',
  },
});

// Quote from fafa for product they haven't sold yet
await prisma.supplierQuote.create({
  data: {
    supplierId: fafa.id,
    productId: sakuraRhod10Good.id,
    quotedPricePerGram: 0.42, // vs pandora's actual 0.45
    minimumOrderGrams: 25.00,
    estimatedQualityRating: 5,
    quoteDate: new Date('2025-11-26'),
    expiresAt: new Date('2025-12-20'),
    status: 'PENDING',
    notes: 'Can match pandora quality at lower price',
  },
});

// Expired quote (for testing status filter)
await prisma.supplierQuote.create({
  data: {
    supplierId: fafa.id,
    productId: sakuraRhod12Normal.id,
    quotedPricePerGram: 0.22,
    minimumOrderGrams: 40.00,
    estimatedQualityRating: 4,
    quoteDate: new Date('2025-10-01'),
    expiresAt: new Date('2025-10-31'),
    status: 'EXPIRED',
    notes: 'Missed this quote - expired last month',
  },
});

console.log('✓ Prospect quotes created');
```

**Step 2: Reset and reseed database**

```bash
npx prisma migrate reset
```

Expected: Database reset and reseeded with quotes

**Step 3: Verify quotes in Prisma Studio**

```bash
npx prisma studio
```

Expected: See supplier_quotes table with 4 quotes

**Step 4: Commit**

```bash
git add prisma/seed.ts
git commit -m "feat: add comprehensive supplier quote examples to seed data"
```

---

## Testing Checklist

After implementation, verify:

- [ ] `GET /api/suppliers/quotes` returns all quotes
- [ ] `GET /api/suppliers/quotes?status=PENDING` filters correctly
- [ ] `GET /api/suppliers/quotes?productId=1` filters by product
- [ ] `POST /api/suppliers/quotes` creates new quote
- [ ] `PATCH /api/suppliers/quotes/[id]` updates quote status
- [ ] `DELETE /api/suppliers/quotes/[id]` removes quote
- [ ] `GET /api/suppliers/comparison?productId=1` shows both purchases and quotes
- [ ] Comparison ranks suppliers by value score correctly
- [ ] New suppliers with only quotes appear in comparison
- [ ] Expired quotes are excluded from comparison (or marked)

---

## Success Criteria

1. **Schema**: SupplierQuote model created with proper relations
2. **API**: Full CRUD operations on quotes working
3. **Comparison**: Enhanced endpoint shows actual vs prospect supplier value
4. **Data**: Seed includes realistic quote examples
5. **Tests**: All vitest tests passing
6. **Documentation**: This plan documents the feature completely

---

## Execution Options

**Plan complete and saved to `docs/plans/2025-11-28-supplier-quotes-addendum.md`. Two execution options:**

**1. Subagent-Driven (this session)** - Dispatch fresh subagent per task (6A, 6B, 6C, 6D), review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach would you prefer?
