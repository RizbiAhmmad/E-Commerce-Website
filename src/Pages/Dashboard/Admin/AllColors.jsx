import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const AllColors = () => {
  const axiosPublic = useAxiosPublic();
  const isDemo = import.meta.env.VITE_DEMO_MODE === "true"; // ✅ Demo Mode Check

  const { data: colors = [], refetch } = useQuery({
    queryKey: ["colors"],
    queryFn: async () => {
      const res = await axiosPublic.get("/colors");
      return res.data;
    },
  });

  const navigate = useNavigate();
  const [localColors, setLocalColors] = useState([]); // ✅ Local state for demo updates
  const currentData = isDemo && localColors.length ? localColors : colors;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    hex: "#000000",
    status: "active",
  });

  const openEditModal = (color) => {
    setSelectedColor(color);
    setFormData({
      name: color.name,
      hex: color.hex,
      status: color.status,
    });
    setIsModalOpen(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      if (isDemo) {
        // ✅ Demo update without real API call
        const updated = currentData.map((c) =>
          c._id === selectedColor._id
            ? { ...c, name: formData.name, hex: formData.hex, status: formData.status }
            : c
        );
        setLocalColors(updated);
        setIsModalOpen(false);
        Swal.fire("Demo Mode", "Color updated temporarily!", "info");
        return;
      }

      await axiosPublic.put(`/colors/${selectedColor._id}`, formData);
      Swal.fire("Updated!", "Color has been updated.", "success");
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      Swal.fire("Error", "Failed to update color", "error");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This color will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        if (isDemo) {
          // ✅ Demo delete without affecting backend
          const filtered = currentData.filter((c) => c._id !== id);
          setLocalColors(filtered);
          Swal.fire("Demo Mode", "Color deleted temporarily!", "info");
          return;
        }

        axiosPublic.delete(`/colors/${id}`).then((res) => {
          if (res.data.deletedCount > 0) {
            refetch();
            Swal.fire("Deleted!", "Color removed.", "success");
          }
        });
      }
    });
  };

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        All Colors
      </h2>

      {isDemo && (
        <p className="mb-4 text-sm text-orange-500 font-semibold text-center">
          🧩 Demo Mode Active — Changes are temporary only.
        </p>
      )}

      {/* Add Color Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/dashboard/addColor")}
          className="flex items-center gap-2 px-4 py-2 text-white bg-cyan-500 rounded-xl hover:bg-cyan-600"
        >
          <FaPlus /> Add Color
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Color</th>
              <th className="px-6 py-3">Preview</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentData.map((color, index) => (
              <tr key={color._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 font-semibold">{color.name}</td>
                <td className="px-6 py-4">
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: color.hex }}
                    title={color.hex}
                  ></div>
                </td>
                <td className="px-6 py-4">
                  {color.status === "active" ? (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="flex gap-4 px-6 py-4">
                  <button onClick={() => openEditModal(color)}>
                    <FaEdit className="text-xl text-cyan-500 hover:text-cyan-600" />
                  </button>
                  <button onClick={() => handleDelete(color._id)}>
                    <FaTrashAlt className="text-xl text-red-500 hover:text-red-700" />
                  </button>
                </td>
              </tr>
            ))}
            {currentData.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-500">
                  No colors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              ✖
            </button>
            <h3 className="mb-4 text-xl font-semibold">Edit Color</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Color Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Hex Code</label>
                <input
                  type="color"
                  name="hex"
                  value={formData.hex}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded h-10"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600"
              >
                Update Color
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllColors;
