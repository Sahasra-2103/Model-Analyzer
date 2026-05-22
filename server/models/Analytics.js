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
    type: Map,
    of: Number,
    default: {}
  },
  languageDistribution: {
    type: Map,
    of: Number,
    default: {}
  }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
