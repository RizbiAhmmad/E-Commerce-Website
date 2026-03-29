import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const NoticeSettings = () => {
  const axiosPublic = useAxiosPublic();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    buttonText: "",
    delay: 3000,
    isActive: true,
  });

  useEffect(() => {
    const fetchNotice = async () => {
      const res = await axiosPublic.get("/notice");
      if (res.data) setFormData(res.data);
    };
    fetchNotice();
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
    const res = await axiosPublic.post("/notice", formData);

    if (res.data.success) {
      Swal.fire("Success", "Notice Updated!", "success");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Notice Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Notice Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />

        <textarea
          name="description"
          placeholder="Notice Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />

        <input
          type="text"
          name="buttonText"
          placeholder="Button Text"
          value={formData.buttonText}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />

        <input
          type="number"
          name="delay"
          placeholder="Delay (ms)"
          value={formData.delay}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        />
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-5 h-5 accent-green-500 cursor-pointer"
          />
          <span className="font-medium">Active Notice</span>
        </label>

        <button className="w-full bg-cyan-500 text-white py-2 rounded">
          Save Notice
        </button>
      </form>
    </div>
  );
};

export default NoticeSettings;
