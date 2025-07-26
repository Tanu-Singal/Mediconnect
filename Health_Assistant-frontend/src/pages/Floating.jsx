import { useState } from "react";
import SymptomChat from "./SymptomChat";
import Sidebar from "./Sidebar";

const Floating = ({ messages, setMessages }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 💬 Floating Button */}
      <button
        className="fixed bottom-4 right-4 bg-blue-600 text-white text-2xl px-4 py-2 rounded-full shadow-lg z-50 hover:bg-blue-700"
        onClick={() => setOpen(!open)}
        title="Chat with AI Assistant"
      >
        {open ? "❌" : "💬"}
      </button>

      {/* 💬 Floating Chatbox */}
      {open && (
        <div className="fixed bottom-20 right-4 w-[95%] sm:w-[90%] md:w-[800px] h-[85vh] max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col sm:flex-row overflow-hidden z-50 border">
          
          {/* ✅ Sidebar hidden on small screens */}
          <div className="hidden sm:block sm:w-1/3 overflow-y-auto border-r bg-gray-50">
            <Sidebar startNewChat={() => setMessages([])} />
          </div>

          {/* Chat Window */}
          <div className="w-full sm:w-2/3 h-full overflow-hidden flex flex-col">
            <SymptomChat messages={messages} setMessages={setMessages} />
          </div>
        </div>
      )}
    </>
  );
};

export default Floating;
