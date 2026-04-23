import crypto from "crypto";

/**
 * Generates a cryptographically secure random password.
 * @param length - Length of the password (default 12)
 * @returns A string containing letters, numbers, and symbols
 */
export const generateRandomPassword = (length: number = 12): string => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";

  // Generate random bytes for better entropy
  const randomBytes: any = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    // Map each byte to a character in our charset
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
};

/**
 * Types text character-by-character with a randomized delay between each.
 */
export async function typeHumanLike(
  locator: any,
  text: string,
  minDelay = 50,
  maxDelay = 150,
) {
  // Clear the field first if needed
  await locator.focus();

  for (const char of text) {
    // Generate a random delay for THIS specific character
    const randomDelay = Math.floor(
      Math.random() * (maxDelay - minDelay + 1) + minDelay,
    );

    // Type the single character
    await locator.pressSequentially(char);

    // Wait for the random duration
    await new Promise((resolve) => setTimeout(resolve, randomDelay));
  }
}

export async function detectCaptcha(page: any) {
  const content = await page.content();

  const models = {
    reCAPTCHA: /google\.com\/recaptcha/i.test(content),
    hCaptcha: /hcaptcha\.com/i.test(content),
    Turnstile: /challenges\.cloudflare\.com/i.test(content),
    Arkose: /arkoselabs\.com/i.test(content),
  };

  const detected = Object.keys(models).find((key) => models[key]);
  return detected || false;
}
