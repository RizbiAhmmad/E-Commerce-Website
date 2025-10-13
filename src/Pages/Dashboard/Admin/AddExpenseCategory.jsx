import React, { useState  } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const AddExpenseCategory = () => {
  const [formData, setFormData] = useState({
    name: "",
    status: "active",
  });
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosPublic.post("/expense-categories", formData);
      if (res.data.insertedId) {
        Swal.fire("Success", "Expense category added!", "success");
        setFormData({ name: "", status: "active" });
        navigate("/dashboard/allExpenseCategories");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to add expense category", "error");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Add Expense Category</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>
       
        <div>
          <label className="block font-medium mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600"
        >
          Add Expense Category
        </button>
      </form>
    </div>
  );
};

export default AddExpenseCategory;