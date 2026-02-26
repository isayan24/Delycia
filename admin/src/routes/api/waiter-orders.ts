import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import signatureService from '@/lib/crypto/signatureService'
import cryptoConfig from '@/lib/crypto/config'
import logger from '@/lib/logger'
import { withAuth, jsonResponse } from '@/lib/withAuth'
import jwt from 'jsonwebtoken'
import {
  WaiterOrderRequest,
  OrderItem,
  FullOrderItem,
} from '@/lib/crypto/crypto.types'
import { calculateTax } from '@/lib/tax/taxCalculator'

export const Route = createFileRoute('/api/waiter-orders')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return withAuth(request, async (accessToken, authHeaders, req) => {
          try {
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

            const data: WaiterOrderRequest = await req.json()
            const {
              customerDetails,
              specialInstructions,
              orderItems,
              table,
              partySize,
              order_status,
            } = data

            let customer_id: string | undefined

            // Validate order items
            if (
              !orderItems ||
              !Array.isArray(orderItems) ||
              orderItems.length === 0
            ) {
              return jsonResponse(
                {
                  error: 'Invalid order items: must be a non-empty array',
                  alive: false,
                  time: new Date().toISOString(),
                },
                400,
              )
            }

            // Step 1: Authenticate customer first (required step)
            if (customerDetails) {
              try {
                const authResponse = await axiosInstance.post(
                  '/admin/auth/waiter-auth',
                  customerDetails,
                )
                customer_id = authResponse.data.id
              } catch (error) {
                logger.error('Customer authentication failed', {
                  error:
                    error instanceof Error ? error.message : 'Unknown error',
                })
                return jsonResponse(
                  {
                    error: 'Customer authentication failed',
                    alive: false,
                    details: {
                      step: 'authentication',
                      message:
                        error instanceof Error
                          ? error.message
                          : 'Unknown error',
                    },
                  },
                  401,
                  authHeaders,
                )
              }
            }

            if (customer_id) {
              // Calculate subtotal from order items
              const subtotal = orderItems.reduce(
                (sum: number, item: FullOrderItem) => {
                  return sum + (item.totalPrice || 0)
                },
                0,
              )

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
                  taxPercent =
                    restaurantResponse.data?.restaurant_info?.tax_percent || 0
                } catch (error) {
                  logger.error('Failed to fetch restaurant tax rate', {
                    error:
                      error instanceof Error ? error.message : 'Unknown error',
                    restaurantId: rid,
                  })
                  // Continue with tax_percent = 0 if fetch fails
                }
              }

              // Calculate tax
              const { taxAmount } = calculateTax(subtotal, taxPercent)

              const transformedOrderItems: OrderItem[] = orderItems.map(
                (item: FullOrderItem) => ({
                  rid: item.rid,
                  customer_id: customer_id,
                  item_id: item.id,
                  variant_id: item?.variantId || 0,
                  quantity: item.quantity.toString(),
                  payment_method: 'cash',
                  delivery_type: 'dine-in',
                  discount_amount: item.discount_amount || 0,
                  special_instructions: specialInstructions,
                  total_amount: item.totalPrice,
                  table_id: table?.id || 0,
                  party_size: partySize || 1,
                  placed_by_staff_id: staffId,
                  placed_by_role_id: staffRole,
                  addons: item.addons,
                  order_status: order_status || 'processing',
                  tax_percent: taxPercent,
                  tax_amount: taxAmount,
                }),
              )

              // Generate signature for the transformed order items
              const signature = signatureService.generateOrderSignature(
                transformedOrderItems,
              )

              // Make signed API call to orders endpoint
              const ordersResponse = await axiosInstance.post(
                cryptoConfig.getOrdersEndpoint(),
                transformedOrderItems,
                {
                  headers: {
                    [cryptoConfig.getSignatureHeader()]: signature,
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                },
              )

              // update table after order is placed
              if (table && ordersResponse.status === 201) {
                const tableData = {
                  id: table.id,
                  zone: table.zone,
                  status: 'occupied',
                  capacity: table.capacity,
                }
                try {
                  await axiosInstance.patch(`/api/v1/admin/tables`, tableData, {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                  })
                } catch (error) {
                  console.error('Error updating table:', error)
                }
              }

              return jsonResponse(
                {
                  success: true,
                  alive: true,
                  order_id: ordersResponse.data?.order_id,
                  customer_id,
                  signature: signature.substring(0, 20) + '...',
                },
                200,
                authHeaders,
              )
            } else {
              return jsonResponse(
                {
                  error: 'Customer authentication required',
                  alive: false,
                  details: {
                    step: 'authentication',
                    message:
                      'Customer details are required for order processing',
                  },
                },
                400,
              )
            }
          } catch (error: any) {
            // If it's an auth error (401/403), throw it so withAuth can handle token refresh
            if (
              error.response?.status === 401 ||
              error.response?.status === 403
            ) {
              throw error // Let withAuth handle auth errors
            }

            // For other errors, return a generic error response
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error'

            return jsonResponse(
              {
                error: 'Pushing order to db failed',
                alive: false,
                details: {
                  step: 'api_call',
                  message: errorMessage,
                },
              },
              500,
              authHeaders,
            )
          }
        })
      },
    },
  },
})
