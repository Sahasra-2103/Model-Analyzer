const Document = require('../models/Document');
const ChatHistory = require('../models/ChatHistory');
const aiProvider = require('../services/ai/aiProvider');

exports.chatWithDocument = async (req, res, next) => {
  try {
    const { documentId, message } = req.body;

    if (!documentId || !message) {
      return res.status(400).json({ success: false, error: 'Document ID and message are required' });
    }

    const doc = await Document.findById(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }

    // Retrieve previous chat history for context
    const pastChats = await ChatHistory.find({ documentId }).sort({ createdAt: 1 }).limit(10);
    
    // Let AI handle the query using document context
    const responseText = await aiProvider.chat(doc.extractedContent, message, pastChats);

    // Save the new chat interaction
    const newChat = await ChatHistory.create({
      documentId: doc._id,
      message,
      response: responseText
    });

    res.status(200).json({ success: true, data: newChat });
  } catch (err) {
    next(err);
  }
};
