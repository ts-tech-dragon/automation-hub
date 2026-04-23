import "dotenv/config";
import axios from "axios";
import { ENV_VARS } from "../../../lib/constants/index.js";

type deepImagePayload = {
  email: string;
  password: string;
};

export async function sendDeepImageData(data: deepImagePayload) {
  const webhookUrl = ENV_VARS.DISCORD_WEBHOOK_URL || "";
  const payload = {
    username: "Automation Hub",
    embeds: [
      {
        title: "🚀 Deep Image Activation",
        description: "New account created and link extracted.",
        color: 0x00ffff,
        fields: [
          {
            name: "Email",
            value: data.email,
            inline: true,
          },
          {
            name: "Password",
            value: data.password,
            inline: true,
          },
        ],
        timestamp: new Date(),
      },
    ],
  };

  try {
    await axios.post(webhookUrl, payload);
    console.log("✅ Data sent via Webhook!");
  } catch (err) {
    console.error("❌ Webhook failed:", err);
  }
}
