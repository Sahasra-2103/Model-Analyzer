const fs = require('fs');
const path = require('path');
const os = require('os');
const Tesseract = require('tesseract.js');

const DEFAULT_OCR_TIMEOUT_MS = process.env.VERCEL ? 55000 : 30000;
const OCR_TIMEOUT_MS = Number(process.env.OCR_TIMEOUT_MS || DEFAULT_OCR_TIMEOUT_MS);

const resolveLangPath = () => {
  const candidates = process.env.VERCEL
    ? [path.join(process.cwd(), 'server'), path.join(__dirname, '..')]
    : [path.join(__dirname, '..'), path.join(process.cwd(), 'server')];

  for (const dir of candidates) {
    const trainedData = path.join(dir, 'eng.traineddata');
    if (fs.existsSync(trainedData)) {
      return dir;
    }
  }

  return candidates[0];
};

const withTimeout = (promise, ms, message) => {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
};

exports.extractImageText = async (filePath) => {
  let worker;
  const langPath = resolveLangPath();
  const trainedDataPath = path.join(langPath, 'eng.traineddata');
  const cachePath = process.env.VERCEL ? os.tmpdir() : langPath;

  if (!fs.existsSync(trainedDataPath)) {
    throw new Error(
      'OCR language data (eng.traineddata) is missing. Run: npm run download-tessdata'
    );
  }

  try {
    worker = await withTimeout(
      Tesseract.createWorker('eng', 1, {
        langPath,
        cachePath,
        gzip: false,
        cacheMethod: process.env.VERCEL ? 'none' : 'read',
        logger: (message) => {
          if (message.status) {
            console.log(
              `OCR ${message.status}${message.progress ? ` ${Math.round(message.progress * 100)}%` : ''}`
            );
          }
        },
      }),
      OCR_TIMEOUT_MS,
      'OCR initialization timed out'
    );

    const result = await withTimeout(
      worker.recognize(filePath),
      OCR_TIMEOUT_MS,
      'OCR recognition timed out'
    );

    return result.data.text;
  } finally {
    if (worker) {
      await worker.terminate().catch((error) => {
        console.warn('Failed to terminate OCR worker:', error.message);
      });
    }
  }
};
