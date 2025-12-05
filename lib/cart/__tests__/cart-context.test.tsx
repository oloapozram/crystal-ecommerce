import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../cart-context';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('CartContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    expect(result.current.cart.items).toEqual([]);
    expect(result.current.cart.itemCount).toBe(0);
    expect(result.current.cart.subtotal).toBe(0);
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const product = {
      productId: 1,
      sku: 'TEST-10MM-NORMAL',
      name: 'Test Crystal 10mm Normal',
      baseName: 'Test Crystal',
      size: 10,
      quality: 'NORMAL',
      element: 'FIRE',
      pricePerUnit: 5.00,
      primaryImage: null,
      stockAvailable: 10,
    };

    act(() => {
      result.current.addItem(product, 2);
    });

    expect(result.current.cart.items).toHaveLength(1);
    expect(result.current.cart.items[0].quantity).toBe(2);
    expect(result.current.cart.itemCount).toBe(2);
    expect(result.current.cart.subtotal).toBe(10.00);
  });

  it('should update quantity when adding existing item', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const product = {
      productId: 1,
      sku: 'TEST-10MM-NORMAL',
      name: 'Test Crystal 10mm Normal',
      baseName: 'Test Crystal',
      size: 10,
      quality: 'NORMAL',
      element: 'FIRE',
      pricePerUnit: 5.00,
      primaryImage: null,
      stockAvailable: 10,
    };

    act(() => {
      result.current.addItem(product, 2);
      result.current.addItem(product, 1);
    });

    expect(result.current.cart.items).toHaveLength(1);
    expect(result.current.cart.items[0].quantity).toBe(3);
    expect(result.current.cart.subtotal).toBe(15.00);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const product = {
      productId: 1,
      sku: 'TEST-10MM-NORMAL',
      name: 'Test Crystal 10mm Normal',
      baseName: 'Test Crystal',
      size: 10,
      quality: 'NORMAL',
      element: 'FIRE',
      pricePerUnit: 5.00,
      primaryImage: null,
      stockAvailable: 10,
    };

    act(() => {
      result.current.addItem(product, 2);
      result.current.removeItem(1);
    });

    expect(result.current.cart.items).toHaveLength(0);
    expect(result.current.cart.itemCount).toBe(0);
    expect(result.current.cart.subtotal).toBe(0);
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const product = {
      productId: 1,
      sku: 'TEST-10MM-NORMAL',
      name: 'Test Crystal 10mm Normal',
      baseName: 'Test Crystal',
      size: 10,
      quality: 'NORMAL',
      element: 'FIRE',
      pricePerUnit: 5.00,
      primaryImage: null,
      stockAvailable: 10,
    };

    act(() => {
      result.current.addItem(product, 2);
      result.current.updateQuantity(1, 5);
    });

    expect(result.current.cart.items[0].quantity).toBe(5);
    expect(result.current.cart.subtotal).toBe(25.00);
  });

  it('should clear entire cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const product = {
      productId: 1,
      sku: 'TEST-10MM-NORMAL',
      name: 'Test Crystal 10mm Normal',
      baseName: 'Test Crystal',
      size: 10,
      quality: 'NORMAL',
      element: 'FIRE',
      pricePerUnit: 5.00,
      primaryImage: null,
      stockAvailable: 10,
    };

    act(() => {
      result.current.addItem(product, 2);
      result.current.clearCart();
    });

    expect(result.current.cart.items).toHaveLength(0);
    expect(result.current.cart.itemCount).toBe(0);
  });

  it('should persist cart to localStorage', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const product = {
      productId: 1,
      sku: 'TEST-10MM-NORMAL',
      name: 'Test Crystal 10mm Normal',
      baseName: 'Test Crystal',
      size: 10,
      quality: 'NORMAL',
      element: 'FIRE',
      pricePerUnit: 5.00,
      primaryImage: null,
      stockAvailable: 10,
    };

    act(() => {
      result.current.addItem(product, 2);
    });

    const savedCart = JSON.parse(localStorageMock.getItem('crystal-cart') || '{}');
    expect(savedCart.items).toHaveLength(1);
    expect(savedCart.items[0].productId).toBe(1);
  });

  it('should load cart from localStorage on mount', () => {
    const existingCart = {
      items: [{
        productId: 1,
        sku: 'TEST-10MM-NORMAL',
        name: 'Test Crystal 10mm Normal',
        baseName: 'Test Crystal',
        size: 10,
        quality: 'NORMAL',
        element: 'FIRE',
        pricePerUnit: 5.00,
        quantity: 2,
        primaryImage: null,
        stockAvailable: 10,
      }],
    };

    localStorageMock.setItem('crystal-cart', JSON.stringify(existingCart));

    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    expect(result.current.cart.items).toHaveLength(1);
    expect(result.current.cart.items[0].productId).toBe(1);
    expect(result.current.cart.itemCount).toBe(2);
  });
});
