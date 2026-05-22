const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const chatController = require('../controllers/chatController');
const analyticsController = require('../controllers/analyticsController');
const upload = require('../middleware/upload');

// Document Routes
router.post('/upload', upload.array('files', 10), documentController.uploadDocuments);
router.post('/analyze', documentController.analyzeDocument);
router.delete('/document/:id', documentController.deleteDocument);
router.get('/history', documentController.getHistory);

// Chat Routes
router.post('/chat', chatController.chatWithDocument);

// Analytics Route
router.get('/analytics', analyticsController.getAnalytics);

module.exports = router;
