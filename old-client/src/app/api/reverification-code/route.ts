// import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import axiosInstance from "@/lib/axios";

// fix manage this route for mobile re verification code, rather than sending email
export async function POST(request: Request) {
  try {
    // getting details from request json
    const body = await request.json();
    const { id, userInfo } = body;

    if (!id) {
      return Response.json(
        {
          success: false,
          message: "id is required",
        },
        { status: 400 }
      );
    } 

    const verifyCode = await axiosInstance
      .post("/users/verify", { uid: id })
      .then((res) => {
        return res.data.verification.code;
      })
      .catch((err) => {
        console.log("error in verification", err);
      });

    //  await sendVerificationEmail(userInfo.email, userInfo.name, verifyCode);

    return Response.json(
      {
        success: true,
        message: "Verification code send successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return Response.json(
      {
        success: false,
        message: Error,
      },
      { status: 500 }
    );
  }
}
