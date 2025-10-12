import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AllBrands = () => {
  const navigate = useNavigate();
  const { data: brands = [], refetch } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await axios.get("https://api.sports.bangladeshiit.com/brands");
      return res.data;
    },
  });

  const [isOpen, setIsOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formData, setFormData] = useState({ name: "", status: "active", logo: "" });
  const [newLogoFile, setNewLogoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const openEdit = (brand) => {
    setSelectedBrand(brand);
    setFormData({ name: brand.name, status: brand.status, logo: brand.logo });
    setNewLogoFile(null);
    setIsOpen(true);
  };

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleLogoChange = (e) => {
    setNewLogoFile(e.target.files[0]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      let logoUrl = formData.logo;

      // If new logo selected, upload to Cloudinary
      if (newLogoFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", newLogoFile);
        fd.append("upload_preset", "eCommerce");
        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dt3bgis04/image/upload",
          fd
        );
        logoUrl = uploadRes.data.secure_url;
        setUploading(false);
      }

      await axios.put(`https://api.sports.bangladeshiit.com/brands/${selectedBrand._id}`, {
        name: formData.name,
        status: formData.status,
        logo: logoUrl,
      });

      Swal.fire("Updated!", "Brand updated successfully", "success");
      setIsOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update brand", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This brand will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await axios.delete(`https://api.sports.bangladeshiit.com/brands/${id}`);
        if (res.data.deletedCount > 0) {
          refetch();
          Swal.fire("Deleted!", "Brand removed.", "success");
        }
      }
    });
  };

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        All Brands
      </h2>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/dashboard/addBrand")}
          className="flex items-center gap-2 px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
        >
          <FaPlus /> Add Brand
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Logo</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {brands.map((b, i) => (
              <tr key={b._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{i + 1}</td>
                <td className="px-6 py-4">
                  <img src={b.logo} alt={b.name} className="w-10 h-10 rounded object-cover border" />
                </td>
                <td className="px-6 py-4 font-semibold">{b.name}</td>
                <td className="px-6 py-4">
                  {b.status === "active" ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Active</span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Inactive</span>
                  )}
                </td>
                <td className="flex gap-4 px-6 py-4">
                  <h1>Edit & delete option hidden for demo show</h1>
                  {/* <button onClick={() => openEdit(b)}>
                    <FaEdit className="text-2xl text-cyan-500 hover:text-cyan-600" />
                  </button>
                  <button onClick={() => handleDelete(b._id)}>
                    <FaTrashAlt className="text-2xl text-red-500 hover:text-red-700" />
                  </button> */}
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-500">
                  No brands found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-md p-6 bg-white rounded shadow">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute text-xl text-gray-500 top-2 right-2"
            >
              ✖
            </button>

            <h3 className="mb-4 text-xl font-semibold">Edit Brand</h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Brand Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Logo</label>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="newLogo"
                    className="px-4 py-2 text-white bg-cyan-500 rounded cursor-pointer hover:bg-cyan-600"
                  >
                    Choose File
                  </label>
                  <span className="text-sm text-gray-600">
                    {newLogoFile ? newLogoFile.name : "Keep current logo"}
                  </span>
                </div>
                <input
                  id="newLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                {formData.logo && (
                  <img src={formData.logo} alt="current" className="w-16 h-16 mt-2 rounded object-cover border" />
                )}
                {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
              </div>

              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600 disabled:opacity-60"
              >
                Update Brand
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllBrands;
