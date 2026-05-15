import { analyzeProductImage, askAssistant } from '../utils/gemini.js';

const getAIErrorMessage = (error) => {
  const status =
    error?.response?.status ||
    error?.status ||
    error?.statusCode ||
    error?.response?.statusCode;
  const message = error?.message?.toString?.().toLowerCase() ?? '';

  if (status === 429 || message.includes('rate limit') || message.includes('quota')) {
    return 'AI usage limit reached. Please try again later.';
  }

  if (
    status === 401 ||
    status === 403 ||
    message.includes('unauth') ||
    message.includes('authentication') ||
    message.includes('invalid api key') ||
    message.includes('permission')
  ) {
    return 'AI authentication failed.';
  }

  return 'AI service temporarily unavailable.';
};


export const handleAnalyzeImage = async (req, res) => {

  try {

    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({
        message: "Filename is required"
      });
    }

    const result = await analyzeProductImage(
      filename
    );

    res.json(result);

  } catch (error) {

    console.error(
      'AI analyze error:',
      error
    );

    const message = getAIErrorMessage(error);

    res.status(500).json({
      message
    });
  }
};



export const handleAskQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    const result = await askAssistant(question);
    res.json({ response: result });
  } catch (error) {
    console.error('AI chat error:', error);
    const message = getAIErrorMessage(error);
    res.status(500).json({ message });
  }
};
