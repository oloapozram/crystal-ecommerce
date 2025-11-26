# Crystal E-Commerce + Inventory + AI Content System
**Design Document**
**Date:** 2025-11-26
**Project Location:** C:\xampp7\htdocs\crystal

---

## Overview

A modern e-commerce platform for crystal merchandise with integrated inventory management, supplier comparison analytics, and AI-powered content generation based on authentic Chinese metaphysical Bazi principles.

---

## Section 1: System Architecture & Tech Stack

### Core Stack
- **Frontend/Backend**: Next.js 15 (App Router)
- **Database**: MySQL 8.0+ (existing XAMPP instance)
- **Styling**: Tailwind CSS + shadcn/ui components
- **AI Integration**: Vercel AI SDK + Anthropic Claude API
- **ORM**: Prisma (type-safe MySQL queries)
- **File Storage**: Local filesystem (`/public/media/products/`)
- **Auth**: NextAuth.js (admin area protection)

### AI Content Generators
1. **Bazi Selling Prompt Generator**: Uses Anthropic Claude with RAG (Retrieval-Augmented Generation) to analyze crystal properties + Chinese metaphysical Bazi elements (Wood, Fire, Earth, Metal, Water) → generates accurate, knowledge-base-verified selling copy
2. **Video Edit Prompt Generator**: Creates structured prompts for video editors (transitions, music, text overlays) optimized for TikTok/Instagram Reels/Facebook

### Plugin Integration
- **Theme Factory**: Brand guidelines stored in `theme-config.json` → auto-applies colors/fonts across all components
- **Algorithmic Art**: p5.js generative backgrounds for each crystal based on its metaphysical properties (e.g., rose quartz = soft pink flow fields)

### Project Structure
```
C:\xampp7\htdocs\crystal/
├── app/                    # Next.js 15 app router
│   ├── (public)/          # Public storefront
│   │   ├── page.tsx       # Homepage
│   │   ├── shop/          # Product catalog
│   │   └── find-your-crystal/  # Bazi matching tool
│   ├── admin/             # Protected admin area
│   │   ├── products/      # Product management
│   │   ├── purchases/     # Purchase recording
│   │   ├── suppliers/     # Supplier management
│   │   └── media/         # Media manager
│   └── api/               # API routes
│       ├── products/
│       ├── suppliers/
│       ├── purchases/
│       ├── inventory/
│       ├── media/
│       └── ai/
├── prisma/                # Database schema + migrations
│   ├── schema.prisma
│   └── migrations/
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── admin/            # Admin-specific components
│   └── public/           # Public storefront components
├── lib/                   # Utilities + AI generators
│   ├── bazi-knowledge/   # RAG knowledge base
│   │   ├── elements.json
│   │   ├── crystals-database.json
│   │   ├── compatibility-rules.json
│   │   └── birth-year-elements.json
│   ├── bazi-calculator.js
│   ├── ai-generators.js
│   └── prisma.js
├── public/
│   └── media/
│       └── products/     # Product images/videos by SKU
├── docs/
│   └── plans/            # Design docs
├── .claude/              # Superpowers + plugin config
│   ├── settings.json
│   └── commands/
└── theme-config.json     # Theme Factory brand guidelines
```

---

## Section 2: Database Schema

### 1. suppliers
```sql
CREATE TABLE suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE NOT NULL,
  contact_email VARCHAR(255) NULL,
  contact_phone VARCHAR(50) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. products
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  base_name VARCHAR(255) NOT NULL COMMENT 'e.g., Sakura Rhodonite',
  size_mm DECIMAL(5,2) NOT NULL,
  quality_grade ENUM('normal', 'good', 'high') DEFAULT 'normal',
  sku VARCHAR(100) UNIQUE NOT NULL COMMENT 'Auto-generated: SAKURA-RHOD-10MM-NORMAL',
  bazi_element ENUM('wood', 'fire', 'earth', 'metal', 'water') NULL,
  metaphysical_properties JSON NULL COMMENT 'Array of keywords: healing, love, prosperity',
  description TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_bazi_element (bazi_element),
  INDEX idx_quality (quality_grade),
  INDEX idx_active (is_active)
);
```

### 3. inventory_purchases
```sql
CREATE TABLE inventory_purchases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  supplier_id INT NOT NULL,
  quantity_purchased INT NOT NULL,
  weight_grams DECIMAL(8,2) NOT NULL COMMENT 'Total weight of this purchase batch',
  cost_total DECIMAL(10,2) NOT NULL COMMENT 'Total cost paid for this batch',
  cost_per_gram DECIMAL(10,4) GENERATED ALWAYS AS (cost_total / weight_grams) STORED,
  markup_percentage DECIMAL(5,2) DEFAULT 40.00,
  retail_per_gram DECIMAL(10,4) GENERATED ALWAYS AS (cost_per_gram * (1 + markup_percentage/100)) STORED,
  purchase_date DATE NOT NULL,
  quality_rating TINYINT NULL COMMENT '1-5 stars, subjective rating after receiving',
  notes TEXT NULL COMMENT 'e.g., Color slightly off, Perfect clarity',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
  INDEX idx_product (product_id),
  INDEX idx_supplier (supplier_id),
  INDEX idx_purchase_date (purchase_date)
);
```

### 4. inventory_stock
```sql
CREATE TABLE inventory_stock (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT UNIQUE NOT NULL,
  quantity_available INT DEFAULT 0,
  weight_grams_available DECIMAL(8,2) DEFAULT 0,
  avg_cost_per_gram DECIMAL(10,4) NULL COMMENT 'Weighted average from purchases',
  last_restock_date DATE NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### 5. ai_generated_content
```sql
CREATE TABLE ai_generated_content (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  content_type ENUM('bazi_selling_copy', 'video_edit_prompt') NOT NULL,
  user_bazi_chart_hash VARCHAR(64) NULL COMMENT 'SHA-256 of birth data for caching',
  platform VARCHAR(20) NULL COMMENT 'For video prompts: tiktok, instagram, facebook',
  generated_content JSON NOT NULL COMMENT 'AI output structure',
  source_facts_used JSON NULL COMMENT 'RAG sources cited',
  confidence_score DECIMAL(3,2) NULL COMMENT '0.00-1.00',
  human_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_type (product_id, content_type),
  INDEX idx_verified (human_verified)
);
```

### 6. media_files
```sql
CREATE TABLE media_files (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  file_path VARCHAR(500) NOT NULL COMMENT 'Relative path from /public/',
  file_type ENUM('image', 'video') NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  platform_tags JSON NULL COMMENT 'Array: [instagram, tiktok, facebook, product-page]',
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id)
);
```

### Pricing & COGS Calculation Logic
- **Cost per gram** = `inventory_purchases.cost_total / weight_grams` (auto-calculated)
- **Weighted average COGS** = SUM(cost_total) / SUM(weight_grams) for all purchases of a product
- **Retail price per gram** = `avg_cost_per_gram × (1 + markup_percentage/100)`
- **Product retail price** = `retail_price_per_gram × weight_grams`

**Example**:
- Sakura Rhodonite 10mm Normal Quality
- Purchase 1: 20g for $5 from fafajewelry → $0.25/g
- Purchase 2: 30g for $9 from pandora → $0.30/g
- Weighted avg COGS = ($5 + $9) / (20g + 30g) = $0.28/g
- Retail @ +40% = $0.28 × 1.40 = $0.392/g
- Selling a 20g piece = $0.392 × 20 = $7.84

### Supplier Comparison Analytics
**Query example** (best value for Sakura Rhodonite 10mm Normal):
```sql
SELECT
  s.name,
  COUNT(ip.id) as purchase_count,
  AVG(ip.cost_per_gram) as avg_cost_per_gram,
  AVG(ip.quality_rating) as avg_quality,
  (AVG(ip.quality_rating) / AVG(ip.cost_per_gram)) as value_score,
  MAX(ip.purchase_date) as last_purchase
