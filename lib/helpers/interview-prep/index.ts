import { INTERVIEW_TECHS } from "../../constants/interview-prep/index.js";

export const getRandomTech: () => string = () =>
  INTERVIEW_TECHS[Math.floor(Math.random() * INTERVIEW_TECHS.length)] as string;

export const escapeHTML = (str: string) => {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
