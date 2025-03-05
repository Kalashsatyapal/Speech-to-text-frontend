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
  const audioRef = useRef(null);

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
      const response = await axios.post("http://localhost:5000/transcribe", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
    <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-indigo-800 to-purple-700 p-6">
      <h1 className="text-4xl font-extrabold text-white text-center py-6 bg-black/40 shadow-lg rounded-lg">
        🎙️ Speech-to-Text Transcription
      </h1>

      <div className="flex flex-col md:flex-row w-full h-full items-start justify-start gap-10 mt-6">
        {/* Left Panel */}
        <div className="w-full md:w-1/2 flex flex-col gap-8">
          {/* Upload Audio */}
          <div className="bg-white/20 backdrop-blur-lg text-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-4">
            <h2 className="text-2xl font-semibold">Upload Audio File</h2>
            <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded-md bg-white text-black" />
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
            {!mediaRecorder ? (
              <button
                onClick={startRecording}
                className="bg-green-500 text-white px-6 py-3 rounded-lg w-full shadow-md hover:scale-105 transition-all duration-300"
              >
                🎤 Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-red-500 text-white px-6 py-3 rounded-lg w-full shadow-md hover:scale-105 transition-all duration-300"
              >
                ⏹️ Stop Recording
              </button>
            )}

            {audioURL && (
              <div className="w-full text-center mt-4">
                <audio ref={audioRef} src={audioURL} controls className="w-full border rounded-md shadow-md"></audio>
                <button
                  onClick={uploadRecordedAudio}
                  className="mt-4 bg-purple-500 text-white px-6 py-3 rounded-lg w-full shadow-md hover:scale-105 transition-all duration-300"
                >
                  📤 Upload & Transcribe
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 bg-white/20 backdrop-blur-lg text-white p-6 rounded-xl shadow-lg flex flex-col gap-4">
          <h2 className="text-3xl font-bold text-center">📝 Transcription Result</h2>
          {loading && <p className="text-lg bg-yellow-300 text-black px-4 py-2 rounded-md shadow-md text-center">⏳ Transcribing audio...</p>}
          <div className="p-4 bg-gray-100 text-black rounded-lg shadow-md overflow-y-auto max-h-60 min-h-[150px]">
            {transcription ? <p className="text-lg leading-relaxed">{transcription}</p> : <p className="text-gray-500 text-center">No transcription available yet.</p>}
          </div>

          {/* Transcription History */}
          <h2 className="text-xl font-bold text-center mt-4">📜 Previous Transcriptions</h2>
          <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
            {previousTranscriptions.length > 0 ? (
              previousTranscriptions.map((item) => (
                <div key={item.id} className="p-4 bg-white text-black rounded-lg shadow-md flex justify-between items-center">
                  <p className="text-lg leading-relaxed">{item.transcription}</p>
                  <button onClick={() => deleteTranscription(item.id)} className="text-red-500 hover:text-red-700">❌</button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No previous transcriptions found.</p>
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
