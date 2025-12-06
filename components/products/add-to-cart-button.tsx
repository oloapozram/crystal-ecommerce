'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
  product: {
    id: number;
    sku: string;
    name: string;
    baseName: string;
    size: number;
    quality: string;
    element: string | null;
    retailPrice: number;
    stockAvailable: number;
    primaryImage: string | null;
  };
  quantity?: number;
}

export function AddToCartButton({ product, quantity = 1 }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);

    addItem({
      productId: product.id,
      sku: product.sku,
      name: product.name,
      baseName: product.baseName,
      size: product.size,
      quality: product.quality,
      element: product.element,
      pricePerUnit: product.retailPrice,
      primaryImage: product.primaryImage,
      stockAvailable: product.stockAvailable,
    }, quantity);

    setTimeout(() => {
      setIsAdding(false);
      router.push('/cart');
    }, 300);
  };

  const isOutOfStock = product.stockAvailable <= 0;

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isOutOfStock || isAdding}
      className="w-full"
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isOutOfStock ? 'Out of Stock' : isAdding ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
}
