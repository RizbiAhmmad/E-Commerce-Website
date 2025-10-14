import React, { useContext, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/provider/AuthProvider";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const AddBrand = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();

  const [formData, setFormData] = useState({
    name: "",
    status: "inactive",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogoChange = (e) => setLogoFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!logoFile) {
      return Swal.fire("Error", "Please select a logo image", "error");
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", logoFile);
      fd.append("upload_preset", "eCommerce");
      const uploadRes = await axiosPublic.post(
        "https://api.cloudinary.com/v1_1/dt3bgis04/image/upload",
        fd
      );
      const logoUrl = uploadRes.data.secure_url;

      const payload = {
        name: formData.name,
        status: formData.status,
        logo: logoUrl,
        createdByEmail: user?.email,
        createdAt: new Date().toISOString(),
      };

      const res = await axiosPublic.post("/brands", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data.insertedId) {
        Swal.fire("Success", "Brand added successfully!", "success");
        setFormData({ name: "", status: "active" });
        setLogoFile(null);
        navigate("/dashboard/allBrands");
      } else {
        Swal.fire("Info", res.data.message || "Brand already exists", "info");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to add brand", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-xl p-6 mx-auto mt-10 bg-white rounded-lg shadow">
      <h2 className="mb-6 text-2xl font-bold text-center">Add Brand</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Brand Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Apple"
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Logo</label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="logo"
              className="px-4 py-2 text-white bg-cyan-500 rounded cursor-pointer hover:bg-cyan-600"
            >
              Choose File
            </label>
            <span className="text-sm text-gray-600">
              {logoFile ? logoFile.name : "No file chosen"}
            </span>
          </div>
          <input
            id="logo"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="hidden"
            required
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
            {/* <option value="active">Active</option> */}
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Add Brand"}
        </button>
      </form>
    </section>
  );
};

export default AddBrand;
