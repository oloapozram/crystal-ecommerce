'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { CartItem } from '@/components/cart/cart-item';
import { CartSummary } from '@/components/cart/cart-summary';
import { Button } from '@/components/ui/button';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeItem } = useCart();

  const handleCheckout = () => {
    router.push('/cart/checkout');
  };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">
            Add some crystals to get started!
          </p>
          <Button asChild className="mt-6">
            <Link href="/shop">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg p-6">
            {cart.items.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>
        </div>

        <div>
          <CartSummary
            subtotal={cart.subtotal}
            itemCount={cart.itemCount}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}
