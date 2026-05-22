const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

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
      // Use OCR for images
      const worker = await Tesseract.createWorker('eng');
      const ret = await worker.recognize(filePath);
      extractedText = ret.data.text;
      await worker.terminate();
    } else {
      // Fallback for PPTX, EXCEL etc, basic string parsing or unsupported message
      // Note: A full robust solution would use additional libraries for Excel/PPTX.
      // We will attempt basic read or return warning.
      extractedText = `File format ${ext} successfully uploaded. Complex parsing for this specific format may be limited in the base version.`;
    }
  } catch (error) {
    console.error(`Error parsing file ${file.originalname}:`, error);
    extractedText = `Error parsing file: ${error.message}`;
  }

  return { text: extractedText };
};
