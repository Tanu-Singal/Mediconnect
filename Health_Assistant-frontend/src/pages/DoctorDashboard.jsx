import React, { useEffect, useState } from "react";
import { toast,ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DoctorDashboard = () => {
const navigate = useNavigate();
 const contact = localStorage.getItem("doctorContact");

  const [appointments, setAppointments] = useState([]);
  const [toCancelId, setToCancelId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [newDate, setNewDate] = useState("");
const [newTime, setNewTime] = useState("");

  useEffect(()=>{
    const fetchappointment=async()=>{
        try{
            const res=await fetch(`http://localhost:8000/get-doctor-appointment?contact=${contact}`)
            const data=await res.json()
            setAppointments(data.appointments || [])
        }catch {
        toast.error("Failed to load appointments");
      }

    }
    fetchappointment();
  },[contact])

  const cancelAppointment=async(id)=>{
    try {
        const res=await fetch(`http://localhost:8000/cancel-appointment/${id}`,{
            method:"DELETE",
        })
        if(res.ok){
             toast.success("Appointment cancelled");
             setAppointments(appointments.filter((appt)=>appt._id!==id))
        }
    } catch (err) {
        toast.error("Error cancelling appointment");
    }
  }
  const formatStatus = (date, time) => {
    const apptDateTime = new Date(`${date} ${time}`);
    return apptDateTime < new Date() ? "Completed" : "Upcoming";
  };

const handleStatusUpdate = async (id, status) => {
  try {
    let res=await fetch(`http://localhost:8000/update-appointment-status/${id}`,{
      method:"PUT",
      headers:{ "Content-Type": "application/json"},
      body:JSON.stringify({status})
    })
    if(res.ok){
      toast.success(`Appointment ${status}`);
      setAppointments((prev)=>prev.map((appt)=>appt._id===id?{...appt,status}:appt))
    }
     else {
      toast.error("Failed to update appointment");
    }
  } catch (error) {
      toast.error("Server error");
  }
}

const handleschedule=async(id)=>{
   if (!newDate || !newTime) {
    toast.error("Select both new date and time");
    return;
  }

  const formattedDate = newDate.toLocaleDateString("en-GB");
  const formattedTime = newTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  try {
    const re=await fetch(`http://localhost:8000/reschedule-appointment/${id}`,{
      method:"PUT",
      headers:{"Content-Type": "application/json"},
      body:JSON.stringify({date:formattedDate,time:formattedTime})
    })
    if(re.ok)
    {
       toast.success("Appointment rescheduled");
       setAppointments((prev) =>
                    prev.map((appt) =>
                      appt._id === rescheduleId ? { ...appt, date: formattedDate, time: formattedTime  } : appt
                    )
                  );
       setShowRescheduleModal(false);
          setRescheduleId(null);
    }
    else {
                  toast.error("Failed to reschedule");
                }
  } catch (error) {
     toast.error("Server error");
  }
}
 return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Doctor Dashboard</h2>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((appt) => (
            <div key={appt._id} className="bg-white p-4 rounded-xl shadow-md">
             <div className="text-sm text-black leading-tight space-y-0.5">
  <h3 className="text-lg font-semibold text-black mb-1">{appt.user_name}</h3>

  <p>
    <span className="font-semibold"> Phone:</span> {appt.phone}
  </p>
  <p>
    <span className="font-semibold"> Age:</span> {appt.age}
  </p>
  <p>
    <span className="font-semibold"> Location:</span> {appt.location}
  </p>
  <p>
    <span className="font-semibold">📅 Appointment:</span> {appt.date} at 🕒 {appt.time}
  </p>
  <p>
    <span className="font-semibold">⏱️ Status:</span> {formatStatus(appt.date, appt.time)}
  </p>

  {appt.status && (
    <span
      className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold
        ${appt.status === "Accepted" ? "bg-green-200 text-green-800" : ""}
        ${appt.status === "Rejected" ? "bg-red-200 text-red-800" : ""}
        ${appt.status === "Pending" ? "bg-yellow-200 text-yellow-800" : ""}
      `}
    >
      {appt.status}
    </span>
  )}
</div>


              <div className="flex flex-col sm:flex-row sm:justify-between mt-4 gap-2">
  <div className="flex gap-2">
    {formatStatus(appt.date, appt.time) === "Upcoming" && (
      <>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 active:scale-95 transition"
          onClick={() => {
            setToCancelId(appt._id);
            setShowModal(true);
          }}
        >
          Cancel
        </button>
        <button className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 active:scale-95 transition"
        onClick={()=>{
          setRescheduleId(appt._id);
           const [day, month, year] = appt.date.split("/");
         const dateObj = new Date(`${year}-${month}-${day}`);

  
        const timeObj = new Date(`${year}-${month}-${day} ${appt.time}`);

        setNewDate(dateObj);
        setNewTime(timeObj);
          setShowRescheduleModal(true);
        }}>
          Reschedule
        </button>
        <button
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 active:scale-95 transition"
          onClick={() => navigate(`/video-call?doctorId=${doctorPhone}`)}
        >
          Start Video Call
        </button>
      </>
    )}
  </div>

  {/* ✅ Accept/Reject Buttons */}
  {appt.status === "Pending" && (
    <div className="flex gap-2">
      <button
        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 active:scale-95"
        onClick={() => handleStatusUpdate(appt._id, "Accepted")}
      >
        ✅ Accept
      </button>
      <button
        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 active:scale-95"
        onClick={() => handleStatusUpdate(appt._id, "Rejected")}
      >
        ❌ Reject
      </button>
    </div>
  )}
</div>


            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-white/5 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur border border-gray-200/60 shadow-2xl rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Cancel Appointment?</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel this appointment?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  await cancelAppointment(toCancelId);
                  setShowModal(false);
                  setToCancelId(null);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Yes, Cancel
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setToCancelId(null);
                }}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                No, Go Back
              </button>
            </div>
          </div>
        </div>
      )}
      {showRescheduleModal && (
  <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center">
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">Reschedule Appointment</h2>
        <div className="space-y-4">
  {/* 📅 Date Picker */}
  <div>
    <label className="block text-sm font-medium mb-1">New Date</label>
    <input
      type="date"
      value={newDate}
      onChange={(e) => setNewDate(e.target.value)}
      className="w-full border p-2 rounded"
    />
  </div>

  {/* 🕑 Time Selector */}
  <div>
    <label className="block text-sm font-medium mb-1">New Time</label>
    <div className="flex gap-2">
      
      
       <DatePicker
                    selected={newDate}
                    onChange={(date) => setNewDate(date)}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date()}
                    className="border p-2 rounded w-full sm:w-1/2"
                    placeholderText="📅 Select Date"
                          />
                <DatePicker
                  selected={newTime}
                  onChange={(time) => setNewTime(time)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="border p-2 rounded w-full sm:w-1/2"
                  placeholderText="⏰ Select Time"
                />
      
    </div>
  </div>
</div>


        <div className="flex items-center justify-end mt-6 space-x-3">
  <button
    onClick={() => {
      setShowRescheduleModal(false);
      setRescheduleId(null);
    }}
    className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition"
  >
    Cancel
  </button>
  <button
    onClick={() => handleschedule(rescheduleId)}
    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition"
  >
    Save
  </button>
</div>

    </div>
  </div>
)}
        <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default DoctorDashboard;