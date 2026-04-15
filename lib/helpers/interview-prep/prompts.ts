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
  Generate 10 Senior-level Interview Q&A for ${tech}.

  CRITICAL CONSTRAINTS:
  1. No Markdown: Do NOT use bold (**), italics (*), or lists (-) inside the JSON values.
  2. Plain Text Only: Keep the answers as raw strings.
  3. Character Limit: Each answer MUST be under 400 characters. 
  4. Escaping: Ensure any double quotes inside the text are properly escaped as \\".

  JSON FORMAT:
  {
    "tech": "${tech}",
    "questions": [
      { "q": "Concise Question?", "a": "Concise technical answer." }
    ]
  }
`;
  return prompt;
};
