import runApplyShine from "./apply.js";

const runShineEngine = async () => {
  try {
    await runApplyShine("");
  } catch (error) {
    console.log("runShineEngine error : ", (error as Error).message);
  }
};

runShineEngine();
