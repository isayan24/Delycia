import axiosInstance from "@/lib/axios";

export async function POST(request: Request) {
  try {
    const { code, phone_number, channel } = await request.json(); 
    console.log("request", code, phone_number, channel);

    if (channel === "sms" || channel === "whatsapp") {
      await axiosInstance
        .post("/users/auth/sendOTP", { phone_number, channel })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log("error in sending verification code", err);
          throw new Error("Error sending verification code");
        });

      return Response.json(
        {
          success: true,
          message: "Verification code sent successfully",
        },
        {
          status: 200,
        }
      );
    } else if (code) {
      console.log("code", code);
      await axiosInstance
        .post("/users/auth/verifyOTP", { code, phone_number })
        .then((res) => {
          console.log(res.data, "res.data")
          return res.data;
        })
        .catch((err) => {
          console.log("error in verifying OTP", err);
          throw new Error("Error verifying OTP");
        });

      return Response.json(
        {
          success: true,
          message: "OTP verified successfully",
        },
        {
          status: 200,
        }
      );
    }
  } catch (error: any) {
    console.error("Error Verifying OTP", error);

    return Response.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
