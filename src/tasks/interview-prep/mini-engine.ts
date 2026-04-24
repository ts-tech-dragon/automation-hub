import "dotenv/config";
import { generateSmallProblemWorker } from "./problem-worker.js";
import { escapeHTML } from "../../../lib/helpers/interview-prep/index.js";
import { sendTelegramInterview } from "../../core/notifier/telegram.js";
import { sendDiscordInterviewProblem } from "../../core/notifier/discord.js";

async function runMiniInterviewPrep() {
  try {
    const probData = await generateSmallProblemWorker();
    // 🧠 Build message
    let probMsg = `<i>${escapeHTML(probData.problem)}</i>\n\n`;

    // ✅ Starter Code (block)
    probMsg += `<b>Starter Code:</b>\n`;
    probMsg += `<pre>${escapeHTML(probData.starterCode)}</pre>\n\n`;

    // ✅ Solution (spoiler + inline code)
    probMsg += `<b>✅ Solution:</b>\n`;
    probMsg += `<pre><code class="language-javascript">${escapeHTML(probData.solution)}</code></pre>`;

    await sendTelegramInterview(
      `DAILY SMALL PROBLEM: ${probData.title}`,
      probMsg,
    );
    await sendDiscordInterviewProblem(probData);
  } catch (error) {
    // If Q&A fails, we catch it HERE, log it, and MOVE ON to the next task.
    console.error(
      "❌ Small Problem Worker failed, but continuing workflow...",
      (error as Error).message,
    );
  }
}

runMiniInterviewPrep();
