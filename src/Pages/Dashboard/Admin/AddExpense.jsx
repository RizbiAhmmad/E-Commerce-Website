import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AddExpense = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    price: "",
    date: "",
  });

  // fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/expense-categories");
        setCategories(res.data);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      ...formData,
      price: Number(formData.price),
    };

    const res = await axios.post("http://localhost:5000/expenses", payload);

    if (res.data.insertedId) {
      Swal.fire("Success", "Expense added successfully!", "success");
      setFormData({ category: "", name: "", price: "", date: "" });
      navigate("/dashboard/allExpense");
    }
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Failed to add expense", "error");
  }
};


  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Add Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Category Dropdown */}
        <div>
          <label className="block font-medium mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
             <option value="">Select Category</option>
    {categories
      .filter((cat) => cat.status === "active") 
      .map((cat) => (
        <option key={cat._id} value={cat.name}>
          {cat.name}
        </option>
            ))}
          </select>
        </div>

        {/* Name */}
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

        {/* Price */}
        <div>
          <label className="block font-medium mb-1">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block font-medium mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default AddExpense;