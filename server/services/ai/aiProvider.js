const grokService = require('./grokService');

// This acts as a wrapper. Can be extended to support Gemini, Claude, etc.
exports.analyze = async (text) => {
  const provider = process.env.AI_PROVIDER || 'grok';
  
  if (provider === 'grok') {
    return await grokService.analyzeDocument(text);
  }
  
  throw new Error(`AI Provider ${provider} not supported`);
};

exports.chat = async (documentContent, message, history) => {
  const provider = process.env.AI_PROVIDER || 'grok';

  if (provider === 'grok') {
    return await grokService.chatWithDocument(documentContent, message, history);
  }

  throw new Error(`AI Provider ${provider} not supported`);
};
