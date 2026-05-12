import { MARKET_HOLIDAYS } from "../../constants/insta-earning-results/index.js";
import { getTimeInIST } from "../index.js";

export const isMarketHoliday = () => {
  const formatedDate = getTimeInIST("YYYY-MM-DD");
  const isMarketHoliday = MARKET_HOLIDAYS.marketHolidays.includes(formatedDate);
  return isMarketHoliday;
};

// Helper function to shift a date by 5.5 hours
export function getFakeIstDate(dateStringOrObject?: string | Date) {
  const date = dateStringOrObject ? new Date(dateStringOrObject) : new Date();
  const istOffsetInMs = 5.5 * 60 * 60 * 1000;
  return new Date(date.getTime() + istOffsetInMs);
}

export function isEpsPositive(eps: string) {
  if (eps === "N/A") return true; // Treat "N/A" as positive for filtering purposes
  const epsValue = parseFloat(
    eps.replace("₹", "").replace("Cr", "").replace(/,/g, "").trim(),
  );
  return epsValue > 0;
}
