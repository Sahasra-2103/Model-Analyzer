const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const imageTextExtractor = require('./imageTextExtractor');

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
      extractedText = await imageTextExtractor.extractImageText(filePath, file.mimetype);
    } else {
      extractedText = `File format ${ext} successfully uploaded. Complex parsing for this specific format may be limited in the base version.`;
    }
  } catch (error) {
    console.error(`Error parsing file ${file.originalname}:`, error);
    return { text: '', error: `Could not extract text from ${file.originalname}: ${error.message}` };
  }

  return { text: extractedText };
};
