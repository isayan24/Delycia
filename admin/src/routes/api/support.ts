import { createFileRoute } from '@tanstack/react-router'
import { withAuth, jsonResponse } from '@/lib/withAuth'
import { resend } from '@/lib/resend'

/**
 * Build the HTML email body for a feature request.
 */
function buildFeatureRequestHtml(
  subject: string,
  description: string,
  userName: string,
  userEmail: string,
): string {
  return [
    '<div style="font-family: Segoe UI, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">',
    '<div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); padding: 24px; border-radius: 12px 12px 0 0;">',
    '<h1 style="color: white; margin: 0; font-size: 20px;">🚀 New Feature Request</h1>',
    '</div>',
    '<div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">',
    '<table style="width: 100%; border-collapse: collapse;">',
    '<tr>',
    '<td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 120px;">From:</td>',
    `<td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${userName}${userEmail ? ` (${userEmail})` : ''}</td>`,
    '</tr>',
    '<tr>',
    '<td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Subject:</td>',
    `<td style="padding: 8px 0; font-size: 14px; font-weight: 500;">${subject}</td>`,
    '</tr>',
    '</table>',
    '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />',
    '<h3 style="color: #374151; font-size: 15px; margin: 0 0 8px;">Description</h3>',
    `<div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #374151;">${description}</div>`,
    '<p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0; text-align: center;">Sent from Delycia Admin Panel</p>',
    '</div>',
    '</div>',
  ].join('')
}

/**
 * BFF API route for Support page actions.
 * POST: Send a feature request email via Resend.
 */
export const Route = createFileRoute('/api/support')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        return withAuth(request, async (_accessToken, authHeaders) => {
          try {
            const body = await request.json()
            const { subject, description, userName, userEmail } = body

            // Validate required fields
            if (!subject?.trim() || !description?.trim()) {
              return jsonResponse(
                {
                  statusCode: 400,
                  message: 'Subject and description are required.',
                  error: true,
                },
                400,
                authHeaders,
              )
            }

            const html = buildFeatureRequestHtml(
              subject.trim(),
              description.trim(),
              userName || 'Unknown User',
              userEmail || '',
            )

            // Send feature request email via Resend
            const { error } = await resend.emails.send({
              from: 'Delycia Support <onboarding@resend.dev>',
              to: ['delycia.app@gmail.com'],
              subject: `[Feature Request] ${subject.trim()}`,
              html,
            })

            if (error) {
              console.error('[Support API] Resend error:', error)
              return jsonResponse(
                {
                  statusCode: 500,
                  message:
                    'Failed to send feature request. Please try again later.',
                  error: true,
                },
                500,
                authHeaders,
              )
            }

            return jsonResponse(
              {
                statusCode: 200,
                message: 'Feature request sent successfully!',
              },
              200,
              authHeaders,
            )
          } catch (error: any) {
            console.error('[Support API] Error:', error)
            return jsonResponse(
              {
                statusCode: 500,
                message: 'An unexpected error occurred. Please try again.',
                error: true,
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