FROM inventory_purchases ip
JOIN suppliers s ON ip.supplier_id = s.id
WHERE ip.product_id = ?
GROUP BY s.id
ORDER BY value_score DESC;
```

---

## Section 3: Admin UI & Features

### Admin Dashboard (`/admin`)

#### 1. Inventory Management

**Add Product Form**:
- Base name (text input)
- Size in mm (decimal input)
- Quality grade (select: Normal/Good/High)
- Bazi element (select: Wood/Fire/Earth/Metal/Water)
- Metaphysical properties (tag input: healing, love, prosperity, protection, clarity, etc.)
- Description (rich text editor)
- Auto-generates SKU on save (e.g., `SAKURA-RHOD-10MM-NORMAL`)

**Record Purchase Form**:
- Product selector (dropdown with autocomplete, or "Create New Product" button)
- Supplier selector (dropdown, or quick-add modal)
- Quantity purchased (integer)
- Weight in grams (decimal)
- Total cost paid (currency)
- Markup % (defaults to 40%, editable per purchase)
- Quality rating (1-5 star selector)
- Purchase date (date picker)
- Notes (textarea)
- **Auto-calculations displayed live**:
  - Cost per gram
  - Retail per gram
  - Total retail value
- **Updates stock** on save

**Stock Overview Table**:
- Columns:
  - SKU
  - Product Name
  - Quality
  - Qty Available
  - Weight Available (g)
  - Avg Cost/g
  - Retail/g (@ markup)
  - Total Inventory Value
  - Actions (Edit, View Suppliers, Delete)
- Filters:
  - Quality grade
  - Bazi element
  - Low stock alert (<5 units)
  - Out of stock
- Sort: by value, by name, by last restock date
- Click row → drills into Supplier Comparison View

#### 2. Supplier Comparison View (per product)

**Visual Components**:
- **Bar Chart**: Cost per gram by supplier (horizontal bars)
- **Comparison Table**:
  - Supplier Name
  - Total Purchases
  - Avg $/gram
  - Avg Quality Rating
  - Best Value Score (quality/cost ratio)
  - Last Purchase Date
  - Quick Reorder Button
- **Highlight best value supplier** in green
- **Quick Reorder**: Pre-fills purchase form with last purchase details from that supplier

#### 3. Media Manager

**Features**:
- Drag-and-drop upload area
- Auto-organizes by SKU: `/public/media/products/{SKU}/`
- Grid preview of all images/videos
- Drag to reorder (sets `display_order`)
- Set primary image (checkbox)
- Platform tags (multi-select: Instagram, TikTok, Facebook, Product Page)
- Bulk actions: delete, download, re-tag
- Video thumbnails auto-generated

#### 4. AI Content Generator

**Button in Product Edit View**: "Generate AI Content"

**Modal displays**:
- **Bazi Selling Copy** (generated from RAG knowledge base)
  - Element analysis
  - Recommended for (which Bazi charts benefit)
  - Full selling paragraph
  - Source facts used (transparency)
  - Confidence score
  - Human verification checkbox
- **Video Edit Prompts** (3 tabs: TikTok, Instagram, Facebook)
  - Scene breakdown with timestamps
  - Music suggestions
  - Text overlays
  - Hashtags
  - Caption text
- **Save to Product** button (stores in `ai_generated_content` table)

---

## Section 4: Public Storefront & API

### Public Pages

#### 1. Homepage (`/`)
- Hero section with Algorithmic Art background (p5.js flow field)
- Featured products carousel
- "Find Your Crystal" CTA button → Bazi matching tool
- Shop by Element (5 element icons linking to filtered catalog)

#### 2. Product Catalog (`/shop`)
- **Grid Layout** with product cards:
  - Primary image
  - Algorithmic Art background (subtle, based on Bazi element)
  - Name, size, quality badge
  - Price (per unit + per gram in small text)
  - Stock status badge (In Stock / Low Stock / Out of Stock)
  - "Add to Cart" button
- **Filters** (sidebar):
  - Bazi element (checkboxes)
  - Quality grade (checkboxes)
  - Price range (slider)
  - In stock only (toggle)
- **Sort** (dropdown):
  - Price: Low to High
  - Price: High to Low
  - Newest
  - Most Popular

#### 3. Product Detail Page (`/shop/[sku]`)
- **Image Gallery** (primary + additional images/videos)
- **Product Info**:
  - Title (base name + size + quality)
  - SKU
  - Price breakdown ($/gram, total for this piece)
  - Stock status
  - Weight, size details
- **Bazi & Metaphysical Section**:
  - Element badge (color-coded)
  - Metaphysical properties (tags)
  - **AI-Generated Bazi Selling Copy** (personalized if user used matching tool, otherwise generic)
  - "Find Your Match" button → Bazi tool
- **Add to Cart** (quantity selector)
- **Social Share Buttons** (pre-fills AI-generated caption + hashtags)

#### 4. Find Your Crystal Tool (`/find-your-crystal`)

**Step 1: Birth Data Input**
- Form fields:
  - Birth Date (date picker, YYYY-MM-DD)
  - Birth Time (optional, HH:MM)
  - Birth Location (optional, for true solar time adjustment)
- Privacy notice: "Your birth data is used only for crystal matching and is not stored."
- "Calculate My Matches" button

**Step 2: Bazi Chart Display**
- Visual representation of Four Pillars (Year/Month/Day/Hour)
- Heavenly Stems + Earthly Branches
- Day Master element highlighted
- Favorable elements (green checkmarks)
- Unfavorable elements (red X marks)
- Educational tooltips explaining each component

**Step 3: Matched Products**
- Grouped by match quality:
  - ✨ **Perfect Matches (100 score)**: "These crystals strengthen your Bazi chart"
    - Element is directly favorable + no conflicts
  - ✅ **Good Matches (75 score)**: "Beneficial for your elemental balance"
    - Element beneficial via productive cycle (e.g., Wood feeds Fire)
  - ⚠️ **Use with Caution (25 score)**: "May create imbalance - consult expert"
    - Element in controlling cycle (e.g., Water controls Fire)
- Each product card shows:
  - Standard product info
  - **Match explanation**: "Your Fire-weak chart benefits from Fire element crystals like Rhodonite"
  - **Personalized Bazi selling copy** (generated with their chart data)
  - "Add to Cart" button
- **Disclaimer**: "This is a simplified Bazi analysis based on traditional Five Elements theory. For detailed consultation, contact a certified Bazi practitioner."
- **Link to Bazi Guide** (`/bazi-guide` page with educational content)

**Data Privacy**:
- Birth data NOT stored in database
- Calculation happens in-memory
- Optional: "Save My Results" generates shareable link with hashed chart (expires in 24 hours)

#### 5. Cart & Checkout (`/cart`)
- Line items with product image, name, qty, price
- Quantity adjustment (+/- buttons)
- Remove item
- Subtotal calculation
- **Simple Contact Form** (for now, no payment integration):
  - Name
  - Email
  - Phone (optional)
  - Message / special requests
  - "Submit Order Inquiry" button
- Admin receives email notification with order details
- *Note: Stripe/PayPal integration can be added later*

### REST API Endpoints (`/api/`)

#### Products
```
GET    /api/products              # List all active products
       Query params: ?element=fire&quality=high&in_stock=true
       Returns: [{ id, sku, name, size_mm, quality_grade, price_per_gram,
                    retail_price, stock_available, primary_image }]

