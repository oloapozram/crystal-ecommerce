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

  // Create new prospect supplier
  const newSupplier = await prisma.supplier.create({
    data: {
      name: 'Crystal Direct Wholesale',
      contactEmail: 'quotes@crystaldirect.com',
      notes: 'New supplier, competitive pricing, no purchase history yet',
    },
  });

  console.log('✓ New prospect supplier created');

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

  // Create prospect supplier quotes
  console.log('Creating prospect quotes...');

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
