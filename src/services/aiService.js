const { aiProvider } = require("../config/env");
const logger = require("../utils/logger");

const generateMockSuggestion = (text) => {
  return `AI Suggestion: Consider a phased MVP for "${text}", define success metrics, and validate user demand with a small experiment.`;
};

const generateIdeaSuggestion = async (text) => {
  if (aiProvider === "mock") {
    return generateMockSuggestion(text);
  }

  // Placeholder for real provider integration. Kept modular for easy swaps.
  logger.warn({ aiProvider }, "Unknown/unsupported AI provider configured; using mock fallback");
  return generateMockSuggestion(text);
};

module.exports = { generateIdeaSuggestion };
