import { useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaTrashAlt } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import { AuthContext } from "@/provider/AuthProvider";

const AllReturnProducts = () => {
  const [returnOrders, setReturnOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const axiosPublic = useAxiosPublic();
  const { user } = useContext(AuthContext);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnData, setReturnData] = useState({
    returnReason: "",
    returnDate: new Date().toISOString().split("T")[0],
  });

  // Fetch orders with status === "returned"
  const fetchReturnOrders = async () => {
    try {
      const res = await axiosPublic.get("/returned-orders");
      setReturnOrders(res.data);
    } catch (error) {
      console.error(error);
      setReturnOrders([]);
    }
  };

  useEffect(() => {
    fetchReturnOrders();
  }, []);

  useEffect(() => {
    if (user?.email) {
      axiosPublic
        .get(`/users/role?email=${user.email}`)
        .then((res) => {
          setCurrentUserRole(res.data.role);
        })
        .catch(() => {
          setCurrentUserRole("user");
        });
    }
  }, [user, axiosPublic]);

  // Delete order
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This order will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPublic.delete(`/orders/${id}`).then((res) => {
          if (res.data.deletedCount > 0) {
            fetchReturnOrders();
            Swal.fire("Deleted!", "Order removed.", "success");
          }
        });
      }
    });
  };

  // Open modal to set return info
  const openReturnModal = (order) => {
    setSelectedOrder(order);
    setReturnData({
      returnReason: order.returnReason || "",
      returnDate: order.returnDate
        ? new Date(order.returnDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  // Search filter
  const filteredProducts = returnOrders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.fullName?.toLowerCase().includes(term) ||
      order.email?.toLowerCase().includes(term) ||
      order.phone?.toLowerCase().includes(term) ||
      order._id?.toLowerCase().includes(term) ||
      order.cartItems.some((item) =>
        item.productName?.toLowerCase().includes(term)
      )
    );
  });

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="max-w-7xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        All Returned Orders
      </h2>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        {/*  Search */}
        <div className="relative w-full md:max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search by name, email, phone, or product..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border pl-10 pr-4 py-2 rounded-xl w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Return Info</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentProducts.map((order, index) => (
              <tr
                key={order._id}
                className="transition duration-200 hover:bg-gray-50"
              >
                <td className="px-4 py-3">{indexOfFirst + index + 1}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold">{order.fullName}</div>
                  <div className="text-gray-500">{order.email}</div>
                  <div className="text-gray-500">{order.phone}</div>
                </td>
                <td className="px-4 py-3">
                  {order.cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-2 mb-2"
                    >
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <div>
                        <div className="font-semibold">{item.productName}</div>
                        <div className="text-sm text-gray-500">
                          Size: {item.size || "-"}, Color: {item.color || "-"},
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3 font-bold">৳{order.total}</td>
                <td className="px-4 py-3 font-bold">
                  <div>
                    Date:{" "}
                    {order.returnDate
                      ? new Date(order.returnDate).toLocaleDateString()
                      : "-"}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold">
                  <div>Reason: {order.returnReason || "-"}</div>
                </td>
                <td className="px-4 py-3 flex items-center justify-center gap-2">
                  <button
                    onClick={() => openReturnModal(order)}
                    className="px-2 py-2 bg-cyan-400 text-white rounded"
                  >
                    Set Return Info
                  </button>
                  {/* {currentUserRole === "admin" && (
                    <button onClick={() => handleDelete(order._id)}>
                      <FaTrashAlt className="text-2xl text-red-500 hover:text-red-700" />
                    </button>
                  )} */}
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="7" className="py-6 text-center text-gray-500">
                  No returned orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Set Return Info</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const endpoint =
                    selectedOrder.source === "pos"
                      ? `/pos/orders/${selectedOrder._id}/return-info`
                      : `/orders/${selectedOrder._id}/return`;

                  await axiosPublic.patch(endpoint, returnData);

                  Swal.fire("Saved!", "Return info updated.", "success");
                  setIsModalOpen(false);
                  fetchReturnOrders();
                } catch (err) {
                  Swal.fire("Error!", "Failed to update return info.", "error");
                }
              }}
            >
              <div className="mb-3">
                <label className="block mb-1">Return Date:</label>
                <input
                  type="date"
                  value={returnData.returnDate}
                  onChange={(e) =>
                    setReturnData((prev) => ({
                      ...prev,
                      returnDate: e.target.value,
                    }))
                  }
                  className="border p-2 w-full rounded"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1">Return Reason:</label>
                <textarea
                  value={returnData.returnReason}
                  onChange={(e) =>
                    setReturnData((prev) => ({
                      ...prev,
                      returnReason: e.target.value,
                    }))
                  }
                  className="border p-2 w-full rounded"
                  rows={3}
                  placeholder="Reason for return"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-cyan-500 text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllReturnProducts;
