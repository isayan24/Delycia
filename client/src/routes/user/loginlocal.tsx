import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2, Phone, AlertCircle } from 'lucide-react'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
import useToast from '@/hooks/UseToast'
import { Alert, AlertDescription } from '@/components/ui/alert'

const loginSchema = z.object({
  mobileNumber: z
    .string()
    .min(10, 'Mobile number must be 10 digits')
    .max(10, 'Mobile number must be 10 digits')
    .regex(/^\d+$/, 'Mobile number must contain only digits'),
})

export const Route = createFileRoute('/user/loginlocal')({
  component: LocalLogin,
})

function LocalLogin() {
  const [mobileNumber, setMobileNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const { refreshSession } = useAuthQuery()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const validatedData = loginSchema.parse({ mobileNumber })
      setIsLoading(true)

      // Call login with country code 91 (India)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country_code: '+91',
          phone_number: validatedData.mobileNumber,
        }),
      })

      const data = await response.json()

      if (response.ok && data.statusCode === 200) {
        // Login successful - cookies are set by the server
        showSuccess('Success', 'Login successful')
        
        // Refresh the session to fetch complete user data
        await refreshSession()
        
        // Navigate to home
        navigate({ to: '/', replace: true })
      } else {
        // Login failed
        const errorMessage = data.message || 'Login failed. Please try again.'
        setError(errorMessage)
        showError('Login Failed', errorMessage)
      }
    } catch (err) {
      console.error('Login error:', err)
      if (err instanceof z.ZodError) {
        const errorMessage = err.issues[0]?.message || 'Validation error'
        setError(errorMessage)
      } else {
        const errorMessage = 'Login failed. Please check your connection and try again.'
        setError(errorMessage)
        showError('Error', errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Only allow digits
    if (value.length <= 10) {
      setMobileNumber(value)
    }
  }

  return (
    <div className="mt-40 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Local Development Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your mobile number to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {process.env.NODE_ENV === 'production' && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This login method is for development only and should not be used in production.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-500">
                  <Phone className="h-4 w-4 mr-1" />
                  <span className="text-sm">+91</span>
                </div>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  onChange={handleMobileNumberChange}
                  className="pl-16"
                  disabled={isLoading}
                  maxLength={10}
                  autoComplete="tel"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || mobileNumber.length !== 10}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-2">
            <div className="text-center text-sm text-gray-500">
              This page is for development purposes only.
            </div>
            <div className="text-center text-xs text-gray-400">
              Bypasses SMS verification for local testing.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
