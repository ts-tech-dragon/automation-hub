import "dotenv/config";
import { generateQA } from "./qa-worker.js";
import { generateProblemWorker } from "./problem-worker.js";
import {
  escapeHTML,
  formatTelegramQAMsg,
  getRandomTech,
} from "../../../lib/helpers/interview-prep/index.js";
import { sendTelegramInterview } from "../../core/notifier/telegram.js";
import {
  MOCK_PROBLEM_RESPONSE,
  MOCK_PROPER_RESPONSE_OBJ,
} from "../../../lib/constants/interview-prep/mocks.js";
import {
  sendDiscordInterview,
  sendDiscordInterviewProblem,
} from "../../core/notifier/discord.js";

async function runInterviewPrep() {
  const tech = getRandomTech(); // Or however you select your daily tech
  console.log(`🚀 Starting Daily Interview Prep for: ${tech}`);

  // ==========================================
  // TASK 1: Q&A WORKER
  // ==========================================
  try {
    console.log("⏳ Generating Q&A...");
    const qaData = await generateQA(tech);
    // const qaData = MOCK_PROPER_RESPONSE_OBJ;

    // Format your Q&A message here (using your existing formatting logic)
    let qaMsg = formatTelegramQAMsg(qaData);

    await sendTelegramInterview(`INTERVIEW Q&A: ${tech}`, qaMsg);

    await sendDiscordInterview(`INTERVIEW Q&A: ${tech}`, qaData);
    console.log("✅ Q&A successfully sent!");
  } catch (error: any) {
    // If Q&A fails, we catch it HERE, log it, and MOVE ON to the next task.
    console.error(
      "❌ Q&A Worker failed, but continuing workflow...",
      error.message,
    );
  }

  // ==========================================
  // TASK 2: PROBLEM WORKER
  // ==========================================
  try {
    console.log("⏳ Generating Problem...");
    const probData = await generateProblemWorker(tech);
    // const probData = MOCK_PROBLEM_RESPONSE;
    // 🧠 Build message
    let probMsg = `<i>${escapeHTML(probData.problem)}</i>\n\n`;

    // ✅ Starter Code (block)
    probMsg += `<b>Starter Code:</b>\n`;
    probMsg += `<pre>${escapeHTML(probData.starterCode)}</pre>\n\n`;

    // ✅ Solution (spoiler + inline code)
    probMsg += `<b>✅ Solution:</b>\n`;
    probMsg += `<pre><code class="language-javascript">${escapeHTML(probData.solution)}</code></pre>`;

    await sendTelegramInterview(`DAILY CHALLENGE: ${probData.title}`, probMsg);
    await sendDiscordInterviewProblem(probData);
    console.log("✅ Problem successfully sent!");
  } catch (error: any) {
    console.error("❌ Problem Worker failed.", error.message);
  }

  console.log("🏁 Interview Prep Workflow Finished.");
}

runInterviewPrep();
