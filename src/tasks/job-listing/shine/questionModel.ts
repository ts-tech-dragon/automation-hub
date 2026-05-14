import type { Page } from "playwright";
import {
  humanDelay,
  humanScroll,
  randInt,
} from "../../../../lib/helpers/human.js";

export async function extractQuestionnaireModal(page: Page) {
  const modal = page.locator("#modalID");
  console.log("📝 Handling dynamic questionnaire...");

  try {
    // 1. Count the total number of questions in this specific modal
    const totalQuestions = await modal.locator(".question-block").count();
    let answeredQuestions = 0;

    // 2. LOGIC: Relocation Question (Radio Button)
    const relocationLabel = modal.locator(".question-block label", {
      hasText: /ready to relocate/i,
    });
    if ((await relocationLabel.count()) > 0) {
      // Checks the radio button directly by its value
      await modal.locator('input[type="radio"][value="Yes"]').check();
      answeredQuestions++;
    }
    await humanDelay(2000, 4000);
    await humanScroll(page, "down", randInt(100, 300));
    await humanDelay(1000, 2000);

    // 3. LOGIC: Skill Experience (Dynamic DOM Reader)
    const skillLabel = modal.locator(".question-block label", {
      hasText: /experience for each of these skills/i,
    });

    if ((await skillLabel.count()) > 0) {
      // Define your actual tech stack here. Everything else gets the default fallback.
      const mySkills = {
        "node.js": "4 yrs",
        node: "4 yrs",
        react: "4 yrs",
        "react.js": "4 yrs",
        "next.js": "4 yrs",
        typescript: "4 yrs",
        javascript: "4 yrs",
        sql: "4 yrs",
        git: "4 yrs",
        api: "4 yrs",
        "artificial intelligence": "4 yrs",
      };

      // Get all the individual skill blocks Shine generated
      const skillItems = modal.locator("li.composite-dropdown");
      const skillCount = await skillItems.count();

      for (let i = 0; i < skillCount; i++) {
        const item = skillItems.nth(i);
        const skillName = await item.locator("label.lbl").innerText();
        const dropdown = item.locator("select");

        // Check if Shine's requested skill matches anything in your tech stack
        const knownSkillKey = Object.keys(mySkills).find((k) =>
          skillName.toLowerCase().includes(k),
        );

        if (knownSkillKey) {
          // It's in your stack! Assign 4 years.
          await dropdown.selectOption(
            mySkills[knownSkillKey as keyof typeof mySkills],
          );
          console.log(`Assigned 4 yrs to ${skillName}`);
        } else {
          // It's outside your stack (e.g., Java, Spring Boot). Assign the fallback.
          // Note: You can change '0 yrs' to '1 yrs' if you want to try bypassing strict filters
          await dropdown.selectOption("1 yrs");
          console.log(`Assigned default 1 yrs to unknown skill: ${skillName}`);
        }
        await humanDelay(2000, 4000);
        await humanScroll(page, "down", randInt(100, 300));
        await humanDelay(1000, 2000);
      }

      // Count this entire question block as successfully answered
      answeredQuestions++;
    }

    // 4. LOGIC: Expected CTC (Dropdown)
    const ctcLabel = modal.locator(".question-block label", {
      hasText: /expected annual CTC/i,
    });
    if ((await ctcLabel.count()) > 0) {
      // Find the select by its default option text rather than a brittle ID
      const ctcDropdown = modal
        .locator("select")
        .filter({ hasText: "CTC (Lakh)" })
        .first();
      if ((await ctcDropdown.count()) > 0) {
        await ctcDropdown.selectOption("Rs 14 - 16 Lakh / Yr");
      }
      answeredQuestions++;
    }
    await humanDelay(2000, 4000);
    await humanScroll(page, "down", randInt(100, 300));
    await humanDelay(1000, 2000);

    // 5. LOGIC: Notice Period (Dropdown)
    const noticeLabel = modal.locator(".question-block label", {
      hasText: /notice period/i,
    });
    if ((await noticeLabel.count()) > 0) {
      const noticeDropdown = modal
        .locator("select")
        .filter({ hasText: "Notice Period" })
        .first();
      if ((await noticeDropdown.count()) > 0) {
        await noticeDropdown.selectOption("Immediate Joiner");
      }
      answeredQuestions++;
    }

    await humanDelay(2000, 4000);
    await humanScroll(page, "down", randInt(100, 300));
    await humanDelay(1000, 2000);

    // 6. THE SAFEGUARD: Did we answer everything?
    if (answeredQuestions < totalQuestions) {
      console.log(
        `⚠️ Found ${totalQuestions} questions, but only knew how to answer ${answeredQuestions}. Closing modal to avoid getting stuck.`,
      );
      await modal.locator(".btnCloseWhite").click();
      return; // Exit the function
    }

    // 7. Submit the application
    await modal.getByRole("button", { name: /Submit and apply/i }).click();
    console.log("✅ Application submitted with questionnaire details!");
  } catch (error) {
    console.error(
      "❌ Error processing modal, closing it safely:",
      (error as Error).message,
    );
    // Fallback: Close modal if anything crashes
    await modal.locator(".btnCloseWhite").click();
  }
}
