import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AllReturnProducts = () => {
  const { data: returnProducts = [], refetch } = useQuery({
    queryKey: ["returnProducts"],
    queryFn: async () => {
      const res = await axios.get(
        "https://e-commerce-server-api.onrender.com/return-products"
      );
      return res.data;
    },
  });

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    referenceNo: "",
    price: "",
    reason: "",
    customerName: "",
    customerEmail: "",
    date: "",
    image: "",
  });

  // Search & Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filter products
  const filteredProducts = returnProducts.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.referenceNo || "").toString().includes(searchTerm) ||
      (p.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.customerEmail || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({ ...product });
    setIsModalOpen(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `https://e-commerce-server-api.onrender.com/return-products/${selectedProduct._id}`,
        formData
      );
      Swal.fire("Updated!", "Return product has been updated.", "success");
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      Swal.fire("Error", "Failed to update product", "error");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This product will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(
            `https://e-commerce-server-api.onrender.com/return-products/${id}`
          )
          .then((res) => {
            if (res.data.deletedCount > 0) {
              refetch();
              Swal.fire("Deleted!", "Product removed.", "success");
            }
          });
      }
    });
  };

  return (
    <div className="max-w-7xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        All Returned Products
      </h2>

      {/* 🔎 Search & Add Button */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by product, ref no, or customer..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded px-4 py-2 text-sm shadow-sm w-72"
        />
        <button
          onClick={() => navigate("/dashboard/addReturnProduct")}
          className="flex items-center gap-2 px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
        >
          <FaPlus /> Add Return Product
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Reference No</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Customer Info</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentProducts.map((product, index) => (
              <tr
                key={product._id}
                className="transition duration-200 hover:bg-gray-50"
              >
                <td className="px-4 py-3">{indexOfFirst + index + 1}</td>
                <td className="px-4 py-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-12 h-12 border rounded"
                  />
                </td>
                <td className="px-4 py-3 font-semibold text-gray-800">
                  {product.name}
                </td>
                <td className="px-4 py-3">{product.referenceNo}</td>
                <td className="px-4 py-3">৳{product.price}</td>
                <td className="px-4 py-3">{product.reason || "-"}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{product.customerName}</p>
                  <p className="text-sm text-gray-600">
                    {product.customerEmail}
                  </p>
                </td>
                <td className="px-4 py-3">{product.date}</td>
                <td className="flex gap-4 px-4 py-3">
                  <button onClick={() => openEditModal(product)}>
                    <FaEdit className="text-2xl text-cyan-500 hover:text-cyan-600" />
                  </button>
                  <button onClick={() => handleDelete(product._id)}>
                    <FaTrashAlt className="text-2xl text-red-500 hover:text-red-700" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="9" className="py-6 text-center text-gray-500">
                  No returned products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-semibold text-white ${
              currentPage === 1
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-cyan-500 hover:bg-cyan-600"
            }`}
          >
            Previous
          </button>
          <span className="px-4 py-2 rounded-lg bg-gray-100">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-semibold text-white ${
              currentPage === totalPages
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-cyan-500 hover:bg-cyan-600"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* ✏️ Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              ✖
            </button>
            <h3 className="mb-4 text-xl font-semibold">Edit Return Product</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleModalChange}
                placeholder="Product Name"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="number"
                name="referenceNo"
                value={formData.referenceNo}
                onChange={handleModalChange}
                placeholder="Reference No"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleModalChange}
                placeholder="Price"
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleModalChange}
                placeholder="Reason"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleModalChange}
                placeholder="Customer Name"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleModalChange}
                placeholder="Customer Email"
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleModalChange}
                className="w-full p-2 border rounded"
                required
              />

              {/* ⬇️ Cloudinary Image Upload */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const formDataImg = new FormData();
                      formDataImg.append("file", file);
                      formDataImg.append(
                        "upload_preset",
                        "your_unsigned_preset"
                      ); // change this

                      try {
                        const res = await axios.post(
                          "https://api.cloudinary.com/v1_1/<your_cloud_name>/image/upload", // change this
                          formDataImg
                        );
                        setFormData((prev) => ({
                          ...prev,
                          image: res.data.secure_url,
                        }));
                        Swal.fire(
                          "Uploaded!",
                          "New image uploaded successfully.",
                          "success"
                        );
                      } catch (err) {
                        Swal.fire("Error", "Image upload failed", "error");
                      }
                    }
                  }}
                  className="w-full p-2 border rounded"
                />

                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="mt-2 w-20 h-20 object-cover rounded border"
                  />
                )}
              </div>

              <button
                type="submit"
                className="px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
              >
                Update
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllReturnProducts;
