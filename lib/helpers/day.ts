import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js"; // 🌟 ADD THIS
import "dayjs/locale/en";

dayjs.locale("en");

// Extend dayjs with the plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat); // 🌟 EXTEND THIS

export const getFormattedDateInIST = (formate = "DD-MM-YYYY", daysAgo = 0) => {
  // Subtract specified days then format in IST
  const targetDate = dayjs()
    .tz("Asia/Kolkata")
    .subtract(daysAgo, "day")
    .format(formate);

  return targetDate;
};

export const getFormattedUpcomingDateInIST = (
  formate = "DD-MM-YYYY",
  daysAgo = 0,
) => {
  // Subtract specified days then format in IST
  const targetDate = dayjs()
    .tz("Asia/Kolkata")
    .add(daysAgo, "day")
    .format(formate);

  return targetDate;
};

export const convertDateToIST = (date: string, formate = "DD-MMM-YYYY") => {
  // Because customParseFormat is active, dayjs perfectly reads "08-Jun-2026"
  // and applies strict UTC midnight to it!
  return dayjs.utc(date, formate).toDate();
};

export const formatDateLabel = (date: string, formate = "DD MMM") => {
  return dayjs.utc(date).format(formate);
};

export const getDayOfWeek = () => {
  const nowInIST = dayjs().tz("Asia/Kolkata");
  const dayOfWeek = nowInIST.day();
  return dayOfWeek;
};
