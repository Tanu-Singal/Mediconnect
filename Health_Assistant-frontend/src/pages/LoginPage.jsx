import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import docimage from "../assets/do.jpg";

const LoginPage = () => {
  const [isDoctor, setIsDoctor] = useState(true);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, role } = formData;

    if (!email || !password || !role) {
      toast.warn("Please fill all fields.");
      return;
    }
 
    try {
      if (isLogin) {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        toast.success("Login successful!");

        const userDoc = await getDoc(doc(db, "user", userCred.user.uid));
        const userData = userDoc.data();
        const userRole = userData?.role || "user";

        if (userRole === "doctor") {
          localStorage.setItem("role", "doctor");
  localStorage.setItem("doctorContact", userData.phone);
  navigate("/doctorLogin");
        } else {
          localStorage.setItem("role", "user");
  localStorage.setItem("phone", userData.phone);
  localStorage.setItem("user_name", userData.name);
  navigate("/profile");
        }
      } else {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        try {
          await setDoc(doc(db, "user", userCred.user.uid), {
            name,
            email,
            phone,
            role,
            uid: userCred.user.uid,
          });

          toast.success("Signup successful!");

          if (role === "doctor") {
            localStorage.setItem("role", "doctor");
            localStorage.setItem("doctorContact", phone);
            navigate("/doctorLogin");
          } else {
            localStorage.setItem("role", "user");
            localStorage.setItem("phone", phone);
            localStorage.setItem("user_name", name);
            navigate("/profile");
          }
        } catch (firestoreError) {
          await userCred.user.delete();
          throw new Error(
            "Signup failed while saving data. Please try again."
          );
        }
      }
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already exists. Please login instead.");
      } else {
        toast.error(error.message || "Something went wrong.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white px-4 py-6 font-sans">
      <div className="relative w-full max-w-4xl bg-white shadow-lg rounded-3xl overflow-hidden flex flex-col-reverse md:flex-row transition-all duration-500">
        {/* Left (Form Section) */}
        <div
          className={`w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center transition-all duration-500 z-10 
        ${isDoctor ? "order-1" : "order-2"}`}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
            {isDoctor ? "Doctor" : "User"} {isLogin ? "Login" : "Signup"}
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label className="text-sm font-semibold mb-1 block text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your name"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-1 block text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Enter your phone"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-1 block text-gray-700">
                    Select Role
                  </label>
                  <div className="flex gap-6 mt-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="doctor"
                        required
                        checked={formData.role === "doctor"}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        className="form-radio text-blue-600"
                      />
                      Doctor
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="user"
                        checked={formData.role === "user"}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        className="form-radio text-blue-600"
                      />
                      User
                    </label>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-semibold mb-1 block text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter your email"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter password"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-xl py-2 font-semibold hover:bg-blue-700 transition"
            >
              {isLogin ? "Login" : "Signup"}
            </button>
          </form>

          <div className="mt-4 text-sm text-center text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 font-medium hover:underline"
            >
              {isLogin ? "Signup" : "Login"}
            </button>
          </div>
        </div>

        {/* Right (Toggle Panel) */}
        <div
          className={`w-full md:w-1/2 bg-gradient-to-br from-blue-300 to-blue-500 text-white flex flex-col items-center justify-center p-6 sm:p-8 transition-all duration-500 
        ${isDoctor ? "order-2" : "order-1"}`}
        >
          <img
            src={docimage}
            alt="Login Illustration"
            className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 lg:w-60 lg:h-60 object-contain mb-6 transition-all duration-500"
          />
          <p className="text-lg font-semibold mb-3 text-center">
            {isDoctor ? "Login as User" : "Login as Doctor"}
          </p>
          <button
            onClick={() => setIsDoctor(!isDoctor)}
            className="bg-white text-blue-600 font-bold px-5 py-2 rounded-full shadow hover:bg-blue-50 hover:text-blue-700 transition"
          >
            Switch Mode
          </button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default LoginPage;

