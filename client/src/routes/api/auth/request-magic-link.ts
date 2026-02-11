/**
 * Request Magic Link API Route
 *
 * BFF endpoint that proxies to backend to request a magic login link
 * sent via WhatsApp.
 */

import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/auth/request-magic-link')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { phone_number, country_code } = await request.json()

          if (!phone_number) {
            return new Response(
              JSON.stringify({
                statusCode: 400,
                message: 'Phone number is required',
                success: false,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }
          // Call backend to request magic link
          const response = await axiosInstance.post(
            '/users/auth/request-login-link',
            {
              phone_number,
              country_code: country_code || '+91',
            },
            {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
            },
          )

          const backendData = response.data

          return new Response(
            JSON.stringify({
              statusCode: backendData.statusCode || 200,
              message: backendData.message || 'Login link sent!',
              success: backendData.statusCode === 200,
              data: backendData.data,
            }),
            {
              status: backendData.statusCode || 200,
              headers: { 'Content-Type': 'application/json' },
            },
          )
        } catch (error: any) {
          console.error('Request magic link error:', error)

          const status = error.response?.status || 500
          const message =
            error.response?.data?.message ||
            'Failed to send login link. Please try again.'

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
