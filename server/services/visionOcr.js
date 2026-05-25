const fs = require('fs');
const path = require('path');
const axios = require('axios');

const AI_REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS || 45000);

const getVisionConfig = () => {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey || apiKey === 'your_grok_api_key') {
    return null;
  }

  const isGroq = apiKey.startsWith('gsk_');
  return {
    apiKey,
    apiUrl: isGroq
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://api.x.ai/v1/chat/completions',
    model: process.env.OCR_VISION_MODEL
      || (isGroq ? 'llama-3.2-11b-vision-preview' : 'grok-2-vision-1212'),
  };
};

const toDataUrl = (filePath, mimetype) => {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const type =
    mimetype ||
    (ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/jpeg');
  return `data:${type};base64,${buffer.toString('base64')}`;
};

exports.extractTextFromImage = async (filePath, mimetype) => {
  const config = getVisionConfig();
  if (!config) {
    throw new Error(
      'Image OCR requires GROK_API_KEY (Groq or xAI with vision). Add it in Vercel environment variables.'
    );
  }

  const dataUrl = toDataUrl(filePath, mimetype);

  const response = await axios.post(
    config.apiUrl,
    {
      model: config.model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                'Extract all readable text from this image. Return only the extracted text, preserving line breaks where appropriate. If there is no text, respond with an empty string.',
            },
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 4000,
    },
    {
      timeout: AI_REQUEST_TIMEOUT_MS,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return (response.data.choices[0].message.content || '').trim();
};
