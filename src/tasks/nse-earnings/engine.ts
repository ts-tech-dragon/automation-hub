import { getTimeInIST } from "../../../lib/helpers/index.js";
import { runNSEScrapper } from "./nseScrapper.js";
import {
  NSE_MOCK_DATA,
  NSE_RESULT_GEMINI_MOCK,
} from "../../../lib/constants/nse-scrapper/mock.js";
import { processBatchNsePdfs } from "./processNsePdf.js";
import { formatNSEResultMessage } from "../../../lib/helpers/nse-results/index.js";
import { sendNSEResultTelegramNotification } from "../../core/notifier/telegram.js";
import { sendNSEResultDiscordNotification } from "../../core/notifier/discord.js";
import { CONCALL_MOCK_RESPONSE } from "../../../lib/constants/insta-earning-results/mock.js";

const runNSEEngine = async () => {
  const dataTime = getTimeInIST("DD-MMM-YYYY HH");
  //   const dataTime = "29-Apr-2026 22";

  try {
    const financialResult = await runNSEScrapper();
    // const financialResult = NSE_MOCK_DATA;

    // 1. Pre-normalize your mock list once (lowercase and trimmed)
    const normalizedAllowed = CONCALL_MOCK_RESPONSE.map((item) =>
      item.name.toLowerCase().trim(),
    );
    const oneHourResult = financialResult.filter((result: any) => {
      const dateTimeMatch = result.an_dt.includes(dataTime);
      const currentName = result.sm_name.toLowerCase().trim();
      const nameMatch = normalizedAllowed.some(
        (allowed) =>
          currentName.includes(allowed) || allowed.includes(currentName),
      );
      if (dateTimeMatch && nameMatch) return result;
    });

    const pdfURLs = oneHourResult.map((item: any) => item.attchmntFile);
    if (!pdfURLs.length) return console.log("No Results Found!!!");
    const geminiResponse = await processBatchNsePdfs(pdfURLs);
    // const geminiResponse = NSE_RESULT_GEMINI_MOCK;
    pdfURLs.forEach(async (url: string, index: number) => {
      const formatedMsg = formatNSEResultMessage(geminiResponse[index]);
      await Promise.all([
        sendNSEResultTelegramNotification(formatedMsg, url),
        sendNSEResultDiscordNotification(geminiResponse[index], url),
      ]);

      console.log("Results Send Successfully!!!");
    });
  } catch (error) {
    console.log("RUN NSE Scrapper : ", (error as Error).message);
  }
};

runNSEEngine();
