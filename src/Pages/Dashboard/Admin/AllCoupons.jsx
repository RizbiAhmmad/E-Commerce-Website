import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AllCoupons = () => {
  const { data: coupons = [], refetch } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const res = await axios.get("https://e-commerce-server-api.onrender.com/coupons");
      return res.data;
    },
  });

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    startDate: "",
    expiryDate: "",
    status: "active",
    image: "",
  });

  const [newImageFile, setNewImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const openEditModal = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      name: coupon.name,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      startDate: coupon.startDate?.slice(0, 10) || "",
      expiryDate: coupon.expiryDate?.slice(0, 10) || "",
      status: coupon.status,
      image: coupon.image,
    });
    setNewImageFile(null);
    setIsModalOpen(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setNewImageFile(e.target.files[0]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = formData.image;

      if (newImageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", newImageFile);
        fd.append("upload_preset", "eCommerce"); // তোমার Cloudinary preset
        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dt3bgis04/image/upload",
          fd
        );
        imageUrl = uploadRes.data.secure_url;
        setUploading(false);
      }

      await axios.put(
        `https://e-commerce-server-api.onrender.com/coupons/${selectedCoupon._id}`,
        {
          ...formData,
          image: imageUrl,
        }
      );

      Swal.fire("Updated!", "Coupon has been updated.", "success");
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      Swal.fire("Error", "Failed to update coupon", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This coupon will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`https://e-commerce-server-api.onrender.com/coupons/${id}`).then((res) => {
          if (res.data.deletedCount > 0) {
            refetch();
            Swal.fire("Deleted!", "Coupon removed.", "success");
          }
        });
      }
    });
  };

  return (
    <div className="max-w-6xl p-4 sm:p-6 mx-auto">
      <h2 className="pb-4 mb-6 text-3xl sm:text-4xl font-bold text-center border-b-2 border-gray-200">
        All Coupons
      </h2>

      {/* Add Coupon Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/dashboard/addCoupon")}
          className="flex items-center gap-2 px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
        >
          <FaPlus /> Add Coupon
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 sm:px-6 py-3">#</th>
              <th className="px-4 sm:px-6 py-3">Image</th>
              <th className="px-4 sm:px-6 py-3">Name</th>
              <th className="px-4 sm:px-6 py-3">Code</th>
              <th className="px-4 sm:px-6 py-3">Discount</th>
              <th className="px-4 sm:px-6 py-3">Start</th>
              <th className="px-4 sm:px-6 py-3">Expiry</th>
              <th className="px-4 sm:px-6 py-3">Status</th>
              <th className="px-4 sm:px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {coupons.map((coupon, index) => (
              <tr key={coupon._id} className="transition duration-200 hover:bg-gray-50">
                <td className="px-4 sm:px-6 py-4">{index + 1}</td>
                <td className="px-4 sm:px-6 py-4">
                  <img
                    src={coupon.image}
                    alt={coupon.name}
                    className="object-cover w-10 h-10 border rounded"
                  />
                </td>
                <td className="px-4 sm:px-6 py-4 font-semibold text-gray-800">{coupon.name}</td>
                <td className="px-4 sm:px-6 py-4 font-mono">{coupon.code}</td>
                <td className="px-4 sm:px-6 py-4">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}%`
                    : `$${coupon.discountValue}`}
                </td>
                <td className="px-4 sm:px-6 py-4">{coupon.startDate?.slice(0, 10)}</td>
                <td className="px-4 sm:px-6 py-4">{coupon.expiryDate?.slice(0, 10)}</td>
                <td className="px-4 sm:px-6 py-4">
                  {coupon.status === "active" ? (
                    <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded">Active</span>
                  ) : (
                    <span className="px-2 py-1 text-xs text-red-800 bg-red-100 rounded">Inactive</span>
                  )}
                </td>
                <td className="flex gap-2 sm:gap-4 px-4 sm:px-6 py-4">
                  <button onClick={() => openEditModal(coupon)}>
                    <FaEdit className="text-2xl text-cyan-500 hover:text-cyan-600" />
                  </button>
                  <button onClick={() => handleDelete(coupon._id)}>
                    <FaTrashAlt className="text-2xl text-red-500 hover:text-red-700" />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan="9" className="py-6 text-center text-gray-500">
                  No coupons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 px-4">
          <div className="bg-white p-2 sm:p-4 rounded shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              ✖
            </button>
            <h3 className="mb-4 text-xl font-semibold">Edit Coupon</h3>
            <form onSubmit={handleUpdate} className="space-y-2 sm:space-y-3">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleModalChange}
                placeholder="Coupon Name"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleModalChange}
                placeholder="Coupon Code"
                className="w-full p-2 border rounded"
                required
              />
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleModalChange}
                className="w-full p-2 border rounded"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleModalChange}
                placeholder="Discount Value"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="number"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleModalChange}
                placeholder="Minimum Order Amount"
                className="w-full p-2 border rounded"
              />
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleModalChange}
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleModalChange}
                className="w-full p-2 border rounded"
                required
              />

              <div>
                <label className="block text-sm font-medium">Image</label>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="newImage"
                    className="px-4 py-2 text-white bg-cyan-500 rounded cursor-pointer hover:bg-cyan-600"
                  >
                    Choose File
                  </label>
                  <span className="text-sm text-gray-600">
                    {newImageFile ? newImageFile.name : "Keep current image"}
                  </span>
                </div>
                <input
                  id="newImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="current"
                    className="w-16 h-16 mt-2 rounded object-cover border"
                  />
                )}
                {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
              </div>

              <select
                name="status"
                value={formData.status}
                onChange={handleModalChange}
                className="w-full p-2 border rounded"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                type="submit"
                disabled={uploading}
                className="w-full px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600 disabled:opacity-60"
              >
                Update Coupon
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCoupons;
