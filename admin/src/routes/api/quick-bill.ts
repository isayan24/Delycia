import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import cryptoConfig from '@/lib/crypto/config'
import signatureService from '@/lib/crypto/signatureService'
import logger from '@/lib/logger-dynamic'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'
import jwt from 'jsonwebtoken'
import { calculateTax } from '@/lib/tax/taxCalculator'

export const Route = createFileRoute('/api/quick-bill')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Get token from httpOnly cookie
          const accessToken = getAccessTokenFromCookie(request)

          if (!accessToken) {
            return new Response(
              JSON.stringify({
                status: 401,
                message: 'Not authenticated',
                error: true,
              }),
              { status: 401, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Decode JWT to extract staff information
          let staffId: number | null = null
          let staffRole: number | null = null
          try {
            const decoded: any = jwt.decode(accessToken)
            if (decoded) {
              staffId = decoded.id || null
              staffRole = decoded.role || null
            }
          } catch (error) {
            logger.error('Failed to decode JWT token', {
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }

          const data = await request.json()
          const { customerDetails, orderItems } = data // Removed token from destructuring

          let customer_id: string | undefined

          // Validate order items
          if (
            !orderItems ||
            !Array.isArray(orderItems) ||
            orderItems.length === 0
          ) {
            return new Response(
              JSON.stringify({
                error: 'Invalid order items: must be a non-empty array',
                alive: false,
                time: new Date().toISOString(),
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }

          // Authenticate/Create customer
          if (customerDetails) {
            try {
              const authResponse = await axiosInstance.post(
                '/admin/auth/waiter-auth',
                customerDetails,
              )
              customer_id = authResponse.data.id || authResponse.data.data?.id
            } catch (error) {
              logger.error('Customer authentication failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
              })
              return new Response(
                JSON.stringify({
                  error: 'Customer authentication failed',
                  alive: false,
                  details: {
                    step: 'authentication',
                    message:
                      error instanceof Error ? error.message : 'Unknown error',
                  },
                }),
                {
                  status: 401,
                  headers: { 'Content-Type': 'application/json' },
                },
              )
            }
          }

          if (customer_id) {
            // Calculate subtotal from order items
            const subtotal = orderItems.reduce((sum: number, item: any) => {
              return sum + (item.totalItemAmount || 0)
            }, 0)

            // Fetch restaurant tax rate
            let taxPercent = 0
            const rid = orderItems[0]?.rid
            
            if (rid) {
              try {
                const restaurantResponse = await axiosInstance.get(
                  `/admin/restaurants?rid=${rid}`,
                  {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  },
                )
                taxPercent = restaurantResponse.data?.restaurant_info?.tax_percent || 0
              } catch (error) {
                logger.error('Failed to fetch restaurant tax rate', {
                  error: error instanceof Error ? error.message : 'Unknown error',
                  restaurantId: rid,
                })
                // Continue with tax_percent = 0 if fetch fails
              }
            }

            // Calculate tax
            const { taxAmount } = calculateTax(subtotal, taxPercent)

            const transformedOrderItems = orderItems.map((item: any) => ({
              rid: item.rid,
              customer_id: customer_id,
              item_id: item.id,
              order_status: item.order_status || 'completed',
              variant_id: item?.variantId || 0,
              quantity: item.quantity.toString(),
              payment_method: item.payment_method || 'cash',
              special_instructions: item.special_instructions || '',
              delivery_type: item.delivery_type || 'takeaway',
              discount_amount: item.discount_amount || 0,
              total_amount: item.totalItemAmount,
              table_id: null, // Quick bill orders don't have tables (takeaway/delivery)
              placed_by_staff_id: staffId,
              placed_by_role_id: staffRole,
              addons: item.addons,
              tax_percent: taxPercent,
              tax_amount: taxAmount,
            }))

            // Generate signature for the transformed order items
            const signature = signatureService.generateOrderSignature(
              transformedOrderItems,
            )

            // Make signed API call to orders endpoint using token from cookie
            const ordersResponse = await axiosInstance.post(
              cryptoConfig.getOrdersEndpoint(),
              transformedOrderItems,
              {
                headers: {
                  [cryptoConfig.getSignatureHeader()]: signature,
                  Authorization: `Bearer ${accessToken}`, // Use token from cookie
                  'Content-Type': 'application/json',
                },
              },
            )

            return new Response(
              JSON.stringify({
                success: true,
                alive: true,
                order_id: ordersResponse.data?.order_id,
                customer_id,
                signature: signature.substring(0, 20) + '...',
              }),
              { status: 200, headers: { 'Content-Type': 'application/json' } },
            )
          } else {
            return new Response(
              JSON.stringify({
                error: 'Customer authentication required',
                alive: false,
              }),
              { status: 400, headers: { 'Content-Type': 'application/json' } },
            )
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'

          return new Response(
            JSON.stringify({
              error: 'Pushing order to db failed',
              alive: false,
              details: {
                step: 'api_call',
                message: errorMessage,
              },
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
