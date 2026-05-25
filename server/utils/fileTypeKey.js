const path = require('path');

const MIME_TO_LABEL = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/msword': 'doc',
  'text/plain': 'txt',
  'text/csv': 'csv',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
};

/** Safe key for analytics storage (Mongoose Maps reject keys containing ".") */
exports.getFileTypeKey = (mimetype, fileName = '') => {
  if (mimetype && MIME_TO_LABEL[mimetype]) {
    return MIME_TO_LABEL[mimetype];
  }
  const ext = path.extname(fileName).toLowerCase().replace(/^\./, '');
  if (ext) {
    return ext;
  }
  return (mimetype || 'unknown').replace(/\./g, '_');
};
