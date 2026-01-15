import twilio from "twilio";
import "dotenv/config";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

const sendOtp = async (phone_number, otp) => {
  if (!phone_number || !otp) return console.log("Number and Otp is required!");
  try {
    const message = await client.messages.create({
      from: "whatsapp:+917797168592",
      contentSid: "HXd9a837d1ff49a836f8e94db133000f41",
      contentVariables: `{"1":"${otp}"}`,
      to: `whatsapp:${phone_number}`,
    });

    console.log(message.sid);
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};

const sendOrderPlaceUpdate = async (data) => {
  try {
    const message = await client.messages.create({
      from: "whatsapp:+917797168592",
      contentSid: "HX568704078cc6eede281d4ac7502ba52b",
      contentVariables: `{"1":"${data.name}", "2":"${data.orderDate}", "3":"${data.items}", "4":"${data.totalAmount}" }`,
      to: `whatsapp:${data.phone}`,
    });

    console.log(message.sid);
    return true;
  } catch (error) {
    console.error("Error sending message:", error);
    return false;
  }
};
export default { sendOtp, sendOrderPlaceUpdate };
