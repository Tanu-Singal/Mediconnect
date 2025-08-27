import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./pages/Navbar"
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import DoctorLogin from "./pages/DoctorLogin";
import SymptomChecker from "./pages/SymptomChecker";
import HospitalLocator from "./pages/HospitalLocator";
import Appointment from "./pages/Appointment";
import UserProfile from "./pages/UserProfile";
import ProfileSection from "./pages/ProfileSection";
import MedicalReport from "./pages/MedicalReport";
import VisionReport from "./pages/VisionReport";
import DoctorDashboard from "./pages/DoctorDashboard";

function AppRoute() {
  const location = useLocation();
  const hideNavbarPaths = ["/"];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {/* Navbar */}
      {shouldShowNavbar && <Navbar />}

      {/* Main Content Wrapper */}
      <main className={`${shouldShowNavbar ? "pt-24" : ""} min-h-screen bg-gray-50`}>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/symptom-checker" element={<SymptomChecker />} />
          <Route path="/hospital-loc" element={<HospitalLocator />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/userprofile" element={<UserProfile />} />
          <Route path="/profile" element={<ProfileSection />} />
          <Route path="/medicalReport" element={<MedicalReport />} />
          <Route path="/VisionReport" element={<VisionReport />} />
          <Route path="/doctorLogin" element={<DoctorLogin />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </main>
    </>
  );
}

export default AppRoute;
