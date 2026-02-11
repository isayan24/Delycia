/**
 * Verify Magic Link API Route
 *
 * BFF endpoint that verifies the magic link token and completes authentication.
 */

import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/auth/verify-magic')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url)
          const token = url.searchParams.get('token')

          if (!token) {
            return new Response(
              JSON.stringify({
                statusCode: 400,
                message: 'Login token is required',
                success: false,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Call backend to verify magic link token
          const response = await axiosInstance.get(
            `/users/auth/magic?token=${token}`,
            {
              headers: {
                Accept: 'application/json',
              },
            },
          )

          const backendData = response.data

          if (backendData.statusCode === 200 && backendData.data) {
            const isProduction = process.env.NODE_ENV === 'production'
            const cookieOptions = {
              httpOnly: true,
              secure: isProduction,
              sameSite: 'strict' as const,
              path: '/',
            }

            const headers = new Headers({
              'Content-Type': 'application/json',
            })

            // Set auth cookies
            if (backendData.data.access_token) {
              headers.append(
                'Set-Cookie',
                `access_token=${backendData.data.access_token}; Max-Age=${7 * 24 * 60 * 60}; ${cookieOptions.httpOnly ? 'HttpOnly;' : ''} ${cookieOptions.secure ? 'Secure;' : ''} SameSite=${cookieOptions.sameSite}; Path=${cookieOptions.path}`,
              )
            }

            if (backendData.data.refresh_token) {
              headers.append(
                'Set-Cookie',
                `refresh_token=${backendData.data.refresh_token}; Max-Age=${30 * 24 * 60 * 60}; ${cookieOptions.httpOnly ? 'HttpOnly;' : ''} ${cookieOptions.secure ? 'Secure;' : ''} SameSite=${cookieOptions.sameSite}; Path=${cookieOptions.path}`,
              )
            }

            return new Response(
              JSON.stringify({
                statusCode: 200,
                message: 'Login successful',
                success: true,
                data: {
                  id: backendData.data.id,
                  uid: backendData.data.uid,
                  country_code: backendData.data.country_code,
                  phone_number: backendData.data.phone_number,
                  name: backendData.data.name,
                  access_token: backendData.data.access_token,
                  refresh_token: backendData.data.refresh_token,
                  isNewUser: backendData.data.isNewUser,
                  requiresName: backendData.data.requiresName,
                },
              }),
              { status: 200, headers },
            )
          }

          return new Response(
            JSON.stringify({
              statusCode: backendData.statusCode || 400,
              message: backendData.message || 'Login failed',
              success: false,
            }),
            {
              status: backendData.statusCode || 400,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        } catch (error: any) {
          console.error('Verify magic link error:', error)

          const status = error.response?.status || 500
          const message =
            error.response?.data?.message ||
            'Login failed. Please request a new link.'

          return new Response(
            JSON.stringify({
              statusCode: status,
              message,
              success: false,
            }),
            { status, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
