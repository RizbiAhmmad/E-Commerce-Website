import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import SocialLogin from "./SocialLogin";
import { AuthContext } from "../provider/AuthProvider";
import { FaArrowLeft } from "react-icons/fa";

const SignUp = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { createUser, updateUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const onSubmit = (data) => {
    createUser(data.email, data.password)
      .then((result) => {
        const loggedUser = result.user;
        updateUserProfile(data.name, data.photoURL)
          .then(() => {
            const userInfo = {
              name: data.name,
              email: data.email,
              photoURL: data.photoURL,
              role: "user",
              createdAt: new Date(),
            };
            fetch("https://bangladeshiit-server-api.onrender.com/users", {
              method: "POST",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify(userInfo),
            })
              .then((res) => res.json())
              .then((data) => {
                if (
                  data.insertedId ||
                  data.message === "User already exists"
                ) {
                  reset();
                  Swal.fire({
                    title: "User created successfully",
                    icon: "success",
                    draggable: true,
                  });
                  navigate("/courses");
                }
              })
              .catch((error) =>
                console.log("Error saving user to MongoDB:", error)
              );
          })
          .catch((error) =>
            console.log("Error updating user profile:", error)
          );
      })
      .catch((error) => console.log("Error creating user:", error));
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4 bg-center bg-cover"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/free-vector/gradient-geometric-shapes-dark-background_23-2148423542.jpg')",
      }}
    >
      <div className="w-full max-w-md p-6 shadow-xl bg-white/20 backdrop-blur-lg rounded-xl sm:p-8">

        {/* ✅ Back Button in normal flow */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition duration-300 border rounded-lg border-white/30 hover:bg-white hover:text-black"
          >
            <FaArrowLeft /> Back to Home
          </Link>
        </div>

        <h2 className="mb-6 text-3xl font-bold text-center text-white">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block font-medium text-white">Name</label>
            <input
              type="text"
              {...register("name", { required: true })}
              placeholder="Enter your name"
              className="w-full px-4 py-2 mt-1 text-white border rounded-lg bg-white/20 backdrop-blur-md border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {errors.name && (
              <span className="text-sm text-red-400">Name is required</span>
            )}
          </div>

          {/* Photo URL */}
          <div>
            <label className="block font-medium text-white">Photo URL</label>
            <input
              type="text"
              {...register("photoURL", { required: false })}
              placeholder="Profile image URL"
              className="w-full px-4 py-2 mt-1 text-white border rounded-lg bg-white/20 backdrop-blur-md border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {errors.photoURL && (
              <span className="text-sm text-red-400">
                Photo URL is required
              </span>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium text-white">Email</label>
            <input
              type="email"
              {...register("email", { required: true })}
              placeholder="Enter your email"
              className="w-full px-4 py-2 mt-1 text-white border rounded-lg bg-white/20 backdrop-blur-md border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {errors.email && (
              <span className="text-sm text-red-400">Email is required</span>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block font-medium text-white">Password</label>
            <input
              type="password"
              {...register("password", {
                required: true,
                minLength: 6,
                maxLength: 20,
                pattern: /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/,
              })}
              placeholder="Enter password"
              className="w-full px-4 py-2 mt-1 text-white border rounded-lg bg-white/20 backdrop-blur-md border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {errors.password?.type === "required" && (
              <span className="text-sm text-red-400">
                Password is required
              </span>
            )}
            {errors.password?.type === "minLength" && (
              <span className="text-sm text-red-400">
                At least 6 characters
              </span>
            )}
            {errors.password?.type === "maxLength" && (
              <span className="text-sm text-red-400">
                Max 20 characters
              </span>
            )}
            {errors.password?.type === "pattern" && (
              <span className="text-sm text-red-400">
                Must include uppercase, lowercase, and number
              </span>
            )}
          </div>

          {/* Sign Up Button */}
          <div className="mt-4">
            <input
              type="submit"
              value="Sign Up"
              className="w-full py-2 font-semibold text-white transition-all duration-300 rounded-lg shadow-lg cursor-pointer bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-500 hover:to-blue-500"
            />
          </div>
        </form>

        {/* Social Login */}
        <div className="mt-4 text-center">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="text-blue-300 hover:underline">
              Login
            </Link>
          </p>
          <div className="my-3 divider"></div>
          <div className="flex justify-center">
            <SocialLogin />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
