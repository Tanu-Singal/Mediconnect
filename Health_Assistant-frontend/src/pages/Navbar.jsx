import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
const Navbar = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("role") || "user");
  const [showConfirm, setShowConfirm] = useState(false);
    const isDoctor = role === "doctor";

  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem("role") || "user");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = async () => {
  const role = localStorage.getItem("role");

  try {
    await signOut(auth); // Common signOut
    if (role === "doctor") {
      localStorage.removeItem("doctorContact");
      navigate("/");
      toast.success("Doctor logged out");
    } else {
      localStorage.removeItem("phone");
      navigate("/");
      toast.success("User logged out");
    }

    localStorage.removeItem("role"); // Common cleanup
  } catch (error) {
    toast.error("Logout failed: " + error.message);
  }
};


  return (
    <header className="bg-white shadow border-b py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between">
        
        {/* Logo */}
        <div className="text-3xl font-bold text-blue-600">
          Dr.<span className="text-blue-400">Care</span>
        </div>

        {/* Nav Links + Logout */}
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-6 font-medium text-gray-700">
          <Link to="/home" className="hover:text-blue-500">Home</Link>
          <Link to="" className="hover:text-blue-500">Contact</Link>
          <div className="relative inline-block">
  <button
    onClick={() => setShowConfirm(true)}
    className="bg-red-500 text-white px-4 py-2 rounded"
  >
    Logout
  </button>

  {showConfirm && (
    <div className="absolute top-full mt-2 right-0 bg-white border shadow-md rounded p-4 z-10 w-64">
      <p className="mb-4 text-sm">Are you sure you want to logout?</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowConfirm(false)}
          className="text-gray-600 hover:text-gray-800"
        >
          No
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Yes
        </button>
      </div>
    </div>
  )}
</div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
