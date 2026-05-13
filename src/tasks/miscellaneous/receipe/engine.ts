import "dotenv/config";
import axios from "axios";
import { RECEIPE_PROMPT } from "../../../../lib/constants/miscellaneous/prompt.js";
import { generateDailyMenu } from "./generateMenu.js";
import { MISCELLANEOUS_ENV_VARS } from "../../../../lib/constants/index.js";

// Replace these with your actual credentials from the Meta Dashboard
const ACCESS_TOKEN = MISCELLANEOUS_ENV_VARS.WHATSAPP_ACCESS_TOKEN || "";
const PHONE_NUMBER_ID = MISCELLANEOUS_ENV_VARS.WHATSAPP_PHONE_NUMBER_ID || "";
const MY_NUMBER = MISCELLANEOUS_ENV_VARS.WHATSAPP_MARI_NUMBER || "";

async function sendWhatsAppReminder() {
  const message = await generateDailyMenu(RECEIPE_PROMPT);
  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

  const data = {
    messaging_product: "whatsapp",
    to: MY_NUMBER,
    type: "text",
    text: {
      body: message,
    },
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    console.log("🚀 Reminder Sent! ID:", response.data.messages[0].id);
  } catch (error: any) {
    console.error(
      "❌ Error sending message:",
      error.response?.data || error.message,
    );
  }
}

// Usage Example
sendWhatsAppReminder();
