const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  extractedContent: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Document', documentSchema);
