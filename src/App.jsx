import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [previousTranscriptions, setPreviousTranscriptions] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchPreviousTranscriptions();
  }, []);

  const fetchPreviousTranscriptions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/transcriptions");
      setPreviousTranscriptions(response.data);
    } catch (error) {
      console.error("Error fetching transcriptions:", error);
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const uploadFile = async () => {
    if (!file) return alert("Please select an audio file");

    const formData = new FormData();
    formData.append("audio", file);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/transcribe",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setTranscription(response.data.transcription);
      fetchPreviousTranscriptions();
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
        setRecordingTime(0);
        clearInterval(timerRef.current);
      };

      recorder.start();
      setMediaRecorder(recorder);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setRecordedAudio(null);
    setAudioURL(null);
    setRecordingTime(0);
  };

  const uploadRecordedAudio = async () => {
    if (!recordedAudio) return alert("No recorded audio available");

    const formData = new FormData();
    formData.append("audio", recordedAudio, "recorded_audio.wav");

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/transcribe",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setTranscription(response.data.transcription);
      fetchPreviousTranscriptions();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to transcribe recorded audio");
    } finally {
      setLoading(false);
    }
  };

  const deleteTranscription = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/transcriptions/${id}`);
      fetchPreviousTranscriptions();
    } catch (error) {
      console.error("Error deleting transcription:", error);
    }
  };

  const clearAllTranscriptions = async () => {
    try {
      await axios.delete("http://localhost:5000/transcriptions");
      setPreviousTranscriptions([]);
    } catch (error) {
      console.error("Error clearing transcriptions:", error);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-indigo-800 to-purple-700 p-6 overflow-hidden">
      <h1 className="text-4xl font-extrabold text-white text-center py-6 bg-black/40 shadow-lg rounded-lg">
        🎙️ Speech-to-Text Transcription
      </h1>

      <div className="flex flex-col md:flex-row w-full h-full items-start justify-start gap-10 overflow-hidden">
        {/* Left Panel */}
        <div className="w-full md:w-1/2 flex flex-col gap-8">
          {/* Upload Audio */}
          <div className="bg-white/20 backdrop-blur-lg text-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-4">
            <h2 className="text-2xl font-semibold">Upload Audio File</h2>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-md bg-white text-black"
            />
            <button
              onClick={uploadFile}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-md hover:scale-105 transition-all duration-300"
            >
              🚀 Upload & Transcribe
            </button>
          </div>

          {/* Record Audio */}
          <div className="bg-white/20 backdrop-blur-lg text-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-4">
            <h2 className="text-2xl font-semibold">Record Audio</h2>

            <div className="flex flex-col items-center">
              <button
                onClick={!mediaRecorder ? startRecording : stopRecording}
                className={`w-16 h-16 flex items-center justify-center rounded-full shadow-lg transition-all duration-300 relative
                ${
                  mediaRecorder
                    ? "bg-red-500 animate-ping"
                    : "bg-green-500 hover:scale-110"
                }`}
              >
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span className="absolute bottom-[-25px] text-white text-sm">
                  {mediaRecorder ? "Stop" : "Start"}
                </span>
              </button>

              {mediaRecorder && (
                <p className="mt-3 text-lg font-bold text-yellow-300">
                  ⏳ {recordingTime}s
                </p>
              )}
            </div>

            {audioURL && (
              <div className="w-full text-center mt-4">
                <audio
                  ref={audioRef}
                  src={audioURL}
                  controls
                  className="w-full border rounded-md shadow-md"
                ></audio>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={uploadRecordedAudio}
                    className="flex-1 bg-purple-500 text-white px-6 py-3 rounded-lg shadow-md hover:scale-105 transition-all duration-300"
                  >
                    📤 Upload & Transcribe
                  </button>
                  <button
                    onClick={resetRecording}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:scale-105 transition-all duration-300"
                  >
                    ❌ Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 bg-white/20 backdrop-blur-lg text-white p-6 rounded-xl shadow-lg flex flex-col gap-4">
          <h2 className="text-3xl font-bold text-center">
            📝 Transcription Result
          </h2>
          {loading && (
            <p className="text-lg bg-yellow-300 text-black px-4 py-2 rounded-md shadow-md text-center">
              ⏳ Transcribing audio...
            </p>
          )}
          <div className="p-4 bg-gray-100 text-black rounded-lg shadow-md overflow-y-auto max-h-60 min-h-[150px]">
            {transcription ? (
              <p className="text-lg leading-relaxed">{transcription}</p>
            ) : (
              <p className="text-gray-500 text-center">
                No transcription available yet.
              </p>
            )}
          </div>

          <button
            onClick={clearAllTranscriptions}
            className="w-full mt-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:scale-105 transition-all duration-300"
          >
            🗑️ Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
