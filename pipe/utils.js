const { execSync } = require("child_process");

const getChangedFiles = () => {
  console.log("Current working directory in getChangedFiles:", process.cwd());

  // Check if the directory is a Git repository
  console.log("Checking if the directory is a Git repository:");
  try {
    execSync("git rev-parse --is-inside-work-tree");
    console.log("This is a Git repository.");
  } catch (error) {
    console.error("This is not a Git repository:", error.message);
    return [];
  }

  // Run 'git status' command
  console.log("Running 'git status':");
  try {
    const gitStatusResult = execSync("git status").toString();
    console.log(gitStatusResult);
  } catch (error) {
    console.error("Error running 'git status':", error.message);
  }

  // Get changed files
  try {
    const isDetached = execSync("git symbolic-ref --short -q HEAD || echo detached").toString().trim();
    if (isDetached === "detached") {
      console.warn("Detached HEAD state detected. Listing all files in the working directory.");
      const allFiles = execSync("git ls-files")
        .toString()
        .trim()
        .split("\n")
        .filter((file) => file.length > 0);
      return allFiles;
    }

    const result = execSync("git diff --name-only HEAD~1 HEAD").toString();
    return result.split("\n").filter((file) => file.length > 0);
  } catch (error) {
    console.error("Error getting changed files with 'git diff':", error.message);
    return [];
  }
};

const findDecision = (responseText) => {
  const decisionMatch = responseText.match(/Decision:\s*(Pass|Fail)/i);
  if (decisionMatch && decisionMatch[1]) {
    if (decisionMatch[1].toLowerCase() === "pass") {
      return "Pass";
    } else if (decisionMatch[1].toLowerCase() === "fail") {
      return "Fail";
    }
  }
  return null;
};

module.exports = {
  getChangedFiles,
  findDecision,
};
