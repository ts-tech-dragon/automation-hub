export const getTenQAPrompt: (tech: string) => string = (tech: string) => {
  const prompt = `
    Generate 10 advanced interview questions and answers for a Senior Developer role focusing on ${tech}.
    Mix concept questions with "What happens if..." scenarios.
    
    Return ONLY JSON:
    {
      "tech": "${tech}",
      "questions": [
        { "q": "Question text", "a": "Detailed answer with code example if applicable" }
      ]
    }
  `;
  return prompt;
};

export const getInterviewProblemPrompt: (tech: string) => string = (
  tech: string,
) => {
  const prompt = `
    Create 1 unique coding challenge for ${tech}.
    Format:
    1. Problem Statement
    2. Constraints
    3. Starter Code
    4. Solution (with explanation)

    Return ONLY JSON:
    {
      "title": "...",
      "problem": "...",
      "starterCode": "...",
      "solution": "..."
    }
  `;
  return prompt;
};
