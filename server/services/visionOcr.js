const fs = require('fs');
const path = require('path');
const axios = require('axios');

const AI_REQUEST_TIMEOUT_MS = Number(process.env.AI_REQUEST_TIMEOUT_MS || 45000);
const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const XAI_VISION_MODEL = 'grok-4.3';
const GROQ_BASE64_MAX_BYTES = 4 * 1024 * 1024;

const OCR_PROMPT =
  'Extract all readable text from this image. Return only the extracted text, preserving line breaks where appropriate. If there is no text, respond with an empty string.';

const formatApiError = (error) => {
  const data = error.response?.data;
  if (data?.error?.message) return data.error.message;
  if (typeof data?.error === 'string') return data.error;
  if (data?.message) return data.message;
  return error.message;
};

const normalizeMimeType = (mimetype, filePath) => {
  if (mimetype === 'image/jpg') return 'image/jpeg';
  if (mimetype && mimetype.startsWith('image/')) return mimetype;
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  return 'image/jpeg';
};

const toDataUrl = (filePath, mimetype) => {
  const stat = fs.statSync(filePath);
  if (stat.size > GROQ_BASE64_MAX_BYTES) {
    throw new Error(
      `Image is too large for OCR (${(stat.size / 1024 / 1024).toFixed(1)} MB). Please use an image under 3 MB.`
    );
  }

  const buffer = fs.readFileSync(filePath);
  const type = normalizeMimeType(mimetype, filePath);
  return `data:${type};base64,${buffer.toString('base64')}`;
};

const parseXaiResponse = (data) => {
  const msg = data.output?.find((item) => item.type === 'message');
  const textBlock = msg?.content?.find((item) => item.type === 'output_text');
  return (textBlock?.text || data.output_text || '').trim();
};

const getVisionConfig = () => {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey || apiKey === 'your_grok_api_key') {
    return null;
  }

  const isGroq = apiKey.startsWith('gsk_');
  return {
    isGroq,
    apiKey,
    model:
      process.env.OCR_VISION_MODEL || (isGroq ? GROQ_VISION_MODEL : XAI_VISION_MODEL),
  };
};

const extractViaGroq = async (apiKey, model, dataUrl) => {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: OCR_PROMPT },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0,
      max_completion_tokens: 4096,
    },
    {
      timeout: AI_REQUEST_TIMEOUT_MS,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return (response.data.choices[0].message.content || '').trim();
};

const extractViaXai = async (apiKey, model, dataUrl) => {
  const response = await axios.post(
    'https://api.x.ai/v1/responses',
    {
      model,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_image', image_url: dataUrl, detail: 'high' },
            { type: 'input_text', text: OCR_PROMPT },
          ],
        },
      ],
    },
    {
      timeout: AI_REQUEST_TIMEOUT_MS,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return parseXaiResponse(response.data);
};

exports.extractTextFromImage = async (filePath, mimetype) => {
  const config = getVisionConfig();
  if (!config) {
    throw new Error(
      'Image OCR requires GROK_API_KEY (Groq or xAI with vision). Add it in Vercel environment variables.'
    );
  }

  const dataUrl = toDataUrl(filePath, mimetype);

  try {
    if (config.isGroq) {
      return await extractViaGroq(config.apiKey, config.model, dataUrl);
    }
    return await extractViaXai(config.apiKey, config.model, dataUrl);
  } catch (error) {
    const detail = formatApiError(error);
    console.error('Vision OCR API error:', error.response?.data || detail);
    throw new Error(detail);
  }
};
