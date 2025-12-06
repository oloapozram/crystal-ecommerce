'use client';

import Image from 'next/image';
import { Minus, Plus, X } from 'lucide-react';
import { CartItem as CartItemType } from '@/lib/cart/types';
import { Button } from '@/components/ui/button';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const itemTotal = item.pricePerUnit * item.quantity;

  return (
    <div className="flex gap-4 py-4 border-b">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {item.primaryImage ? (
          <Image
            src={item.primaryImage}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex justify-between">
            <div>
              <h3 className="font-medium">{item.baseName}</h3>
              <p className="text-sm text-muted-foreground">
                {item.size}mm • {item.quality}
                {item.element && ` • ${item.element}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(item.productId)}
              aria-label="Remove item"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-12 text-center">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              disabled={item.quantity >= item.stockAvailable}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <span className="ml-2 text-sm text-muted-foreground">
              {item.stockAvailable} available
            </span>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <p className="text-sm text-muted-foreground">
            ${item.pricePerUnit.toFixed(2)} each
          </p>
          <p className="font-semibold">
            ${itemTotal.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
