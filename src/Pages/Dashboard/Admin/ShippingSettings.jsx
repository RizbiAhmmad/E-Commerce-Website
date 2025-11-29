import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const ShippingSettings = () => {
  const axiosPublic = useAxiosPublic();
  const [formData, setFormData] = useState({
    insideDhaka: "",
    outsideDhaka: "",
  });

  const [loading, setLoading] = useState(false);

  // Load existing shipping data
  useEffect(() => {
    const fetchShipping = async () => {
      const res = await axiosPublic.get("/shipping");
      if (res.data) {
        setFormData({
          insideDhaka: res.data.insideDhaka || "",
          outsideDhaka: res.data.outsideDhaka || "",
        });
      }
    };
    fetchShipping();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosPublic.post(
        "/shipping",
        JSON.stringify(formData),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data.success) {
        Swal.fire("Success", "Shipping Settings Updated!", "success");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center">Shipping Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block mb-1 font-semibold">Inside Dhaka (৳)</label>
          <input
            type="number"
            name="insideDhaka"
            value={formData.insideDhaka}
            onChange={handleChange}
            placeholder="e.g., 70"
            required
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Outside Dhaka (৳)</label>
          <input
            type="number"
            name="outsideDhaka"
            value={formData.outsideDhaka}
            onChange={handleChange}
            placeholder="e.g., 130"
            required
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
};

export default ShippingSettings;