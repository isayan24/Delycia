import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fileToBase64 } from "@/helpers/fileToBase64";
import UseOptimizeImage from "@/hooks/UseOptimizeImage";
import { Loader2, Save, Upload, User, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useLayoutEffect, useState } from "react";

interface UserProfile {
  image?: string | null;
}
interface UserData {
  profile_pic?: string;
}

export default function ProfileImage({
  userData,
  onProfilePictureUpload,
}: any) {
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    image: userData?.profile_pic || null,
  });

  const handleAvatarChange = (e: any) => {
    const file = e.target.files[0];
    console.log(file);
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarSave = async () => {
    try {
      if (!avatar) {
        console.error("No file selected");
        return;
      }
      setIsLoading(true);
      const base64Avatar = await fileToBase64(avatar);
      const base64Data = base64Avatar.split(",")[1];
      if (base64Data) {
        const res = await onProfilePictureUpload(base64Data, userData.uid);

        if (res?.status === 200) {
          setAvatarPreview("");
          setProfile({
            image: res.message, // Update the profile image with the returned download link
          });
        } else {
          console.log("Failed to upload profile picture:", res?.message);
        }
      }
    } catch (error) {
      console.log("Error converting file to base64", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync state when session changes
  useLayoutEffect(() => {
    if (userData) {
      setProfile({
        image: userData.profile_pic || null,
      });
    }
  }, [userData]);

  return (
    <div>
      <Card className="mb-6 overflow-hidden flex items-center border-none shadow-none">
        <div className="relative bg-gray-100 w-[10rem] h-[10rem] max-[800px]:w-[5rem] max-[800px]:h-[5rem] rounded-full overflow-hidden flex items-center justify-center shrink-0">
          {/* input for dp */}
          <input
            className="hidden"
            type="file"
            id="profilePic"
            name="profilePic"
            onChange={(e) => handleAvatarChange(e)}
            accept="image/*"
          />

          {avatarPreview && (
            <div className="relative w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarPreview}
                alt="avatar preview"
                loading="lazy"
                className="object-cover w-full h-full"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-5 right-5 h-8 w-8 rounded-full bg-background/80"
                onClick={() => setAvatarPreview("")}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove image</span>
              </Button>
            </div>
          )}

          {!avatarPreview && (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-full">
              {profile.image ? (
                <UseOptimizeImage
                  src={profile.image}
                  alt={profile.image}
                  width={100}
                  height={100}
                  className="object-cover w-full h-full"
                  loading="lazy"
                  rounded="rounded-full"
                  blurBgImage="/blurPerson.png"
                />
              ) : (
                <Avatar className="h-[9.5rem] w-[9.5rem]">
                  <AvatarFallback>
                    <User className="h-[4rem] w-[4rem]" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {avatarPreview !== "" ? (
            <Button
              onClick={handleAvatarSave}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isLoading ? "Saving..." : "Save"}
            </Button>
          ) : (
            <label
              htmlFor="profilePic"
              className="w-full flex border p-3 py-2 rounded-lg items-center justify-center gap-2 text-sm dark:hover:bg-[#27272a] duration-150 hover:bg-[#f5f5f9] text-nowrap"
            >
              <Upload className="h-4 w-4" />
              Upload New Photo
            </label>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
