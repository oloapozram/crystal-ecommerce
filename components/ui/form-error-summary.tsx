import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface FormErrorSummaryProps {
  errors: Record<string, any>
  title?: string
}

export function FormErrorSummary({ errors, title = 'Please correct the following errors' }: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors).filter(([_, value]) => value?.message)

  if (errorEntries.length === 0) return null

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside space-y-1 mt-2">
          {errorEntries.map(([field, error]: [string, any]) => (
            <li key={field} className="text-sm">
              <span className="font-medium capitalize">
                {field.replace(/([A-Z])/g, ' $1').trim()}:
              </span>{' '}
              {error.message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  )
}
