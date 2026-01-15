import twilio from "twilio";

const accountSid = "ACde831134c2443f7513a7cb0e0056abb0";
const authToken = "e2bb1fd217b136f5ab80a258c96b1efa";

const client = new twilio(accountSid, authToken);

const sendOTP = async (phoneNumber, otp) => {
  try {
    await client.messages.create({
      body: `Your OTP is: ${otp} for Delycia.com`,
      from: "+13307372417",
      to: phoneNumber,
    });
    console.log("OTP sent successfully!");
    return true;
  } catch (error) {
    console.error("Error sending OTP:", error);
    return false;
  }
};

export default { sendOTP };
