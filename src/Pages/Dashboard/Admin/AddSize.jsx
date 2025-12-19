import { useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const AddSize = () => {
  const [formData, setFormData] = useState({
    name: "",
    status: "active",
  });

  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      Swal.fire("Error", "Size name is required", "error");
      return;
    }

    try {
      const res = await axiosPublic.post("/sizes", formData);
      if (res.data.insertedId) {
        Swal.fire("Success", "Size added successfully", "success");
        setFormData({ name: "", status: "active" });
        navigate("/dashboard/allSizes"); // Navigate after successful submission
      }
    } catch (error) {
      Swal.fire("Error", "Failed to add size", "error");
    }
  };

  return (
    <div className="max-w-lg p-6 mx-auto bg-white rounded shadow">
      <h2 className="mb-6 text-2xl font-bold text-center">Add Size</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Size Name */}
        <div>
          <label className="block mb-1 text-sm font-medium">Size Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter size (e.g., S, M, L, XL or 40, 41, 42)"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Status */}
        <div>
          <label className="block mb-1 text-sm font-medium">Status</label>
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

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
        >
          Add Size
        </button>
      </form>
    </div>
  );
};

export default AddSize;
