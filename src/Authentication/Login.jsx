import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import SocialLogin from "./SocialLogin";
import { AuthContext } from "@/provider/AuthProvider";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "@/firebase/firebase.config";


const auth = getAuth(app);

const Login = () => {
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
      await signIn(email, password);
      Swal.fire({
        title: "User Login Successfully",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
      navigate(from, { replace: true });
    } catch (error) {
      Swal.fire({
        title: "Login Failed",
        text: error.message,
        icon: "error",
      });
    }
  };

  const handleForgotPassword = async () => {
    const email = document.querySelector("input[name='email']")?.value;

    if (!email) {
      Swal.fire({
        title: "Please enter your email",
        text: "Email field cannot be empty",
        icon: "warning",
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Swal.fire({
        title: "Email Sent!",
        text: "Check your email to reset password",
        icon: "success",
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
      });
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://t3.ftcdn.net/jpg/16/13/79/42/360_F_1613794244_KlUIXWBf734TJR9DITsl2chsMrMi932E.jpg')",
      }}
    >
      <div className="bg-white/20 backdrop-blur-lg shadow-xl rounded-xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-white font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 mt-1 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-white font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 mt-1 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
              />
              <span
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            <div className="text-right mt-1">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-300 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* Login Button */}
          <div className="mt-4">
            <button
              type="submit"
              className="w-full py-2 text-white font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500 rounded-lg shadow-lg transition-all duration-300 cursor-pointer"
            >
              Login
            </button>
          </div>
        </form>

        {/* Social Login and Signup Link */}
        <div className="text-center mt-4">
          <p>
            New here?{" "}
            <Link to="/signup" className="text-blue-300 hover:underline">
              Create an account
            </Link>
          </p>
          <div className="divider my-3"></div>
          <div className="flex justify-center">
            <SocialLogin />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
