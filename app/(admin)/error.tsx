'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin panel error:', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-6">
          <AlertCircle className="mx-auto h-16 w-16 text-destructive" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Admin Panel Error</h1>

        <p className="text-muted-foreground mb-6">
          An error occurred while loading the admin panel. This might be due to
          invalid data or a temporary issue.
        </p>

        {error.message && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-semibold text-destructive mb-2">
              Error Details:
            </p>
            <p className="text-sm text-destructive font-mono break-words">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/products">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Go to Products
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
