import React, { useContext, useState } from "react";
import { AuthContext } from "@/provider/AuthProvider";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.displayName || "");
  const [address, setAddress] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = user?.photoURL;

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "eCommerce");

        const res = await axiosPublic.post(
          "https://api.cloudinary.com/v1_1/dt3bgis04/image/upload",
          formData
        );

        imageUrl = res.data.secure_url;
      }

      await axiosPublic.patch(`/users/profile/${user.email}`, {
        name,
        photoURL: imageUrl,
        address,
      });

      await updateUserProfile(name, imageUrl);

      Swal.fire("Success", "Profile updated successfully", "success");
    navigate("/dashboard/profile");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Profile update failed", "error");
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold text-center mb-6">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          className="w-full border px-4 py-2 rounded"
          required
        />

        {/* Address */}
        {/* <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Your Address"
          className="w-full border px-4 py-2 rounded"
        /> */}

        {/* Image */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />

        <button
          disabled={loading}
          className="w-full bg-cyan-500 text-white py-2 rounded-xl hover:bg-cyan-600"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
