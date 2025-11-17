import { useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaSearch, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import { AuthContext } from "@/provider/AuthProvider";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const IncompleteOrders = () => {
  const axiosPublic = useAxiosPublic();
  const { user } = useContext(AuthContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data: products = [] } = useQuery({
  queryKey: ["products"],
  queryFn: async () => {
    const res = await axiosPublic.get("/products");
    return res.data;
  },
});

const { data: cartItems = [], refetch } = useQuery({
  queryKey: ["cartItems"],
  queryFn: async () => {
    const res = await axiosPublic.get("/cart");
    return res.data;
  },
});

const mergedItems = cartItems.map((item) => {
  const product = products.find((p) => p._id === item.productId);
  return { ...item, product };
});

const filtered = mergedItems.filter((item) =>
  `${item.product?.name} ${item.selectedColor} ${item.selectedSize}`
    .toLowerCase()
    .includes(searchTerm.toLowerCase())
);

// Pagination
const lastIndex = currentPage * itemsPerPage;
const firstIndex = lastIndex - itemsPerPage;
const currentItems = filtered.slice(firstIndex, lastIndex);
const totalPages = Math.ceil(filtered.length / itemsPerPage);


  const handlePageChange = (p) => {
    if (p >= 1 && p <= totalPages) setCurrentPage(p);
  };

  // Delete Cart Item
  const handleDelete = (id) => {
    Swal.fire({
      title: "Remove Item?",
      text: "This will delete the item from cart.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0FABCA",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPublic.delete(`/cart/${id}`).then((res) => {
          if (res.data.deletedCount > 0) {
            Swal.fire("Deleted!", "Item removed.", "success");
            refetch();
          }
        });
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="pb-4 mb-8 text-3xl text-center font-bold border-b">
        Incomplete Orders
      </h2>

      {/* Search */}
      <div className="flex items-center mb-4 gap-3">
        <div className="flex items-center w-full md:w-1/3 border rounded px-3 py-2">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            className="w-full outline-none"
            placeholder="Search by product..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-md">
        <table className="w-full table-auto text-sm text-left">
          <thead className="bg-gray-100">
  <tr>
    <th className="px-4 py-3">#</th>
    <th className="px-4 py-3">User</th>
    <th className="px-4 py-3">Email</th>
    <th className="px-4 py-3">Product</th>
    <th className="px-4 py-3">Color</th>
    <th className="px-4 py-3">Size</th>
    <th className="px-4 py-3">Qty</th>
    <th className="px-4 py-3">Price</th>
    <th className="px-4 py-3">Total</th>
    <th className="px-4 py-3">Action</th>
  </tr>
</thead>

<tbody className="divide-y">
  {currentItems.map((item, index) => (
    <tr key={item._id} className="hover:bg-gray-50">
      <td className="px-4 py-3">{firstIndex + index + 1}</td>

      <td className="px-4 py-3">{item.name}</td>
      <td className="px-4 py-3">{item.email}</td>

      <td className="px-4 py-3 font-semibold">
  {item.product?.name || item.productId}
</td>

      <td className="px-4 py-3">{item.selectedColor || "-"}</td>
      <td className="px-4 py-3">{item.selectedSize || "-"}</td>
      <td className="px-4 py-3">{item.quantity}</td>

      <td className="px-4 py-3">
  ৳ {item.product?.newPrice?.toLocaleString() || "-"}
</td>

     <td className="px-4 py-3 font-semibold text-green-600">
  ৳ {item.quantity * (item.product?.newPrice || 0).toLocaleString()}
</td>

      <td className="px-4 py-3">
        <button onClick={() => handleDelete(item._id)}>
          <FaTrashAlt className="text-red-500 text-lg hover:text-red-700" />
        </button>
      </td>
    </tr>
  ))}

  {filtered.length === 0 && (
    <tr>
      <td colSpan={10} className="py-6 text-center text-gray-500">
        No incomplete cart items found.
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-4">
        <button
          className={`px-4 py-2 rounded ${
            currentPage === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-cyan-500 text-white"
          }`}
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Previous
        </button>

        <span className="px-4 py-2 bg-gray-100 rounded">
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          className={`px-4 py-2 rounded ${
            currentPage === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-cyan-500 text-white"
          }`}
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default IncompleteOrders;