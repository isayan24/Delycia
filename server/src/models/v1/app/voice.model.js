import pool from "../../../config/db.connection.js";
import OpenAI from "openai";
import axios from "axios";
import otherUtils from "../../../utils/others.js";
import { GoogleGenAI } from "@google/genai";

// const generateScript = async (user_name, item_names) => {
//   console.log("Generating script....");

//   const system =
//     "You are a helpful assistant that crafts polite, professional messages for restaurant customers. You always follow tone and language instructions carefully, and respect strict formatting rules.";

//   const openai = new OpenAI({
//     baseURL: "https://api.deepseek.com",
//     apiKey: "sk-e84dad9b4abb4bc0bca0af2240222ad0",
//   });

//   try {
//     const completion = await openai.chat.completions.create({
//       messages: [
//         {
//           role: "system",
//           content: system,
//         },
//         {
//           role: "user",
//           content: `Items: ${item_names} User: ${user_name} Write in English language message informing ${user_name} their items (use short names only, without any quantity or size like "2L", "250ml", etc.) are being prepared and to please wait; 🔒 Strict Rules: Use only short names of items; Extract and use only the first name from ${user_name}; If the extracted name appears to be a real name, use a respectful tone; otherwise, skip honorifics; Tone must be friendly and professional like a restaurant assistant; Return only the message in English language, characters — no translations, explanations, or extra text.`,
//         },
//       ],
//       model: "deepseek-chat",
//     });

//     if (
//       completion &&
//       completion.choices &&
//       completion.choices.length > 0 &&
//       completion.choices[0].message &&
//       completion.choices[0].message.content
//     ) {
//       console.log("BY DEEPSHEEK : ->", completion.choices[0].message.content);
//       return { status: true, script: completion.choices[0].message.content };
//     } else {
//       console.error("Invalid response format from OpenAI API");
//       return { status: false };
//     }
//   } catch (error) {
//     console.error("Error generating script:", error.message || error);
//     return { status: false };
//   }
// };
let executeCounter = 0;
const generateScriptGemini = async (user_name, item_names) => {
  console.log("Generating script....");

  const system =
    "You are a helpful assistant that crafts polite, professional messages for restaurant customers. You always follow tone and language instructions carefully, and respect strict formatting rules.";

  try {
    const [result] = await pool.query(
      "SELECT value FROM config WHERE name = 'QR_CODE_VOICE_SCRIPT_PROMPT'"
    );

    const ai = new GoogleGenAI({
      apiKey: "AIzaSyC-vP6VlyXeReQU9nnPwzSqT0QnrfDFplw",
    });

    // Evaluate template
    //console.log(result[0].value);
    const promptTemplate = "`" + result[0].value + "`";
    const prompt = eval(promptTemplate);

    // Generate content
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      systemInstruction: {
        role: "system",
        parts: [{ text: system }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const generatedText =
      response?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("BY GEMINI : ->", generatedText);

    return { status: true, script: generatedText };
  } catch (error) {
    console.error("Gemini generation failed:", error);

    return { status: false };
  }
};

const speak = async (req) => {
  try {
    //console.log("Request Body:", JSON.stringify(req.body, null, 2)); // better visibility

    const nested = req.body?.orders;
    const orderInfo = nested?.orders;

    if (!Array.isArray(orderInfo) || orderInfo.length === 0) {
      console.error("Detected orderInfo:", orderInfo);
      throw new Error("Invalid or empty 'orders' array in request body.");
    }

    const customerId = orderInfo[0].customer_id;

    // Fetch customer name
    const [customerRows] = await pool.query(
      `SELECT name FROM users WHERE id = ?`,
      [customerId]
    );

    if (!customerRows || customerRows.length === 0) {
      throw new Error(`Customer with id ${customerId} not found.`);
    }

    const customerName = customerRows[0].name;
    //console.log("Customer Name:", customerName);

    // Fetch item names
    const itemIds = orderInfo.map((order) => order.item_id);
    const placeholders = itemIds.map(() => "?").join(",");
    const itemQuery = `SELECT name FROM inventories WHERE id IN (${placeholders})`;

    const [itemRows] = await pool.query(itemQuery, itemIds);
    const itemNames = itemRows.map((row) => row.name);
    const allItemsName = itemNames.join(", ");
    // console.log("Item Names:", allItemsName);

    // Generate script

    console.log("--------------------------------------------");
    //const result = await generateScript(customerName, allItemsName);
    const result = await generateScriptGemini(customerName, allItemsName);
    //console.log("Script Generated:", result.script);

    if (!result.status) {
      console.log("Script generation failed.");
      return { status: true, statusCode: 200 };
    }

    // Generate voice
    console.log("Generating voice...");
    const voice = await generateAudio(result.script);

    if (!voice.status) {
      console.log("Voice generation failed.");
      return { status: false, statusCode: 400 };
    }

    //console.log("Voice data:", voice.result);
    return { status: true, statusCode: 200, data: voice.result };
  } catch (error) {
    console.error("An error occurred in speak():", error);
    return { status: false, statusCode: 500, error: error.message };
  }
};

const generateAudio = async (script) => {
  const [result] = await pool.query(
    "SELECT value from config WHERE name = 'Elevenlabs_API_KEY'"
  );
  const API_KEY = result[0].value;
  const VOICE_ID = "1Z7Y8o9cvUeWq8oLKgMY";
  //const VOICE_ID = "2zRM7PkgwBPiau2jvVXc";
  //const VOICE_ID = "OYTbf65OHHFELVut7v2H";
  const text = script;

  try {
    const response = await axios({
      method: "post",
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      responseType: "arraybuffer",
      data: {
        text,
        model_id: "eleven_flash_v2_5",
        voice_settings: {
          stability: 1,
          similarity_boost: 1,
          style: 0.2,
          use_speaker_boost: false,
        },
      },
    });

    const base64Audio = Buffer.from(response.data, "binary").toString("base64");

    const result = {
      audios: base64Audio,
    };
    console.log("----------------------END--------------------");
    //console.log(JSON.stringify(result, null, 2));
    return { status: true, result };
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    return { status: false };
  }
};

const welcome = async (req) => {
  console.log("Entred");
  const { name } = req.body;
  const message = `.. ${otherUtils.getGreeting()}, ${
    name.split(" ")[0]
  }. Welcome to The Calcutta Retro — we’re so happy to have you here!
I’m Emma, your virtual assistant.🌟 Take a look at our menu… and order your favorites anytime, right here! 😊`;

  console.log(message);
  const voice = await generateAudio(message);
  if (!voice.status) return { status: false, statusCode: 400 };
  return { status: true, statusCode: 200, data: voice.result };
};

export default { speak, welcome };