GET    /api/products/:id          # Single product with full details
       Returns: { product, pricing, stock, media[], related_products[] }

GET    /api/products/:id/supplier-comparison
       Returns: [{ supplier_name, purchase_count, avg_cost_per_gram,
                   avg_quality, value_score, last_purchase }]

POST   /api/products              # Create product (admin only)
       Body: { base_name, size_mm, quality_grade, bazi_element,
               metaphysical_properties[], description }
       Returns: { id, sku }

PATCH  /api/products/:id          # Update product (admin only)
DELETE /api/products/:id          # Soft delete (is_active = false)
```

#### Suppliers
```
GET    /api/suppliers             # List all suppliers
POST   /api/suppliers             # Create supplier (admin only)
       Body: { name, contact_email?, contact_phone?, notes? }
```

#### Purchases
```
POST   /api/purchases             # Record new purchase (admin only)
       Body: { product_id, supplier_id, quantity_purchased, weight_grams,
               cost_total, markup_percentage?, quality_rating?,
               purchase_date, notes? }
       Side effect: Updates inventory_stock

GET    /api/purchases?product_id=X  # Purchase history for a product
       Returns: [{ id, supplier_name, date, cost_per_gram, quality_rating }]
```

#### Inventory
```
GET    /api/inventory             # All stock levels
       Returns: [{ product_id, sku, quantity_available, weight_available,
                   avg_cost_per_gram }]

GET    /api/inventory/:product_id # Stock for one product
```

#### Media
```
POST   /api/media/upload          # Upload image/video (admin only)
       Body: FormData { product_id, file, platform_tags[], is_primary? }
       Returns: { id, file_path }

GET    /api/media?product_id=X    # Get product media
       Returns: [{ id, file_path, file_type, is_primary, platform_tags[] }]

DELETE /api/media/:id             # Remove media file (admin only)
```

#### AI Content Generation
```
POST   /api/ai/bazi-prompt        # Generate Bazi selling copy
       Body: { product_id, user_bazi_chart? }
       user_bazi_chart: { birth_date, birth_time?, birth_location? }
       Returns: {
         selling_copy: string,
         element_analysis: string,
         recommended_for: string,
         source_facts_used: string[],
         confidence_score: number
       }

POST   /api/ai/video-prompt       # Generate video edit prompt
       Body: { product_id, platform: 'tiktok'|'instagram'|'facebook' }
       Returns: {
         video_structure: [{ timestamp, shot_description, camera_angle }],
         music_suggestion: { vibe, genre, specific_tracks? },
         text_overlays: [{ timestamp, text, style }],
         hashtags: string[],
         caption: string
       }
```

#### Bazi Matching
```
POST   /api/bazi/calculate-chart  # Calculate Bazi from birth data
       Body: { birth_date, birth_time?, birth_location? }
       Returns: {
         year_pillar: { stem, branch, element },
         month_pillar: { stem, branch, element },
         day_pillar: { stem, branch, element },
         hour_pillar: { stem, branch, element },
         day_master: { stem, element, strength },
         favorable_elements: string[],
         unfavorable_elements: string[]
       }

POST   /api/bazi/match-products   # Get matched products for a chart
       Body: { bazi_chart } (from calculate-chart response)
       Returns: {
         perfect_matches: [{ product, match_score, explanation }],
         good_matches: [{ product, match_score, explanation }],
         caution_matches: [{ product, match_score, explanation }]
       }
```

---

## Section 5: AI Content Generation Implementation

### The Accuracy Challenge

**Problem**: AI models can hallucinate Bazi metaphysical properties, creating inaccurate or misleading content.

**Solution**: Retrieval-Augmented Generation (RAG) + Human Verification

### 1. Bazi Knowledge Base (RAG)

**Location**: `lib/bazi-knowledge/`

#### `elements.json`
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
  }
  // ... earth, metal, water
}
```

#### `crystals-database.json`
```json
{
  "rhodonite": {
    "bazi_element": "fire",
    "sub_element": "earth",
    "yin_yang": "yin",
    "authentic_properties": [
      "Activates Heart Chakra (Fire element seat in body)",
      "Balances emotional Fire with grounding Earth qualities",
      "Benefits Bazi charts weak in Fire element (common in Water-year births)",
      "Strengthens Day Master when Fire is a favorable element",
      "Supports emotional healing and compassion (Heart = Fire organ)"
    ],
    "element_interactions": {
      "wood": "Wood feeds Fire - wearing with Wood element crystals enhances Rhodonite's energy",
      "fire": "Same element - amplifies passion and heart-centered qualities; use moderately if Fire is already strong",
      "earth": "Fire creates Earth - provides grounding; excellent for balancing intense emotions",
      "metal": "Fire controls Metal - transformative; helps release rigid patterns",
      "water": "Water controls Fire - use cautiously; may dampen Rhodonite's energizing effect"
    },
    "favorable_for_bazi_charts": [
      "Day Master weak in Fire element",
      "Birth year in Water element (needs Fire warmth)",
      "Charts lacking Heart/relationship energy",
      "Xin Metal Day Masters (Fire refines Metal)"
    ],
    "contraindications": [
      "Bazi charts with excessive Fire (may overheat)",
      "Strong Yang Fire Day Masters (already passionate)",
      "Charts needing Water balance (Fire controls Water)"
    ],
    "traditional_uses": [
      "Worn over heart during meditation",
      "Placed in relationship corner (Southwest in Feng Shui)",
      "Used in Bazi remedies for Fire deficiency"
    ]
  },
  "blue_moonstone": {
    "bazi_element": "water",
    "sub_element": "metal",
    "yin_yang": "yin",
    "authentic_properties": [
      "Embodies Yin Water qualities (intuition, flow, receptivity)",
      "Connects to lunar cycles (Yin energy peaks)",
      "Benefits Bazi charts weak in Water element",
      "Calms excessive Yang energy (Fire, Wood)",
      "Supports Kidney energy (Water organ in TCM)"
    ],
    "element_interactions": {
      "wood": "Water nourishes Wood - excellent pairing for growth and creativity",
      "fire": "Water controls Fire - use to calm intense emotions or excessive Yang",
      "earth": "Earth controls Water - may block flow; use sparingly together",
      "metal": "Metal produces Water - enhances Moonstone's Yin qualities",
      "water": "Same element - deepens intuition; avoid if Water is already excessive"
    },
    "favorable_for_bazi_charts": [
      "Day Master weak in Water element",
      "Birth year in Fire element (needs cooling)",
      "Charts with excessive Yang (imbalanced toward action over reflection)",
      "Bing Fire Day Masters (Water balances Fire)"
    ],
    "contraindications": [
      "Bazi charts with excessive Water (may increase lethargy)",
      "Strong Yin Water Day Masters (already highly intuitive)",
      "Charts needing Fire or Yang energy"
    ],
    "traditional_uses": [
      "Worn during new/full moon for Yin cultivation",
      "Placed under pillow for dream work",
      "Used in Bazi remedies for Water deficiency"
    ]
  }
  // ... more crystals
}
```

