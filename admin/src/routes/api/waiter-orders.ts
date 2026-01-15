import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import signatureService from '@/lib/crypto/signatureService'
import cryptoConfig from '@/lib/crypto/config'
import logger from '@/lib/logger'
import {
  WaiterOrderRequest,
  OrderItem,
  FullOrderItem,
} from '@/lib/crypto/crypto.types'

export const Route = createFileRoute('/api/waiter-orders')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const data: WaiterOrderRequest = await request.json()
          const {
            customerDetails,
            specialInstructions,
            orderItems,
            token,
            table,
          } = data

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
            const transformedOrderItems: OrderItem[] = orderItems.map(
              (item: FullOrderItem) => ({
                rid: item.rid,
                customer_id: customer_id,
                item_id: item.id,
                variant_id: item?.variantId || 0,
                quantity: item.quantity.toString(),
                payment_method: 'cash',
                delivery_type: 'dine-in',
                discount_amount: 0,
                special_instructions: specialInstructions,
                total_amount: item.totalPrice,
                table_no: table?.table_number || 0,
              }),
            )

            // Generate signature for the transformed order items
            const signature = signatureService.generateOrderSignature(
              transformedOrderItems,
            )

            // Make signed API call to orders endpoint with raw JSON
            const ordersResponse = await axiosInstance.post(
              cryptoConfig.getOrdersEndpoint(),
              transformedOrderItems,
              {
                headers: {
                  [cryptoConfig.getSignatureHeader()]: signature,
                  Authorization: `Bearer ${token}`,
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
                await axiosInstance.patch(`/admin/tables/`, tableData, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                })
              } catch (error) {
                console.error('Error updating table:', error)
              }
            }

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
                details: {
                  step: 'authentication',
                  message: 'Customer details are required for order processing',
                },
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
