'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { Button } from '@/components/ui/button';

export function CartBadge() {
  const { cart } = useCart();

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        {cart.itemCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
            {cart.itemCount > 9 ? '9+' : cart.itemCount}
          </span>
        )}
        <span className="sr-only">Shopping cart</span>
      </Link>
    </Button>
  );
}
