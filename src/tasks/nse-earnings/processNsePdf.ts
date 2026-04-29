import axios from "axios";
import { askPDFResponseGemini } from "../../core/gemini.js";
import { ANALYZE_NSE_PROMPT } from "../../../lib/constants/insta-earning-results/prompts.js";

export async function processBatchNsePdfs(pdfUrls: any[]) {
  // 1. Download all PDFs in parallel to save time
  const pdfParts = await Promise.all(
    pdfUrls.map(async (url) => {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        headers: { "User-Agent": "Mozilla/5.0" }, // NSE sometimes needs this
      });

      return {
        inlineData: {
          data: Buffer.from(response.data).toString("base64"),
          mimeType: "application/pdf",
        },
      };
    }),
  );

  // 3. Combine PDFs and Prompt into the "parts" array
  const parts = [...pdfParts, { text: ANALYZE_NSE_PROMPT }];

  // 3. Send everything in ONE call
  const result = await askPDFResponseGemini(parts, true);
  return result;
}
