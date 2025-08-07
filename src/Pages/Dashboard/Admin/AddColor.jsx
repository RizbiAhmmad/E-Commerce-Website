import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const AddColor = () => {
  const [colorData, setColorData] = useState({
    name: "",
    hex: "#000000",
    status: "active",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setColorData({ ...colorData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/colors", colorData); // Update with your backend URL
      if (res.data.insertedId) {
        Swal.fire("Success!", "Color added successfully", "success");
        setColorData({ name: "", hex: "#000000", status: "active" });
      }
    } catch (error) {
      Swal.fire("Error", "Failed to add color", "error");
    }
  };

  return (
    <div className="max-w-xl p-6 mx-auto mt-10 bg-white border rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center">Add New Color</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block mb-1 font-medium">Color Name</label>
          <input
            type="text"
            name="name"
            value={colorData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            placeholder="e.g. Red, Blue, Green"
            required
          />
        </div>

        {/* Hex */}
        <div>
          <label className="block mb-1 font-medium">Pick Color</label>
          <input
            type="color"
            name="hex"
            value={colorData.hex}
            onChange={handleChange}
            className="w-16 h-10 p-0 border cursor-pointer rounded"
            required
          />
        </div>

        {/* Status */}
        <div>
          <label className="block mb-1 font-medium">Status</label>
          <select
            name="status"
            value={colorData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-2 font-semibold text-white bg-green-600 rounded hover:bg-green-700"
        >
          Add Color
        </button>
      </form>
    </div>
  );
};

export default AddColor;