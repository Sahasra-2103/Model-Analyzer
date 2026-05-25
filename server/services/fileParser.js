const fs = require('fs');
const path = require('path');
const os = require('os');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

const OCR_TIMEOUT_MS = Number(process.env.OCR_TIMEOUT_MS || 30000);

const withTimeout = (promise, ms, message) => {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
};

const extractImageText = async (filePath) => {
  let worker;
  const langPath = path.join(__dirname, '..');
  const cachePath = process.env.VERCEL ? os.tmpdir() : path.join(__dirname, '..');

  try {
    worker = await withTimeout(
      Tesseract.createWorker('eng', 1, {
        langPath,
        cachePath,
        gzip: false,
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
