import React, { useState, useContext } from "react";
import { AuthContext } from "../../../provider/AuthProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const AddReturnProduct = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    reason: "",
    price: "",
    referenceNo: "",
    customerName: "",
    customerEmail: "",
    date: "", // added date
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      const cloudinaryData = new FormData();
      cloudinaryData.append("file", imageFile);
      cloudinaryData.append("upload_preset", "eCommerce");

      const cloudinaryRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dt3bgis04/image/upload",
        cloudinaryData
      );

      const imageUrl = cloudinaryRes.data.secure_url;

      // Submit to backend
      const returnProductData = {
        ...formData,
        image: imageUrl,
        email: user?.email, // logged-in staff/admin email
        price: Number(formData.price),
        referenceNo: Number(formData.referenceNo),
      };

      const res = await axios.post(
        "https://e-commerce-server-api.onrender.com/return-products",
        JSON.stringify(returnProductData),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.insertedId) {
        Swal.fire("Success", "Return product added successfully!", "success");
        setFormData({
          name: "",
          referenceNo: "",
          price: "",
          reason: "",
          customerName: "",
          customerEmail: "",
          date: "", // reset date
        });
        setImageFile(null);
        navigate("/dashboard/allReturnProducts");
      } else {
        Swal.fire("Error", "Server error. Product not added.", "error");
      }
    } catch (err) {
      console.error(
        "❌ Add Return Product Error:",
        err.response?.data || err.message
      );
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center">
        Add Return Product
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block mb-1 font-semibold">Product Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Product Name"
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Reference No */}
        <div>
          <label className="block mb-1 font-semibold">Reference No</label>
          <input
            type="number"
            name="referenceNo"
            required
            value={formData.referenceNo}
            onChange={handleChange}
            placeholder="Reference Number"
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block mb-1 font-semibold">Price</label>
          <input
            type="number"
            name="price"
            required
            value={formData.price}
            onChange={handleChange}
            placeholder="Price"
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Customer Name */}
        <div>
          <label className="block mb-1 font-semibold">Customer Name</label>
          <input
            type="text"
            name="customerName"
            required
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Customer Name"
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Customer Email */}
        <div>
          <label className="block mb-1 font-semibold">Customer Email</label>
          <input
            type="email"
            name="customerEmail"
            required
            value={formData.customerEmail}
            onChange={handleChange}
            placeholder="Customer Email"
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block mb-1 font-semibold">Return Date</label>
          <input
            type="date"
            name="date"
            required
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Reason */}
        <div>
          <label className="block mb-1 font-semibold">Reason</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Optional Reason"
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Image */}
        <div>
          <label className="block mb-1 font-semibold">Image</label>
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
        >
          {loading ? "Submitting..." : "Add Return Product"}
        </button>
      </form>
    </div>
  );
};

export default AddReturnProduct;
