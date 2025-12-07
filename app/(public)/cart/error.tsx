'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export default function CartError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Cart error:', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-6">
          <AlertCircle className="mx-auto h-16 w-16 text-destructive" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Cart Error</h1>

        <p className="text-muted-foreground mb-6">
          We encountered an issue while processing your cart. Your items should
          still be saved.
        </p>

        {error.message && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-destructive font-mono">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset}>
            Reload cart
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Continue shopping
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            If this problem persists, try clearing your browser cache or contact
            support with the error ID below.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-muted-foreground font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
