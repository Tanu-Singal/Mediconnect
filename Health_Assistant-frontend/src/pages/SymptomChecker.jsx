// ✅ SymptomChecker.jsx with Modal-based Booking using AI Agent
import React, { useState,useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SymptomChecker = () => {  
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [specialist, setSpecialist] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", age: "", location: "" });
   const [loading, setLoading] = useState(false);
const [diagnosis,setDiagnosis]=useState([]);
const [followUp,setFollowUp]=useState("");
const [conversation, setConversation] = useState([]);
const [followUpReply,setFollowUpReply]=useState("")
 const [followUpCount, setFollowUpCount] = useState(0);
const [finalSuggestion, setFinalSuggestion] = useState(null);
const [showDoctors, setShowDoctors] = useState(false);
const [emergencyAsked, setEmergencyAsked] = useState(false);
const userPhone=localStorage.getItem("phone")
useEffect(() => {
  const lastUserMsg = conversation.slice().reverse().find(msg => msg.role === "user");
  if (lastUserMsg && /yes|doctor|suggest/i.test(lastUserMsg.message)) {
    setShowDoctors(true);
  }
}, [conversation]);




const handleFollowUpReply = async () => {
  const currentUserId = localStorage.getItem("user_id") || "guest";

  const updatedHistory = [
    ...conversation,
    { role: "user", message: followUpReply }
  ];

  setConversation(updatedHistory);
  console.log("Sending follow-up count:", followUpCount);

  try {
    const res = await fetch("https://mediconnect-backend1-r5kg.onrender.com/follow-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversation: updatedHistory,
        count: followUpCount,
        user_id: currentUserId,
        emergency_asked: emergencyAsked 
      }),
    });

    const data = await res.json();
    console.log("Backend response:", data); 
    console.log("Follow-up count:", followUpCount);
    if (data.emergency_asked !== undefined) {
  setEmergencyAsked(data.emergency_asked);
}
    if (data.doctors) {
  setDoctors(data.doctors);
}
    const newConversation = [...updatedHistory];

    const lastMessages = conversation.slice(-4).map(msg => msg.message.toLowerCase());

    // ✅ Check if data.answer exists before using toLowerCase
    if (data.answer && !lastMessages.includes(data.answer.toLowerCase())) {
      newConversation.push({ role: "assistant", message: data.answer });
    }
    if (data.specialist) {
  setSpecialist(data.specialist);
  getDoctors(data.specialist);
}
    // ✅ Check follow-up question
    if (data.follow_up_question?.trim()) {
      newConversation.push({ role: "assistant", message: data.follow_up_question });
    }

    setConversation(newConversation);
    setFollowUp("");

    // ✅ If it's final suggestion, set it
    if (data.final && /doctor|remedy|specialist/i.test(followUpReply)) {
      console.log(" Is result.final true?", data.final);
  setFinalSuggestion(data);
  const userInputMsgs = updatedHistory.filter(msg => msg.role === "user");
const symptoms = userInputMsgs.at(-1)?.message || "N/A";

    const reportPayload = {
    user_id: localStorage.getItem("user_id") || "guest",
    date: new Date().toISOString(), // ✅ Better format for backend/Mongo
    symptoms: symptoms,
    ai_suggestion: data.answer,
    suggested_tests: data.tests || [],
    urgency: "Low",
    full_conversation: newConversation,
    phone:userPhone
  };

  try {
    const reportRes = await fetch("https://mediconnect-backend1-r5kg.onrender.com/save-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportPayload),
    });

    const reportData = await reportRes.json();
    console.log("🧾 Report saved:", reportData);
  } catch (err) {
    console.error("❌ Failed to save report:", err);
  }
} else {
      setFollowUp(data.follow_up_question || "");
      setFollowUpCount(prev => prev + 1);
    }

    setFollowUpReply("");
  } catch (err) {
    console.error("Follow-up failed:", err);
    toast.error("Follow-up failed");
  }
};






 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const data = new FormData();
  data.append("query", query);

  try {
    const res = await fetch("https://mediconnect-backend1-r5kg.onrender.com/symptom-check", {
      method: "POST",
      body: data,
    });

    const result = await res.json();

    const updated = [
      { role: "user", message: query },
      { role: "assistant", message: result.answer || "Sorry, I couldn't understand that."}
    ];

    const newConversation = [...updated];

    if (result.follow_up_question) {
      newConversation.push({ role: "assistant", message: result.follow_up_question });
    }

    setConversation(newConversation);
    setAnswer(result.answer);
    setSpecialist(result.specialist);
    setFollowUp(result.follow_up_question);
    setFollowUpCount(0);
console.log("🧠 Is result.final true?", result.final);
   if (result.final) {
  setFinalSuggestion(result);

  // ✅ Build the conversation properly from current state
  const fullConversation = [
    { role: "user", message: query },
    { role: "assistant", message: result.answer },
  ];
console.log("🧾 full_conversation:", fullConversation);
  if (result.follow_up_question) {
    fullConversation.push({ role: "assistant", message: result.follow_up_question });
  }

  const reportPayload = {
    user_id: localStorage.getItem("user_id") || "guest",
    date: new Date().toISOString(), // ✅ Better format for backend/Mongo
    symptoms: query,
    ai_suggestion: result.answer,
    suggested_tests: result.tests || [],
    urgency: "Low",
    full_conversation: fullConversation,
    phone:userPhone
  };

  try {
    const reportRes = await fetch("https://mediconnect-backend1-r5kg.onrender.com/save-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportPayload),
    });

    const reportData = await reportRes.json();
    console.log("🧾 Report saved:", reportData);
  } catch (err) {
    console.error("❌ Failed to save report:", err);
  }
}

    // ✅ Optional: Call doctor fetch function if specialist is returned
    if (result.specialist) {
      getDoctors(result.specialist);
    }

    toast.success("Symptoms checked!");
    setLoading(false);
  } catch (err) {
    console.error("Error:", err);
    toast.error("Failed to check symptoms.");
    setLoading(false);
  }
};


  const getDoctors = async (specialization) => {
    try {
      const res = await fetch("https://mediconnect-backend1-r5kg.onrender.com/find-doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialization }),
      });
      const data = await res.json();
      console.log("Doctors found:", data.doctors);
      setDoctors(data.doctors);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  const openModal = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setShowModal(true);
  };

  const bookAppointment = async () => {
      if (!formData.name || !formData.phone || !selectedSlot) {
    toast.warn("Please fill in all the required fields.");
    return;
  }
  
    const payload = {
      user_name: formData.name,
      phone: formData.phone,
      age:formData.age,
      location:formData.location,
      doctor_name: selectedSlot.doctor_name,
      contact:selectedSlot.contact,
      specialization: selectedSlot.specialization,
      date: selectedSlot.date,
      time: selectedSlot.time,
    };

    try {
      const res = await fetch("https://mediconnect-backend1-r5kg.onrender.com/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      toast.success(data.message);
      setShowModal(false);
      setFormData({ name: "", phone: "", age: "", location: "" });
    } catch (err) {
      console.error("Booking failed:", err);
     toast.error("Booking failed. Please try again.");

    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🩺 Symptom Checker</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Describe your symptoms..."
          className="border p-2 w-full rounded"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
           <button
          type="submit"
          className={`px-4 py-2 rounded text-white w-full ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
          }`}
          disabled={loading}
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </form>
{answer &&  !finalSuggestion && (
  <div className="bg-gray-100 p-4 mt-4 rounded">
    <h2 className="font-semibold mb-2">🧠 AI Advice:</h2>
    <p>{answer}</p>
    {specialist && (
      <p className="mt-2 text-sm text-gray-600">
        Recommended Specialist: <span className="font-semibold">{specialist}</span>
      </p>
    )}
  </div>
)}


<div className="mt-4 space-y-2">
  {conversation.map((msg, idx) => (
    <div
      key={idx}
      className={`p-2 my-1 rounded max-w-md ${
        msg.role === "user"
          ? "bg-blue-100 ml-auto text-right"
          : "bg-gray-200 mr-auto text-left"
      }`}
    > 
      {msg.message}
    </div>
  ))}
</div>

{conversation.length > 0 && finalSuggestion && followUpCount >= 3 && conversation.slice(-4).some(
  msg => msg.role === "user" && /yes|doctor|suggest/i.test(msg.message)
) && (
  <div className="bg-green-100 p-4 mt-4 rounded">
    <h3 className="font-semibold mb-2">Doctor's Available:</h3>
    <p className="mb-2">{finalSuggestion.answer}</p>
  </div>
)}


{!finalSuggestion && (followUp?.trim() !== "" || answer?.trim() !== "") && (
  <div className="bg-yellow-50 p-4 mt-4 rounded">
    <h2 className="font-semibold mb-2">🤔 Follow-up Question:</h2>
    <p className="mb-3">{followUp}</p>

    <input
      type="text"
      placeholder="Your answer..."
      className="w-full p-2 border rounded mb-2"
      value={followUpReply}
      onChange={(e) => setFollowUpReply(e.target.value)}
    />

    <button
      onClick={handleFollowUpReply}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 active:bg-blue-800"
    >
      Submit Follow-up Answer
    </button>
  </div>
)}
         {showDoctors && specialist && doctors.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2">Available {specialist}s:</h3>
          {doctors.map((doctor, index) => (
            <div key={index} className="bg-white p-4 rounded shadow mb-4">
              <h2 className="text-xl font-semibold">{doctor.name}</h2>
              <p className="text-gray-600">📍 {doctor.city}, {doctor.state}</p>
              <p>📞 {doctor.contact}</p>
              {doctor.available_slots && Object.entries(doctor.available_slots).map(
                ([date, slots]) => (
                  <div key={date} className="mt-2">
                    <p className="font-semibold">📅 {date}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                     {slots.map((slot) => {
  const isBooked = doctor.booked_slots?.[date]?.includes(slot);

  // ✅ Parse the date and time properly for comparison
  const slotDateTime = new Date(`${date}T${slot}`);
  const now = new Date();

  const isPastDate = slotDateTime < now;
  const isDisabled = isBooked || isPastDate;

  return (
    <button
      key={slot}
      onClick={() =>
        !isDisabled &&
        openModal({
          doctor_name: doctor.name,
          specialization: doctor.specialization,
          contact: doctor.contact,
          date,
          time: slot,
        })
      }
      disabled={isDisabled}
      className={`px-3 py-1 rounded text-sm transition
        ${isDisabled
          ? "bg-gray-400 text-white cursor-not-allowed"
          : "bg-green-500 text-white hover:bg-green-600 active:scale-95 shadow-sm"
        }`}
    >
      {slot} {isBooked ? "(Booked)" : isPastDate ? "(Past)" : ""}
    </button>
  );
})}

                    </div>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md px-6 py-8 transition-all">
            <h2 className="text-2xl font-semibold mb-6 text-center">Book Appointment</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Phone Number"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <input
                type="text"
                placeholder="Age"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
              <input
                type="text"
                required
                placeholder="Location"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <button
                onClick={bookAppointment}
                className="bg-blue-600 text-white font-medium px-4 py-2 rounded-xl w-full mt-4 hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-md"
>
  
                Confirm Booking
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="text-red-500 text-sm mt-2 hover:text-red-700 active:scale-95 transition-all duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default SymptomChecker;
