import fs from "node:fs";
import path from "node:path";

export const LINKEDIN_SESSION_PATH = path.resolve(
  "src/auth/storage/linkedin-storage.json",
);

export const ETERNAL_SESSION_PATH = path.resolve(
  "src/auth/storage/eternal_auth.json",
);

export const X_SESSION_PATH = path.resolve("src/auth/storage/x_auth.json");

export function ensureAuthFile(storagePath: string = ETERNAL_SESSION_PATH) {
  const dir = path.dirname(storagePath);

  // 1. Ensure directory exists (Applies to all paths)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 2. Map the file paths to their corresponding environment variables
  const sessionSecretsMap: Record<string, string | undefined> = {
    [ETERNAL_SESSION_PATH]: process.env.ETERNAL_SESSION_JSON,
    [X_SESSION_PATH]: process.env.X_SESSION_JSON,
  };

  // 3. Look up the correct secret for the requested path
  const secretData = sessionSecretsMap[storagePath];

  // 4. Write the file if it's missing and the secret is available
  if (!fs.existsSync(storagePath) && secretData) {
    try {
      // Optional: Quick sanity check to ensure the secret is actually valid JSON
      JSON.parse(secretData);

      fs.writeFileSync(storagePath, secretData);
      console.log(
        `✅ Session file created for ${path.basename(storagePath)} from GitHub Secrets.`,
      );
    } catch (error) {
      console.error(
        `❌ CRITICAL: The GitHub Secret for ${storagePath} contains invalid JSON.`,
      );
    }
  }
}
