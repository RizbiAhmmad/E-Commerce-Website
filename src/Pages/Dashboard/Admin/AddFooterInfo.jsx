import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const AddFooterInfo = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    facebook: "",
    youtube: "",
    linkedin: "",
    tiktok: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!logoFile) {
      return Swal.fire("Error", "Please select a logo image", "error");
    }

    setLoading(true);
    try {
      // Upload logo to Cloudinary
      const cloudinaryData = new FormData();
      cloudinaryData.append("file", logoFile);
      cloudinaryData.append("upload_preset", "eCommerce");

      const cloudRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dt3bgis04/image/upload",
        cloudinaryData
      );

      const logoUrl = cloudRes.data.secure_url;

      // Submit to backend
      const footerData = {
        ...formData,
        logo: logoUrl,
      };

      const res = await axios.post(
        "https://e-commerce-server-api.onrender.com/footer",
        JSON.stringify(footerData),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data.insertedId) {
        Swal.fire("Success", "Footer info added successfully!", "success");
        setFormData({
          name: "",
          description: "",
          phone: "",
          email: "",
          address: "",
          facebook: "",
          linkedin: "",
        });
        setLogoFile(null);
        navigate("/dashboard/FooterInfo");
      } else {
        Swal.fire("Error", "Server error. Footer info not added.", "error");
      }
    } catch (err) {
      console.error("❌ Add Footer Info Error:", err.response?.data || err.message);
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center">Add Information</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Logo Upload */}
        <div>
          <label className="block mb-1 font-semibold">Logo</label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="logo"
              className="px-4 py-2 text-white transition bg-cyan-500 rounded-lg shadow cursor-pointer hover:bg-cyan-600"
            >
              Choose File
            </label>
            <span className="text-sm text-gray-600">
              {logoFile ? logoFile.name : "No file chosen"}
            </span>
          </div>
          <input
            type="file"
            id="logo"
            name="logo"
            onChange={handleLogoChange}
            accept="image/*"
            required
            className="hidden"
          />
        </div>

        {/* Text Fields */}
        <input
          type="text"
          name="name"
          placeholder="Company Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Company Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          rows={3}
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="text"
          name="facebook"
          placeholder="Facebook URL"
          value={formData.facebook}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="text"
          name="youtube"
          placeholder="YouTube URL"
          value={formData.youtube}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="text"
          name="linkedin"
          placeholder="LinkedIn URL"
          value={formData.linkedin}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="text"
          name="tiktok"
          placeholder="TikTok URL"
          value={formData.tiktok}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
        >
          {loading ? "Submitting..." : "Add Information"}
        </button>
      </form>
    </div>
  );
};

export default AddFooterInfo;
