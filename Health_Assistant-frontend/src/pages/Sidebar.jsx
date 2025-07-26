import { useState, useEffect } from "react";

const Sidebar = ({ startNewChat }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleNewChatClick = () => {
    setLoading(true);
    startNewChat();
    setTimeout(() => setLoading(false), 1000);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      const phone = localStorage.getItem("phone");
      if (!phone) return;

      try {
        const res = await fetch(`https://mediconnect-backend1-r5kg.onrender.com/history?phone=${phone}`);
        const data = await res.json();
        setHistory(data.history || []);
      } catch (err) {
        console.error("❌ Error fetching history", err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="h-full overflow-y-auto p-4 bg-white">
      <button
        onClick={handleNewChatClick}
        className={`mb-4 px-3 py-2 rounded text-white flex items-center justify-center gap-2 transition-all duration-200 ${
          loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 hover:scale-105"
        }`}
        disabled={loading}
      >
        {loading ? "Resetting..." : "➕ New Chat"}
      </button>

      <h2 className="text-lg font-semibold mb-2">Chat History</h2>
      {history.length === 0 ? (
        <p className="text-gray-600">No previous chats found.</p>
      ) : (
        <ul className="space-y-3 overflow-y-auto">
          {history.map((item, idx) => (
            <li
              key={idx}
              className="bg-white p-3 rounded shadow hover:bg-gray-100 cursor-pointer"
            >
              <div className="font-medium text-sm text-gray-800 break-words">
                Q: {item.question}
              </div>
              <div className="text-xs text-gray-500 break-words">
                A: {item.answer}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(item.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;
