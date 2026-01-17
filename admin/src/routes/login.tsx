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
import { signInSchema } from '@/schemas/signInSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock, Shield, LogIn } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import useToast from '@/hooks/UseToast'
import { useAuth } from '@/hooks/useAuth'
import { DEFAULT_ROUTES } from '@/components/user-roles/roleBasedAccess'
import { requireGuest } from '@/middleware/auth'

export const Route = createFileRoute('/login')({
  beforeLoad: requireGuest,
  component: LoginPage,
})

function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showError, showSuccess } = useToast()
  const navigate = useNavigate()

  const { login, isAuthenticated, user, isLoading } = useAuth()

  // Redirect authenticated users to their default route
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const redirect = DEFAULT_ROUTES[user?.role as number] || '/'
      navigate({ to: redirect })
    }
  }, [isAuthenticated, user, isLoading, navigate])

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true)
    try {
      const result = await login({
        phone_number: values.identifier,
        password: values.password,
      })

      if (!result) {
        showError('Error', 'Login failed: ID or password incorrect')
      }

      if (result) {
        showSuccess('Success', 'Login successful! Redirecting...')
        const redirect = DEFAULT_ROUTES[user?.role as number] || '/'

        if (redirect) {
          navigate({ to: redirect })
        } else if (isAuthenticated && result) {
          showError('Error', 'Login failed: Invalid credentials')
        }
      }
    } catch (error) {
      console.error('Login failed:', error)
      showError('Error', 'Login failed: An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-5">
      <main className="max-w-md md:max-w-lg w-full rounded-xl shadow-xl border bg-white/95 p-6 md:p-8 lg:p-10 transition-all duration-300">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Shield className="h-10 w-10 text-purple-600" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Securely access the restaurant management system
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 md:space-y-6"
          >
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm md:text-base font-medium">
                    Admin ID
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Enter your admin ID"
                        className="pl-10 py-2 md:py-3 text-sm md:text-base rounded-lg focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs md:text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm md:text-base font-medium">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10 py-2 md:py-3 text-sm md:text-base rounded-lg focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs md:text-sm" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 py-2 md:py-3 rounded-lg text-sm md:text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Admin Sign In</span>
                </>
              )}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  )
}