#### `compatibility-rules.json`
```json
{
  "productive_cycle": {
    "wood_feeds_fire": {
      "score_boost": 25,
      "explanation": "Wood element nourishes Fire, enhancing this crystal's energy in your chart"
    },
    "fire_creates_earth": {
      "score_boost": 25,
      "explanation": "Fire produces Earth, providing grounding and stability"
    },
    "earth_bears_metal": {
      "score_boost": 25,
      "explanation": "Earth generates Metal, supporting structure and clarity"
    },
    "metal_enriches_water": {
      "score_boost": 25,
      "explanation": "Metal produces Water, deepening intuition and flow"
    },
    "water_nourishes_wood": {
      "score_boost": 25,
      "explanation": "Water feeds Wood, promoting growth and expansion"
    }
  },
  "controlling_cycle": {
    "wood_controls_earth": {
      "score_penalty": -50,
      "warning": "Wood dominates Earth - use cautiously as this may create imbalance",
      "when_beneficial": "If your chart has excessive Earth needing regulation"
    },
    "fire_controls_metal": {
      "score_penalty": -50,
      "warning": "Fire melts Metal - use cautiously as this may create tension",
      "when_beneficial": "If your chart has excessive Metal needing softening"
    },
    "earth_controls_water": {
      "score_penalty": -50,
      "warning": "Earth blocks Water - use cautiously as this may restrict flow",
      "when_beneficial": "If your chart has excessive Water needing grounding"
    },
    "metal_controls_wood": {
      "score_penalty": -50,
      "warning": "Metal cuts Wood - use cautiously as this may limit growth",
      "when_beneficial": "If your chart has excessive Wood needing pruning"
    },
    "water_controls_fire": {
      "score_penalty": -50,
      "warning": "Water extinguishes Fire - use cautiously as this may dampen passion",
      "when_beneficial": "If your chart has excessive Fire needing cooling"
    }
  },
  "same_element": {
    "score_boost": 50,
    "explanation": "Same element as your favorable element - directly strengthens your Bazi chart",
    "warning_if_excessive": "Your chart already has strong {element} - use moderately to avoid imbalance"
  }
}
```

#### `birth-year-elements.json`
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
  "1995": { "stem": "Yi", "branch": "Hai", "element": "wood", "animal": "Pig", "yin_yang": "yin" }
  // ... extend to cover 1924-2044 (120-year cycle)
}
```

### 2. AI Prompt with RAG

**Bazi Selling Copy Generator** (`lib/ai-generators.js`):

```javascript
async function generateBaziSellingCopy(productId, userBaziChart = null) {
  // 1. Fetch product from database
  const product = await prisma.products.findUnique({ where: { id: productId } });

  // 2. Load RAG knowledge base
  const crystalData = require('./bazi-knowledge/crystals-database.json')[product.base_name.toLowerCase()];
  const elementData = require('./bazi-knowledge/elements.json')[product.bazi_element];
  const compatibilityRules = require('./bazi-knowledge/compatibility-rules.json');

  // 3. If user chart provided, calculate compatibility
  let matchAnalysis = null;
  if (userBaziChart) {
    matchAnalysis = calculateBaziMatch(userBaziChart, product.bazi_element, crystalData);
  }

  // 4. Construct prompt with RAG context
  const prompt = `You are a certified Bazi consultant and crystal healer. Use ONLY the provided knowledge base. Do NOT invent Bazi properties.

KNOWLEDGE BASE:
${JSON.stringify({ crystalData, elementData, compatibilityRules }, null, 2)}

${userBaziChart ? `CUSTOMER BAZI CHART:
${JSON.stringify(userBaziChart, null, 2)}

COMPATIBILITY ANALYSIS:
${JSON.stringify(matchAnalysis, null, 2)}
` : ''}

PRODUCT DETAILS:
- Name: ${product.base_name}
- Size: ${product.size_mm}mm
- Quality: ${product.quality_grade}
- Element: ${product.bazi_element}

TASK:
Generate a 2-3 paragraph selling description that:
1. Explains the crystal's Bazi element and authentic energetic properties (cite from knowledge base)
2. ${userBaziChart ? 'Analyzes compatibility with the customer\'s Bazi chart using the compatibility analysis provided' : 'Describes general benefits for elemental balance'}
3. Uses warm, spiritual language while being factually accurate (no medical claims)
4. Ends with a gentle call-to-action

CRITICAL RULES:
- Quote authentic_properties verbatim from knowledge base
- Apply element_interactions rules correctly
- If uncertain about a Bazi principle, state "consult a certified Bazi practitioner for personalized analysis"
- NEVER invent new metaphysical properties

Return JSON:
{
  "selling_copy": "full paragraph text",
  "element_analysis": "brief explanation of element role",
  "recommended_for": "which Bazi chart types benefit most",
  "source_facts_used": ["array", "of", "knowledge base facts cited"],
  "confidence_score": 0.95
}`;

  // 5. Call Anthropic API
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  });

  const result = JSON.parse(response.content[0].text);

  // 6. Save to database
  await prisma.ai_generated_content.create({
    data: {
      product_id: productId,
      content_type: 'bazi_selling_copy',
      user_bazi_chart_hash: userBaziChart ? sha256(JSON.stringify(userBaziChart)) : null,
      generated_content: result,
      source_facts_used: result.source_facts_used,
      confidence_score: result.confidence_score,
      human_verified: false
    }
  });

  return result;
}
```

### 3. Video Edit Prompt Generator

```javascript
async function generateVideoEditPrompt(productId, platform) {
  const product = await prisma.products.findUnique({
    where: { id: productId },
    include: { media_files: true }
  });

  const platformSpecs = {
    tiktok: { duration: '15-60s', aspect: '9:16', vibe: 'fast, trendy, engaging' },
    instagram: { duration: '15-90s', aspect: '9:16', vibe: 'aesthetic, polished' },
    facebook: { duration: '30-120s', aspect: '1:1 or 16:9', vibe: 'informative, storytelling' }
  };

  const prompt = `You are a professional social media video editor specializing in product content for ${platform}.

PRODUCT:
- Name: ${product.base_name}
- Element: ${product.bazi_element}
- Quality: ${product.quality_grade}
- Metaphysical properties: ${product.metaphysical_properties.join(', ')}
- Available media: ${product.media_files.length} files

PLATFORM: ${platform}
- Duration: ${platformSpecs[platform].duration}
- Aspect ratio: ${platformSpecs[platform].aspect}
- Vibe: ${platformSpecs[platform].vibe}

CREATE a structured video edit prompt with:
1. Scene-by-scene breakdown (timestamps, shot descriptions, camera angles)
2. Music/audio suggestions (vibe, genre, specific royalty-free tracks if possible)
3. Text overlays with exact timestamps and styling
4. Transition effects between scenes
5. 10-15 relevant hashtags optimized for ${platform} algorithm
6. Caption text (hook + body + CTA, under 150 chars for ${platform})

Return JSON:
{
  "video_structure": [
    { "timestamp": "0:00-0:05", "shot": "Close-up of crystal rotating on velvet", "camera": "Macro lens, slow rotation", "transition": "Fade in" },
    ...
  ],
  "music_suggestion": {
    "vibe": "Calm, spiritual, meditative",
    "genre": "Ambient piano",
    "specific_tracks": ["Ethereal Dreams by AudioJungle", "Crystal Meditation by Epidemic Sound"]
  },
  "text_overlays": [
    { "timestamp": "0:03", "text": "Rhodonite 💗", "style": "Bold white, fade in", "position": "Center" },
    ...
  ],
  "hashtags": ["#crystalhealing", "#rhodonite", "#bazimetaphysics", ...],
  "caption": "Hook text here... [emoji] CTA"
}`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }]
  });

  const result = JSON.parse(response.content[0].text);

  await prisma.ai_generated_content.create({
    data: {
      product_id: productId,
      content_type: 'video_edit_prompt',
      platform: platform,
      generated_content: result,
      human_verified: false
    }
  });

  return result;
}
```

### 4. Human Verification Workflow

**Admin UI Flow**:
1. Click "Generate AI Content" button in product edit view
2. AI generates content (with loading spinner)
3. Modal displays:
   - Generated selling copy
   - Source facts cited (transparency)
   - Confidence score
   - ⚠️ Warning if confidence < 0.8
4. Admin reviews, can:
   - **Approve** → Sets `human_verified = true`, saves to product description
   - **Edit** → Opens text editor, saves modified version
   - **Regenerate** → Calls API again with different seed
   - **Reject** → Deletes from `ai_generated_content` table

**Reuse Logic**:
- If identical `product_id + user_bazi_chart_hash` exists with `human_verified = true`, return cached version
- Avoids redundant API calls for same queries

---

## Section 6: Theme Factory & Algorithmic Art Integration

### Theme Factory Configuration

**File**: `theme-config.json`

```json
{
  "brand": {
    "name": "Crystal Essence",
    "tagline": "Align Your Energy with Nature's Wisdom"
  },
  "colors": {
    "primary": "#8B5CF6",
    "primaryHover": "#7C3AED",
    "secondary": "#EC4899",
    "secondaryHover": "#DB2777",
    "accent": "#06B6D4",
    "accentHover": "#0891B2",
    "earth": "#78716C",
    "background": "#FAFAF9",
    "backgroundDark": "#1C1917",
    "text": "#1C1917",
    "textLight": "#78716C",
    "textInverse": "#FAFAF9",
    "success": "#10B981",
    "warning": "#F59E0B",
    "error": "#EF4444",
    "elementColors": {
      "wood": "#10B981",
      "fire": "#EF4444",
      "earth": "#F59E0B",
      "metal": "#6B7280",
      "water": "#3B82F6"
    }
  },
  "typography": {
    "fontFamily": {
      "heading": "'Cormorant Garamond', serif",
      "body": "'Inter', sans-serif",
      "accent": "'Cinzel', serif"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem"
    },
    "fontWeight": {
      "normal": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    }
  },
  "spacing": {
    "scale": "relaxed",
    "baseUnit": "0.25rem"
  },
  "borderRadius": {
    "sm": "0.25rem",
    "md": "0.5rem",
    "lg": "0.75rem",
    "xl": "1rem",
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
  }
}
```

**Integration with Tailwind** (`tailwind.config.js`):
```javascript
const themeConfig = require('./theme-config.json');

