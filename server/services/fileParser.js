const fs = require('fs');
const path = require('path');
const os = require('os');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

const DEFAULT_OCR_TIMEOUT_MS = process.env.VERCEL ? 55000 : 30000;
const OCR_TIMEOUT_MS = Number(process.env.OCR_TIMEOUT_MS || DEFAULT_OCR_TIMEOUT_MS);

const resolveLangPath = () => {
  const candidates = process.env.VERCEL
    ? [
        path.join(process.cwd(), 'server'),
        path.join(__dirname, '..'),
      ]
    : [
        path.join(__dirname, '..'),
        path.join(process.cwd(), 'server'),
      ];

  for (const dir of candidates) {
    const trainedData = path.join(dir, 'eng.traineddata');
    if (fs.existsSync(trainedData)) {
      return dir;
    }
  }

  console.warn(
    'eng.traineddata not found; checked:',
    candidates.map((d) => path.join(d, 'eng.traineddata'))
  );
  return candidates[0];
};

const withTimeout = (promise, ms, message) => {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
};

const extractImageText = async (filePath) => {
  let worker;
  const langPath = resolveLangPath();
  const trainedDataPath = path.join(langPath, 'eng.traineddata');
  const cachePath = process.env.VERCEL ? os.tmpdir() : langPath;

  if (!fs.existsSync(trainedDataPath)) {
    throw new Error(
      'OCR language data (eng.traineddata) is missing. Run: node scripts/download-tessdata.js'
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
            console.log(`OCR ${message.status}${message.progress ? ` ${Math.round(message.progress * 100)}%` : ''}`);
          }
        }
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

exports.parseFile = async (file) => {
  const filePath = file.path;
  const ext = path.extname(file.originalname).toLowerCase();
  let extractedText = '';

  try {
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
    } else if (ext === '.txt' || ext === '.csv') {
      extractedText = fs.readFileSync(filePath, 'utf8');
    } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      extractedText = await extractImageText(filePath);
    } else {
      // Fallback for PPTX, EXCEL etc, basic string parsing or unsupported message
      // Note: A full robust solution would use additional libraries for Excel/PPTX.
      // We will attempt basic read or return warning.
      extractedText = `File format ${ext} successfully uploaded. Complex parsing for this specific format may be limited in the base version.`;
    }
  } catch (error) {
    console.error(`Error parsing file ${file.originalname}:`, error);
    return { text: '', error: `Could not extract text from ${file.originalname}: ${error.message}` };
  }

  return { text: extractedText };
};
