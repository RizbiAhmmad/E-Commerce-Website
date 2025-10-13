import useAxiosPublic from "@/Hooks/useAxiosPublic";
import { AuthContext } from "@/provider/AuthProvider";
import React, { useContext } from "react";
import { FaGoogle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

const SocialLogin = () => {
  const { googleSignIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPublic = useAxiosPublic();

  const from = location.state?.from?.pathname || "/";

  const handleGoogleSignIn = async () => {
    try {

      const result = await googleSignIn();
      const user = result.user;

      const userInfo = {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: "user",
        createdAt: new Date(),
      };

      const res = await axiosPublic.post("/users", userInfo);

      if (res.data.insertedId || res.data.message === "User already exists") {
        Swal.fire({
          title: "Login Successful!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("❌ Google Sign-In Error:", error);
      Swal.fire({
        title: "Sign-In Failed!",
        text: error.message || "Something went wrong, please try again.",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex justify-center">
      <button
        onClick={handleGoogleSignIn}
        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
      >
        <FaGoogle className="text-lg" />
        Sign in with Google
      </button>
    </div>
  );
};

export default SocialLogin;