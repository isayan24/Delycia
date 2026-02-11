import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { updateNameSchema } from '@/schemas/updateProfileSchema'
import UpdateDetails from '@/components/user/profile/UpdateDetails'
import { toast } from 'sonner'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
import { useState, useEffect } from 'react'
import useToast from '@/hooks/UseToast'
import { useUpdateUserMutation } from '@/hooks/mutations/useUserMutations'
import { useFileUploadMutation } from '@/hooks/mutations/useFileUploadMutation'

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
  const fileUploadMutation = useFileUploadMutation()

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
  const onProfilePictureUpload = async (values: string) => {
    try {
      // 1. Upload file
      const uploadResponse = await fileUploadMutation.mutateAsync({
        fileName: 'image.png',
        fileData: values,
      })

      const downloadLink = uploadResponse?.downloadLink

      if (!downloadLink) {
        toast.error('Failed to upload profile picture')
        return { status: 500, message: 'Failed to upload' }
      }

      if (user?._id) {
       await updateUserMutation.mutateAsync({
        uid: user._id,
        profile_pic: downloadLink,
      })
      } 

      toast.success('Profile picture uploaded successfully')
      return { status: 200, message: downloadLink }
    } catch (error) {
      console.error('Error during upload:', error)
      toast.error('An error occurred while uploading')
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
