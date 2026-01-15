import { z } from 'zod'
import {
  updateNameSchema,
  updatePasswordSchema,
} from '@/schemas/updateProfileSchema'
import { toast } from 'sonner'
import { useState } from 'react'
import axios from 'axios'
import UpdateAdminProfile from './UpdateAdminProfile'
import { useAuth } from '@/hooks/useAuth'
import useToast from '@/hooks/UseToast'

export default function AdminProfile() {
  const [isNameSubmit, setIsNameSubmit] = useState(false)
  const [isPasswordSubmit, setIsPasswordSubmit] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { showError, showSuccess } = useToast()

  if (!isAuthenticated) {
    return null
  }

  // Update password
  const onPasswordSubmit = async (
    values: z.infer<typeof updatePasswordSchema>,
  ) => {
    setIsPasswordSubmit(true)
    try {
      await axios.post('/api/admin/update', {
        uid: user?._id,
        password: values.newPassword,
        username: user?.username,
      })
      toast.success('Password updated successfully')
      setIsPasswordSubmit(false)
      return { status: 200 }
    } catch (error) {
      setIsPasswordSubmit(false)
      toast.error('Unable to update password')
      return { status: 500 }
    }
  }
  // Update Name
  const onNameSubmit = async (values: z.infer<typeof updateNameSchema>) => {
    setIsNameSubmit(true)
    try {
      await axios
        .post('/api/admin/update', {
          username: values.username,
          name: values.name,
          phone_number: values?.phone_number,
          uid: user?._id,
        })
        .then(() => {
          showSuccess('Success', 'User details updated successfully')
          setIsNameSubmit(false)
        })
        .catch((err) => {
          showError('Error', err)
          console.log(err.message)
          setIsNameSubmit(false)
        })
    } catch (error) {
      showError('Error', 'Unable to update user')
    }
  }
  // fix Update Profile picture
  const onProfilePictureUpload = async (values: string, uid: string) => {
    try {
      // Upload to ImageKit via secure backend API route (send JSON with base64)
      const uploadResponse = await axios.post('/api/imagekit', {
        base64Image: values,
        fileName: `profile_${Date.now()}.jpg`,
        folder: '/profile',
      })

      if (uploadResponse.status == 200) {
        const downloadLink = uploadResponse.data?.url
        const updateResponse = await axios.post('/api/admin/update', {
          uid: user?._id,
          profile_pic: downloadLink,
        })

        if (updateResponse.status === 200) {
          showSuccess('Success', 'Profile picture uploaded successfully')
          return { status: 200, message: downloadLink }
        } else {
          showError('Error', 'Failed to upload profile picture')
          return { status: updateResponse.status, message: 'Failed to upload' }
        }
      } else {
        showError('Error', 'Failed to upload profile picture')
      }
    } catch (error) {
      console.error('Error during upload:', error)
      showError('Error', 'An error occurred while uploading')
    }
  }

  return (
    <div>
      <UpdateAdminProfile
        onPasswordSubmit={onPasswordSubmit}
        onNameSubmit={onNameSubmit}
        onProfilePictureUpload={onProfilePictureUpload}
        isNameSubmit={isNameSubmit}
        isPasswordSubmit={isPasswordSubmit}
      />
    </div>
  )
}
