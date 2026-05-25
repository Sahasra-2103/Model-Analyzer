const visionOcr = require('./visionOcr');

let tesseractModule;
const loadTesseract = () => {
  if (!tesseractModule) {
    tesseractModule = require('./tesseractOcr');
  }
  return tesseractModule;
};

const useVisionFirst = () => {
  if (process.env.OCR_PROVIDER === 'vision') return true;
  if (process.env.OCR_PROVIDER === 'tesseract') return false;
  return Boolean(process.env.VERCEL);
};

exports.extractImageText = async (filePath, mimetype) => {
  if (useVisionFirst()) {
    return visionOcr.extractTextFromImage(filePath, mimetype);
  }

  try {
    return await loadTesseract().extractImageText(filePath);
  } catch (tesseractError) {
    console.warn('Tesseract OCR failed, falling back to vision API:', tesseractError.message);
    return visionOcr.extractTextFromImage(filePath, mimetype);
  }
};
