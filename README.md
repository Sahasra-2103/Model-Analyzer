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

```bash
vercel --prod
```
