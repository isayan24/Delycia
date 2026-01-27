import { createFileRoute } from '@tanstack/react-router'
import axiosInstance from '@/lib/axios'

export const Route = createFileRoute('/api/reverification-code')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          const { id, userInfo } = body

          if (!id) {
            return Response.json(
              {
                success: false,
                message: 'id is required',
              },
              { status: 400 },
            )
          }

          const verifyCode = await axiosInstance
            .post('/users/verify', { uid: id })
            .then((res) => {
              return res.data.verification.code
            })
            .catch((err) => {
              console.log('error in verification', err)
            })

          //  await sendVerificationEmail(userInfo.email, userInfo.name, verifyCode);

          return Response.json(
            {
              success: true,
              message: 'Verification code send successfully',
            },
            { status: 200 },
          )
        } catch (error) {
          console.log(error)
          return Response.json(
            {
              success: false,
              message: Error,
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
