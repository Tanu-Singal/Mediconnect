import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SymptomChat = ({ messages, setMessages }) => {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  const phone = localStorage.getItem("phone");

  const handleSend = async (textOverride = null) => {
    const finalInput = textOverride !== null ? textOverride : input;
    if (!finalInput.trim()) return;
    if (finalInput === messages[messages.length - 1]?.text) return;

    const newMessages = [...messages, { sender: "user", text: finalInput }];
    setMessages(newMessages);
    setInput("");

    try {
      const res = await fetch("https://mediconnect-backend1-r5kg.onrender.com/chat-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: finalInput, phone }),
      });

      const data = await res.json();
      const explanation = data.text || "⚠️ No response from server.";
      const ans =
        typeof explanation === "object"
          ? JSON.stringify(explanation, null, 2)
          : String(explanation);

      const botMessage = { sender: "bot", text: ans };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("❌ API Error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Failed to get response" },
      ]);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition not supported. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      handleSend(transcript);
    };

    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    };
  };

  return (
    <div className="flex flex-col h-full max-h-screen bg-gradient-to-br from-white to-sky-50">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="max-w-[80%] sm:max-w-sm">
              {msg.text && (
                <div
                  className={`px-4 py-3 rounded-2xl shadow text-sm break-words ${
                    msg.sender === "user"
                      ? "bg-green-100"
                      : "bg-white border border-blue-100"
                  }`}
                >
                  {msg.text}
                </div>
              )}
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Report Graph"
                  className="rounded-xl mt-2 border border-gray-300"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white flex flex-col sm:flex-row gap-3 items-center border-t shadow-md sticky bottom-0 z-10">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          className="w-full flex-1 border border-gray-300 p-3 rounded focus:outline-none"
          placeholder="💬 Type or speak your question..."
        />
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => handleSend()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto"
          >
            Send
          </button>
          <button
            onClick={startVoiceInput}
            title="Tap to speak"
            className={`px-4 py-2 rounded-full text-white ${
              isListening ? "bg-red-500" : "bg-gray-700"
            }`}
          >
            🎙
          </button>

        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default SymptomChat;
