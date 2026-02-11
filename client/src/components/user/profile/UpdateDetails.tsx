'use client'
import  { useEffect, useState } from 'react'
import { z } from 'zod'
import { updateNameSchema } from '@/schemas/updateProfileSchema'
import ProfileImage from './ProfileImage'
import UpdateName from './UpdateName'
import { useAuthQuery } from '@/hooks/queries/useAuthQuery'
import { getUser } from '@/helpers/getUser'
import Signout from '@/components/smallComponents/Signout'

interface UpdateDetailsProps {
  onNameSubmit: (value: z.infer<typeof updateNameSchema>) => void
  isNameSubmit: any
  onProfilePictureUpload: any
}

export default function UpdateDetails({
  onNameSubmit,
  onProfilePictureUpload,
  isNameSubmit,
}: UpdateDetailsProps) {
  const { user } = useAuthQuery()
  const [userData, setUserData] = useState<any | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUser()
        if (data?.user) {
          setUserData(data.user)
        }
      } catch (err) {
        console.error(err)
      }
    }

    if (user) {
      fetchUserData()
    }
  }, [user])

  return (
    <main>
      <div className="flex flex-col p-5 max-w-[50rem] mx-auto max-[500px]:p-3">
        <div className="my-5"></div>
        <div className="flex-1">
          <div className="">
            {/* Account Management */}
            <div className="lg:col-span-1">
              {/* Profile img */}
              <ProfileImage
                userData={userData}
                onProfilePictureUpload={onProfilePictureUpload}
              />
            </div>

            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <UpdateName
                  onNameSubmit={onNameSubmit}
                  userData={userData}
                  isNameSubmit={isNameSubmit}
                />
              </div>
            </div>
            <Signout />
          </div>
        </div>
      </div>
    </main>
  )
}
