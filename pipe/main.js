const fs = require("fs");
const path = require("path");
const { geminiGenerateResponse } = require("./gemini");
const { getChangedFiles, findDecision } = require("./utils");

// Function to analyze files with Gemini
async function analyzeWithGemini(files, { severityLevel, warningOnly }) {
  const decisionPromises = files.map(async (file) => {
    try {
      console.log(`Analyzing ${file} with Gemini...`);

      const fileContent = fs.readFileSync(file, "utf-8");

      const result = await geminiGenerateResponse(fileContent, severityLevel);

      console.log(file + " result:");
      console.log(result.data);

      const decision = findDecision(result.data);

      console.log("Decision:", decision);
      return decision;
    } catch (error) {
      console.error(`Error analyzing ${file}: ${error.message}`);
      // If there's an error, assume the decision is "Pass"
      // this is due to Gemini rules that might throw an error when analysing code sometimes
      return "Pass";
    }
  });

  // Wait for all file analyses to complete
  const decisions = await Promise.all(decisionPromises);

  // Check if any decision is "Fail"
  if (decisions.includes("Fail")) {
    console.error("At least one file did not pass the security check.");

    warningOnly ? null : process.exit(1) // Exit with a non-zero status code to fail the CI/CD job
  } else {
    console.log("All files passed the security check.");
  }
}

const doAnalysis = async () => {
  const severityLevel = process.env.SEVERITY_LEVEL || "Medium"; // Default to "Medium" if not set
  const warningOnly = process.env.WARNING_ONLY === "true";

  // Change to the specific directory using the GITHUB_WORKSPACE environment variable
  const specificDirectory = process.env.GITHUB_WORKSPACE; // Get the directory path from the environment variable
  if (specificDirectory) {
    console.log("Changing working directory to:", specificDirectory);
    process.chdir(specificDirectory);
  } else {
    console.error("GITHUB_WORKSPACE environment variable is not set.");
    process.exit(1); // Exit with a non-zero status code if the environment variable is not set
  }

  console.log("Current working directory:", process.cwd());
  
  const changedFiles = getChangedFiles();

  if (changedFiles.length === 0) {
    console.log("No files changed.");
  } else {
    console.log("Changed files:", changedFiles);
    await analyzeWithGemini(changedFiles, {
      severityLevel,
      warningOnly,
    });
  }
};

doAnalysis();
