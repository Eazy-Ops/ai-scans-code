const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const geminiGenerateResponse = async (fileContent, severityLevel) => {
  const gemini_api_key = process.env.GeminiAPIKey;
  console.log("Severity Level:", severityLevel);

  const googleAI = new GoogleGenerativeAI(gemini_api_key);

  const geminiConfig = {
    model: "gemini-1.5-flash",
  };
  const geminiModel = googleAI.getGenerativeModel(geminiConfig);

  try {
    const promptConfig = [
      {
        text: `You are a helpful AI assistant.
                   You are proficient in data and code security.
                   Don't make assumptions about the code or data.
                   You should only point on those issues that are completely within the code, and only those issues can fail the decicion, 
                   if the potential problem is an assumption, this shoul not be the reason to not pass the test
                   The response should be as plain text, don't use Markdown or any other formatting.
                   Use the following severity level guidelines for your analysis:
                        - Critical: Critical issues that require immediate attention.
                        - High: Very important issues that must be fixed as soon as possible.
                        - Medium: Important issues that should be addressed soon.
                        - Low: Minor issues that can be fixed in the future.
                   Consider the severity level for issues as ${severityLevel}.
                   If the issues are lower than the severity selected, the decision should be passed, and only if the issues are higher, the decision should be failed.
                   Provide your response in the following format:
                   1. Summary of the analysis
                   2. Identified issues
                   3. Recommendations
                   4. Decision (Pass/Fail) based on severity level, should be short and in the format: Decision: Pass/Fail.
                   
                   This is the code that was sent to you for a security check: ${fileContent}`,
      },
    ];

    const timeStart = new Date().getTime();

    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: promptConfig }],
      generationConfig: {
        temperature: 0.3,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
    });
    const response = await result.response;
    const timeEnd = new Date().getTime();
    const timeTaken = timeEnd - timeStart;

    return {
      data: await response.text(),
      timeTaken,
    };
  } catch (error) {
    console.log("response error", error);
    throw error;
  }
};

module.exports = {
  geminiGenerateResponse,
};