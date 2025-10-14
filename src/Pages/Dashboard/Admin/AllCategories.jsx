import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const AllCategories = () => {
  const axiosPublic = useAxiosPublic();
  const isDemo = import.meta.env.VITE_DEMO_MODE === "true";

  const { data: categories = [], refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosPublic.get("/categories");
      return res.data;
    },
  });

  const navigate = useNavigate();
  const [localCategories, setLocalCategories] = useState([]);
  const currentData = isDemo && localCategories.length ? localCategories : categories;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    status: "active",
    image: "",
  });
  const [newImageFile, setNewImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentCategories = currentData.slice(indexOfFirst, indexOfLast);

  const openEditModal = (cat) => {
    setSelectedCategory(cat);
    setFormData({
      name: cat.name,
      status: cat.status,
      image: cat.image,
    });
    setNewImageFile(null);
    setIsModalOpen(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setNewImageFile(e.target.files[0]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = formData.image;

      if (isDemo) {
        const updated = currentData.map((cat) =>
          cat._id === selectedCategory._id
            ? { ...cat, name: formData.name, status: formData.status, image: imageUrl }
            : cat
        );
        setLocalCategories(updated);
        setIsModalOpen(false);
        Swal.fire("Demo Mode", "Category updated temporarily!", "info");
        return;
      }

      if (newImageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", newImageFile);
        fd.append("upload_preset", "eCommerce");
        const uploadRes = await axiosPublic.post(
          "https://api.cloudinary.com/v1_1/dt3bgis04/image/upload",
          fd
        );
        imageUrl = uploadRes.data.secure_url;
        setUploading(false);
      }

      await axiosPublic.put(`/categories/${selectedCategory._id}`, {
        name: formData.name,
        status: formData.status,
        image: imageUrl,
      });

      Swal.fire("Updated!", "Category has been updated.", "success");
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      Swal.fire("Error", "Failed to update category", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This category will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (isDemo) {
          const filtered = currentData.filter((cat) => cat._id !== id);
          setLocalCategories(filtered);
          Swal.fire("Demo Mode", "Category deleted temporarily!", "info");
          return;
        }

        const res = await axiosPublic.delete(`/categories/${id}`);
        if (res.data.deletedCount > 0) {
          refetch();
          Swal.fire("Deleted!", "Category removed.", "success");
        }
      }
    });
  };

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <h2 className="pb-4 mb-4 text-4xl font-bold text-center border-b-2 border-gray-200">
        All Categories
      </h2>

      {isDemo && (
        <p className="mb-4 text-sm text-orange-500 font-semibold text-center">
          🧩 Demo Mode Active — Changes are temporary only.
        </p>
      )}

      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/dashboard/addCategory")}
          className="flex items-center gap-2 px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
        >
          <FaPlus /> Add Category
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Image</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentCategories.map((cat, index) => (
              <tr
                key={cat._id}
                className="transition duration-200 hover:bg-gray-50"
              >
                <td className="px-6 py-4">{indexOfFirst + index + 1}</td>
                <td className="px-6 py-4">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="object-cover w-10 h-10 border rounded"
                  />
                </td>
                <td className="px-6 py-4 font-semibold text-gray-800">
                  {cat.name}
                </td>
                <td className="px-6 py-4">
                  {cat.status === "active" ? (
                    <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs text-red-800 bg-red-100 rounded">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="flex gap-4 px-6 py-4">
                  <button onClick={() => openEditModal(cat)}>
                    <FaEdit className="text-2xl text-cyan-500 hover:text-cyan-600" />
                  </button>
                  <button onClick={() => handleDelete(cat._id)}>
                    <FaTrashAlt className="text-2xl text-red-500 hover:text-red-700" />
                  </button>
                </td>
              </tr>
            ))}
            {currentData.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="py-6 text-center text-gray-500"
                >
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {currentData.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          {[...Array(totalPages).keys()].map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === num + 1
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {num + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              ✖
            </button>
            <h3 className="mb-4 text-xl font-semibold">Edit Category</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
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
                <label className="block text-sm font-medium">Image</label>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="newImage"
                    className="px-4 py-2 text-white bg-cyan-500 rounded cursor-pointer hover:bg-cyan-600"
                  >
                    Choose File
                  </label>
                  <span className="text-sm text-gray-600">
                    {newImageFile ? newImageFile.name : "Keep current image"}
                  </span>
                </div>
                <input
                  id="newImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="current"
                    className="w-16 h-16 mt-2 rounded object-cover border"
                  />
                )}
                {uploading && (
                  <p className="text-sm text-gray-500 mt-1">Uploading...</p>
                )}
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
                disabled={uploading}
                className="px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600 disabled:opacity-60"
              >
                Update Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCategories;
