"use client";
import { z } from "zod";
import {
  updateNameSchema, 
} from "@/schemas/updateProfileSchema";
import UpdateDetails from "@/components/user/profile/UpdateDetails";
import { toast } from "sonner";
import { useAuthContext } from "@/context/AuthProvider";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation"; 
import useToast from "@/hooks/UseToast";

export default function UserProfileLayout() {
  const { user, getValidAccessToken } = useAuthContext();
  const [isNameSubmit, setIsNameSubmit] = useState(false);
  const [isPasswordSubmit, setIsPasswordSubmit] = useState(false);
  const searchParams = useSearchParams();
  const { showError, showSuccess } = useToast();

  // Check for error parameter to display toast
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'unauthorized_admin_access') {
      toast.error("You don't have permission to access the admin area");
    }
  }, [searchParams]);
 
  // Update Name
  const onNameSubmit = async (values: z.infer<typeof updateNameSchema>) => {
    setIsNameSubmit(true);
    console.log(values, "values");
    try {
      const accessToken = await getValidAccessToken();
      await axios
        .post("/api/user/update", {
          username: values.username,
          name: values.name,
          phone_number: values?.phone_number,
          uid: user?._id,
          accessToken: accessToken,
        })
        .then(() => {
          showSuccess("Updated","User details updated successfully");
          setIsNameSubmit(false);
        })
        .catch((err) => {
          showError("Error",err);
          console.log(err.message);
          setIsNameSubmit(false);
        });
    } catch (error) {
      showError("Error","Unable to update user");
      throw new Error("Unable to update user");
    }
  };
  // Update Profile picture
  const onProfilePictureUpload = async (values: string, uid: string) => {
    try {
      const response = await axios.post("https://files.expressme.in/upload", {
        fileName: "image.png",
        fileData: values,
      });

      if (response.status == 201) {
        const downloadLink = response.data?.downloadLink;

        const accessToken = await getValidAccessToken();
        const updateResponse = await axios.post("/api/user/update", {
          uid: user?._id,
          profile_pic: downloadLink,
          accessToken: accessToken,
        });

        if (updateResponse.status === 200) {
          toast.success("Profile picture uploaded successfully");
          return { status: 200, message: downloadLink };
        } else {
          toast.error("Failed to upload profile picture");
          return { status: updateResponse.status, message: "Failed to upload" };
        }
      } else {
        toast.error("Failed to upload profile picture");
        return { status: response.status, message: "Failed to upload" };
      }
    } catch (error) {
      console.error("Error during upload:", error);
      toast.error("An error occurred while uploading");
      return { status: 500, message: "An error occurred" };
    }
  };

  return (
    <main>
      <UpdateDetails 
        onNameSubmit={async (values) => {
          await onNameSubmit(values);
          return { status: 200 };
        }} 
        onProfilePictureUpload={onProfilePictureUpload}
        isNameSubmit={isNameSubmit} 
      /> 
    </main>
  );
}
