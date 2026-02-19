import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/app/temp-session')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await req.json()
          const response = await axiosInstance.post('/app/temp-session', body)
          return Response.json(response.data)
        } catch (error: any) {
          console.error('Error in temp-session:', error)
          return Response.json(
            { error: 'Failed to create temp session' },
            { status: error.response?.status || 500 },
          )
        }
      },
    },
  },
})
