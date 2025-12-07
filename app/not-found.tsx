import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion, Home, ShoppingBag } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <FileQuestion className="mx-auto h-24 w-24 text-muted-foreground" />
        </div>

        <h1 className="text-6xl font-bold mb-4">404</h1>

        <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>

        <p className="text-lg text-muted-foreground mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been
          moved or deleted.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Go to Homepage
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Browse Products
            </Link>
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Looking for something specific? Try using the navigation menu above.
          </p>
        </div>
      </div>
    </div>
  )
}
