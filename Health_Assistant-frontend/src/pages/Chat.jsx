import { useState } from "react";
import { toast,ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Chat = ({ messages, setMessages }) => {

  const [input, setInput] = useState("");
   const [isListening, setIsListening] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lang, setLang] = useState("en");
  const [selectedDate, setSelectedDate] = useState(null);
const [selectedTime, setSelectedTime] = useState(null);
  const [bookingState, setBookingState] = useState({});
  const [lastBotMessage, setLastBotMessage] = useState(null);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-US";
    window.speechSynthesis.speak(utterance);
  };


  const handleSend = async (textOverride = null) => {
  const finalInput = textOverride !== null ? textOverride : input;

  const newMessages = [...messages, { sender: "user", text: finalInput }];
  setMessages(newMessages);
  setInput(""); // clear input box

  if  (!selectedDate || !selectedTime) {
      toast.warn("Please select both date and time for the appointment.");
      return;
    }

  try {
    
      const dateStr = selectedDate.toLocaleDateString("en-CA");  
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
    
      const timeStr = `${hours}:${minutes}`;
     const res = await fetch("https://mediconnect-backend1-r5kg.onrender.com/book-appoint", {
      method: "POST",
      headers: {
      "Content-Type": "application/json" 
      },
      body:JSON.stringify({
            ...bookingState,    
        user_input: finalInput,
        date:  dateStr,
        time: timeStr
      })
    });

  
     const data = await res.json(); 
    const explanation = data.text || "⚠️ No response from server.";
    
  const ans = typeof explanation === "object"
  ? JSON.stringify(explanation, null, 2)
  : String(explanation);

     const detectFieldFromResponse = (text) => {
  text = text.toLowerCase();
  if (text.includes("confirm") || text.includes("yes/no")) return "confirmed";
  return null;
};
   
    const prevBotMessage = lastBotMessage?.text || "";
const field = detectFieldFromResponse(prevBotMessage);

  // ✅ Update booking state
  if (data.state && field) {
  if (field === "confirmed") {
    data.state.confirmed = finalInput.toLowerCase().includes("yes");
  }  else {
    data.state[field] = finalInput;
  }
}
    console.log("🧠 FinalInput:", finalInput);
console.log("🧠 Bot Said (ans):", ans);
console.log("🧠 Detected Field:", field);
console.log("🧾 Payload before sending to backend:", data.state);

// ✅ Step 2: Make API call with updated state
    setBookingState(data.state);

  const botMessage = { sender: "bot", text: ans };
  setMessages((prev) => [...prev, botMessage]);
  setLastBotMessage(botMessage);

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
    recognition.lang = lang === "hi" ? "hi-IN" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.start();

   recognition.onresult = (e) => {
  const transcript = e.results[0][0].transcript;
  setInput(transcript); // optional: fill text box
  setIsListening(false);

  handleSend(transcript); // directly pass to avoid async issues
};


    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    };
  };

   return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-white to-sky-50">
         <div className="p-4 bg-white shadow-md flex flex-wrap gap-3 border-b">
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full sm:w-1/6"
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
        </select>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-sm">
              {msg.text && (
                <div className={`px-4 py-3 rounded-2xl shadow text-sm ${msg.sender === "user" ? "bg-green-100" : "bg-white border border-blue-100"}`}>
                  {msg.text}
                </div>
              )}
              {msg.image && (
                <img src={msg.image} alt="Report Graph" className="rounded-xl mt-2 border border-gray-300" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 bg-blue-50 border-t flex flex-col sm:flex-row gap-2">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
          minDate={new Date()}
          className="border p-2 rounded w-full sm:w-1/2"
          placeholderText="📅 Select Date"
        />
        <DatePicker
          selected={selectedTime}
          onChange={(time) => setSelectedTime(time)}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={30}
          timeCaption="Time"
          dateFormat="h:mm aa"
          className="border p-2 rounded w-full sm:w-1/2"
          placeholderText="⏰ Select Time"
        />
      </div>

      <div className="p-4 bg-white flex gap-3 items-center border-t shadow-md">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border border-gray-300 p-3 rounded focus:outline-none"
          placeholder="💬 Type or speak your question..."
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
        <button
          onClick={startVoiceInput}
          title="Tap to speak"
          className={`px-4 py-2 rounded-full text-white ${isListening ? "bg-red-500" : "bg-gray-700"}`}
        >
          🎙
        </button>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Chat;
