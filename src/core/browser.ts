import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";

chromium.use(stealth());

export const getBrowser = async (headless: boolean = true) => {
  const browser = await chromium.launch({ headless });
  return browser;
};
