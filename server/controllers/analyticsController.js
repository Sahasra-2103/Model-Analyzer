const Analytics = require('../models/Analytics');

exports.getAnalytics = async (req, res, next) => {
  try {
    let analytics = await Analytics.findOne();
    if (!analytics) {
      analytics = {
        totalDocuments: 0,
        averageProcessingTime: 0,
        documentTypes: {},
        languageDistribution: {}
      };
    }

    res.status(200).json({ success: true, data: analytics });
  } catch (err) {
    next(err);
  }
};
