import { useState, useRef } from "react";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const audioRef = useRef(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const uploadFile = async () => {
    if (!file) return alert("Please select an audio file");

    const formData = new FormData();
    formData.append("audio", file);

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTranscription(response.data.transcription);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to transcribe audio");
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (event) => audioChunks.push(event.data);
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        setRecordedAudio(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  const uploadRecordedAudio = async () => {
    if (!recordedAudio) return alert("No recorded audio available");

    const formData = new FormData();
    formData.append("audio", recordedAudio, "recorded_audio.wav");

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTranscription(response.data.transcription);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to transcribe recorded audio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-r from-blue-500 to-purple-500 p-6">
      {/* Full-width Header */}
      <h1 className="text-3xl font-bold text-white text-center w-full py-4 bg-black/30">
        🎙️ Speech-to-Text Transcription
      </h1>

      {/* Main Content Layout */}
      <div className="flex flex-col md:flex-row w-full h-full items-start justify-start mt-6 gap-8">
        {/* Left Section: Buttons */}
        <div className="w-full md:w-1/2 flex flex-col gap-6">
          {/* File Upload Section */}
          <div className="bg-white text-black p-6 rounded-xl shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-indigo-600">Upload Audio File</h2>
            <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded-md mb-3" />
            <button
              onClick={uploadFile}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
            >
              Upload & Transcribe
            </button>
          </div>

          {/* Audio Recording Section */}
          <div className="bg-white text-black p-6 rounded-xl shadow-lg flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4 text-red-500">Record Audio</h2>
            {!mediaRecorder ? (
              <button
                onClick={startRecording}
                className="bg-green-500 text-white px-4 py-2 rounded-md w-full hover:bg-green-600 transition-all"
              >
                🎤 Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-red-500 text-white px-4 py-2 rounded-md w-full hover:bg-red-600 transition-all"
              >
                ⏹️ Stop Recording
              </button>
            )}

            {audioURL && (
              <div className="mt-4 w-full text-center">
                <audio ref={audioRef} src={audioURL} controls className="w-full border rounded-md shadow-md"></audio>
                <div className="mt-3 flex justify-between">
                  <button
                    onClick={() => {
                      setAudioURL(null);
                      setRecordedAudio(null);
                    }}
                    className="bg-gray-500 text-white px-4 py-1 rounded-md hover:bg-gray-600 transition-all"
                  >
                    ❌ Delete
                  </button>
                  <a
                    href={audioURL}
                    download="recorded_audio.wav"
                    className="bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 transition-all"
                  >
                    ⬇️ Download
                  </a>
                </div>
                <button
                  onClick={uploadRecordedAudio}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md w-full mt-3 hover:bg-purple-700 transition-all"
                >
                  Upload Recorded Audio & Transcribe
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Transcription Display */}
        <div className="w-full md:w-1/2 bg-white text-black p-6 rounded-xl shadow-lg flex flex-col justify-start">
          <h2 className="text-2xl font-bold text-indigo-600 text-center mb-3">📝 Transcription Result:</h2>

          {/* Loading Indicator */}
          {loading && (
            <p className="text-lg bg-yellow-300 text-black px-4 py-2 rounded-md shadow-md text-center">
              ⏳ Transcribing audio...
            </p>
          )}

          {/* Transcription Text */}
          <div className="mt-3 p-4 bg-gray-100 rounded-lg shadow-md overflow-y-auto max-h-60 min-h-[150px]">
            {transcription ? (
              <p className="text-lg text-gray-800 leading-relaxed">{transcription}</p>
            ) : (
              <p className="text-gray-500 text-center">No transcription available yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
