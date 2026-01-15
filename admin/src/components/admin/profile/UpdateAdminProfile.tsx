import React, { useEffect, useState } from "react";
import { z } from "zod";
import {
  updateNameSchema,
  updatePasswordSchema,
} from "@/schemas/updateProfileSchema";
import { getUser } from "@/helpers/user/getUser";
import Signout from "@/components/smallComponents/Signout";
import ProfileImage from "./ProfileImage";
import UpdateName from "./UpdateName";
import UpdatePassword from "./UpdatePassword";
import { useAuth } from "@/hooks/useAuth";

interface UpdateDetailsProps {
  onPasswordSubmit: (
    values: z.infer<typeof updatePasswordSchema>
  ) => Promise<{ status: number }>;
  onNameSubmit: (value: z.infer<typeof updateNameSchema>) => void;
  isNameSubmit: any;
  isPasswordSubmit: any;
  onProfilePictureUpload: any;
}

export default function UpdateAdminProfile({
  onPasswordSubmit,
  onNameSubmit,
  onProfilePictureUpload,
  isNameSubmit,
  isPasswordSubmit,
}: UpdateDetailsProps) {
  const [userData, setUserData] = useState(null);
  const { accessToken } = useAuth();

  useEffect(() => {
    if (accessToken) {
      getUser(accessToken)
        .then((data) => {
          setUserData(data.user);
        })
        .catch((err) => console.error(err));
    }
  }, [accessToken]);

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
                {/* <UpdatePassword
                  onPasswordSubmit={async (values) => {
                    await onPasswordSubmit(values);
                    return { status: 200 }; // Ensure a Promise<{ status: number }> is returned
                  }}
                  isPasswordSubmit={isPasswordSubmit}
                /> */}
                {/*  */}
              </div>
            </div>
            <Signout />
          </div>
        </div>
      </div>
    </main>
  );
}
