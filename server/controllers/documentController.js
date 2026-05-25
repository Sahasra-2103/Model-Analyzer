const Document = require('../models/Document');
const Analysis = require('../models/Analysis');
const Analytics = require('../models/Analytics');
const fileParser = require('../services/fileParser');
const aiProvider = require('../services/ai/aiProvider');
const { getFileTypeKey } = require('../utils/fileTypeKey');
const fs = require('fs');

exports.uploadDocuments = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const processedDocs = [];

    for (const file of req.files) {
      // Parse file content
      const parsedData = await fileParser.parseFile(file);
      if (parsedData.error) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(422).json({ success: false, error: parsedData.error });
      }
      
      // Save document
      const doc = await Document.create({
        fileName: file.originalname,
        fileType: file.mimetype,
        extractedContent: parsedData.text || 'No text extracted'
      });
      
      processedDocs.push(doc);

      // Clean up uploaded file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    res.status(200).json({ success: true, data: processedDocs });
  } catch (err) {
    next(err);
  }
};

exports.analyzeDocument = async (req, res, next) => {
  try {
    const { documentId } = req.body;
    
    if (!documentId) {
      return res.status(400).json({ success: false, error: 'Document ID required' });
    }

    const doc = await Document.findById(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Call AI Provider to analyze the document
    const analysisResult = await aiProvider.analyze(doc.extractedContent);

    // Save Analysis
    const analysis = await Analysis.create({
      documentId: doc._id,
      ...analysisResult
    });
    
    // Update Analytics
    let analytics = await Analytics.findOne();
    if (!analytics) {
      analytics = new Analytics();
    }
    
    analytics.totalDocuments += 1;
    const typeKey = getFileTypeKey(doc.fileType, doc.fileName);
    analytics.documentTypes[typeKey] = (analytics.documentTypes[typeKey] || 0) + 1;
    if (analysis.language) {
      const langKey = String(analysis.language).replace(/\./g, '_');
      analytics.languageDistribution[langKey] = (analytics.languageDistribution[langKey] || 0) + 1;
    }
    analytics.markModified('documentTypes');
    analytics.markModified('languageDistribution');
    await analytics.save();

    res.status(200).json({ success: true, data: analysis });
  } catch (err) {
    next(err);
  }
};

exports.getHistory = async (req, res, next) => {
  try {
    const documents = await Document.find().sort({ uploadedAt: -1 }).lean();
    const history = [];

    for (const doc of documents) {
      const analysis = await Analysis.findOne({ documentId: doc._id }).lean();
      history.push({
        ...doc,
        analysis: analysis || null
      });
    }

    res.status(200).json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    await Document.findByIdAndDelete(req.params.id);
    await Analysis.deleteMany({ documentId: req.params.id });
    
    // You could optionally delete chat history as well.

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
