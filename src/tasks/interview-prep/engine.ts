import "dotenv/config";
import { generateQA } from "./qa-worker.js";
import { generateProblemWorker } from "./problem-worker.js";
import {
  escapeHTML,
  getRandomTech,
} from "../../../lib/helpers/interview-prep/index.js";
import { sendTelegramInterview } from "../../core/notifier/telegram.js";

async function runInterviewPrep() {
  try {
    const tech = getRandomTech();
    // 1. Run Q&A Worker
    const qaData = await generateQA(tech);
    let qaMsg = `<b>Focus: ${qaData.tech}</b>\n\n`;
    qaData.questions.forEach((item: any, i: number) => {
      qaMsg += `<b>Q${i + 1}:</b> ${item.q}\n<b>A:</b> ${item.a}\n\n`;
    });

    // 2. Run Problem Worker
    const probData = await generateProblemWorker(tech);
    // 1. Starter Code (Copy-pasteable block)
    let probMsg = `<b>🚀 Challenge: ${probData.title}</b>\n\n`;
    probMsg += `<i>${probData.problem}</i>\n\n`;

    probMsg += `<b>Starter Code:</b>\n`;
    // Wrap in <pre><code class="language-js"> for syntax highlighting
    probMsg += `<pre><code class="language-javascript">${probData.starterCode}</code></pre>\n\n`;

    // 2. Solution (Hidden until tapped)
    probMsg += `<b>✅ Solution (Tap to reveal):</b>\n`;
    probMsg += `<tg-spoiler><pre><code class="language-javascript">${escapeHTML(probData.solution)}</code></pre></tg-spoiler>`;

    // 3. Send to Telegram
    await sendTelegramInterview(`INTERVIEW PREP: Q&A`, qaMsg);
    await sendTelegramInterview(`DAILY CODING CHALLENGE`, probMsg);

    console.log("✅ Interview pack sent to Telegram!");
  } catch (error) {
    console.log("Error in interview prep workflow:", (error as Error).message);
  }
}

runInterviewPrep();
