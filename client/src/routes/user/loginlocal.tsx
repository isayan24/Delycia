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
import { Loader2, Phone } from 'lucide-react'
import { useAuthContext } from '@/context/AuthProvider'
import useToast from '@/hooks/UseToast'

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

  const { login } = useAuthContext()
  const navigate = useNavigate()
  const { showSuccess } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const validatedData = loginSchema.parse({ mobileNumber })

      setIsLoading(true)

      // Call login with country code 91 (India)
      await login({
        country_code: '+91',
        phone_number: validatedData.mobileNumber,
      }).then((res) => {
        if (res) {
          console.log('Login successful, redirecting...')
          showSuccess('Success', 'Login successful')
          navigate({ to: '/', replace: true })
          window.location.reload()
        }
      })
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || 'Validation error')
      } else {
        setError('Login failed. Please try again.')
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
            Login Secretly
          </CardTitle>
          <CardDescription className="text-center">
            Enter your mobile number to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}

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

          <div className="mt-4 text-center text-sm text-gray-500">
            This page is for development purpose login only.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
