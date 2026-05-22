const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  summary: {
    type: String
  },
  keywords: {
    type: [String]
  },
  sentiment: {
    type: String
  },
  category: {
    type: String
  },
  language: {
    type: String
  },
  recommendations: {
    type: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analysis', analysisSchema);
