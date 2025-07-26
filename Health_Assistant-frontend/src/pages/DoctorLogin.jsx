import React, { useEffect, useState } from "react";
import { toast,ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

  const DoctorLogin=()=>{
  const navigate = useNavigate();

  // ✅ FIX: Initializing available_slots from start
  const [doctor, setDoctor] = useState({
    name: "",
    specialization: "",
    city: "",
    contact: "",
    fee: "",
    available_slots: {}
  });
const [newDate, setNewDate] = useState("");
const [newTime, setNewTime] = useState("");


const addSlot = () => {
    if (!newDate || !newTime) {
      toast.error("Select both date and time.");
      return;
    }
    const formattedDate = newDate.toLocaleDateString("en-GB");
    const formattedTime = newTime.toLocaleTimeString("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});
     setDoctor((prev) => ({
    ...prev,
    available_slots: {
      ...prev.available_slots,
      [formattedDate]: Array.from(
        new Set([...(prev.available_slots[formattedDate] || []), formattedTime])
      ),
    },
  }));

    setNewDate("");
    setNewTime("");
    toast.success("Slot added");
  };

  useEffect(()=>{
    const contact = localStorage.getItem("doctorContact");
    const fetchdoc=async()=>{
      try {
        
        const re=await fetch(`http://localhost:8000/get-doctor-profile?contact=${contact}`)
        const data=await re.json();
        if(data.success)
        {
          setDoctor(data.doctor)
        }
      } catch (error) {
        console.error("Error fetching doctor profile:", err);
      }
    }
     fetchdoc();
  },[]);

  const handleChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(doctor.available_slots).length === 0) {
      toast.error("Please add at least one available slot.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/doctor-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctor),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Doctor Logged in");
        localStorage.setItem("doctorContact", doctor.contact);

        /*navigate(`/doctor-dashboard?phone=${doctor.contact}`);*/
        navigate("/home")
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Doctor Profile Setup</h2>

        {["name", "specialization", "city", "contact", "fee"].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            placeholder={field[0].toUpperCase() + field.slice(1)}
            value={doctor[field]}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 mb-3 border rounded focus:outline-none focus:ring"
          />
        ))}

       <div className="mb-4">
  <label className="font-semibold block mb-2">Add Available Slot</label>

  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
    {/* 📅 Date Input */}
    <DatePicker
      selected={newDate}
      onChange={(date) => setNewDate(date)}
      dateFormat="dd/MM/yyyy"
      minDate={new Date()}
      className="border p-2 rounded-md w-full sm:w-[180px] text-sm"
      placeholderText="📅 Date"
    />

    {/* ⏰ Time Input */}
    <DatePicker
      selected={newTime}
      onChange={(time) => setNewTime(time)}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={30}
      timeCaption="Time"
      dateFormat="h:mm aa"
      className="border p-2 rounded-md w-full sm:w-[140px] text-sm"
      placeholderText="⏰ Time"
    />

    {/* ➕ Add Button */}
    <button
      type="button"
      onClick={addSlot}
      className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded-md transition w-full sm:w-auto"
    >
      ➕ Add
    </button>
  </div>
</div>



        {/* 🔍 Preview */}
        {Object.keys(doctor.available_slots).length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Available Slots</h3>
            {Object.entries(doctor.available_slots).map(([date, times]) => (
              <div key={date} className="mb-2">
                <p className="font-medium">{date}:</p>
                <ul className="list-disc list-inside ml-4">
                  {times.map((time, idx) => (
                    <li key={idx}>🕒 {time}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}


        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
        <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default DoctorLogin;
