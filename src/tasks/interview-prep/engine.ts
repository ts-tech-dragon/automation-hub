import "dotenv/config";
import { generateQA } from "./qa-worker.js";
import { generateProblemWorker } from "./problem-worker.js";
import {
  escapeHTML,
  getRandomTech,
} from "../../../lib/helpers/interview-prep/index.js";
import { sendTelegramInterview } from "../../core/notifier/telegram.js";
import { MOCK_PROPER_RESPONSE_OBJ } from "../../../lib/constants/interview-prep/mocks.js";

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
    let qaMsg = ``;

    qaData.questions.forEach((q: { q: string; a: string }, i: number) => {
      qaMsg += `<b>Q${i + 1}: ${escapeHTML(q.q)}</b>\n`;
      qaMsg += `<pre><code>${escapeHTML(q.a)}</code></pre>\n\n`;
    });

    await sendTelegramInterview(`INTERVIEW Q&A: ${tech}`, qaMsg);
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
    // 🧠 Build message
    let probMsg = `<i>${escapeHTML(probData.problem)}</i>\n\n`;

    // ✅ Starter Code (block)
    probMsg += `<b>Starter Code:</b>\n`;
    probMsg += `<pre>${escapeHTML(probData.starterCode)}</pre>\n\n`;

    // ✅ Solution (spoiler + inline code)
    probMsg += `<b>✅ Solution:</b>\n`;
    probMsg += `<pre>${escapeHTML(probData.solution)}</pre>`;

    await sendTelegramInterview(`DAILY CHALLENGE: ${probData.title}`, probMsg);
    console.log("✅ Problem successfully sent!");
  } catch (error: any) {
    console.error("❌ Problem Worker failed.", error.message);
  }

  console.log("🏁 Interview Prep Workflow Finished.");
}

runInterviewPrep();
