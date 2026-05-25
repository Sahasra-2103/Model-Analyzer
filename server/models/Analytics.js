const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  totalDocuments: {
    type: Number,
    default: 0
  },
  averageProcessingTime: {
    type: Number,
    default: 0
  },
  documentTypes: {
    type: Object,
    default: {}
  },
  languageDistribution: {
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
