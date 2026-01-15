// import { sendPasswordChangedEmail } from "@/helpers/sendPasswordChangeEmail";
import axiosInstance from "@/lib/axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      uid,
      username,
      name,
      accessToken,
      profile_pic,
      // phone_number,
    } = body;

    if (username || name) {
      await axiosInstance.patch(
        `/users`,
        {
          uid,
          username,
          name,
          // phone_number,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    }

    if (profile_pic) {
      await axiosInstance.patch(
        `/users`,
        { uid, profile_pic },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    }
    return NextResponse.json(
      { message: "User updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
