import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { updateNameSchema } from '@/schemas/updateProfileSchema'
import UpdateDetails from '@/components/user/profile/UpdateDetails'
import { toast } from 'sonner'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
import { useState, useEffect } from 'react'
import useToast from '@/hooks/UseToast'
import { useUpdateUserMutation } from '@/hooks/mutations/useUserMutations'

const searchSchema = z.object({
  error: z.string().optional(),
})

export const Route = createFileRoute('/user/p')({
  validateSearch: (search) => searchSchema.parse(search),
  component: UserProfileLayout,
})

function UserProfileLayout() {
  const { user } = useAuthQuery()
  const [isNameSubmit, setIsNameSubmit] = useState(false)
  const searchParams = Route.useSearch()
  const { showError, showSuccess } = useToast()

  // Check for error parameter to display toast
  useEffect(() => {
    if (searchParams.error === 'unauthorized_admin_access') {
      toast.error("You don't have permission to access the admin area")
    }
  }, [searchParams])

  const updateUserMutation = useUpdateUserMutation()

  // Update Name
  const onNameSubmit = async (values: z.infer<typeof updateNameSchema>) => {
    setIsNameSubmit(true)
    try {
      const uid = user?._id
      if (!uid) throw new Error('User not found')

      await updateUserMutation.mutateAsync({
        username: values.username,
        name: values.name,
        phone_number: values?.phone_number,
        uid: uid,
      })

      showSuccess('Updated', 'User details updated successfully')
      setIsNameSubmit(false)
    } catch (error: any) {
      showError('Error', error.message || 'Unable to update user')
      console.log(error.message)
      setIsNameSubmit(false)
    }
  }

  // Update Profile picture
  const onProfilePictureUpload = async (imageUrl: string, uid: string) => {
    try {
      // Update user profile with the new ImageKit URL
      if (!uid) {
        showError('Error', 'User ID not found')
        return { status: 400, message: 'User ID not found' }
      }

      await updateUserMutation.mutateAsync({
        uid: uid,
        profile_pic: imageUrl,
      })

      showSuccess('Updated', 'Profile picture updated successfully')
      return { status: 200, message: imageUrl }
    } catch (error) {
      console.error('Error updating profile picture:', error)
      showError('Error', 'Failed to update profile picture')
      return { status: 500, message: 'An error occurred' }
    }
  }

  return (
    <main>
      <UpdateDetails
        onNameSubmit={async (values) => {
          await onNameSubmit(values)
          return { status: 200 }
        }}
        onProfilePictureUpload={onProfilePictureUpload}
        isNameSubmit={isNameSubmit}
      />
    </main>
  )
}
