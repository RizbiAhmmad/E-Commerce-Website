import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { AuthContext } from "../../../provider/AuthProvider";

const Profile = () => {
  const { user, logOut } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/"); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-20 bg-white shadow-md border border-green-500 p-6 rounded-xl">
      <h2 className="text-3xl font-bold text-center text-green-600 mb-6">Your Profile</h2>

      <div className="flex flex-col items-center gap-4">
        <img
          src={user?.photoURL || "https://www.shutterstock.com/image-vector/user-circle-isolated-icon-round-600nw-2459622791.jpg"}
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-green-400 object-cover"
        />
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800">{user?.displayName || "Anonymous"}</h3>
          <p className="text-gray-600">{user?.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 flex items-center gap-2 bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600 transition"
        >
          <FiLogOut className="text-lg" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
