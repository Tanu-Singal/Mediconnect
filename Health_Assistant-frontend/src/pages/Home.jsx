
import React from "react";
import h from "../assets/h.jpg"
import d from "../assets/d.jpg"
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Mail,
  Phone,
  User,
  Stethoscope,
  ClipboardList,
  Hospital,
  MessageSquareHeart,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "user";

  const userFeatures = [
    {
      title: "Find & Book Doctors",
      desc: "Search doctors by specialty & book appointments",
      icon: <Stethoscope className="w-8 h-8 text-blue-600" />,
      route: "/appointment",
    },
    {
      title: "Symptom Checker AI",
      desc: "Describe symptoms, get instant AI insights",
      icon: <MessageSquareHeart className="w-8 h-8 text-blue-600" />,
      route: "/symptom-checker",
    },
    {
      title: "Nearby Hospitals",
      desc: "Search hospitals by your location",
      icon: <Hospital className="w-8 h-8 text-blue-600" />,
      route: "/hospital-loc",
    },
    {
      title: "Medical Report Summary",
      desc: "Upload reports & get quick health summary",
      icon: <ClipboardList className="w-8 h-8 text-blue-600" />,
      route: "/medicalReport",
    },
    {
      title: "Your Profile",
      desc: "Edit and save your health info",
      icon: <User className="w-8 h-8 text-blue-600" />,
      route: "/userprofile",
    },
    {
      title: "User Account",
      desc: "Manage account, logout, and more",
      icon: <User className="w-8 h-8 text-blue-600" />,
      route: "/profile",
    },
  ];

  const doctorFeatures = [
    {
      title: "Doctor Dashboard",
      desc: "View appointments and manage patients",
      icon: <ClipboardList className="w-8 h-8 text-green-600" />,
      route: "/doctor-dashboard",
    },
    {
      title: "Doctor Profile",
      desc: "Manage your profile & specialties",
      icon: <User className="w-8 h-8 text-green-600" />,
      route: "/doctorLogin",
    },
  ];

  const features = role === "doctor" ? doctorFeatures : userFeatures;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 font-sans">
      {/* Hero Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-800 leading-tight mb-4">
          All-In-One <span className="text-blue-500">Healthcare</span> Platform
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Book appointments, consult AI, manage reports, search hospitals, and more — all in one place.
        </p>
      </section>

      {/* Feature Banner 1 */}
      <section className="py-12 bg-blue-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 px-6">
          <img src={h} alt="Doctors" className="w-full md:w-1/2 rounded-2xl shadow-lg" />
          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Expert Doctors You Can Trust</h2>
            <p className="text-gray-600 mb-6">
              Connect with certified healthcare professionals, book appointments instantly, and get personalized care.
            </p>
            <button
              onClick={() => navigate("/appointment")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md"
            >
              Book Now
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map(({ title, desc, icon, route }, idx) => (
            <div
              key={idx}
              onClick={() => navigate(route)}
              className="cursor-pointer bg-gradient-to-br from-blue-50 to-white hover:shadow-xl transition-all duration-300 p-6 rounded-2xl border border-blue-100 text-center"
            >
              <div className="mb-4 flex justify-center">{icon}</div>
              <h3 className="text-xl font-semibold text-blue-600 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Banner 2 */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-8 px-6">
          <img src={d} alt="Healthcare" className="w-full md:w-1/2 rounded-2xl shadow-lg" />
          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Health, Our Priority</h2>
            <p className="text-gray-600 mb-6">
              Get AI-powered symptom analysis, hospital search, and secure health reports to stay ahead of your wellness journey.
            </p>
            <button
              onClick={() => navigate("/symptom-checker")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md"
            >
              Try Symptom Checker
            </button>
          </div>
        </div>
      </section>

      {/* Footer Contact Bar */}
      <footer className="bg-blue-50 py-6 px-4 mt-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-700 gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>198 West 21th Street, Suite 721, NY</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>support@drcare.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-400" />
            <span>+1 234 567 8901</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
