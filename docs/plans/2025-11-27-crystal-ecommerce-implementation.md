# Crystal E-Commerce Platform - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete e-commerce platform for crystal merchandise with inventory management, supplier analytics, Bazi matching tool, and AI-powered content generation.

**Architecture:** Next.js 15 App Router with MySQL backend via Prisma ORM. Public storefront + protected admin area. AI content generation uses Vercel AI SDK with Anthropic Claude and RAG knowledge base. p5.js algorithmic art for element-based backgrounds. Manual payment processing (no merchant integration).

**Tech Stack:** Next.js 15, TypeScript, MySQL 8.0+, Prisma, Tailwind CSS, shadcn/ui, Vercel AI SDK, Anthropic Claude API, p5.js, NextAuth.js

---

## Phase 1: Project Foundation

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`

**Step 1: Initialize Next.js with TypeScript**

```bash
cd C:\xampp7\htdocs\crystal
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

**When prompted:**
- ✓ Would you like to use TypeScript? Yes
- ✓ Would you like to use ESLint? Yes
- ✓ Would you like to use Tailwind CSS? Yes
- ✓ Would you like to use `src/` directory? No
- ✓ Would you like to use App Router? Yes
- ✓ Would you like to customize the default import alias? Yes → @/*

**Step 2: Install additional dependencies**

```bash
npm install @prisma/client @vercel/ai ai @anthropic-ai/sdk zod
npm install -D prisma
npm install next-auth@beta bcrypt
npm install p5 @types/p5
npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge lucide-react
npm install date-fns
npm install sharp
```

**Step 3: Verify dev server runs**

```bash
npm run dev
```

Expected: Server starts on http://localhost:3000

**Step 4: Commit**

```bash
git add .
git commit -m "chore: initialize Next.js 15 project with dependencies"
```

---

### Task 2: Configure Tailwind with Theme Factory

**Files:**
- Modify: `tailwind.config.ts`
- Create: `lib/utils.ts`
- Reference: `theme-config.json` (already exists)

**Step 1: Update Tailwind config with theme colors**

Modify `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";
const themeConfig = require("./theme-config.json");

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: themeConfig.colors.primary,
        primaryHover: themeConfig.colors.primaryHover,
        primaryLight: themeConfig.colors.primaryLight,
        primaryDark: themeConfig.colors.primaryDark,
        secondary: themeConfig.colors.secondary,
        secondaryHover: themeConfig.colors.secondaryHover,
        accent: themeConfig.colors.accent,
        accentHover: themeConfig.colors.accentHover,
        earth: themeConfig.colors.earth,
        background: themeConfig.colors.background,
        backgroundDark: themeConfig.colors.backgroundDark,
        backgroundAlt: themeConfig.colors.backgroundAlt,
        text: themeConfig.colors.text,
        textLight: themeConfig.colors.textLight,
        textInverse: themeConfig.colors.textInverse,
        success: themeConfig.colors.success,
        warning: themeConfig.colors.warning,
        error: themeConfig.colors.error,
        wood: themeConfig.colors.elementColors.wood,
        fire: themeConfig.colors.elementColors.fire,
        metal: themeConfig.colors.elementColors.metal,
        water: themeConfig.colors.elementColors.water,
      },
      fontFamily: {
        heading: themeConfig.typography.fontFamily.heading.split(","),
        body: themeConfig.typography.fontFamily.body.split(","),
        accent: themeConfig.typography.fontFamily.accent.split(","),
        mono: themeConfig.typography.fontFamily.mono.split(","),
      },
      fontSize: themeConfig.typography.fontSize,
      borderRadius: themeConfig.borderRadius,
      boxShadow: themeConfig.shadows,
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

**Step 2: Install tailwindcss-animate**

```bash
npm install tailwindcss-animate
```

**Step 3: Create utility helper**

Create `lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Step 4: Load custom fonts**

Modify `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Cinzel } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant"
});
const cinzel = Cinzel({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cinzel"
});

export const metadata: Metadata = {
  title: "Crystal Essence - Align Your Energy",
  description: "E-commerce platform for crystal merchandise with Bazi matching",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} ${cinzel.variable}`}>
      <body className="font-body bg-background text-text antialiased">
        {children}
      </body>
    </html>
  );
}
```

**Step 5: Update global CSS**

Modify `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-inter: 'Inter', sans-serif;
    --font-cormorant: 'Cormorant Garamond', serif;
    --font-cinzel: 'Cinzel', serif;
  }
}
```

**Step 6: Test dev server with theme**

```bash
npm run dev
```

Expected: Fonts and colors load correctly

**Step 7: Commit**

```bash
git add .
git commit -m "feat: configure Tailwind with Theme Factory colors and fonts"
```

---

### Task 3: Set up Prisma with MySQL

**Files:**
- Create: `prisma/schema.prisma`
- Create: `.env.local`
- Create: `lib/prisma.ts`

**Step 1: Initialize Prisma**

```bash
npx prisma init
```

**Step 2: Configure database connection**

Create `.env.local`:

```env
DATABASE_URL="mysql://root:@localhost:3306/crystal_ecommerce"
NEXTAUTH_SECRET="your-nextauth-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="your-anthropic-api-key"
```

**Step 3: Define Prisma schema**

Modify `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Supplier {
  id            Int       @id @default(autoincrement())
  name          String    @unique @db.VarChar(255)
  contactEmail  String?   @map("contact_email") @db.VarChar(255)
  contactPhone  String?   @map("contact_phone") @db.VarChar(50)
  notes         String?   @db.Text
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  purchases     InventoryPurchase[]

  @@map("suppliers")
}

model Product {
  id                    Int       @id @default(autoincrement())
  baseName              String    @map("base_name") @db.VarChar(255)
  sizeMm                Decimal   @map("size_mm") @db.Decimal(5, 2)
  qualityGrade          QualityGrade @map("quality_grade") @default(NORMAL)
  sku                   String    @unique @db.VarChar(100)
  baziElement           BaziElement? @map("bazi_element")
  metaphysicalProperties Json?    @map("metaphysical_properties")
  description           String?   @db.Text
  isActive              Boolean   @default(true) @map("is_active")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  purchases             InventoryPurchase[]
  stock                 InventoryStock?
  mediaFiles            MediaFile[]
  aiContent             AiGeneratedContent[]

  @@index([baziElement])
  @@index([qualityGrade])
  @@index([isActive])
  @@map("products")
}

model InventoryPurchase {
  id                Int       @id @default(autoincrement())
  productId         Int       @map("product_id")
  supplierId        Int       @map("supplier_id")
  quantityPurchased Int       @map("quantity_purchased")
  weightGrams       Decimal   @map("weight_grams") @db.Decimal(8, 2)
  costTotal         Decimal   @map("cost_total") @db.Decimal(10, 2)
  markupPercentage  Decimal   @map("markup_percentage") @db.Decimal(5, 2) @default(40.00)
  qualityRating     Int?      @map("quality_rating") @db.TinyInt
  purchaseDate      DateTime  @map("purchase_date") @db.Date
  notes             String?   @db.Text
  createdAt         DateTime  @default(now()) @map("created_at")

  product           Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  supplier          Supplier  @relation(fields: [supplierId], references: [id], onDelete: Restrict)

  @@index([productId])
  @@index([supplierId])
  @@index([purchaseDate])
  @@map("inventory_purchases")
}

model InventoryStock {
  id                   Int       @id @default(autoincrement())
  productId            Int       @unique @map("product_id")
  quantityAvailable    Int       @default(0) @map("quantity_available")
  weightGramsAvailable Decimal   @default(0) @map("weight_grams_available") @db.Decimal(8, 2)
  avgCostPerGram       Decimal?  @map("avg_cost_per_gram") @db.Decimal(10, 4)
  lastRestockDate      DateTime? @map("last_restock_date") @db.Date
  updatedAt            DateTime  @updatedAt @map("updated_at")

  product              Product   @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("inventory_stock")
}

model MediaFile {
  id            Int       @id @default(autoincrement())
  productId     Int       @map("product_id")
  filePath      String    @map("file_path") @db.VarChar(500)
  fileType      FileType  @map("file_type")
  isPrimary     Boolean   @default(false) @map("is_primary")
  platformTags  Json?     @map("platform_tags")
  displayOrder  Int       @default(0) @map("display_order")
  createdAt     DateTime  @default(now()) @map("created_at")

  product       Product   @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@map("media_files")
}

model AiGeneratedContent {
  id                 Int       @id @default(autoincrement())
  productId          Int       @map("product_id")
  contentType        ContentType @map("content_type")
  userBaziChartHash  String?   @map("user_bazi_chart_hash") @db.VarChar(64)
  platform           String?   @db.VarChar(20)
  generatedContent   Json      @map("generated_content")
  sourceFactsUsed    Json?     @map("source_facts_used")
  confidenceScore    Decimal?  @map("confidence_score") @db.Decimal(3, 2)
  humanVerified      Boolean   @default(false) @map("human_verified")
  createdAt          DateTime  @default(now()) @map("created_at")

  product            Product   @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId, contentType])
  @@index([humanVerified])
  @@map("ai_generated_content")
}

enum QualityGrade {
  NORMAL @map("normal")
  GOOD   @map("good")
  HIGH   @map("high")
}

enum BaziElement {
  WOOD  @map("wood")
  FIRE  @map("fire")
  EARTH @map("earth")
  METAL @map("metal")
  WATER @map("water")
}

enum FileType {
  IMAGE @map("image")
  VIDEO @map("video")
}

enum ContentType {
  BAZI_SELLING_COPY @map("bazi_selling_copy")
  VIDEO_EDIT_PROMPT @map("video_edit_prompt")
}
```

**Step 4: Create Prisma client singleton**

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Step 5: Create database**

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS crystal_ecommerce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**Step 6: Generate Prisma client and run migration**

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Expected: Tables created successfully

**Step 7: Verify schema**

```bash
npx prisma studio
```

Expected: Prisma Studio opens, shows all tables

**Step 8: Commit**

```bash
git add .
git commit -m "feat: configure Prisma with MySQL schema"
```

---

### Task 4: Seed Database with Sample Data

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json`

**Step 1: Create seed script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create suppliers
  const fafa = await prisma.supplier.create({
    data: {
      name: 'fafajewelry',
      contactEmail: 'contact@fafajewelry.com',
      notes: 'Reliable supplier, good quality, ships within 3 days',
    },
  });

  const pandora = await prisma.supplier.create({
    data: {
      name: 'pandora',
      contactEmail: 'wholesale@pandora.com',
      notes: 'Premium quality, higher prices, luxury packaging',
    },
  });

  console.log('✓ Suppliers created');

  // Create products
  const sakuraRhod10Normal = await prisma.product.create({
    data: {
      baseName: 'Sakura Rhodonite',
      sizeMm: 10.00,
      qualityGrade: 'NORMAL',
      sku: 'SAKURA-RHOD-10MM-NORMAL',
      baziElement: 'FIRE',
      metaphysicalProperties: ['healing', 'love', 'compassion', 'emotional_balance'],
      description: 'Beautiful sakura pink rhodonite beads, perfect for heart-centered work',
      isActive: true,
    },
  });

  const sakuraRhod12Normal = await prisma.product.create({
    data: {
      baseName: 'Sakura Rhodonite',
      sizeMm: 12.00,
      qualityGrade: 'NORMAL',
      sku: 'SAKURA-RHOD-12MM-NORMAL',
      baziElement: 'FIRE',
      metaphysicalProperties: ['healing', 'love', 'compassion', 'emotional_balance'],
      description: 'Larger sakura rhodonite beads, more intense energy',
      isActive: true,
    },
  });

  const sakuraRhod10Good = await prisma.product.create({
    data: {
      baseName: 'Sakura Rhodonite',
      sizeMm: 10.00,
      qualityGrade: 'GOOD',
      sku: 'SAKURA-RHOD-10MM-GOOD',
      baziElement: 'FIRE',
      metaphysicalProperties: ['healing', 'love', 'compassion', 'emotional_balance'],
      description: 'Higher quality sakura rhodonite with excellent clarity',
      isActive: true,
    },
  });

  const blueMoon8Normal = await prisma.product.create({
    data: {
      baseName: 'Blue Moonstone',
      sizeMm: 8.00,
      qualityGrade: 'NORMAL',
      sku: 'BLUE-MOON-8MM-NORMAL',
      baziElement: 'WATER',
      metaphysicalProperties: ['intuition', 'feminine_energy', 'lunar_connection', 'emotional_healing'],
      description: 'Shimmering blue moonstone with strong adularescence',
      isActive: true,
    },
  });

  console.log('✓ Products created');

  // Create purchases
  await prisma.inventoryPurchase.create({
    data: {
      productId: sakuraRhod10Normal.id,
      supplierId: fafa.id,
      quantityPurchased: 10,
      weightGrams: 20.00,
      costTotal: 5.00,
      markupPercentage: 40.00,
      qualityRating: 4,
      purchaseDate: new Date('2025-01-15'),
      notes: 'Good color consistency',
    },
  });

  await prisma.inventoryPurchase.create({
    data: {
      productId: sakuraRhod12Normal.id,
      supplierId: fafa.id,
      quantityPurchased: 5,
      weightGrams: 30.00,
      costTotal: 7.00,
      markupPercentage: 40.00,
      qualityRating: 4,
      purchaseDate: new Date('2025-01-15'),
      notes: 'Slightly larger than expected',
    },
  });

  await prisma.inventoryPurchase.create({
    data: {
      productId: sakuraRhod10Good.id,
      supplierId: pandora.id,
      quantityPurchased: 8,
      weightGrams: 20.00,
      costTotal: 9.00,
      markupPercentage: 40.00,
      qualityRating: 5,
      purchaseDate: new Date('2025-01-20'),
      notes: 'Excellent clarity, premium feel',
    },
  });

  await prisma.inventoryPurchase.create({
    data: {
      productId: blueMoon8Normal.id,
      supplierId: fafa.id,
      quantityPurchased: 12,
      weightGrams: 15.00,
      costTotal: 6.00,
      markupPercentage: 40.00,
      qualityRating: 4,
      purchaseDate: new Date('2025-01-18'),
      notes: 'Strong blue flash',
    },
  });

  console.log('✓ Purchases created');

  // Create stock records
  await prisma.inventoryStock.create({
    data: {
      productId: sakuraRhod10Normal.id,
      quantityAvailable: 10,
      weightGramsAvailable: 20.00,
      avgCostPerGram: 0.25,
      lastRestockDate: new Date('2025-01-15'),
    },
  });

  await prisma.inventoryStock.create({
    data: {
      productId: sakuraRhod12Normal.id,
      quantityAvailable: 5,
      weightGramsAvailable: 30.00,
      avgCostPerGram: 0.2333,
      lastRestockDate: new Date('2025-01-15'),
    },
  });

  await prisma.inventoryStock.create({
    data: {
      productId: sakuraRhod10Good.id,
      quantityAvailable: 8,
      weightGramsAvailable: 20.00,
      avgCostPerGram: 0.45,
      lastRestockDate: new Date('2025-01-20'),
    },
  });

  await prisma.inventoryStock.create({
    data: {
      productId: blueMoon8Normal.id,
      quantityAvailable: 12,
      weightGramsAvailable: 15.00,
      avgCostPerGram: 0.40,
      lastRestockDate: new Date('2025-01-18'),
    },
  });

  console.log('✓ Stock records created');
  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Step 2: Add seed script to package.json**

Modify `package.json` (add to scripts section):

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

**Step 3: Install ts-node**

```bash
npm install -D ts-node
```

**Step 4: Run seed**

```bash
npx prisma db seed
```

Expected: All seed data created successfully

**Step 5: Verify in Prisma Studio**

```bash
npx prisma studio
```

Expected: See suppliers, products, purchases, stock

**Step 6: Commit**

```bash
git add .
git commit -m "feat: add database seed script with sample crystal data"
```

---

## Phase 2: API Routes & Business Logic

### Task 5: Create Product API Endpoints

**Files:**
- Create: `app/api/products/route.ts`
- Create: `app/api/products/[id]/route.ts`
- Create: `lib/pricing.ts`

**Step 1: Write test for product pricing calculation**

Create `lib/pricing.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateRetailPrice } from './pricing';

describe('calculateRetailPrice', () => {
  it('should calculate retail price with markup', () => {
    const costPerGram = 0.25;
    const markupPercentage = 40;
    const weightGrams = 20;

    const result = calculateRetailPrice(costPerGram, markupPercentage, weightGrams);

    expect(result.costPerGram).toBe(0.25);
    expect(result.retailPerGram).toBe(0.35);
    expect(result.totalRetailPrice).toBe(7.00);
  });
});
```

**Step 2: Install vitest**

```bash
npm install -D vitest
```

Add to `package.json` scripts:

```json
"test": "vitest"
```

**Step 3: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL - module not found

**Step 4: Implement pricing calculation**

Create `lib/pricing.ts`:

```typescript
export interface PricingResult {
  costPerGram: number;
  retailPerGram: number;
  totalRetailPrice: number;
  markup: number;
}

export function calculateRetailPrice(
  costPerGram: number,
  markupPercentage: number,
  weightGrams: number
): PricingResult {
  const retailPerGram = costPerGram * (1 + markupPercentage / 100);
  const totalRetailPrice = parseFloat((retailPerGram * weightGrams).toFixed(2));

  return {
    costPerGram: parseFloat(costPerGram.toFixed(4)),
    retailPerGram: parseFloat(retailPerGram.toFixed(4)),
    totalRetailPrice,
    markup: markupPercentage,
  };
}

export function calculateWeightedAvgCost(
  purchases: Array<{ costTotal: number; weightGrams: number }>
): number {
  const totalCost = purchases.reduce((sum, p) => sum + p.costTotal, 0);
  const totalWeight = purchases.reduce((sum, p) => sum + p.weightGrams, 0);

  return totalWeight > 0 ? totalCost / totalWeight : 0;
}
```

**Step 5: Run test to verify it passes**

```bash
npm test
```

Expected: PASS

**Step 6: Create products API (list all)**

Create `app/api/products/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateRetailPrice } from '@/lib/pricing';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const element = searchParams.get('element');
  const quality = searchParams.get('quality');
  const inStock = searchParams.get('in_stock') === 'true';

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(element && { baziElement: element.toUpperCase() as any }),
      ...(quality && { qualityGrade: quality.toUpperCase() as any }),
      ...(inStock && {
        stock: {
          quantityAvailable: { gt: 0 },
        },
      }),
    },
    include: {
      stock: true,
      mediaFiles: {
        where: { isPrimary: true },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const productsWithPricing = products.map((product) => {
    const avgCost = product.stock?.avgCostPerGram?.toNumber() || 0;
    const pricing = calculateRetailPrice(avgCost, 40, product.sizeMm.toNumber());

    return {
      id: product.id,
      sku: product.sku,
      name: `${product.baseName} ${product.sizeMm}mm ${product.qualityGrade}`,
      baseName: product.baseName,
      size: product.sizeMm.toNumber(),
      quality: product.qualityGrade,
      element: product.baziElement,
      pricePerGram: pricing.retailPerGram,
      retailPrice: pricing.totalRetailPrice,
      stockAvailable: product.stock?.quantityAvailable || 0,
      primaryImage: product.mediaFiles[0]?.filePath || null,
    };
  });

  return NextResponse.json(productsWithPricing);
}

export async function POST(request: Request) {
  const body = await request.json();

  const product = await prisma.product.create({
    data: {
      baseName: body.baseName,
      sizeMm: body.sizeMm,
      qualityGrade: body.qualityGrade,
      sku: body.sku || generateSKU(body.baseName, body.sizeMm, body.qualityGrade),
      baziElement: body.baziElement,
      metaphysicalProperties: body.metaphysicalProperties,
      description: body.description,
    },
  });

  return NextResponse.json(product, { status: 201 });
}

function generateSKU(baseName: string, size: number, quality: string): string {
  const nameSlug = baseName
    .toUpperCase()
    .replace(/\s+/g, '-')
    .replace(/[^A-Z0-9-]/g, '');

  return `${nameSlug}-${size}MM-${quality}`;
}
```

**Step 7: Create single product API**

Create `app/api/products/[id]/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateRetailPrice } from '@/lib/pricing';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      stock: true,
      mediaFiles: {
        orderBy: { displayOrder: 'asc' },
      },
      purchases: {
        include: { supplier: true },
        orderBy: { purchaseDate: 'desc' },
      },
    },
  });

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const avgCost = product.stock?.avgCostPerGram?.toNumber() || 0;
  const pricing = calculateRetailPrice(avgCost, 40, product.stock?.weightGramsAvailable?.toNumber() || 0);

  return NextResponse.json({
    ...product,
    pricing,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  const product = await prisma.product.update({
    where: { id: parseInt(params.id) },
    data: body,
  });

  return NextResponse.json(product);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await prisma.product.update({
    where: { id: parseInt(params.id) },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true });
}
```

**Step 8: Test API endpoints**

```bash
# Start dev server if not running
npm run dev

# Test in another terminal
curl http://localhost:3000/api/products
```

Expected: JSON array of products with pricing

**Step 9: Commit**

```bash
git add .
git commit -m "feat: add product API endpoints with pricing calculation"
```

---

### Task 6: Create Supplier Comparison API

**Files:**
- Create: `app/api/products/[id]/supplier-comparison/route.ts`

**Step 1: Create supplier comparison endpoint**

Create `app/api/products/[id]/supplier-comparison/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const productId = parseInt(params.id);

  const purchases = await prisma.inventoryPurchase.findMany({
    where: { productId },
    include: { supplier: true },
  });

  // Group by supplier
  const supplierStats = purchases.reduce((acc, purchase) => {
    const supplierId = purchase.supplierId;
    const supplierName = purchase.supplier.name;

    if (!acc[supplierId]) {
      acc[supplierId] = {
        supplierId,
        supplierName,
        purchases: [],
        totalCost: 0,
        totalWeight: 0,
        qualityRatings: [],
      };
    }

    const costPerGram = purchase.costTotal.toNumber() / purchase.weightGrams.toNumber();

    acc[supplierId].purchases.push(purchase);
    acc[supplierId].totalCost += purchase.costTotal.toNumber();
    acc[supplierId].totalWeight += purchase.weightGrams.toNumber();

    if (purchase.qualityRating) {
      acc[supplierId].qualityRatings.push(purchase.qualityRating);
    }

    return acc;
  }, {} as Record<number, any>);

  // Calculate averages and value scores
  const comparison = Object.values(supplierStats).map((stat: any) => {
    const avgCostPerGram = stat.totalCost / stat.totalWeight;
    const avgQuality = stat.qualityRatings.length > 0
      ? stat.qualityRatings.reduce((sum: number, r: number) => sum + r, 0) / stat.qualityRatings.length
      : null;

    const valueScore = avgQuality ? avgQuality / avgCostPerGram : 0;

    const lastPurchase = stat.purchases.sort(
      (a: any, b: any) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    )[0];

    return {
      supplierName: stat.supplierName,
      purchaseCount: stat.purchases.length,
      avgCostPerGram: parseFloat(avgCostPerGram.toFixed(4)),
      avgQuality: avgQuality ? parseFloat(avgQuality.toFixed(2)) : null,
      valueScore: parseFloat(valueScore.toFixed(2)),
      lastPurchaseDate: lastPurchase.purchaseDate,
    };
  });

  // Sort by value score descending
  comparison.sort((a, b) => b.valueScore - a.valueScore);

  return NextResponse.json(comparison);
}
```

**Step 2: Test supplier comparison**

```bash
curl http://localhost:3000/api/products/1/supplier-comparison
```

Expected: JSON array showing supplier comparison stats

**Step 3: Commit**

```bash
git add .
git commit -m "feat: add supplier comparison API endpoint"
```

---

## Phase 3: Bazi Knowledge Base & Calculator

### Task 7: Create Bazi Knowledge Base Files

**Files:**
- Create: `lib/bazi-knowledge/elements.json`
- Create: `lib/bazi-knowledge/crystals-database.json`
- Create: `lib/bazi-knowledge/compatibility-rules.json`
- Create: `lib/bazi-knowledge/birth-year-elements.json`

**Step 1: Create elements.json**

Create `lib/bazi-knowledge/elements.json`:

```json
{
  "wood": {
    "yin_yang": { "yin": "soft, flexible", "yang": "strong, growing" },
    "season": "spring",
    "direction": "east",
    "color": "green",
    "personality": "creative, expansive, compassionate",
    "body_parts": ["liver", "gallbladder", "eyes", "tendons"],
    "produces": "fire",
    "produced_by": "water",
    "controls": "earth",
    "controlled_by": "metal"
  },
  "fire": {
    "yin_yang": { "yin": "warm, gentle", "yang": "intense, passionate" },
    "season": "summer",
    "direction": "south",
    "color": "red",
    "personality": "passionate, charismatic, expressive",
    "body_parts": ["heart", "small_intestine", "tongue", "blood_vessels"],
    "produces": "earth",
    "produced_by": "wood",
    "controls": "metal",
    "controlled_by": "water"
  },
  "earth": {
    "yin_yang": { "yin": "nurturing, receptive", "yang": "stable, solid" },
    "season": "late_summer",
    "direction": "center",
    "color": "yellow",
    "personality": "grounded, reliable, harmonious",
    "body_parts": ["spleen", "stomach", "mouth", "muscles"],
    "produces": "metal",
    "produced_by": "fire",
    "controls": "water",
    "controlled_by": "wood"
  },
  "metal": {
    "yin_yang": { "yin": "refined, precise", "yang": "rigid, strong" },
    "season": "autumn",
    "direction": "west",
    "color": "white",
    "personality": "organized, disciplined, righteous",
    "body_parts": ["lung", "large_intestine", "nose", "skin"],
    "produces": "water",
    "produced_by": "earth",
    "controls": "wood",
    "controlled_by": "fire"
  },
  "water": {
    "yin_yang": { "yin": "quiet, reflective", "yang": "flowing, powerful" },
    "season": "winter",
    "direction": "north",
    "color": "black",
    "personality": "intuitive, adaptable, wise",
    "body_parts": ["kidney", "bladder", "ears", "bones"],
    "produces": "wood",
    "produced_by": "metal",
    "controls": "fire",
    "controlled_by": "earth"
  }
}
```

**Step 2: Create crystals-database.json** (abbreviated for space)

Create `lib/bazi-knowledge/crystals-database.json`:

```json
{
  "rhodonite": {
    "bazi_element": "fire",
    "sub_element": "earth",
    "yin_yang": "yin",
    "authentic_properties": [
      "Activates Heart Chakra (Fire element seat in body)",
      "Balances emotional Fire with grounding Earth qualities",
      "Benefits Bazi charts weak in Fire element",
      "Strengthens Day Master when Fire is favorable",
      "Supports emotional healing and compassion"
    ],
    "element_interactions": {
      "wood": "Wood feeds Fire - enhances energy",
      "fire": "Same element - amplifies passion",
      "earth": "Fire creates Earth - provides grounding",
      "metal": "Fire controls Metal - transformative",
      "water": "Water controls Fire - use cautiously"
    },
    "favorable_for_bazi_charts": [
      "Day Master weak in Fire element",
      "Birth year in Water element",
      "Charts lacking Heart energy"
    ],
    "contraindications": [
      "Bazi charts with excessive Fire",
      "Strong Yang Fire Day Masters"
    ]
  },
  "moonstone": {
    "bazi_element": "water",
    "sub_element": "metal",
    "yin_yang": "yin",
    "authentic_properties": [
      "Embodies Yin Water qualities (intuition, flow)",
      "Connects to lunar cycles",
      "Benefits charts weak in Water element",
      "Calms excessive Yang energy",
      "Supports Kidney energy (Water organ)"
    ],
    "element_interactions": {
      "wood": "Water nourishes Wood - excellent pairing",
      "fire": "Water controls Fire - calms intense emotions",
      "earth": "Earth controls Water - use sparingly",
      "metal": "Metal produces Water - enhances Yin qualities",
      "water": "Same element - deepens intuition"
    },
    "favorable_for_bazi_charts": [
      "Day Master weak in Water element",
      "Birth year in Fire element",
      "Charts with excessive Yang"
    ],
    "contraindications": [
      "Bazi charts with excessive Water",
      "Strong Yin Water Day Masters"
    ]
  }
}
```

**Step 3: Create compatibility-rules.json**

Create `lib/bazi-knowledge/compatibility-rules.json`:

```json
{
  "productive_cycle": {
    "wood_feeds_fire": {
      "score_boost": 25,
      "explanation": "Wood nourishes Fire, enhancing this crystal's energy"
    },
    "fire_creates_earth": {
      "score_boost": 25,
      "explanation": "Fire produces Earth, providing grounding"
    },
    "earth_bears_metal": {
      "score_boost": 25,
      "explanation": "Earth generates Metal, supporting structure"
    },
    "metal_enriches_water": {
      "score_boost": 25,
      "explanation": "Metal produces Water, deepening intuition"
    },
    "water_nourishes_wood": {
      "score_boost": 25,
      "explanation": "Water feeds Wood, promoting growth"
    }
  },
  "controlling_cycle": {
    "wood_controls_earth": {
      "score_penalty": -50,
      "warning": "Wood dominates Earth - use cautiously"
    },
    "fire_controls_metal": {
      "score_penalty": -50,
      "warning": "Fire melts Metal - may create tension"
    },
    "earth_controls_water": {
      "score_penalty": -50,
      "warning": "Earth blocks Water - may restrict flow"
    },
    "metal_controls_wood": {
      "score_penalty": -50,
      "warning": "Metal cuts Wood - may limit growth"
    },
    "water_controls_fire": {
      "score_penalty": -50,
      "warning": "Water extinguishes Fire - may dampen passion"
    }
  },
  "same_element": {
    "score_boost": 50,
    "explanation": "Same element - directly strengthens your chart"
  }
}
```

**Step 4: Create birth-year-elements.json** (sample years)

Create `lib/bazi-knowledge/birth-year-elements.json`:

```json
{
  "1984": { "stem": "Jia", "branch": "Zi", "element": "wood", "animal": "Rat", "yin_yang": "yang" },
  "1985": { "stem": "Yi", "branch": "Chou", "element": "wood", "animal": "Ox", "yin_yang": "yin" },
  "1986": { "stem": "Bing", "branch": "Yin", "element": "fire", "animal": "Tiger", "yin_yang": "yang" },
  "1987": { "stem": "Ding", "branch": "Mao", "element": "fire", "animal": "Rabbit", "yin_yang": "yin" },
  "1988": { "stem": "Wu", "branch": "Chen", "element": "earth", "animal": "Dragon", "yin_yang": "yang" },
  "1989": { "stem": "Ji", "branch": "Si", "element": "earth", "animal": "Snake", "yin_yang": "yin" },
  "1990": { "stem": "Geng", "branch": "Wu", "element": "metal", "animal": "Horse", "yin_yang": "yang" },
  "1991": { "stem": "Xin", "branch": "Wei", "element": "metal", "animal": "Goat", "yin_yang": "yin" },
  "1992": { "stem": "Ren", "branch": "Shen", "element": "water", "animal": "Monkey", "yin_yang": "yang" },
  "1993": { "stem": "Gui", "branch": "You", "element": "water", "animal": "Rooster", "yin_yang": "yin" },
  "1994": { "stem": "Jia", "branch": "Xu", "element": "wood", "animal": "Dog", "yin_yang": "yang" },
  "1995": { "stem": "Yi", "branch": "Hai", "element": "wood", "animal": "Pig", "yin_yang": "yin" },
  "1996": { "stem": "Bing", "branch": "Zi", "element": "fire", "animal": "Rat", "yin_yang": "yang" },
  "1997": { "stem": "Ding", "branch": "Chou", "element": "fire", "animal": "Ox", "yin_yang": "yin" },
  "1998": { "stem": "Wu", "branch": "Yin", "element": "earth", "animal": "Tiger", "yin_yang": "yang" },
  "1999": { "stem": "Ji", "branch": "Mao", "element": "earth", "animal": "Rabbit", "yin_yang": "yin" },
  "2000": { "stem": "Geng", "branch": "Chen", "element": "metal", "animal": "Dragon", "yin_yang": "yang" }
}
```

**Step 5: Commit**

```bash
git add lib/bazi-knowledge/
git commit -m "feat: add Bazi RAG knowledge base (elements, crystals, compatibility)"
```

---

**(Implementation plan continues with Tasks 8-20 covering Bazi calculator, AI generators, admin UI, public storefront, etc. - truncated for length. The full plan would be ~5000 lines.)**

**For brevity, key remaining tasks:**

- Task 8: Bazi Calculator Implementation
- Task 9: Bazi Matching API
- Task 10: AI Bazi Content Generator (RAG)
- Task 11: AI Video Prompt Generator
- Task 12: Admin Authentication (NextAuth)
- Task 13: Admin Product Management UI
- Task 14: Admin Supplier Comparison UI
- Task 15: Media Upload & Manager
- Task 16: Public Product Catalog
- Task 17: Find Your Crystal Tool
- Task 18: p5.js Algorithmic Art Component
- Task 19: Cart & Checkout Flow
- Task 20: Deployment & Production Setup

---

## Execution Notes

**Testing Strategy:**
- Unit tests for all business logic (pricing, Bazi calculations)
- API integration tests using Vitest
- Manual UI testing for admin/public flows

**Commit Frequency:**
- Every completed step = commit
- Use conventional commits (feat:, fix:, chore:, test:)

**Code Review Checkpoints:**
- After each Phase (1-3)
- Before merging to main

**YAGNI Principles:**
- No user roles beyond admin/public (add later if needed)
- No analytics (add later)
- No email notifications (add later)
- Simple contact form only (no payment processing)

**DRY Principles:**
- Extract pricing logic to lib/pricing.ts
- Reuse Bazi knowledge base across APIs
- Shared UI components in components/ui/

---
