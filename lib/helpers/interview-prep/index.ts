import { INTERVIEW_TECHS } from "../../constants/interview-prep/index.js";

export const getRandomTech: () => string = () =>
  INTERVIEW_TECHS[Math.floor(Math.random() * INTERVIEW_TECHS.length)] as string;

export const escapeHTML = (str: string) => {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// 1. Intha function-a file-oda top-la illa searchJobsAllPages-ku mela poodunga
export const scrollToLoad = async (page: any) => {
  console.log("   Scrolling to load cards...");
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    // Random wait for human-like behavior
    await page.waitForTimeout(1000 + Math.floor(Math.random() * 500));
  }
};

export function convertToDiscordMarkdown(html: string): string {
  return (
    html
      .replace(/<b>(.*?)<\/b>/g, "**$1**")
      .replace(/<i>(.*?)<\/i>/g, "*$1*")
      // ✅ Add 'javascript' (or your tech variable) to the backticks
      .replace(/<pre><code>(.*?)<\/code><\/pre>/gs, "```javascript\n$1\n```")
      .replace(/<code>(.*?)<\/code>/g, "`$1`")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
  );
}

export function formatTelegramQAMsg(qaData: {
  questions: { q: string; a: string }[];
}) {
  try {
    // Format your Q&A message here (using your existing formatting logic)
    let qaMsg = ``;

    qaData.questions.forEach((q: { q: string; a: string }, i: number) => {
      qaMsg += `<b>Q${i + 1}: ${escapeHTML(q.q)}</b>\n`;
      qaMsg += `<pre><code>${escapeHTML(q.a)}</code></pre>\n\n`;
    });
    return qaMsg;
  } catch (error) {
    console.log("Error : ", (error as Error).message);
    return "Formate Error";
  }
}
