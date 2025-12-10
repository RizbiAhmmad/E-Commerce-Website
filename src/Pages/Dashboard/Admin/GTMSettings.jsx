import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const GTMSettings = () => {
  const axiosPublic = useAxiosPublic();
  const [formData, setFormData] = useState({
    gtmId: "",
    enableGtm: false,
  });
  const [loading, setLoading] = useState(false);

  // Load existing GTM settings
  useEffect(() => {
    const fetchGTM = async () => {
      const res = await axiosPublic.get("/gtm");
      if (res.data) {
        setFormData({
          gtmId: res.data.gtmId || "",
          enableGtm: res.data.enableGtm || false,
        });
      }
    };
    fetchGTM();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosPublic.post("/gtm", formData);
      if (res.data.success) {
        Swal.fire("Success", "GTM Settings Updated!", "success");
      }
    } catch (err) {
      Swal.fire("Error", "Failed to update GTM!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center">Google Tag Manager Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block mb-1 font-semibold">GTM ID</label>
          <input
            type="text"
            name="gtmId"
            value={formData.gtmId}
            onChange={handleChange}
            placeholder="GTM-XXXXXXX"
            className="w-full px-4 py-2 border rounded"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="enableGtm"
            checked={formData.enableGtm}
            onChange={handleChange}
          />
          <label>Enable GTM</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-white bg-cyan-500 rounded-xl hover:bg-cyan-600"
        >
          {loading ? "Saving..." : "Save GTM Settings"}
        </button>
      </form>
    </div>
  );
};

export default GTMSettings;
