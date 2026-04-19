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
        { "q": "Concise Question?", "a": "Concise technical answer." },
        { "q": "Concise Question?", "a": "Concise technical answer." }
      ]
    }
    NOTE:
    Return COMPLETE JSON.
    Do not truncate.
    Ensure all questions have answers.
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

export const getSmallInterviewProblemPrompt = () => {
  const prompt = `
    Generate a JSON result for this below query
    Act as a JavaScript coding tutor. Generate a unique 'Simple' to 'Easy' difficulty JavaScript coding challenge.
The response must follow this strict structure:

title: A short name for the problem.
Description: Explain the logic/math behind the problem (e.g., explaining what a Prime number or Factorial is).
Constraints: Mention any edge cases to handle (e.g., negative numbers, empty strings).
Solution: Provide a clean, commented JavaScript function.
Test Cases: Provide 3 console.log() examples.
Rules: > - Do not repeat common problems like 'Hello World'.

Focus on: Arrays, Strings, Basic Math, or Loops.
Keep the explanation concise and the code modern (ES6+).

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
