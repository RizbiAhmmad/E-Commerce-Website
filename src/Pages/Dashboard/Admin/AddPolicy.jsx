import React, { useState, useContext } from "react";
import { AuthContext } from "../../../provider/AuthProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const AddPolicy = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const policyData = {
        ...formData,
        email: user?.email,
        createdAt: new Date(),
      };

      const res = await axios.post(
        "https://e-commerce-server-api.onrender.com/policies",
        JSON.stringify(policyData),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data.insertedId) {
        Swal.fire("Success", "Policy added successfully!", "success");
        setFormData({ title: "", content: "", status: "active" });
        navigate("/dashboard/allPolicies");
      } else {
        Swal.fire("Error", "Server error. Policy not added.", "error");
      }
    } catch (err) {
      console.error("❌ Add Policy Error:", err.response?.data || err.message);
      Swal.fire("Error", "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center">Add Policy</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Policy Title</label>
          <select
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded"
          >
            <option value="">Select Policy Type</option>
            <option value="Privacy Policy">Privacy Policy</option>
            <option value="Return & Refund Policy">Return & Refund Policy</option>
            <option value="Terms & Conditions">Terms & Conditions</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            placeholder="Write policy details here..."
            rows="8"
            className="w-full px-4 py-2 border rounded"
          ></textarea>
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
          {loading ? "Submitting..." : "Add Policy"}
        </button>
      </form>
    </div>
  );
};

export default AddPolicy;
