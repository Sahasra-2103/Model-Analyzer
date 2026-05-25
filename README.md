# Multimodal Document Analyzer

A full-stack SaaS application that intelligently analyzes uploaded documents and understands multiple content types. Powered by Grok AI, Node.js, Express, MongoDB, and React.

## Features

- **Multimodal File Upload**: Supports PDF, DOCX, TXT, PPT/PPTX, PNG, JPG, CSV, Excel, Scanned Documents.
- **AI Document Analysis**: Extracts text, generates summaries, keywords, insights, and recommendations.
- **Chat with Document**: Have a contextual conversation with your uploaded files.
- **Analytics & History**: Track processing history and view insights via the dashboard.
- **Dynamic Theming**: Premium Light/Dark mode via pure CSS variables.
- **Modular AI System**: Designed to easily swap out AI Providers (Grok, Gemini, Claude).

## Tech Stack

- **Frontend**: React, Vite, React Router DOM, Axios, Plain CSS.
- **Backend**: Node.js, Express, Multer, Mongoose, Tesseract.js, pdf-parse, mammoth.
- **Database**: MongoDB
- **AI**: Grok API

## Running Locally

1. Clone the repository and install dependencies:
   ```bash
   cd multimodal-document-analyzer
   cd server && npm install
   cd ../client && npm install
   ```

2. Configure environment variables. Rename `.env.example` to `.env` in the root (or `server`) folder and fill in:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   GROK_API_KEY=your_grok_api_key
   GROK_MODEL=grok-beta
   AI_PROVIDER=grok
   ```

3. Start the application (from root folder):
   ```bash
   npm install concurrently
   npm run dev
   ```

## Deployment

This project includes a `vercel.json` for easy deployment to Vercel. 
Ensure you set your environment variables in the Vercel dashboard.

**Important — Vercel Root Directory:** In [Vercel Project Settings → General → Root Directory](https://vercel.com/docs/deployments/configure-a-build#root-directory), leave the field **empty** (repository root). Do **not** set it to `client`. If Root Directory is `client`, install fails with `client/client/package.json` not found and the API (`api/index.js`) will not deploy.

On **Vercel**, image text extraction uses your **GROK_API_KEY** vision API instead of Tesseract (Groq: `meta-llama/llama-4-scout-17b-16e-instruct`, xAI: `grok-4.3`). Images must be under **3 MB** for Groq. Set `OCR_PROVIDER=vision` or `tesseract` to force one provider. Optional: `OCR_VISION_MODEL` to override the model name.

```bash
vercel --prod
```

If image upload fails with **OCR initialization timed out** after deploy, run `npm run download-tessdata` locally and commit `server/eng.traineddata`.
