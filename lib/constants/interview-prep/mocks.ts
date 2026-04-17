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

export const MOCK_BROKEN_RESPONESE = {
  text: `{
  "tech": "React.js",
  "questions": [
    {
      "q": "You need to prevent a component from re-rendering when its parent updates. How do you implement this using a higher-order component?",
      "a": "const MemoizedComponent = React.memo(MyComponent);"
    },
    {
      "q": "What happens if you call a Hook inside a standard JavaScript loop or conditional? Explain the requirement for Hook call order.",
      "a": "React will throw an error because it relies on the call order to map state to the correct Hook. Always call Hooks at the top level."
    },
    {
      "q": "You need`,
};

export const MOCK_PROPER_RESPONSE_OBJ = {
  tech: "Node.js (Backend)",
  questions: [
    {
      q: "What happens if you use a global variable for caching in a high-traffic app? Write a function that uses a Map with a size limit to prevent memory leaks.",
      a: "const cache = new Map(); function addToCache(k, v) { if (cache.size > 100) cache.delete(cache.keys().next().value); cache.set(k, v); }",
    },
    {
      q: "What happens if you perform heavy CPU work in the main event loop? Implement a solution using setImmediate to allow the loop to process other events between iterations.",
      a: "function heavyTask(n) { if (n <= 0) return; doWork(); setImmediate(() => heavyTask(n - 1)); }",
    },
    {
      q: "What happens if a readable stream is faster than a writable stream? Write a snippet that uses the pipe method to automatically handle backpressure.",
      a: 'const fs = require("fs"); const src = fs.createReadStream("big.file"); const dest = fs.createWriteStream("out.file"); src.pipe(dest);',
    },
    {
      q: "What happens if an asynchronous error is thrown inside a callback? Implement a function that wraps a callback-based API in a Promise to handle errors with try-catch.",
      a: "const wrapper = () => new Promise((resolve, reject) => { legacyApi((err, data) => err ? reject(err) : resolve(data)); });",
    },
    {
      q: "What happens if you have too many listeners on an EventEmitter? Write code to increase the limit for a specific emitter instance to avoid warnings.",
      a: 'const EventEmitter = require("events"); const myEmitter = new EventEmitter(); myEmitter.setMaxListeners(50);',
    },
    {
      q: "What happens if you do not handle the unhandledRejection event? Create a global listener that logs the error and exits the process safely.",
      a: 'process.on("unhandledRejection", (reason, promise) => { console.error("Unhandled Rejection at:", promise, "reason:", reason); process.exit(1); });',
    },
    {
      q: "What happens if multiple processes try to listen on the same port? Use the cluster module to share a single port across multiple worker processes.",
      a: 'const cluster = require("cluster"); if (cluster.isPrimary) { cluster.fork(); cluster.fork(); } else { require("http").createServer().listen(8080); }',
    },
    {
      q: "What happens if you use sync file methods in a web server? Rewrite a synchronous readFileSync call to use the asynchronous fs.promises API.",
      a: 'const fs = require("fs").promises; async function getData(path) { try { return await fs.readFile(path, "utf8"); } catch (e) { return null; } }',
    },
    {
      q: "What happens if a child process becomes a zombie? Write a script that spawns a child and ensures it is killed when the parent exits.",
      a: 'const { spawn } = require("child_process"); const child = spawn("node", ["worker.js"]); process.on("exit", () => child.kill());',
    },
    {
      q: "What happens if you use process.nextTick for recursive calls? Implement a recursive function using setImmediate to prevent I/O starvation.",
      a: "function safeRecursive() { setImmediate(() => safeRecursive()); } safeRecursive();",
    },
  ],
};
