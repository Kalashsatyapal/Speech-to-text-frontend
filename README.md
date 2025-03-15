# Speech-to-Text Transcription App

## Overview
This is a **Speech-to-Text Transcription** web application built with **React.js** and **Tailwind CSS**. The app allows users to:

- **Upload audio files** (MP3, WAV, OGG)
- **Record audio** directly in the browser
- **Transcribe audio files** using a backend API
- **View previous transcriptions**
- **Delete transcriptions**

## Features
- 🎤 **Record Audio** and transcribe in real-time.
- 📤 **Upload Audio Files** in MP3, WAV, or OGG format.
- 📝 **View Transcription** of the uploaded or recorded audio.
- 🔄 **Retrieve Previous Transcriptions** from the backend.
- ❌ **Delete Transcriptions** to manage history.
- 🚀 **Modern UI** with a beautiful, responsive design using Tailwind CSS.

## Tech Stack
### Frontend
- **React.js**
- **Tailwind CSS**
- **Axios** (for API calls)

### Backend (API Used)
The app connects to a **Node.js + Express** backend deployed on Vercel:

```
https://speech-to-text-backend-git-main-kalash-satyapals-projects.vercel.app
```

## Installation
1. **Clone the Repository:**
   ```sh
   git clone https://github.com/your-repo/speech-to-text-app.git
   cd speech-to-text-app
   ```
2. **Install Dependencies:**
   ```sh
   npm install
   ```
3. **Run the App:**
   ```sh
   npm run dev
   ```
4. **Open in Browser:**
   ```
   http://localhost:5173
   ```

## How to Use
1. **Upload an audio file** using the file input and click "Upload & Transcribe".
2. **Record audio** using the "Start" button, then stop and upload the recording.
3. **View transcriptions** in real-time and previous transcriptions in history.
4. **Download recorded audio** or delete unnecessary transcriptions.

## API Endpoints
- `GET /transcriptions` - Fetch previous transcriptions.
- `POST /transcribe` - Upload audio for transcription.
- `DELETE /transcriptions/:id` - Delete a transcription.

## Screenshots
Coming soon...

## License
MIT License

## Author
Kalash satyapal | [GitHub]([https://github.com/your-profile](https://github.com/Kalashsatyapal)) | [Linkedin] ( https://www.linkedin.com/in/kalash-satyapal-5b63972b8/?originalSubdomain=in)

## Contributing
Pull requests are welcome! Please open an issue first for any major changes.

