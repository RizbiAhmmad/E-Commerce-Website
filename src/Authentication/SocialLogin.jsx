import { AuthContext } from "@/provider/AuthProvider";
import React, { useContext } from "react";
import { FaGoogle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

const SocialLogin = () => {
  const { googleSignIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleGoogleSignIn = () => {
    googleSignIn()
      .then((result) => {
        const user = result.user;
        const userInfo = {
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          role: "user",
          createdAt: new Date(),
        };

        fetch("http://localhost:5000/users", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(userInfo),
        })
          .then((res) => res.json())
          .then(() => {
            console.log("User saved to MongoDB");
            navigate(from, { replace: true });
          })
          .catch((error) =>
            console.error("Error saving user to MongoDB:", error)
          );
      })
      .catch((error) => console.error("Google Sign-In Error:", error));
  };

  return (
    <div>
      <button
        onClick={handleGoogleSignIn}
        className="btn flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        <FaGoogle />
        Sign in with Google
      </button>
    </div>
  );
};

export default SocialLogin;