import "dotenv/config";
import axios from "axios";
import { convertToDiscordMarkdown } from "../../../lib/helpers/interview-prep/index.js";
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

// Add 'rawResponse' as an optional third parameter
export async function sendErrorToDiscord(
  error: any,
  title = "",
  rawResponse?: string,
) {
  const webhookUrl = ENV_VARS.DISCORD_ERROR_LOGS_URL || "";
  try {
    const fields = [
      {
        name: "Stack Trace",
        // Substring to stay within Discord's 1024 character limit per field
        value: `\`\`\`${error?.stack?.substring(0, 1000) || "No stack trace available"}\`\`\``,
      },
      { name: "Timestamp", value: new Date().toISOString() },
    ];

    // If a raw response is provided, add it as a new field
    if (rawResponse) {
      fields.push({
        name: "Raw Gemini Response",
        // Format it as a code block for better readability
        value: `\`\`\`json\n${rawResponse.substring(0, 1000)}\n\`\`\``,
      });
    }

    const payload = {
      username: "Error Logger",
      embeds: [
        {
          title: "🚨 Application Error" + (title ? `: ${title}` : ""),
          description: `**Message:** ${error.message}`,
          color: 15158332,
          fields: fields,
          footer: { text: "Node.js Error Monitoring" },
        },
      ],
    };

    await axios.post(webhookUrl, payload);
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
        title: `Corporate Announcement: ${data.symbol}`,
        url: pdfUrl,
        color: data.dividend_declared ? 3066993 : 5814783, // Green if dividend, Blue otherwise
        description: data.highlights.map((h: string) => `• ${h}`).join("\n"),
        fields: [
          {
            name: "Company",
            value: data.company_name,
            inline: true,
          },
          {
            name: "Date",
            value: data.meeting_date,
            inline: true,
          },
          {
            name: "Financials (YoY)",
            value: data?.financials?.profit_current
              ? `
                Profit: ${data.financials.profit_current ?? "N/A"} Rs
                \nProfit %: ${data.financials.profit_yoy_chg_pct ?? "N/A"}%
                \nEPS: ${data.financials.eps_current ?? "N/A"} Rs
                \nEPS %: ${data.financials.eps_yoy_chg_pct ?? "N/A"}%
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
