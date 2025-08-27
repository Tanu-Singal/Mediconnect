import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Menu, X, LogOut, Home, Phone } from "lucide-react";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("role") || "user");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      await signOut(auth); 
      if (role === "doctor") {
        localStorage.removeItem("doctorContact");
        toast.success("Doctor logged out");
      } else {
        localStorage.removeItem("phone");
        toast.success("User logged out");
      }
      localStorage.removeItem("role");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed: " + error.message);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md shadow-md border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <div className="text-3xl font-bold text-blue-600 tracking-wide cursor-pointer">
          Dr.<span className="text-blue-400">Care</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 font-medium text-gray-700">
          <Link
            to="/home"
            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
          >
            <Home className="w-5 h-5" /> Home
          </Link>
          <Link
            to=""
            className="flex items-center gap-2 hover:text-blue-600 transition-colors"
          >
            <Phone className="w-5 h-5" /> Contact
          </Link>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </nav>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-md hover:bg-gray-100 transition"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-md border-t shadow-lg flex flex-col items-center py-4 space-y-4">
          <Link to="/home" className="hover:text-blue-600">Home</Link>
          <Link to="" className="hover:text-blue-600">Contact</Link>
          <button
            onClick={() => setShowConfirm(true)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

