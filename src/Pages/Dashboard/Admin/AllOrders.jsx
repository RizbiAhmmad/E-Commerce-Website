import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaTrashAlt } from "react-icons/fa";
import axios from "axios";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const ordersPerPage = 20;

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get("https://e-commerce-server-api.onrender.com/orders");
      setOrders(res.data);
    } catch (error) {
      console.error(error);
      setOrders([]);
    }
  };

  // Fetch active couriers
  const fetchCouriers = async () => {
    try {
      const res = await axios.get("https://e-commerce-server-api.onrender.com/courier/settings");
      setCouriers(res.data);
    } catch (error) {
      console.error(error);
      setCouriers([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCouriers();
  }, []);

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
        axios.delete(`https://e-commerce-server-api.onrender.com/orders/${id}`).then((res) => {
          if (res.data.deletedCount > 0) {
            fetchOrders();
            Swal.fire("Deleted!", "Order removed.", "success");
          }
        });
      }
    });
  };

  // Update order status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.patch(
        `https://e-commerce-server-api.onrender.com/orders/${id}/status`,
        { status: newStatus }
      );
      if (res.data.success) {
        Swal.fire("Updated!", "Order status updated.", "success");
        fetchOrders();
      } else {
        Swal.fire("Error!", res.data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error!", "Failed to update status", "error");
    }
  };

  // Assign courier
  const handleCourierAssign = async (orderId, courierName) => {
    if (!courierName) return;

    try {
      const res = await axios.patch(
        `https://e-commerce-server-api.onrender.com/orders/${orderId}/courier`,
        { courierName }
      );
      if (res.data.success) {
        Swal.fire("Updated!", "Courier assigned successfully.", "success");
        fetchOrders();
      } else {
        Swal.fire("Error!", res.data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error!", "Failed to assign courier", "error");
      console.error(error);
    }
  };

  // Status badge classes
  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 border border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-300";
      case "placed":
        return "bg-cyan-100 text-cyan-800 border border-cyan-300";
      case "failed":
        return "bg-red-200 text-red-800 border border-red-400";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  // 🔹 Search + Filter Orders
  const searchedOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.fullName?.toLowerCase().includes(term) ||
      order.email?.toLowerCase().includes(term) ||
      order.phone?.toLowerCase().includes(term) ||
      order.cartItems.some((item) =>
        item.productName?.toLowerCase().includes(term)
      )
    );
  });

  const filteredOrders =
    statusFilter === "all"
      ? searchedOrders
      : searchedOrders.filter((order) => order.status?.toLowerCase() === statusFilter);

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="max-w-7xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        All Orders
      </h2>

      {/*  Search & Filter */}
      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Search by name, email, phone or product..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/3 shadow-sm"
        />

        <div className="flex items-center">
          <label
            htmlFor="statusFilter"
            className="mr-2 text-lg font-medium text-gray-700"
          >
            Filter by Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-3 py-2 text-sm shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="initiated">Initiated</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Address</th>
              <th className="px-6 py-3">Shipping</th>
              <th className="px-6 py-3">Payment</th>
              <th className="px-6 py-3">Cart Items</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Date & Time</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Courier</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentOrders.map((order, index) => (
              <tr
                key={order._id}
                className="transition duration-200 hover:bg-gray-50"
              >
                <td className="px-6 py-4">{indexOfFirstOrder + index + 1}</td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-800">
                    {order.fullName}
                  </div>
                  <div className="text-gray-500">{order.email}</div>
                  <div className="text-gray-500">{order.phone}</div>
                </td>
                <td className="px-6 py-4">{order.address}</td>
                <td className="px-6 py-4">{order.shipping}</td>
                <td className="px-6 py-4">{order.payment}</td>
                <td className="px-6 py-4">
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
                <td className="px-6 py-4 font-bold">৳{order.total}</td>
                <td className="px-6 py-4 font-bold">
                  {new Date(order.createdAt).toLocaleString()}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
                        order.status || order.courierStatus
                      )}`}
                    >
                      {order.status?.toUpperCase() ||
                        order.courierStatus?.toUpperCase() ||
                        "PENDING"}
                    </span>
                    <select
                      value={order.status || "pending"}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-xs focus:ring focus:ring-red-200"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <select
                    value={order.courier || ""}
                    onChange={(e) => {
                      if (e.target.value)
                        handleCourierAssign(order._id, e.target.value);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-xs"
                  >
                    <option value="">Assign Courier</option>
                    {couriers.map((c) => (
                      <option key={c._id} value={c.courierName}>
                        {c.courierName} ({c.status})
                      </option>
                    ))}
                  </select>
                </td>

                <td className="flex gap-4 px-6 py-6">
                  <button onClick={() => handleDelete(order._id)}>
                    <FaTrashAlt className="text-2xl text-red-500 hover:text-red-700" />
                  </button>
                </td>
              </tr>
            ))}

            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="11" className="py-6 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
    </div>
  );
};

export default AllOrders;
