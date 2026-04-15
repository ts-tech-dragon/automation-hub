export const MOCK_QA_RESPONSE = {
  tech: "React.js",
  questions: [
    {
      q: "What is the difference between 'useLayoutEffect' and 'useEffect'?",
      a: "useEffect runs asynchronously after the render is committed to the screen. useLayoutEffect runs synchronously after all DOM mutations but before the browser has a chance to paint. Use useLayoutEffect only when you need to measure DOM nodes or prevent flickering.",
    },
    {
      q: "How does React's Reconciliation algorithm work?",
      a: "React uses a 'Diffing' algorithm with O(n) complexity. It assumes that two elements of different types will produce different trees and that developers can hint at stable elements across renders using the 'key' prop.",
    },
    // ... add more as needed
  ],
};

export const MOCK_PROBLEM_RESPONSE = {
  title: "Array Flattening (Deep)",
  problem:
    "Write a function that flattens a nested array of any depth without using Array.prototype.flat().",
  starterCode:
    "function flatten(arr) {\n  // Your code here\n}\n\nconsole.log(flatten([1, [2, [3, [4]], 5]]));",
  solution:
    "function flatten(arr) {\n  return arr.reduce((acc, val) => \n    Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []);\n}",
};
