function extractEmail(raw: string): string | null {
  const match = raw.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

function isValidRecruiterEmail(email: string, companyName: string): boolean {
  if (!email || !companyName) return false;

  // Extract clean email first in case raw text is passed
  const cleanEmail = extractEmail(email);
  if (!cleanEmail) return false;

  console.log(
    "Validating clean email:",
    cleanEmail,
    "for company:",
    companyName,
  );

  const normalizedEmail = cleanEmail.trim().toLowerCase();
  const normalizedCompany = companyName.trim().toLowerCase();

  // Step 1: Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) return false;

  // Step 2: Check valid prefixes
  const validPrefixes = ["hr", "careers", "recruiter", "info"];
  const [localPart, domain] = normalizedEmail.split("@");

  const hasValidPrefix = validPrefixes.some(
    (prefix) =>
      localPart === prefix ||
      localPart?.startsWith(`${prefix}.`) ||
      localPart?.startsWith(`${prefix}_`) ||
      localPart?.includes(prefix),
  );
  if (!hasValidPrefix) return false;

  // Step 3: Check company name is in domain
  const normalizedForDomain = normalizedCompany.replace(/[\s.\-_]/g, "");
  const companyExtension = domain?.split(".")[0] as string;

  const domainMatches =
    companyExtension.includes(normalizedForDomain) ||
    normalizedForDomain.includes(companyExtension);
  if (!domainMatches) return false;
  return true;
}

export const getHrMailIdFromSearchAPIResponse = (
  response: { snippet_highlighted_words: string[] }[],
  companyName: string,
): string | null => {
  if (!response || !Array.isArray(response)) return null;

  for (const item of response) {
    if (!item.snippet_highlighted_words) continue;
    for (const word of item.snippet_highlighted_words) {
      if (isValidRecruiterEmail(word, companyName)) {
        return word;
      }
    }
  }
  return null;
};
