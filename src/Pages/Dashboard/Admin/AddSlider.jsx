import React, { useState, useContext } from "react";
import { AuthContext } from "../../../provider/AuthProvider";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const AddSlider = () => {
  const { user } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    status: "active",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const optimizeSliderImage = (file, maxWidth = 1700, quality = 0.85) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");

        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            const optimizedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          },
          "image/jpeg",
          quality
        );
      };
    });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      return Swal.fire("Error", "Please select an image", "error");
    }

    setLoading(true);

    try {
      // Upload image to Cloudinary
      const optimizedImage = await optimizeSliderImage(imageFile, 1700, 0.85);

      const cloudinaryData = new FormData();
      cloudinaryData.append("file", optimizedImage);
      cloudinaryData.append("upload_preset", "eCommerce");
      cloudinaryData.append("folder", "sliders");

      const cloudinaryRes = await axiosPublic.post(
        "https://api.cloudinary.com/v1_1/dt3bgis04/image/upload",
        cloudinaryData
      );

      const imageUrl = cloudinaryRes.data.secure_url;

      // Submit to backend
      const bannerData = {
        ...formData,
        image: imageUrl,
        email: user?.email,
      };

      const res = await axiosPublic.post(
        "/slider",
        JSON.stringify(bannerData),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.insertedId) {
        Swal.fire("Success", "Slider added successfully!", "success");
        setFormData({ status: "active" });
        setImageFile(null);
        navigate("/dashboard/allSliders");
      } else {
        Swal.fire("Error", "Server error. Slider not added.", "error");
      }
    } catch (err) {
      console.error("❌ Add Slider Error:", err.response?.data || err.message);
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center">Add New Slider</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">
            Image (1700 x 600 px)
          </label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="image"
              className="px-4 py-2 text-white transition bg-cyan-500 rounded-lg shadow cursor-pointer hover:bg-cyan-600"
            >
              Choose File
            </label>
            <span className="text-sm text-gray-600">
              {imageFile ? imageFile.name : "No file chosen"}
            </span>
          </div>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            required
            className="hidden"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
        >
          {loading ? "Submitting..." : "Add Slider"}
        </button>
      </form>
    </div>
  );
};

export default AddSlider;
