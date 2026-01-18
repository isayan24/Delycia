import { createFileRoute } from '@tanstack/react-router'
import jwt from 'jsonwebtoken'
import axios from 'axios'

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8020/api/v1'

// Helper function to parse cookies
function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}
  return cookieHeader.split(';').reduce(
    (cookies, cookie) => {
      const [name, value] = cookie.trim().split('=')
      cookies[name] = value
      return cookies
    },
    {} as Record<string, string>,
  )
}

export const Route = createFileRoute('/api/auth/session')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          // Get access token from httpOnly cookie
          const cookieHeader = request.headers.get('cookie')
          const cookies = parseCookies(cookieHeader)
          const accessToken = cookies['access_token']

          if (!accessToken) {
            return new Response(
              JSON.stringify({
                statusCode: 401,
                message: 'No session found',
                isAuthenticated: false,
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Validate JWT structure (decode without verification for now)
          let decoded: any
          try {
            decoded = jwt.decode(accessToken)
            if (!decoded || !decoded.exp) {
              throw new Error('Invalid token structure')
            }

            // Check if token is expired
            const currentTime = Math.floor(Date.now() / 1000)
            if (decoded.exp < currentTime) {
              return new Response(
                JSON.stringify({
                  statusCode: 401,
                  message: 'Session expired',
                  isAuthenticated: false,
                }),
                {
                  status: 401,
                  headers: { 'Content-Type': 'application/json' },
                },
              )
            }
          } catch (error) {
            return new Response(
              JSON.stringify({
                statusCode: 401,
                message: 'Invalid session',
                isAuthenticated: false,
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Fetch user data from backend using the access token
          try {
            const userResponse = await axios.get(
              `${SERVER_URL}/admin/users?id=${decoded.id}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Accept: 'application/json',
                },
              },
            )

            // Check if response is successful and has user data
            if (
              userResponse.data?.statusCode === 200 &&
              userResponse.data?.message?.users &&
              userResponse.data.message.users.length > 0
            ) {
              const userData = userResponse.data.message.users[0]

              // Return backend user data with all available fields
              // Including restaurant_rids from backend (if available)
              // Client-side will merge with localStorage for selected_rid
              return new Response(
                JSON.stringify({
                  statusCode: 200,
                  message: 'Session valid',
                  isAuthenticated: true,
                  data: {
                    user: {
                      _id: userData.uid,
                      id: userData.id,
                      username: userData.username,
                      name: userData.name,
                      email: userData.email,
                      phone_number: userData.phone_number,
                      profile_pic: userData.profile_pic,
                      role: userData.role,
                      // Include restaurant_rids from backend if available
                      restaurant_rids: userData.restaurant_rids || [],
                      // Note: selected_rid will be merged from localStorage in useAuth
                    },
                  },
                }),
                {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                },
              )
            }
          } catch (userError: any) {
            // If user fetch fails, return basic decoded data
            return new Response(
              JSON.stringify({
                statusCode: 200,
                message: 'Session valid (limited data)',
                isAuthenticated: true,
                data: {
                  user: {
                    _id: decoded.uid,
                    id: decoded.id,
                    phone_number: null,
                    role: null,
                    restaurant_rids: [],
                    selected_rid: null,
                  },
                },
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Fallback response
          return new Response(
            JSON.stringify({
              statusCode: 401,
              message: 'Invalid session',
              isAuthenticated: false,
            }),
            { status: 401, headers: { 'Content-Type': 'application/json' } },
          )
        } catch (error: any) {
          console.error('Session validation error:', error)
          return new Response(
            JSON.stringify({
              statusCode: 500,
              message: 'Session validation failed',
              isAuthenticated: false,
              error: error.message,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
