'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  onCheckout: () => void;
}

export function CartSummary({ subtotal, itemCount, onCheckout }: CartSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Items ({itemCount})</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        <div className="pt-2 border-t">
          <div className="flex justify-between font-semibold">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={onCheckout}
          disabled={itemCount === 0}
        >
          Proceed to Checkout
        </Button>
      </CardFooter>
    </Card>
  );
}
