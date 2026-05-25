const Analytics = require('../models/Analytics');

const toPlainCounts = (value) => {
  if (!value) return {};
  if (value instanceof Map) {
    return Object.fromEntries(value);
  }
  return typeof value === 'object' ? { ...value } : {};
};

exports.getAnalytics = async (req, res, next) => {
  try {
    let analytics = await Analytics.findOne().lean();
    if (!analytics) {
      analytics = {
        totalDocuments: 0,
        averageProcessingTime: 0,
        documentTypes: {},
        languageDistribution: {}
      };
    } else {
      analytics.documentTypes = toPlainCounts(analytics.documentTypes);
      analytics.languageDistribution = toPlainCounts(analytics.languageDistribution);
    }

    res.status(200).json({ success: true, data: analytics });
  } catch (err) {
    next(err);
  }
};
