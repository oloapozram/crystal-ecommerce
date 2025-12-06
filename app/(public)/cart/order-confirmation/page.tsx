'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get('orderNumber');

  useEffect(() => {
    // Redirect to home if no order number
    if (!orderNumber) {
      router.push('/');
    }
  }, [orderNumber, router]);

  if (!orderNumber) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-6">
          <CheckCircle className="mx-auto h-20 w-20 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>

        <p className="text-lg text-muted-foreground mb-8">
          Thank you for your order. We've received your order and will process it shortly.
        </p>

        <div className="bg-card rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Order Number</span>
          </div>
          <p className="text-2xl font-bold font-mono">{orderNumber}</p>
        </div>

        <div className="space-y-4 text-muted-foreground mb-8">
          <p>
            We've sent a confirmation email with your order details. Please save your order
            number for reference.
          </p>
          <p>
            If you have any questions about your order, please contact us with your order
            number.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