module.exports = {
  theme: {
    extend: {
      colors: themeConfig.colors,
      fontFamily: themeConfig.typography.fontFamily,
      fontSize: themeConfig.typography.fontSize,
      borderRadius: themeConfig.borderRadius,
      boxShadow: themeConfig.shadows
    }
  }
};
```

**Auto-Application**:
- All shadcn/ui components automatically inherit theme colors
- Element badges use `elementColors` mapping
- Consistent branding across admin + public pages

### Algorithmic Art Integration

**p5.js Generative Backgrounds** (per product based on Bazi element)

**Component**: `components/AlgorithmicBackground.tsx`

```typescript
'use client';
import { useEffect, useRef } from 'react';
import p5 from 'p5';
import themeConfig from '@/theme-config.json';

interface Props {
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  seed: number; // product.id for reproducibility
  opacity?: number; // 0.0-1.0, default 0.15
}

export default function AlgorithmicBackground({ element, seed, opacity = 0.15 }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const elementConfigs = {
      wood: {
        type: 'organic_growth',
        particles: 3000,
        colors: [themeConfig.colors.elementColors.wood, '#34D399', '#6EE7B7'],
        movement: 'branching',
        speed: 0.5
      },
      fire: {
        type: 'flow_field',
        particles: 5000,
        colors: [themeConfig.colors.elementColors.fire, '#F97316', '#FBBF24'],
        movement: 'turbulent',
        speed: 0.8
      },
      earth: {
        type: 'particle_grid',
        particles: 2000,
        colors: [themeConfig.colors.elementColors.earth, '#D97706', '#92400E'],
        movement: 'stable',
        speed: 0.2
      },
      metal: {
        type: 'geometric_pattern',
        particles: 1500,
        colors: [themeConfig.colors.elementColors.metal, '#9CA3AF', '#D1D5DB'],
        movement: 'crystalline',
        speed: 0.3
      },
      water: {
        type: 'wave_pattern',
        particles: 4000,
        colors: [themeConfig.colors.elementColors.water, '#0EA5E9', '#38BDF8'],
        movement: 'flowing',
        speed: 0.6
      }
    };

    const config = elementConfigs[element];

    const sketch = (p: p5) => {
      let particles: Particle[] = [];

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.randomSeed(seed);
        p.noiseDetail(2, 0.5);

        // Initialize particles based on element type
        for (let i = 0; i < config.particles; i++) {
          particles.push(new Particle(p, config));
        }
      };

      p.draw = () => {
        p.clear();
        particles.forEach(particle => {
          particle.update();
          particle.display(p, opacity);
        });
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };

    const p5Instance = new p5(sketch, canvasRef.current);

    return () => {
      p5Instance.remove();
    };
  }, [element, seed, opacity]);

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none -z-10"
      aria-hidden="true"
    />
  );
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  config: any;

  constructor(p: p5, config: any) {
    this.x = p.random(p.width);
    this.y = p.random(p.height);
    this.vx = p.random(-1, 1) * config.speed;
    this.vy = p.random(-1, 1) * config.speed;
    this.color = p.random(config.colors);
    this.config = config;
  }

  update() {
    // Element-specific movement logic
    switch (this.config.type) {
      case 'flow_field':
        // Perlin noise flow field
        break;
      case 'wave_pattern':
        // Sine wave motion
        break;
      // ... other patterns
    }
  }

  display(p: p5, opacity: number) {
    p.fill(this.color);
    p.noStroke();
    p.circle(this.x, this.y, 2);
  }
}
```

**Usage**:
```tsx
// Product card background
<div className="relative">
  <AlgorithmicBackground element={product.bazi_element} seed={product.id} opacity={0.1} />
  <ProductCard product={product} />
