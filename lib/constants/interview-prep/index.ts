export const INTERVIEW_TECHS = [
  "React.js",
  "Next.js",
  "TypeScript",
  "Node.js (Backend)",
  "JavaScript (ES6+ & Internals)",
  "Tailwind CSS",
  "PostgreSQL & Database Design",
];

export const RUN_INDEED_SCRAPER_PAYLOAD = {
  keyword: "Frontend Developer,React,next.js,javascript,typescript,html,css",
  // locations: ["chennai", "bengaluru", "coimbatore", "tiruchchirappalli"],
  locations: ["salem"],
  maxPages: 1,
};

export const RUN_LINKEDIN_SCRAPER_PAYLOAD = {
  maxResults: 25, // Max number of job results to fetch
  locations: [
    "Chennai",
    "Coimbatore",
    "Bangalore",
    "Trichy",
    "Bengaluru",
    "Tiruchirappalli",
  ], // Location filter for jobs
  keywords: ["Software Engineer", "Frontend Developer", "Next.js", "react js"], // Job title keywords
  experienceLevel: "Entry level", // Experience level filter
};

export const INDEED_SCRAPPER_RESULT_PATH = `lib/results/jobs/indeed-jobs.json`;
