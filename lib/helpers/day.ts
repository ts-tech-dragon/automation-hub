import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import "dayjs/locale/en";

dayjs.locale("en");
// Extend dayjs with the plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export const getFormattedDateInIST = (formate = "DD-MM-YYYY", daysAgo = 0) => {
  // Subtract specified days then format in IST
  const targetDate = dayjs()
    .tz("Asia/Kolkata")
    .subtract(daysAgo, "day")
    .format(formate);

  return targetDate;
};
