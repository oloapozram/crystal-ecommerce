import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GET } from '../route';
import { prisma } from '@/lib/prisma';

describe('GET /api/products/[id]', () => {
  let testProduct: any;
  let testSupplier: any;
  let testPurchase: any;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.mediaFile.deleteMany({});
    await prisma.inventoryStock.deleteMany({});
    await prisma.inventoryPurchase.deleteMany({});
    await prisma.product.deleteMany({
      where: { sku: 'TEST-SINGLE-PRODUCT' }
    });
    await prisma.supplier.deleteMany({
      where: { name: 'Test Single Supplier' }
    });

    // Create test supplier
    testSupplier = await prisma.supplier.create({
      data: {
        name: 'Test Single Supplier',
        contactEmail: 'single@example.com',
      },
    });

    // Create test product
    testProduct = await prisma.product.create({
      data: {
        baseName: 'Test Single Product',
        sizeMm: 10.00,
        qualityGrade: 'GOOD',
        sku: 'TEST-SINGLE-PRODUCT',
        baziElement: 'METAL',
        metaphysicalProperties: ['focus', 'clarity'],
        description: 'Test single product description',
        isActive: true,
      },
    });

    // Create purchase
    testPurchase = await prisma.inventoryPurchase.create({
      data: {
        productId: testProduct.id,
        supplierId: testSupplier.id,
        quantityPurchased: 20,
        weightGrams: 40.00,
        costTotal: 12.00,
        markupPercentage: 40.00,
        qualityRating: 5,
        purchaseDate: new Date('2025-01-20'),
        notes: 'Excellent quality',
      },
    });

    // Create stock
    await prisma.inventoryStock.create({
      data: {
        productId: testProduct.id,
        quantityAvailable: 20,
        weightGramsAvailable: 40.00,
        avgCostPerGram: 0.30, // 12.00 / 40.00
        lastRestockDate: new Date('2025-01-20'),
      },
    });

    // Create media files
    await prisma.mediaFile.create({
      data: {
        productId: testProduct.id,
        filePath: '/images/test-primary.jpg',
        fileType: 'IMAGE',
        isPrimary: true,
        displayOrder: 0,
      },
    });

    await prisma.mediaFile.create({
      data: {
        productId: testProduct.id,
        filePath: '/images/test-secondary.jpg',
        fileType: 'IMAGE',
        isPrimary: false,
        displayOrder: 1,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.mediaFile.deleteMany({
      where: { productId: testProduct.id }
    });
    await prisma.inventoryStock.deleteMany({
      where: { productId: testProduct.id }
    });
    await prisma.inventoryPurchase.deleteMany({
      where: { productId: testProduct.id }
    });
    await prisma.product.deleteMany({
      where: { id: testProduct.id }
    });
    await prisma.supplier.deleteMany({
      where: { id: testSupplier.id }
    });
    await prisma.$disconnect();
  });

  it('should return single product by ID with full details', async () => {
    const request = new Request(`http://localhost:3000/api/products/${testProduct.id}`);
    const response = await GET(request, { params: { id: testProduct.id.toString() } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(testProduct.id);
    expect(data.sku).toBe('TEST-SINGLE-PRODUCT');
    expect(data.baseName).toBe('Test Single Product');
    expect(data.baziElement).toBe('METAL');
    expect(data.description).toBe('Test single product description');
  });

  it('should include stock information', async () => {
    const request = new Request(`http://localhost:3000/api/products/${testProduct.id}`);
    const response = await GET(request, { params: { id: testProduct.id.toString() } });
    const data = await response.json();

    expect(data.stock).toBeDefined();
    expect(data.stock.quantityAvailable).toBe(20);
    expect(data.stock.weightGramsAvailable).toBeDefined();
  });

  it('should include pricing information', async () => {
    const request = new Request(`http://localhost:3000/api/products/${testProduct.id}`);
    const response = await GET(request, { params: { id: testProduct.id.toString() } });
    const data = await response.json();

    expect(data.pricing).toBeDefined();
    expect(data.pricing.costPerGram).toBeDefined();
    expect(data.pricing.retailPerGram).toBeDefined();
    expect(data.pricing.totalRetailPrice).toBeDefined();
    expect(data.pricing.markup).toBe(40);

    // Verify pricing calculation
    // Cost per gram: 0.30
    // Retail per gram: 0.30 * 1.40 = 0.42
    // Total retail: 0.42 * 40.00 = 16.80
    expect(data.pricing.costPerGram).toBe(0.30);
    expect(data.pricing.retailPerGram).toBe(0.42);
    expect(data.pricing.totalRetailPrice).toBe(16.80);
  });

  it('should include purchases with supplier information', async () => {
    const request = new Request(`http://localhost:3000/api/products/${testProduct.id}`);
    const response = await GET(request, { params: { id: testProduct.id.toString() } });
    const data = await response.json();

    expect(data.purchases).toBeDefined();
    expect(Array.isArray(data.purchases)).toBe(true);
    expect(data.purchases.length).toBe(1);

    const purchase = data.purchases[0];
    expect(purchase.supplier).toBeDefined();
    expect(purchase.supplier.name).toBe('Test Single Supplier');
    expect(purchase.quantityPurchased).toBe(20);
    expect(purchase.qualityRating).toBe(5);
  });

  it('should include all media files ordered by displayOrder', async () => {
    const request = new Request(`http://localhost:3000/api/products/${testProduct.id}`);
    const response = await GET(request, { params: { id: testProduct.id.toString() } });
    const data = await response.json();

    expect(data.mediaFiles).toBeDefined();
    expect(Array.isArray(data.mediaFiles)).toBe(true);
    expect(data.mediaFiles.length).toBe(2);

    // Should be ordered by displayOrder
    expect(data.mediaFiles[0].filePath).toBe('/images/test-primary.jpg');
    expect(data.mediaFiles[0].isPrimary).toBe(true);
    expect(data.mediaFiles[1].filePath).toBe('/images/test-secondary.jpg');
  });

  it('should return 404 for non-existent product', async () => {
    const request = new Request('http://localhost:3000/api/products/99999');
    const response = await GET(request, { params: { id: '99999' } });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Product not found');
  });
});
