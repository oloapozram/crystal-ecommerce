'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCart } from '@/lib/cart/cart-context';
import { checkoutSchema, CheckoutFormData } from '@/lib/validation/checkout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);

    // Validate cart
    const validationResponse = await fetch('/api/cart/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
        })),
      }),
    });

    const validation = await validationResponse.json();

    if (!validation.valid) {
      alert('Some items in your cart are no longer available. Please review your cart.');
      setIsSubmitting(false);
      router.push('/cart');
      return;
    }

    // Prepare order data
    const orderData = {
      customer: data,
      items: cart.items,
      subtotal: cart.subtotal,
    };

    console.log('Order submitted:', orderData);

    // For now, just show success message
    alert('Thank you for your order! We will contact you shortly via email.');
    clearCart();
    router.push('/');
  };

  if (cart.items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                {cart.itemCount} items • ${cart.subtotal.toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>
                      {item.baseName} ({item.quantity}x)
                    </span>
                    <span>${(item.pricePerUnit * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                We'll contact you to arrange payment and shipping
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message (optional)</Label>
                  <Textarea
                    id="message"
                    {...register('message')}
                    placeholder="Any special requests or questions?"
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    onCheckedChange={(checked) => setValue('agreeToTerms', checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm font-normal">
                    I agree to be contacted about this order
                  </Label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-sm text-destructive">{errors.agreeToTerms.message}</p>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Order'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
