# Crystal Material Master Data - Implementation Plan

## Goal
Add a Material field to the product creation flow that auto-populates Bazi element and metaphysical properties based on a master database of 40 common crystal materials.

## Database Schema Changes

### Step 1: Add CrystalMaterial Model to Prisma Schema

```prisma
model CrystalMaterial {
  id                Int         @id @default(autoincrement())
  name              String      @unique @db.VarChar(100)
  baziElement       BaziElement
  defaultProperties Json        // Array of base metaphysical properties
  chakra            String?     @db.VarChar(100)
  color             String?     @db.VarChar(100)
  description       String?     @db.Text
  createdAt         DateTime    @default(now()) @map("created_at")
  
  products Product[]
  
  @@map("crystal_materials")
}

model Product {
  // Add new fields
  materialId Int? @map("material_id")
  variety    String? @db.VarChar(100) // "Dream", "Bolivian", etc.
  
  // Add relation
  material CrystalMaterial? @relation(fields: [materialId], references: [id])
  
  @@index([materialId])
}
```

### Step 2: Create Migration

```bash
npx prisma migrate dev --name add_crystal_materials
```

### Step 3: Seed Crystal Materials

Create `prisma/seed-materials.ts` with 40 common materials:
- 8 Fire element crystals
- 8 Earth element crystals
- 8 Metal element crystals
- 8 Water element crystals
- 8 Wood element crystals

Each material includes:
- Name
- Bazi element
- Default properties (3-5 key properties)
- Associated chakra
- Primary color

## UI Changes

### Step 4: Update Product Form

Modify `components/admin/product-form.tsx`:
1. Add Material dropdown (searchable/autocomplete)
2. Add Variety text input (optional)
3. Auto-populate Element when Material is selected
4. Auto-populate Properties when Material is selected
5. Allow manual override of auto-filled values
6. Auto-generate Product Name: `${variety} ${material.name}` or just `${material.name}`

### Step 5: Update Product Validation Schema

Modify `lib/validations/product.ts`:
- Add `materialId` (optional number)
- Add `variety` (optional string)
- Make `baziElement` optional (can be inherited from material)
- Update logic to handle material-based defaults

### Step 6: Update Server Actions

Modify `app/admin/products/actions.ts`:
- Handle materialId in create/update
- If materialId provided, fetch material and use its defaults
- Merge material defaults with any custom overrides

## Material Database (40 Crystals)

### Fire Element (8)
1. Carnelian - Creativity, Courage, Vitality
2. Sunstone - Joy, Leadership, Abundance
3. Red Jasper - Strength, Stamina, Grounding
4. Fire Agate - Protection, Energy, Passion
5. Ruby - Love, Prosperity, Confidence
6. Garnet - Regeneration, Passion, Balance
7. Citrine - Manifestation, Success, Positivity
8. Tiger's Eye - Confidence, Willpower, Focus

### Earth Element (8)
9. Smoky Quartz - Grounding, Protection, Detox
10. Brown Jasper - Stability, Comfort, Nurturing
11. Petrified Wood - Patience, Transformation, Grounding
12. Aragonite - Centering, Patience, Reliability
13. Moss Agate - Growth, Abundance, Nature Connection
14. Unakite - Balance, Rebirth, Emotional Healing
15. Green Jade - Harmony, Prosperity, Longevity
16. Malachite - Transformation, Protection, Healing

### Metal Element (8)
17. Clear Quartz - Amplification, Clarity, Energy
18. Selenite - Cleansing, Clarity, Higher Consciousness
19. Apophyllite - Spiritual Connection, Truth, Clarity
20. Herkimer Diamond - Attunement, Clarity, Dreams
21. Pyrite - Abundance, Willpower, Manifestation
22. Hematite - Grounding, Protection, Focus
23. Silver - Intuition, Reflection, Feminine Energy
24. Labradorite - Magic, Protection, Transformation

### Water Element (8)
25. Aquamarine - Calm, Communication, Courage
26. Blue Lace Agate - Peace, Communication, Serenity
27. Larimar - Tranquility, Clarity, Healing
28. Sodalite - Logic, Truth, Intuition
29. Lapis Lazuli - Wisdom, Truth, Inner Vision
30. Azurite - Insight, Intuition, Spiritual Awareness
31. Moonstone - Intuition, Feminine Energy, New Beginnings
32. Amethyst - Calm, Spiritual Protection, Intuition

### Wood Element (8)
33. Green Aventurine - Luck, Growth, Opportunity
34. Amazonite - Truth, Communication, Harmony
35. Chrysoprase - Growth, Compassion, Acceptance
36. Emerald - Love, Abundance, Growth
37. Peridot - Renewal, Growth, Prosperity
38. Prehnite - Peace, Protection, Unconditional Love
39. Tree Agate - Growth, Stability, Connection to Nature
40. Fuchsite - Resilience, Self-Worth, Emotional Healing

### Special/Multi-Element
- Rose Quartz (EARTH) - Love, Compassion, Healing
- Black Tourmaline (EARTH) - Protection, Grounding, Purification

## Implementation Steps

1. Update Prisma schema
2. Run migration
3. Create seed script for materials
4. Run seed
5. Update product form UI
6. Update validation schema
7. Update server actions
8. Test: Create product with material selection
9. Verify auto-population works

## Verification Checklist

- [ ] Can select material from dropdown
- [ ] Element auto-fills when material selected
- [ ] Properties auto-fill when material selected
- [ ] Can add variety name (optional)
- [ ] Product name auto-generates correctly
- [ ] Can override auto-filled values
- [ ] Existing products still work
