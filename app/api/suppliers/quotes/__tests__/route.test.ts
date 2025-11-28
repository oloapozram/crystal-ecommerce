import { describe, it, expect, beforeAll } from 'vitest';
import { GET, POST } from '../route';
import { prisma } from '@/lib/prisma';

describe('GET /api/suppliers/quotes', () => {
  it('should return all quotes with related data', async () => {
    const request = new Request('http://localhost:3000/api/suppliers/quotes');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('should filter by status query param', async () => {
    const request = new Request('http://localhost:3000/api/suppliers/quotes?status=PENDING');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    if (data.length > 0) {
      expect(data.every((q: any) => q.status === 'PENDING')).toBe(true);
    }
  });

  it('should filter by productId query param', async () => {
    const request = new Request('http://localhost:3000/api/suppliers/quotes?productId=1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  it('should include supplier and product data', async () => {
    const request = new Request('http://localhost:3000/api/suppliers/quotes');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('supplier');
      expect(data[0]).toHaveProperty('product');
    }
  });
});

describe('POST /api/suppliers/quotes', () => {
  it('should create new quote with required fields', async () => {
    const quoteData = {
      supplierId: 1,
      productId: 1,
      quotedPricePerGram: 0.30,
      notes: 'Vitest test quote'
    };

    const request = new Request('http://localhost:3000/api/suppliers/quotes', {
      method: 'POST',
      body: JSON.stringify(quoteData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data.status).toBe('PENDING');

    // Cleanup
    if (data.id) {
      await prisma.supplierQuote.delete({ where: { id: data.id } });
    }
  });

  it('should create quote with all optional fields', async () => {
    const quoteData = {
      supplierId: 1,
      productId: 1,
      quotedPricePerGram: 0.25,
      minimumOrderGrams: 50.00,
      estimatedQualityRating: 5,
      expiresAt: '2025-12-31',
      notes: 'Full quote test'
    };

    const request = new Request('http://localhost:3000/api/suppliers/quotes', {
      method: 'POST',
      body: JSON.stringify(quoteData),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.estimatedQualityRating).toBe(5);
    expect(data.notes).toBe('Full quote test');

    // Cleanup
    if (data.id) {
      await prisma.supplierQuote.delete({ where: { id: data.id } });
    }
  });
});
