const axios = require('axios');
const promptService = require('./promptService');

const stripJsonFence = (value) => {
  return value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
};

const getGrokResponse = async (prompt, systemMessage = "") => {
  try {
    const apiKey = process.env.GROK_API_KEY;
    
    // Fallback mock response if no API key provided (to avoid crashing in local dev without real keys)
    if (!apiKey || apiKey === 'your_grok_api_key') {
      console.warn("Using mock Grok response because API key is missing or invalid");
      return "Mock AI Response: Please configure a valid GROK_API_KEY in your .env file.";
    }

    const isGroq = apiKey.startsWith('gsk_');
    const apiUrl = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.x.ai/v1/chat/completions';
    const defaultModel = isGroq ? 'llama-3.3-70b-versatile' : 'grok-beta';

    const response = await axios.post(
      apiUrl,
      {
        model: process.env.GROK_MODEL || defaultModel,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1800,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Grok API Error:', error?.response?.data || error.message);
    // Graceful fallback for demo purposes
    return `Error communicating with AI API: ${error.message}`;
  }
};

exports.analyzeDocument = async (text) => {
  const systemPrompt = promptService.getSystemPrompt();
  
  // Create a structured prompt that requests JSON output
  const prompt = `
  Analyze the following document content.
  Return a strictly valid JSON object with these keys: 
  "summary" (string), "keywords" (array of short individual terms/words only, max 2-3 words per keyword), "sentiment" (string: Positive/Neutral/Negative), 
  "category" (string), "language" (string), "recommendations" (array of strings).

  Return only raw JSON. Do not wrap the response in Markdown, code fences, or a \`\`\`json block.

  Summary requirements:
  - Write a medium-length, document-grounded summary of 120-180 words when enough content is available.
  - Cover the document's main purpose, key topics, important facts, and conclusions.
  - Use 1-2 cohesive paragraphs inside the summary string.
  - Do not make the summary too brief unless the document itself has very little extracted content.
  - Do not add information that is not supported by the document content.
  
  IMPORTANT: Keywords must be individual elements (single words or short 2-3 word phrases), NOT sentences.
  Example keywords: ["machine learning", "data analysis", "automation"] NOT ["The document discusses machine learning concepts"]
  
  Document Content:
  ${text.substring(0, 15000)} // Limiting size for API constraints
  `;

  const rawResponse = await getGrokResponse(prompt, systemPrompt);
  const cleanedResponse = stripJsonFence(rawResponse);
  
  try {
    // Attempt to extract JSON from the response
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found in response');
  } catch (e) {
    console.warn("Failed to parse AI response as JSON. Returning default structure.", e);
    return {
      summary: cleanedResponse,
      keywords: ["analysis", "document"],
      sentiment: "Neutral",
      category: "Uncategorized",
      language: "Unknown",
      recommendations: ["Ensure API key is valid", "Check document length"]
    };
  }
};

exports.chatWithDocument = async (documentContent, message, history) => {
  const systemPrompt = promptService.getSystemPrompt() + 
    "\nYou are answering a user's question based strictly on the provided document context. If the answer is not in the document, state that.";
  
  // Format history
  let historyText = history.map(h => `User: ${h.message}\nAI: ${h.response}`).join('\n');
  
  const prompt = `
  Document Context:
  ${documentContent.substring(0, 10000)}
  
  Past Conversation:
  ${historyText}
  
  User Question: ${message}
  `;

  return await getGrokResponse(prompt, systemPrompt);
};
