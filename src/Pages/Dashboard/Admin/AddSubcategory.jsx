import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AddSubcategory = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    status: "active",
  });

  useEffect(() => {
    axios.get("https://e-commerce-server-api.onrender.com/categories").then((res) => {
      setCategories(res.data);
    });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://e-commerce-server-api.onrender.com/subcategories", formData);
      if (res.data.insertedId) {
        Swal.fire("Success", "Subcategory added!", "success");
        setFormData({ name: "", categoryId: "", status: "active" });
        navigate("/dashboard/allsubCategories");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to add subcategory", "error");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Add Subcategory</h2>
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
          <label className="block font-medium mb-1">Category</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
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
          Add Subcategory
        </button>
      </form>
    </div>
  );
};

export default AddSubcategory;