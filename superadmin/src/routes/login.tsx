import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { loginSchema } from '@/schemas/authSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock, Shield, LogIn } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { requireGuest } from '@/middleware/auth'

export const Route = createFileRoute('/login')({
  beforeLoad: requireGuest,
  component: LoginPage,
})

function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  const { login, isAuthenticated, user, isLoading } = useAuth()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate({ to: '/dashboard' })
    }
  }, [isAuthenticated, user, isLoading, navigate])

  const form = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues: {
      identifier: '',
      password: '',
      rememberMe: false,
    },
  })

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.identifier)

      const result = await login({
        ...(isEmail
          ? { email: values.identifier }
          : { username: values.identifier }),
        password: values.password,
        rememberMe: values.rememberMe,
      })

      if (!result) {
        // Generic error message to hide credential details (Requirement 8.4)
        setErrorMessage('Invalid credentials. Please check your email/username and password.')
      } else {
        // Success - redirect to dashboard
        navigate({ to: '/dashboard' })
      }
    } catch (error: any) {
      console.error('Login failed:', error)
      
      // Handle different error types
      if (error.response) {
        const status = error.response.status
        const errorData = error.response.data
        
        // Rate limiting error (429)
        if (status === 429) {
          setErrorMessage(
            errorData?.error || 
            'Too many login attempts. Please try again after 15 minutes.'
          )
        }
        // Authentication errors (401, 403)
        else if (status === 401 || status === 403) {
          // Generic message to hide credential details (Requirement 8.4)
          setErrorMessage('Invalid credentials. Please check your email/username and password.')
        }
        // Server errors (500+)
        else if (status >= 500) {
          setErrorMessage('Server error. Please try again later.')
        }
        // Other client errors (400, etc.)
        else {
          setErrorMessage('Invalid credentials. Please check your email/username and password.')
        }
      } 
      // Network errors (no response from server)
      else if (error.request) {
        setErrorMessage('Network error. Please check your connection and try again.')
      }
      // Other errors
      else {
        setErrorMessage('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-5 bg-linear-to-br from-purple-50 to-blue-50">
      <main className="max-w-md w-full rounded-xl shadow-xl border bg-white/95 p-8 lg:p-10 transition-all duration-300">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Shield className="h-10 w-10 text-purple-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Superadmin Portal
          </h1>
          <p className="text-gray-600 text-sm">
            Secure access to platform management
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Email or Username
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Enter your email or username"
                        className="pl-10 py-3 text-sm rounded-lg focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10 py-3 text-sm rounded-lg focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal cursor-pointer">
                    Remember me for 30 days
                  </FormLabel>
                </FormItem>
              )}
            />

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 py-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Sign In</span>
                </>
              )}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  )
}
