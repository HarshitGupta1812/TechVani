# TechVani

TechVani is an AI-powered localized learning engine designed to break down language barriers in education. It allows users to ingest educational content from YouTube videos or various document formats and generates comprehensive, easy-to-understand summaries translated into any of 22 Indian languages. Users can choose to receive these summaries as text or listen to them via high-quality Neural Text-to-Speech (TTS).

## Features

- **YouTube Video Processing**: Extract content directly from YouTube without downloading heavy audio files. TechVani fetches transcripts directly and uses AI to summarize and translate the video content.
- **Document Processing**: Upload your study materials in PDF, DOC, DOCX, or TXT formats. The platform extracts the text, summarizes it based on a given subject, and translates it.
- **Multi-Language Support**: Choose from 22 supported Indian languages including Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati, Kannada, Malayalam, Odia, Punjabi, Assamese, Maithili, Sanskrit, Urdu, Sindhi, Dogri, Konkani, Manipuri, Bodo, Santali, Kashmiri, and Nepali.
- **Neural Text-to-Speech (TTS)**: Listen to your translated summaries! TechVani uses Microsoft Edge Neural Voices (`edge-tts`) to generate natural-sounding audio for the translated content.
- **Interactive AI Tutor Chat**: A built-in Gemini-powered assistant allows users to ask follow-up questions, clarify doubts, and interact with the platform seamlessly.
- **Secure Authentication System**: JWT-based authentication featuring OTP email verification for signup and password resets.
- **History Tracking**: Keep track of your previously processed documents and videos for quick review.

## Technology Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS, Framer Motion for animations
- **Icons**: Lucide React, React Icons
- **Real-time**: Socket.io-client
- **File Handling**: React Dropzone

### Backend
- **Server**: Node.js with Express
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JWT, bcryptjs, express-rate-limit
- **Real-time**: Socket.io
- **AI Integration**: LangChain Google GenAI (`@langchain/google-genai`) powered by Gemini 2.5 Flash
- **Content Parsing**: `youtube-transcript`, `pdf-parse`, `pdf2json`, `mammoth` (for DOCX)
- **Text-to-Speech**: Python `edge-tts` (spawned via child process)
- **Email Service**: Nodemailer

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Python](https://www.python.org/) (v3.7 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas URL)
- Python package `edge-tts`: 
  ```bash
  pip install edge-tts
  ```

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd TechVani
```

### 2. Backend Setup

Navigate to the backend directory, install dependencies, and configure your environment variables.

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret

# AI Integration
GOOGLE_API_KEY=your_gemini_api_key

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM="TechVani" your_email@gmail.com
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, install dependencies, and start the Vite development server.

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

Start the frontend application:
```bash
npm run dev
```

### 4. Usage

1. Open your browser and navigate to `http://localhost:5173`.
2. Sign up with your email (OTP verification required).
3. Log in to access the Dashboard.
4. Choose either **YouTube URL** or **Document Upload** to start processing content.
5. Select the subject and your preferred output language.
6. Choose between Text Summary or Audio (TTS) output.
7. Read or listen to the localized summary!

## Project Structure

```text
TechVani/
├── backend/
│   ├── models/        # Mongoose schema definitions (User, History, PendingUser)
│   ├── routes/        # Express API routes (auth, process, history, chat)
│   ├── services/      # Core logic (AI integration, TTS generation, Email)
│   ├── temp/          # Temporary storage for uploads and TTS audio
│   ├── server.js      # Backend entry point and Socket.io setup
│   └── package.json
└── frontend/
    ├── src/
    │   ├── assets/    # Static assets
    │   ├── components/# Reusable React components (Modals, UI elements)
    │   ├── pages/     # Main views (Landing, Dashboard, ResultView)
    │   ├── App.jsx    # Root React component managing state and routing
    │   └── main.jsx   # React entry point
    ├── vite.config.js
    └── package.json
```

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## License

This project is licensed under the MIT License.
