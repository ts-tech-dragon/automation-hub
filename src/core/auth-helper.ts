import fs from "node:fs";
import path from "node:path";

export const SESSION_PATH = path.resolve(
  "src/auth/storage/linkedin-storage.json",
);

export function ensureAuthFile() {
  const dir = path.dirname(SESSION_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // If running on GitHub and file is missing, use the Environment Variable
  if (!fs.existsSync(SESSION_PATH) && process.env.ETERNAL_SESSION_JSON) {
    fs.writeFileSync(SESSION_PATH, process.env.ETERNAL_SESSION_JSON);
    console.log("✅ Session file created from GitHub Secrets.");
  }
}
