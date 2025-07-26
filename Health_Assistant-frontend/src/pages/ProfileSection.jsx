import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast,ToastContainer } from "react-toastify";

import 'react-toastify/dist/ReactToastify.css';

const ProfileSection = () => {
  const Navigate=useNavigate();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Tanu Singal",
    email: "tanu@example.com",
    phone: "9876543210",
    age: 22,
    gender: "Female",
    address: "Noida, India",
  });
 useEffect(() => {
    const storedProfile = {
      name: localStorage.getItem("user_name") || "",
      email: localStorage.getItem("userEmail") || "",
      phone: localStorage.getItem("phone") || "",
      age: localStorage.getItem("userAge") || "",
      gender: localStorage.getItem("userGender") || "",
      address: localStorage.getItem("userAddress") || "",
    };
    setProfile(storedProfile);
  }, []);
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveChanges = () => {
    setEditing(false);
      localStorage.setItem("user_name", profile.name);
 
      localStorage.setItem("phone", profile.phone);
      localStorage.setItem("userEmail", profile.email);
   localStorage.setItem("userGender", profile.gender);
      localStorage.setItem("userAge", profile.age.toString());
      localStorage.setItem("userAddress", profile.address);
    toast.success("Profile saved!") 
  
  const payload=new FormData()
  payload.append("name", profile.name);
payload.append("email", profile.email);
payload.append("phone", profile.phone);
payload.append("age", profile.age);
payload.append("gender", profile.gender);
payload.append("address", profile.address);

fetch("http://localhost:8000/ask",{
  method:"POST",
  body:payload
})
  .then((res) => res.json())
    .then((data) => {
      console.log("Saved to backend:", data);
      Navigate("/home")
      toast.success("Profile saved!");
    })
    .catch((err) => {
      console.error("Profile save failed:", err);
      toast.error("Failed to save profile");
    });
  };

  return (
    <div className="max-w-xl mx-auto mt-6 bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        👤 Your Profile
      </h2>

      <div className="space-y-4">
        {Object.keys(profile).map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-600 capitalize mb-1">
              {field}
            </label>
            {editing ? (
              <input
                type="text"
                name={field}
                value={profile[field]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <p className="bg-gray-50 px-3 py-2 rounded-md text-gray-700 border border-gray-200">
                {profile[field]}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        {editing ? (
          <>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              onClick={saveChanges}
            >
              ✅ Save
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg transition"
              onClick={() => setEditing(false)}
            >
              ❌ Cancel
            </button>
          </>
        ) : (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            onClick={() => setEditing(true)}
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>
       <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ProfileSection;
