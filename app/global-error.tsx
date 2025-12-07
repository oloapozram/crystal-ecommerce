'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
            </div>

            <h1 className="text-3xl font-bold mb-4">Critical Error</h1>

            <p className="text-gray-600 mb-6">
              A critical error has occurred. Please refresh the page to continue.
            </p>

            {error.message && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 font-mono">
                  {error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Go to homepage
              </button>
            </div>

            {error.digest && (
              <p className="mt-6 text-xs text-gray-500">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