</div>

// Product detail hero
<AlgorithmicBackground element={product.bazi_element} seed={product.id} opacity={0.2} />

// Admin dashboard accent
<AlgorithmicBackground element="earth" seed={42} opacity={0.05} />
```

**Performance**:
- Canvas renders at 30fps
- Pauses animation when tab not active (via `requestAnimationFrame`)
- Lazy loads p5.js library (not in critical path)

---

## Section 7: Customer Bazi Matching Feature

### Public Feature: "Find Your Crystal" Tool

**Route**: `/find-your-crystal`

### User Flow

#### Step 1: Birth Data Input

**Form Component** (`app/(public)/find-your-crystal/page.tsx`):

```tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FindYourCrystalPage() {
  const [birthData, setBirthData] = useState({
    birth_date: '',
    birth_time: '',
    birth_location: ''
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Step 1: Calculate Bazi chart
    const chartResponse = await fetch('/api/bazi/calculate-chart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(birthData)
    });
    const baziChart = await chartResponse.json();

    // Step 2: Match products
    const matchResponse = await fetch('/api/bazi/match-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bazi_chart: baziChart })
    });
    const matches = await matchResponse.json();

    setResults({ baziChart, matches });
    setLoading(false);
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="font-accent text-5xl mb-4">Find Your Crystal</h1>
      <p className="text-textLight mb-8">
        Enter your birth details to discover crystals that align with your Bazi chart.
      </p>

      <form onSubmit={handleSubmit} className="max-w-md space-y-6">
        <div>
          <Label htmlFor="birth_date">Birth Date *</Label>
          <Input
            type="date"
            id="birth_date"
            required
            value={birthData.birth_date}
            onChange={(e) => setBirthData({...birthData, birth_date: e.target.value})}
          />
        </div>

        <div>
          <Label htmlFor="birth_time">Birth Time (optional)</Label>
          <Input
            type="time"
            id="birth_time"
            value={birthData.birth_time}
            onChange={(e) => setBirthData({...birthData, birth_time: e.target.value})}
          />
          <p className="text-sm text-textLight mt-1">
            For more accurate Hour Pillar calculation
          </p>
        </div>

        <div>
          <Label htmlFor="birth_location">Birth Location (optional)</Label>
          <Input
            type="text"
            id="birth_location"
            placeholder="City, Country"
            value={birthData.birth_location}
            onChange={(e) => setBirthData({...birthData, birth_location: e.target.value})}
          />
          <p className="text-sm text-textLight mt-1">
            For true solar time adjustment
          </p>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <p className="text-sm">
            🔒 <strong>Privacy:</strong> Your birth data is used only for crystal matching
            and is not stored in our database.
          </p>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate My Matches'}
        </Button>
      </form>

      {results && <ResultsSection results={results} />}
    </div>
  );
}
```

#### Step 2: Bazi Chart Calculation

**Backend Logic** (`lib/bazi-calculator.js`):

```javascript
import birthYearElements from './bazi-knowledge/birth-year-elements.json';

// Heavenly Stems (Tian Gan)
const heavenlyStems = [
  { name: 'Jia', element: 'wood', yin_yang: 'yang' },
  { name: 'Yi', element: 'wood', yin_yang: 'yin' },
  { name: 'Bing', element: 'fire', yin_yang: 'yang' },
  { name: 'Ding', element: 'fire', yin_yang: 'yin' },
  { name: 'Wu', element: 'earth', yin_yang: 'yang' },
  { name: 'Ji', element: 'earth', yin_yang: 'yin' },
  { name: 'Geng', element: 'metal', yin_yang: 'yang' },
  { name: 'Xin', element: 'metal', yin_yang: 'yin' },
  { name: 'Ren', element: 'water', yin_yang: 'yang' },
  { name: 'Gui', element: 'water', yin_yang: 'yin' }
];

// Earthly Branches (Di Zhi)
const earthlyBranches = [
  { name: 'Zi', element: 'water', animal: 'Rat' },
  { name: 'Chou', element: 'earth', animal: 'Ox' },
  { name: 'Yin', element: 'wood', animal: 'Tiger' },
  { name: 'Mao', element: 'wood', animal: 'Rabbit' },
  { name: 'Chen', element: 'earth', animal: 'Dragon' },
  { name: 'Si', element: 'fire', animal: 'Snake' },
  { name: 'Wu', element: 'fire', animal: 'Horse' },
  { name: 'Wei', element: 'earth', animal: 'Goat' },
  { name: 'Shen', element: 'metal', animal: 'Monkey' },
  { name: 'You', element: 'metal', animal: 'Rooster' },
  { name: 'Xu', element: 'earth', animal: 'Dog' },
  { name: 'Hai', element: 'water', animal: 'Pig' }
];

export function calculateBaziChart(birthDate, birthTime = null, birthLocation = null) {
  // Convert Gregorian to Lunar calendar
  const lunarDate = solarToLunar(birthDate);

  // Calculate Year Pillar
  const yearPillar = birthYearElements[lunarDate.year];

  // Calculate Month Pillar (based on solar terms)
  const monthPillar = calculateMonthPillar(lunarDate);

  // Calculate Day Pillar (complex algorithm, uses Julian Day Number)
  const dayPillar = calculateDayPillar(lunarDate);

  // Calculate Hour Pillar (if birth time provided)
  const hourPillar = birthTime ? calculateHourPillar(birthTime, dayPillar, birthLocation) : null;

  // Determine Day Master (Day Pillar Heavenly Stem)
  const dayMaster = {
    stem: dayPillar.stem,
    element: dayPillar.element,
    yin_yang: dayPillar.yin_yang
  };

  // Analyze elemental strength
  const elementalAnalysis = analyzeElementalStrength({
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar
  });

  // Determine favorable/unfavorable elements
  const { favorable, unfavorable } = determineFavorableElements(dayMaster, elementalAnalysis);

  return {
    year_pillar: yearPillar,
    month_pillar: monthPillar,
    day_pillar: dayPillar,
    hour_pillar: hourPillar,
    day_master: dayMaster,
    elemental_strength: elementalAnalysis,
    favorable_elements: favorable,
    unfavorable_elements: unfavorable
  };
}

function analyzeElementalStrength(pillars) {
  const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  // Count elements in stems and branches
  [pillars.yearPillar, pillars.monthPillar, pillars.dayPillar, pillars.hourPillar]
    .filter(Boolean)
    .forEach(pillar => {
      counts[pillar.stem_element]++;
      counts[pillar.branch_element]++;
    });

  return counts;
}

function determineFavorableElements(dayMaster, elementalStrength) {
  // Simplified logic (real Bazi is more complex)
  const weak = elementalStrength[dayMaster.element] <= 2;

  if (weak) {
    // Day Master is weak, needs support
    return {
      favorable: [
        dayMaster.element, // Same element supports
        getProducingElement(dayMaster.element) // Element that produces Day Master
      ],
      unfavorable: [
        getControllingElement(dayMaster.element), // Element that controls Day Master
        getProducedElement(dayMaster.element) // Element Day Master produces (drains energy)
      ]
    };
  } else {
    // Day Master is strong, needs balance
    return {
      favorable: [
        getControllingElement(dayMaster.element), // Element that controls (balances) Day Master
        getProducedElement(dayMaster.element) // Element Day Master produces (releases energy)
      ],
      unfavorable: [
        dayMaster.element, // Same element adds to excess
        getProducingElement(dayMaster.element) // Element that produces Day Master (adds more)
      ]
    };
  }
}

