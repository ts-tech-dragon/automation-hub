export const getTenQAPrompt: (tech: string) => string = (tech: string) => {
  const prompt = `
    Generate JSON file with 10 advanced interview questions and answers for a Senior Developer role focusing on ${tech}.
    Mix concept questions with "What happens if..." scenarios.

    CRITICAL CONSTRAINTS:
    1. No Markdown: Do NOT use bold (**), italics (*), or lists (-) inside the JSON values.
    2. Plain Text Only: Keep the answers as raw strings.
    3. Character Limit: Each answer MUST be under 400 characters. 
    4. Escaping: Ensure any double quotes inside the text are properly escaped as \\".

    STRICT REQUIREMENTS:
    1. The "problem" should be a clear, 2-sentence task.
    2. The "solution" MUST be a single, concise code block. 
    3. DO NOT include a long text explanation after the code. 
    4. DO NOT create multi-file projects; keep it to one component or function.
    5. Avoid excessive comments.

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

export const getInterviewProblemPrompt: (tech: string) => string = (
  tech: string,
) => {
  const prompt = `
    Generate JSON file with 1 unique coding challenge for ${tech}.
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
