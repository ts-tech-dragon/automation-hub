import { MARKET_HOLIDAYS } from "../../constants/insta-earning-results/index.js";
import { getTimeInIST } from "../index.js";

export const isMarketHoliday = () => {
  const formatedDate = getTimeInIST("YYYY-MM-DD");
  const isMarketHoliday = MARKET_HOLIDAYS.marketHolidays.includes(formatedDate);
  return isMarketHoliday;
};
