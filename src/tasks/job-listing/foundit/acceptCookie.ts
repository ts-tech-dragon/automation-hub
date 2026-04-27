import { humanClick, humanDelay, log } from "../../../../lib/helpers/human.js";

export const acceptFounditCookie = async (page: any) => {
  // ✅ Handle cookie banner if present
  try {
    const cookieBtn = page.locator("#acceptAll").first();
    const cookieVisible = await cookieBtn
      .isVisible({ timeout: 4000 })
      .catch(() => false);

    if (cookieVisible) {
      log("Cookie banner detected");
      await humanDelay(800, 1500);
      const btnHandle = await cookieBtn.elementHandle();
      if (btnHandle) {
        await humanClick(page, btnHandle);
        log("Accepted cookie policy", "success");
        await humanDelay(1200, 2000);
      }
    }
  } catch {}
};