function getProducingElement(element) {
  const cycle = { wood: 'water', fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal' };
  return cycle[element];
}

function getProducedElement(element) {
  const cycle = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
  return cycle[element];
}

function getControllingElement(element) {
  const cycle = { wood: 'metal', fire: 'water', earth: 'wood', metal: 'fire', water: 'earth' };
  return cycle[element];
}

// Lunar calendar conversion (use existing library like 'lunar-javascript' or custom implementation)
function solarToLunar(gregorianDate) {
  // Implementation or library usage
  return { year: 1990, month: 5, day: 12 };
}

function calculateMonthPillar(lunarDate) {
  // Based on solar terms (Jie Qi)
  // Implementation
  return { stem: 'Bing', branch: 'Wu', element: 'fire' };
}

function calculateDayPillar(lunarDate) {
  // Uses Julian Day Number algorithm
  // Implementation
  return { stem: 'Xin', branch: 'Wei', element: 'metal', yin_yang: 'yin' };
}

function calculateHourPillar(birthTime, dayPillar, location) {
  // Adjusts for true solar time based on location
  // Implementation
  return { stem: 'Ren', branch: 'Shen', element: 'water' };
}
```

#### Step 3: Product Matching

**API Endpoint** (`app/api/bazi/match-products/route.ts`):

```typescript
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import compatibilityRules from '@/lib/bazi-knowledge/compatibility-rules.json';

export async function POST(request: Request) {
  const { bazi_chart } = await request.json();

  // Fetch all active products with stock
  const products = await prisma.products.findMany({
    where: {
      is_active: true,
      inventory_stock: {
        quantity_available: { gt: 0 }
      }
    },
    include: {
      inventory_stock: true,
      media_files: {
        where: { is_primary: true },
        take: 1
      }
    }
  });

  // Score each product
  const scoredProducts = products.map(product => {
    const score = calculateMatchScore(product.bazi_element, bazi_chart);
    const explanation = generateExplanation(product.bazi_element, bazi_chart, score);

    return {
      product,
      match_score: score.total,
      explanation: explanation,
      category: score.category
    };
  });

  // Group by category
  const perfectMatches = scoredProducts.filter(p => p.category === 'perfect').sort((a, b) => b.match_score - a.match_score);
  const goodMatches = scoredProducts.filter(p => p.category === 'good').sort((a, b) => b.match_score - a.match_score);
  const cautionMatches = scoredProducts.filter(p => p.category === 'caution').sort((a, b) => b.match_score - a.match_score);

  return NextResponse.json({
    perfect_matches: perfectMatches,
    good_matches: goodMatches,
    caution_matches: cautionMatches
  });
}

function calculateMatchScore(crystalElement: string, baziChart: any) {
  let score = 50; // Base neutral score
  let category = 'good';

  const { favorable_elements, unfavorable_elements, elemental_strength } = baziChart;

  // Perfect match: crystal element is favorable
  if (favorable_elements.includes(crystalElement)) {
    score += 50;
    category = 'perfect';
  }

  // Caution: crystal element is unfavorable
  if (unfavorable_elements.includes(crystalElement)) {
    score -= 50;
    category = 'caution';
  }

  // Productive cycle bonus
  const producedBy = getProducingElement(crystalElement);
  if (favorable_elements.includes(producedBy)) {
    score += 25;
  }

  // Controlling cycle warning
  const controlledBy = getControllingElement(crystalElement);
  if (favorable_elements.includes(controlledBy)) {
    score -= 25;
    if (category !== 'caution') category = 'good';
  }

  // Excessive element check
  if (elemental_strength[crystalElement] >= 4) {
    score -= 15;
    // Note: may be beneficial if intentionally balancing
  }

  return { total: Math.max(0, Math.min(100, score)), category };
}

function generateExplanation(crystalElement: string, baziChart: any, score: any): string {
  const { day_master, favorable_elements } = baziChart;

  if (score.category === 'perfect') {
    return `${capitalize(crystalElement)} element directly strengthens your ${day_master.element} Day Master. This crystal aligns perfectly with your favorable elements.`;
  } else if (score.category === 'good') {
    return `${capitalize(crystalElement)} element supports your Bazi chart through the productive cycle, promoting balance and harmony.`;
  } else {
    return `${capitalize(crystalElement)} element may conflict with your ${day_master.element} Day Master. Use cautiously or consult a Bazi practitioner.`;
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Element cycle helpers (same as in bazi-calculator.js)
function getProducingElement(element: string) {
  const cycle = { wood: 'water', fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal' };
  return cycle[element];
}

function getControllingElement(element: string) {
  const cycle = { wood: 'metal', fire: 'water', earth: 'wood', metal: 'fire', water: 'earth' };
  return cycle[element];
}
```

#### Step 4: Results Display

**Results Component**:

```tsx
function ResultsSection({ results }) {
  const { baziChart, matches } = results;

  return (
    <div className="mt-12 space-y-12">
      {/* Bazi Chart Display */}
      <section>
        <h2 className="font-accent text-3xl mb-6">Your Bazi Chart</h2>
        <div className="grid grid-cols-4 gap-4">
          <PillarCard title="Year" pillar={baziChart.year_pillar} />
          <PillarCard title="Month" pillar={baziChart.month_pillar} />
          <PillarCard title="Day" pillar={baziChart.day_pillar} />
          {baziChart.hour_pillar && <PillarCard title="Hour" pillar={baziChart.hour_pillar} />}
        </div>

        <div className="mt-6 p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <h3 className="font-semibold mb-2">Day Master: {baziChart.day_master.stem} ({baziChart.day_master.element})</h3>
          <div className="flex gap-4">
            <div>
              <p className="text-sm font-medium">Favorable Elements:</p>
              <div className="flex gap-2 mt-1">
                {baziChart.favorable_elements.map(el => (
                  <ElementBadge key={el} element={el} favorable />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Unfavorable Elements:</p>
              <div className="flex gap-2 mt-1">
                {baziChart.unfavorable_elements.map(el => (
                  <ElementBadge key={el} element={el} favorable={false} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Perfect Matches */}
      <section>
        <h2 className="font-accent text-3xl mb-4">✨ Perfect Matches</h2>
        <p className="text-textLight mb-6">These crystals directly strengthen your Bazi chart</p>
        <div className="grid grid-cols-3 gap-6">
          {matches.perfect_matches.map(match => (
            <MatchedProductCard key={match.product.id} match={match} />
          ))}
        </div>
      </section>

      {/* Good Matches */}
      <section>
        <h2 className="font-accent text-3xl mb-4">✅ Good Matches</h2>
        <p className="text-textLight mb-6">Beneficial for your elemental balance</p>
        <div className="grid grid-cols-3 gap-6">
          {matches.good_matches.map(match => (
            <MatchedProductCard key={match.product.id} match={match} />
          ))}
        </div>
      </section>

      {/* Caution Matches */}
      {matches.caution_matches.length > 0 && (
        <section>
          <h2 className="font-accent text-3xl mb-4">⚠️ Use with Caution</h2>
          <p className="text-textLight mb-6">May create imbalance - consult an expert</p>
          <div className="grid grid-cols-3 gap-6">
            {matches.caution_matches.map(match => (
              <MatchedProductCard key={match.product.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <div className="bg-warning/10 border border-warning/30 rounded-lg p-6">
        <p className="text-sm">
          ⚠️ <strong>Educational Purposes:</strong> This is a simplified Bazi analysis based on
          traditional Five Elements theory. For personalized consultation, please contact a
          certified Bazi practitioner. <a href="/bazi-guide" className="text-primary underline">Learn more about Bazi</a>
        </p>
      </div>
    </div>
  );
}
```

### Data Privacy & Security

**Privacy Measures**:
1. Birth data is NOT stored in database
2. All calculations happen server-side in-memory
3. Optional: Generate shareable link with hashed chart (expires 24hrs)
   - SHA-256 hash of birth data as URL parameter
   - Stored in Redis cache with TTL
   - User can revisit results without re-entering data

**Disclaimer Display**:
- Prominent notice on every Bazi-related page
- Link to educational `/bazi-guide` page explaining methodology
- Clear statement: "Not a substitute for professional Bazi consultation"

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
1. Initialize Next.js 15 project in `C:\xampp7\htdocs\crystal`
2. Set up MySQL database + Prisma ORM
3. Create database schema + run migrations
4. Seed database with sample products (Sakura Rhodonite, Blue Moonstone, etc.)
5. Configure Theme Factory (`theme-config.json` + Tailwind integration)
6. Set up `.claude/` folder with superpowers skills configuration

### Phase 2: Admin Backend (Week 2-3)
1. Implement API routes (products, suppliers, purchases, inventory, media)
2. Build admin authentication (NextAuth.js)
3. Create admin UI components:
   - Product add/edit forms
   - Purchase recording interface
   - Stock overview table
   - Supplier comparison view
   - Media manager

### Phase 3: Public Storefront (Week 3-4)
1. Build product catalog + detail pages
2. Implement cart functionality
3. Create simple checkout/contact form
4. Integrate Algorithmic Art backgrounds (p5.js)

### Phase 4: Bazi System (Week 4-5)
1. Build RAG knowledge base (elements.json, crystals-database.json, etc.)
2. Implement Bazi calculator (`lib/bazi-calculator.js`)
3. Create "Find Your Crystal" tool (birth data form + chart display)
4. Build product matching algorithm
5. Add educational `/bazi-guide` page

### Phase 5: AI Content Generation (Week 5-6)
1. Integrate Vercel AI SDK + Anthropic API
2. Implement Bazi selling copy generator (with RAG)
3. Implement video edit prompt generator
4. Build admin content preview/verification UI
5. Add caching layer for approved content

### Phase 6: Polish & Testing (Week 6-7)
1. Responsive design testing (mobile/tablet/desktop)
2. Performance optimization (image lazy loading, code splitting)
3. SEO setup (meta tags, sitemap, schema.org markup)
4. Accessibility audit (WCAG 2.1 AA compliance)
5. User acceptance testing with sample workflows

### Phase 7: Deployment Preparation (Week 7-8)
1. Configure production environment variables
2. Set up MySQL backup scripts
3. Create deployment documentation
4. Security hardening (rate limiting, input validation, HTTPS)
5. Analytics setup (optional: Google Analytics / Plausible)

---

## Seed Data Examples

**Suppliers**:
```sql
INSERT INTO suppliers (name, contact_email, notes) VALUES
('fafajewelry', 'contact@fafajewelry.com', 'Reliable supplier, good quality, ships within 3 days'),
('pandora', 'wholesale@pandora.com', 'Premium quality, higher prices, luxury packaging');
```

**Products**:
```sql
INSERT INTO products (base_name, size_mm, quality_grade, sku, bazi_element, metaphysical_properties, description) VALUES
('Sakura Rhodonite', 10.00, 'normal', 'SAKURA-RHOD-10MM-NORMAL', 'fire', '["healing", "love", "compassion", "emotional_balance"]', 'Beautiful sakura pink rhodonite beads, perfect for heart-centered work'),
('Sakura Rhodonite', 12.00, 'normal', 'SAKURA-RHOD-12MM-NORMAL', 'fire', '["healing", "love", "compassion", "emotional_balance"]', 'Larger sakura rhodonite beads, more intense energy'),
('Sakura Rhodonite', 10.00, 'good', 'SAKURA-RHOD-10MM-GOOD', 'fire', '["healing", "love", "compassion", "emotional_balance"]', 'Higher quality sakura rhodonite with excellent clarity'),
('Blue Moonstone', 8.00, 'normal', 'BLUE-MOON-8MM-NORMAL', 'water', '["intuition", "feminine_energy", "lunar_connection", "emotional_healing"]', 'Shimmering blue moonstone with strong adularescence');
```

**Purchases**:
```sql
INSERT INTO inventory_purchases (product_id, supplier_id, quantity_purchased, weight_grams, cost_total, markup_percentage, quality_rating, purchase_date, notes) VALUES
(1, 1, 10, 20.00, 5.00, 40.00, 4, '2025-01-15', 'Good color consistency'),
(2, 1, 5, 30.00, 7.00, 40.00, 4, '2025-01-15', 'Slightly larger than expected'),
(3, 2, 8, 20.00, 9.00, 40.00, 5, '2025-01-20', 'Excellent clarity, premium feel'),
(4, 1, 12, 15.00, 6.00, 40.00, 4, '2025-01-18', 'Strong blue flash');
```

**Stock** (auto-updated by purchases trigger):
```sql
INSERT INTO inventory_stock (product_id, quantity_available, weight_grams_available, avg_cost_per_gram) VALUES
(1, 10, 20.00, 0.25),
(2, 5, 30.00, 0.2333),
(3, 8, 20.00, 0.45),
(4, 12, 15.00, 0.40);
```

---

## Success Criteria Checklist

✅ **Working local website** at `C:\xampp7\htdocs\crystal`
✅ **MySQL database** with schema implemented
✅ **Public product catalog** with filtering, sorting
✅ **Admin area** for product/supplier/purchase management
✅ **Inventory tracking** with COGS calculation
✅ **Supplier comparison** analytics per product
✅ **Media manager** with file uploads and tagging
✅ **Bazi matching tool** for customer birth chart analysis
✅ **AI Bazi selling copy generator** with RAG accuracy
✅ **AI video edit prompt generator** for social media
✅ **Theme Factory** integration with consistent branding
✅ **Algorithmic Art** p5.js backgrounds per element
✅ **REST API endpoints** fully functional
✅ **Example seed data** loaded (Sakura Rhodonite, Blue Moonstone)
✅ **Documentation** in `docs/plans/`

---

## Next Steps After Design Approval

1. Create `.claude/settings.json` with superpowers skills configuration
2. Use `superpowers:using-git-worktrees` to create isolated workspace
3. Use `superpowers:writing-plans` to create detailed implementation plan
4. Begin Phase 1 implementation with TDD approach

---

**End of Design Document**
