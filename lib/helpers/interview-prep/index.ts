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
