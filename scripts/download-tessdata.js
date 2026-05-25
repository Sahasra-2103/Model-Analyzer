/**
 * Downloads eng.traineddata for offline OCR (required on Vercel serverless).
 * Run automatically via postinstall, or: node scripts/download-tessdata.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO_ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(REPO_ROOT, 'server');
const OUT_FILE = path.join(OUT_DIR, 'eng.traineddata');
const ROOT_COPY = path.join(REPO_ROOT, 'eng.traineddata');
// Tesseract.js 4.x LSTM English model (uncompressed for gzip: false in fileParser)
const DOWNLOAD_URL =
  'https://cdn.jsdelivr.net/gh/naptha/tessdata@gh-pages/4.0.0/eng.traineddata.gz';

const download = (url, dest) =>
  new Promise((resolve, reject) => {
    const request = (currentUrl) => {
      https
        .get(currentUrl, (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            request(res.headers.location);
            return;
          }
          if (res.statusCode !== 200) {
            reject(new Error(`Download failed: HTTP ${res.statusCode}`));
            return;
          }
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        })
        .on('error', reject);
    };
    request(url);
  });

const gunzip = (buffer) => {
  const zlib = require('zlib');
  return zlib.gunzipSync(buffer);
};

const main = async () => {
  if (fs.existsSync(OUT_FILE) && fs.statSync(OUT_FILE).size > 1_000_000) {
    console.log('server/eng.traineddata already present, skipping download');
    return;
  }

  if (fs.existsSync(ROOT_COPY) && fs.statSync(ROOT_COPY).size > 1_000_000) {
    if (!fs.existsSync(OUT_DIR)) {
      fs.mkdirSync(OUT_DIR, { recursive: true });
    }
    fs.copyFileSync(ROOT_COPY, OUT_FILE);
    console.log('Copied eng.traineddata from repo root to server/');
    return;
  }

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('Downloading eng.traineddata for OCR...');
  const gzipped = await download(DOWNLOAD_URL);
  const data = gunzip(gzipped);
  fs.writeFileSync(OUT_FILE, data);
  console.log(`Saved ${OUT_FILE} (${(data.length / 1024 / 1024).toFixed(2)} MB)`);
};

main().catch((err) => {
  console.error('Failed to download tessdata:', err.message);
  process.exit(1);
});
