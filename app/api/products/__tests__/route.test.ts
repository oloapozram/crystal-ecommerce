import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GET } from '../route';
import { prisma } from '@/lib/prisma';

describe('GET /api/products', () => {
  let testProduct1: any;
  let testProduct2: any;
  let testProduct3: any;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.inventoryStock.deleteMany({});
    await prisma.inventoryPurchase.deleteMany({});
    await prisma.product.deleteMany({
      where: {
        sku: {
          in: ['TEST-FIRE-10MM', 'TEST-WATER-8MM', 'TEST-FIRE-GOOD-12MM']
        }
      }
    });
    await prisma.supplier.deleteMany({
      where: { name: 'Test Supplier' }
    });

    // Create test supplier
    const supplier = await prisma.supplier.create({
      data: {
        name: 'Test Supplier',
        contactEmail: 'test@example.com',
      },
    });

    // Create test products with different elements and quality grades
    testProduct1 = await prisma.product.create({
      data: {
        baseName: 'Test Fire Crystal',
        sizeMm: 10.00,
        qualityGrade: 'NORMAL',
        sku: 'TEST-FIRE-10MM',
        baziElement: 'FIRE',
        metaphysicalProperties: ['healing', 'passion'],
        description: 'Test fire crystal',
        isActive: true,
      },
    });

    testProduct2 = await prisma.product.create({
      data: {
        baseName: 'Test Water Crystal',
        sizeMm: 8.00,
        qualityGrade: 'NORMAL',
        sku: 'TEST-WATER-8MM',
        baziElement: 'WATER',
        metaphysicalProperties: ['intuition', 'flow'],
        description: 'Test water crystal',
        isActive: true,
      },
    });

    testProduct3 = await prisma.product.create({
      data: {
        baseName: 'Test Fire Good Crystal',
        sizeMm: 12.00,
        qualityGrade: 'GOOD',
        sku: 'TEST-FIRE-GOOD-12MM',
        baziElement: 'FIRE',
        metaphysicalProperties: ['energy'],
        description: 'Test fire good crystal',
        isActive: true,
      },
    });

    // Create purchases and stock for products
    await prisma.inventoryPurchase.create({
      data: {
        productId: testProduct1.id,
        supplierId: supplier.id,
        quantityPurchased: 10,
        weightGrams: 20.00,
        costTotal: 5.00, // 0.25 per gram
        markupPercentage: 40.00,
        purchaseDate: new Date('2025-01-15'),
      },
    });

    await prisma.inventoryStock.create({
      data: {
        productId: testProduct1.id,
        quantityAvailable: 10,
        weightGramsAvailable: 20.00,
        avgCostPerGram: 0.25, // costTotal / weightGrams = 5.00 / 20.00 = 0.25
        lastRestockDate: new Date('2025-01-15'),
      },
    });

    await prisma.inventoryPurchase.create({
      data: {
        productId: testProduct2.id,
        supplierId: supplier.id,
        quantityPurchased: 15,
        weightGrams: 15.00,
        costTotal: 6.00, // 0.40 per gram
        markupPercentage: 40.00,
        purchaseDate: new Date('2025-01-16'),
      },
    });

    await prisma.inventoryStock.create({
      data: {
        productId: testProduct2.id,
        quantityAvailable: 15,
        weightGramsAvailable: 15.00,
        avgCostPerGram: 0.40,
        lastRestockDate: new Date('2025-01-16'),
      },
    });

    await prisma.inventoryPurchase.create({
      data: {
        productId: testProduct3.id,
        supplierId: supplier.id,
        quantityPurchased: 8,
        weightGrams: 25.00,
        costTotal: 10.00, // 0.40 per gram
        markupPercentage: 40.00,
        purchaseDate: new Date('2025-01-17'),
      },
    });

    await prisma.inventoryStock.create({
      data: {
        productId: testProduct3.id,
        quantityAvailable: 8,
        weightGramsAvailable: 25.00,
        avgCostPerGram: 0.40,
        lastRestockDate: new Date('2025-01-17'),
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.inventoryStock.deleteMany({});
    await prisma.inventoryPurchase.deleteMany({});
    await prisma.product.deleteMany({
      where: {
        sku: {
          in: ['TEST-FIRE-10MM', 'TEST-WATER-8MM', 'TEST-FIRE-GOOD-12MM']
        }
      }
    });
    await prisma.supplier.deleteMany({
      where: { name: 'Test Supplier' }
    });
    await prisma.$disconnect();
  });

  it('should return all active products with stock info', async () => {
    const request = new Request('http://localhost:3000/api/products');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(3);

    // Find our test products in the response
    const fireProduct = data.find((p: any) => p.sku === 'TEST-FIRE-10MM');
    expect(fireProduct).toBeDefined();
    expect(fireProduct.baseName).toBe('Test Fire Crystal');
    expect(fireProduct.element).toBe('FIRE');
    expect(fireProduct.stockAvailable).toBe(10);
  });

  it('should calculate pricing correctly: (costTotal / weightGrams) * (1 + markupPercentage/100)', async () => {
    const request = new Request('http://localhost:3000/api/products');
    const response = await GET(request);
    const data = await response.json();

    const fireProduct = data.find((p: any) => p.sku === 'TEST-FIRE-10MM');

    // Cost per gram: 5.00 / 20.00 = 0.25
    // Retail per gram: 0.25 * (1 + 40/100) = 0.25 * 1.40 = 0.35
    // Total retail price: 0.35 * 20.00 = 7.00
    expect(fireProduct.pricePerGram).toBe(0.35);
    expect(fireProduct.retailPrice).toBe(7.00);
  });

  it('should filter by baziElement query param', async () => {
    const request = new Request('http://localhost:3000/api/products?element=FIRE');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);

    // Should only return FIRE element products
    const fireProducts = data.filter((p: any) =>
      p.sku === 'TEST-FIRE-10MM' || p.sku === 'TEST-FIRE-GOOD-12MM'
    );
    const waterProducts = data.filter((p: any) => p.sku === 'TEST-WATER-8MM');

    expect(fireProducts.length).toBe(2);
    expect(waterProducts.length).toBe(0);

    fireProducts.forEach((product: any) => {
      expect(product.element).toBe('FIRE');
    });
  });

  it('should filter by qualityGrade query param', async () => {
    const request = new Request('http://localhost:3000/api/products?quality=GOOD');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);

    const goodProducts = data.filter((p: any) => p.sku === 'TEST-FIRE-GOOD-12MM');
    expect(goodProducts.length).toBe(1);
    expect(goodProducts[0].quality).toBe('GOOD');
  });

  it('should filter by in_stock query param', async () => {
    const request = new Request('http://localhost:3000/api/products?in_stock=true');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);

    // All our test products have stock
    data.forEach((product: any) => {
      expect(product.stockAvailable).toBeGreaterThan(0);
    });
  });

  it('should combine multiple filters', async () => {
    const request = new Request('http://localhost:3000/api/products?element=FIRE&quality=GOOD');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);

    const matchingProduct = data.find((p: any) => p.sku === 'TEST-FIRE-GOOD-12MM');
    expect(matchingProduct).toBeDefined();
    expect(matchingProduct.element).toBe('FIRE');
    expect(matchingProduct.quality).toBe('GOOD');
  });
});
