import "dotenv/config";
import axios from "axios";
import { convertToDiscordMarkdown } from "../../../lib/helpers/interview-prep/index.js";
// Add 'rawResponse' as an optional third parameter
import fs from "fs";
import path from "path";
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

export async function sendDiscordInterview(title: string, qaData: any) {
  try {
    const webhookUrl = ENV_VARS.DISCORD_INTERVIEW_PREP_URL;
    console.log("web hook :", webhookUrl);
    if (!webhookUrl) return;

    const fields = qaData.questions.map((q: any, i: number) => ({
      name: `Q${i + 1}: ${q.q}`,
      value: `\`\`\`javascript\n${q.a}\n\`\`\``,
      inline: false,
    }));

    const payload = {
      username: "Automation Hub 👨🏼‍💻",
      embeds: [
        {
          title: `🚀 Daily Interview Prep: ${title}`,
          color: 5814783, // Blurple color
          fields: fields,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await axios.post(webhookUrl, payload);
  } catch (error) {
    console.log("sendDiscordInterview error : ", (error as Error).message);
  }
}

export async function sendDiscordInterviewProblem(probData: {
  title: string;
  problem: string;
  starterCode: string;
  solution: string;
}) {
  try {
    const webhookUrl = ENV_VARS.DISCORD_INTERVIEW_PREP_URL as string;
    // 3. Send to Discord (using Markdown specifically for code copying)
    const codeContent =
      `**🚀 DAILY CHALLENGE: ${probData.title}**\n` +
      `*${probData.problem}*\n\n` +
      `**✅ Starter code:**\n` +
      `\`\`\`javascript\n${probData.starterCode}\n\`\`\`\n` +
      `**✅ Solution:**\n` +
      `\`\`\`javascript\n${probData.solution}\n\`\`\``;

    const payload = {
      username: "Automation Hub 👨🏼‍💻",
      content: codeContent, // Content allows up to 2000 chars and is best for code
      embeds: [
        {
          title: `📝 Problem Statement`,
          description: probData.problem, // Description is perfect for the text
          color: 5814783,
          timestamp: new Date().toISOString(),
          footer: {
            text: "React.js • Interview Prep Hub",
          },
        },
      ],
    };
    await axios.post(webhookUrl, payload);
  } catch (error) {
    console.log(
      "sendDiscordInterviewProblem error : ",
      (error as Error).message,
    );
  }
}

export async function sendErrorToDiscord(
  error: any,
  title = "",
  rawResponse?: string,
  imagePath?: string, // 🌟 Optional parameter for the screenshot path
) {
  const webhookUrl = ENV_VARS.DISCORD_ERROR_LOGS_URL || "";
  if (!webhookUrl) return;

  try {
    const fields = [
      {
        name: "Stack Trace",
        value: `\`\`\`${error?.stack?.substring(0, 1000) || "No stack trace available"}\`\`\``,
      },
      { name: "Timestamp", value: new Date().toISOString() },
    ];

    if (rawResponse) {
      fields.push({
        name: "Raw Gemini Response",
        value: `\`\`\`json\n${rawResponse.substring(0, 1000)}\n\`\`\``,
      });
    }

    const payload: any = {
      username: "Error Logger",
      embeds: [
        {
          title: "🚨 Application Error" + (title ? `: ${title}` : ""),
          description: `**Message:** ${error?.message || error}`,
          color: 15158332,
          fields: fields,
          footer: { text: "Node.js Error Monitoring" },
        },
      ],
    };

    // 🌟 Check if an image path was provided and the file exists
    if (imagePath && fs.existsSync(imagePath)) {
      const fileName = path.basename(imagePath);

      // Attach the image reference to the embed so Discord renders it inline
      payload.embeds[0].image = {
        url: `attachment://${fileName}`,
      };

      // Use FormData to send both the JSON payload and the file together
      const formData = new FormData();
      formData.append("payload_json", JSON.stringify(payload));

      const fileBuffer = fs.readFileSync(imagePath);
      const blob = new Blob([fileBuffer]);
      formData.append("file", blob, fileName);

      await axios.post(webhookUrl, formData);
    } else {
      // 🌟 Fallback: Works exactly as before if no image argument is passed
      await axios.post(webhookUrl, payload);
    }
  } catch (err) {
    console.error("Failed to send error to Discord:", (err as Error).message);
  }
}

export async function sendNSEResultDiscordNotification(
  data: any,
  pdfUrl: string,
) {
  const webhookUrl = ENV_VARS.DISCORD_WEBHOOK_URL || "";

  const payload = {
    username: "NSE Result Bot 📈",
    embeds: [
      {
        title: `Corporate Announcement: ${data.symbol ?? "N/A"}`,
        url: pdfUrl,
        color: data.dividend_declared ? 3066993 : 5814783, // Green if dividend, Blue otherwise
        fields: [
          {
            name: "Company",
            value: data.company_name ?? "N/A",
            inline: true,
          },
          {
            name: "Market Cap",
            value: data.marketCap || "N/A",
            inline: true,
          },
          {
            name: "Date",
            value: data.meeting_date ?? "N/A",
            inline: true,
          },
          {
            name: "Financials (YoY)",
            value: data?.financials?.profit_current
              ? `
                Profit: ${data.financials.profit_current ?? "N/A"} Rs
                \nProfit(YoY) %: ${data.financials.profit_yoy_chg_pct ?? "N/A"}%
                \nProfit(QoQ) %: ${data.financials.profit_qoq_chg_pct ?? "N/A"}%
                \nEPS: ${data.financials.eps_current ?? "N/A"} Rs
                \nEPS(YoY) %: ${data.financials.eps_yoy_chg_pct ?? "N/A"}%
                \nEPS(QoQ) %: ${data.financials.eps_qoq_chg_pct ?? "N/A"}%
                `
              : "N/A",
            inline: false,
          },
        ],
        footer: { text: "NSE Archive Automation" },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    await axios.post(webhookUrl, payload);
  } catch (err) {
    console.error("Failed to send error to Discord:", (err as Error).message);
    sendErrorToDiscord(err, "NSE DISCORD ERROR", data);
  }
}
