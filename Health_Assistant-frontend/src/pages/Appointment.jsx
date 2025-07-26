import React, { useEffect, useState } from "react";
import { toast,ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
const Appointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", age: "", location: "" });
  useEffect(() => {
    fetch("http://localhost:8000/all_doctors")
      .then((res) => res.json())
      .then((data) => setDoctors(data.doctors || data))
      .catch((err) => console.error("Error:", err));
  }, []);

  const filteredDoctors = doctors.filter((doc, idx, self) =>   
    /*self matlab vo pura array doctors ka */
    (specialty ? doc.specialization.toLowerCase().includes(specialty.toLowerCase()) : true) &&
    (location ? doc.city.toLowerCase().includes(location.toLowerCase()) : true) &&
    idx === self.findIndex(d => d.name === doc.name && d.contact === doc.contact)
  );
 const openModal = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setShowModal(true);
  };

  const bookAppointment = async () => {
      if (!formData.name || !formData.phone ||  !formData.age || !formData.location ||  !selectedSlot) {
    toast.warn("Please fill in all the required fields.");
    return;
  }

    const payload = {
      user_name: formData.name,
      email:`${formData.phone}@mail.com`,
      amount:selectedSlot.fee,
      phone: formData.phone,
      age:formData.age,
      location:formData.location,
      doctor_name: selectedSlot.doctor_name,
      specialization: selectedSlot.specialization,
      contact:selectedSlot.contact,
      date: selectedSlot.date,
      time: selectedSlot.time,
    };
    try {
      const res=await fetch("http://localhost:8000/book-appointment",{
        method:"POST",
        headers:{ "Content-Type": "application/json" },
        body:JSON.stringify(payload)
      })
      const data=await res.json();
     console.log("data received:", data);
           if (res.ok) {
    toast.success(data.message); // Appointment confirmed
     setShowModal(false);  
      setSelectedSlot(null);  
       setFormData({                        // ✅ Reset form
        name: "",
        phone: "",
        age: "",
        location: ""
      });
  } else {
    toast.warn(data.message); // Slot already booked
  }
      
    } catch (error) {
       console.error("Payment Error:", error);
    toast.error("Booking failed. Please try again.");
    }

  };
 
  return (
    <div className="bg-gradient-to-b from-[#f3f4f6] to-white min-h-screen p-6">
      <h1 className="text-3xl font-semibold text-blue-900 mb-6">
        {filteredDoctors.length} doctors available {location && `in ${location}`}
      </h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search Specialization"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="p-3 rounded-lg border shadow-sm w-full md:w-1/3"
        />
        <input
          type="text"
          placeholder="Search City"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="p-3 rounded-lg border shadow-sm w-full md:w-1/3"
        />
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDoctors.map((doc, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row justify-between hover:shadow-2xl transition"
          >
            {/* Left: Image + Info */}
            <div className="flex gap-4">
              <img
                src={`https://ui-avatars.com/api/?name=${doc.name.replace(" ", "+")}&background=random&size=128`}
                alt="doctor"
                className="w-24 h-24 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-bold text-blue-800">{doc.name}</h2>
                <p className="text-gray-600">{doc.specialization}</p>
                <p className="text-sm text-gray-500 mt-1">📍 {doc.city}</p>
                <p className="text-sm text-gray-500">📞 {doc.contact}</p>
                <p className="text-sm text-gray-600 mt-1">fee: {doc.fee}</p>
                <p className="text-sm text-green-600 font-medium mt-1">✅ Available Today</p>
              </div>
            </div>

            {/* Right: Available Slots */}
            <div className="mt-4 md:mt-0 md:w-1/2 flex flex-col gap-3">
              {doc.available_slots &&
                Object.entries(doc.available_slots).map(([date, slots]) => (
                  <div key={date}>
                    <p className="font-semibold">📅 {date}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                    {slots.map((slot) => {
                      const isBooked = doc.booked_slots?.[date]?.includes(slot);
                      const slotDateTime = new Date(`${date} ${slot}`); // combine date & time
                       const now = new Date();
                      const isPastDate = slotDateTime < now;
                      const isdisabled=isBooked || isPastDate
                      return(
  <button
    key={slot}
     onClick={() =>
        !isdisabled &&
        openModal({
          doctor_name: doc.name,
          specialization: doc.specialization,
          contact: doc.contact,
          fee: doc.fee,
          date,
          time: slot
        })
      }
    disabled={isdisabled}
    className={`px-3 py-1 rounded text-sm transition
        ${isdisabled
          ? "bg-gray-400 text-white cursor-not-allowed"
          : "bg-green-500 text-white hover:bg-green-600 active:scale-95 shadow-sm"}`}
  >
   {slot} {isBooked ? "(Booked)" : isPastDate ? "(Past)" : ""}
  </button>
                      )
})}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
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
                onClick={() => {setShowModal(false) 
                   setSelectedSlot(null);
                   setFormData({ name: "", phone: "", age: "", location: "" });}}
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

export default Appointment;
