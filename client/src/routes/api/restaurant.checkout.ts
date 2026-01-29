import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'
import cryptoConfig from '@/lib/crypto/config'
import signatureService from '@/lib/crypto/signatureService'
import { getAccessTokenFromCookie } from '@/lib/server-cookies'

export const Route = createFileRoute('/api/restaurant/checkout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const data = await request.json()
          const {
            rid,
            table,
            special_instruction,
            orderItems,
            // totalPrice,
            customer_id,
          } = data

          console.log(data, 'data in checkout \n\n\n')

          const accessToken = getAccessTokenFromCookie(request)

          // Validate that we have an access token
          if (!accessToken) {
            return Response.json(
              {
                error: 'Access token is required',
                alive: false,
                time: new Date().toISOString(),
              },
              { status: 401 },
            )
          }

          // Validation
          if (
            !orderItems ||
            !Array.isArray(orderItems) ||
            orderItems.length === 0
          ) {
            return Response.json(
              {
                error: 'Invalid order items: must be a non-empty array',
                alive: false,
                time: new Date().toISOString(),
              },
              { status: 400 },
            )
          }
          if (customer_id && rid) {
            const transformedOrderItems = orderItems.map((item: any) => ({
              rid,
              customer_id, //parseInt(customer_id!),
              item_id: item.id,
              variant_id: item?.variantId || 0,
              quantity: item.quantity.toString(),
              payment_method: 'cash',
              delivery_type: 'dine-in',
              discount_amount: 0,
              special_instructions: special_instruction,
              total_amount: item.price || 0,
              table_no: table || null, // Add table number to each order item,
              addons: item.addons || [],
            }))

            const signature = signatureService.generateOrderSignature(
              transformedOrderItems,
            )

            const ordersResponse = await axiosInstance.post(
              cryptoConfig.getOrdersEndpoint(),
              transformedOrderItems,
              {
                headers: {
                  [cryptoConfig.getSignatureHeader()]: signature,
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json', // Override to send raw JSON
                },
              },
            )

            return Response.json({
              success: true,
              alive: true,
              order_id: ordersResponse.data?.order_id,
              customer_id,
              signature: signature.substring(0, 20) + '...', // Show partial signature for debugging
            })
          } else {
            return Response.json(
              {
                error: 'Customer authentication required',
                alive: false,
                details: {
                  step: 'authentication',
                  message: 'Customer details are required for order processing',
                },
              },
              { status: 400 },
            )
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error'

          return Response.json(
            {
              error: 'Order Failed to submit',
              alive: false,
              details: {
                step: 'api_call',
                message: errorMessage,
              },
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
