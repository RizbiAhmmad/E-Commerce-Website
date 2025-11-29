import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaPrint, FaSearch, FaTrashAlt } from "react-icons/fa";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const ordersPerPage = 20;
  const axiosPublic = useAxiosPublic();

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await axiosPublic.get("/orders");
      setOrders(res.data);
    } catch (error) {
      console.error(error);
      setOrders([]);
    }
  };

  // Fetch active couriers
  const fetchCouriers = async () => {
    try {
      const res = await axiosPublic.get("/courier/settings");
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
        axiosPublic.delete(`/orders/${id}`).then((res) => {
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
      const res = await axiosPublic.patch(`/orders/${id}/status`, {
        status: newStatus,
      });
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
      const res = await axiosPublic.patch(`/orders/${orderId}/courier`, {
        courierName,
      });
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
      case "returned":
        return "bg-orange-100 text-orange-800 border border-orange-300";
      case "failed":
        return "bg-red-200 text-red-800 border border-red-400";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  // Search + Filter Orders
  const searchedOrders = orders.filter((order) => {
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

  const filteredOrders =
    statusFilter === "all"
      ? searchedOrders
      : searchedOrders.filter(
          (order) => order.status?.toLowerCase() === statusFilter
        );

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handlePrint = (order) => {
    const printWindow = window.open("", "_blank");
    const htmlContent = `
    <html>
      <head>
        <title>Order Invoice - ${order._id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          h2 { text-align: center; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .info-line { margin: 4px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .items-table th, .items-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .items-table th { background-color: #f5f5f5; }
          .total-box { margin-top: 20px; float: right; width: 320px; }
          .total-box table { width: 100%; border-collapse: collapse; }
          .total-box td { padding: 6px 8px; }
          .total-box tr td:first-child { text-align: left; }
          .total-box tr td:last-child { text-align: right; }
          .grand-total {
            font-weight: bold;
            font-size: 18px;
            border-top: 2px solid #333;
            padding-top: 10px;
          }
          .footer { text-align: center; margin-top: 60px; color: gray; font-size: 12px; }
        </style>
      </head>
      <body>
        <h2>Order Invoice</h2>

        <div class="section">
          <div class="info-line"><strong>Order ID:</strong> ${order._id}</div>
          <div class="info-line"><strong>Customer:</strong> ${
            order.fullName
          }</div>
          <div class="info-line"><strong>Phone:</strong> ${order.phone}</div>
          <div class="info-line"><strong>Email:</strong> ${order.email}</div>
          <div class="info-line"><strong>Address:</strong> ${
            order.address
          }</div>
          <div class="info-line"><strong>Shipping:</strong> ${
            order.shipping === "inside" ? "Inside Dhaka" : "Outside Dhaka"
          }</div>
          <div class="info-line"><strong>Payment:</strong> ${
            order.payment
          }</div>
          <div class="info-line"><strong>Date:</strong> ${new Date(
            order.createdAt
          ).toLocaleString()}</div>
          <div class="info-line"><strong>Status:</strong> ${
            order.status || "Pending"
          }</div>
        </div>

        <div class="section">
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Size</th>
                <th>Color</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.cartItems
                ?.map(
                  (item) => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.size || "-"}</td>
                  <td>${item.color || "-"}</td>
                  <td>${item.quantity}</td>
                  <td>৳${item.price}</td>
                  <td>৳${(item.price * item.quantity).toFixed(2)}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>

          <div class="total-box">
            <table>
              <tr>
                <td>Subtotal:</td>
                <td>৳${order.subtotal?.toFixed(2) || "0.00"}</td>
              </tr>
              <tr>
                <td>Shipping Cost:</td>
                <td>৳${order.shippingCost?.toFixed(2) || "0.00"}</td>
              </tr>
              ${
                order.discount > 0
                  ? `<tr><td>Discount${
                      order.coupon ? ` (${order.coupon})` : ""
                    }:</td><td>- ৳${order.discount.toFixed(2)}</td></tr>`
                  : ""
              }
              <tr class="grand-total">
                <td>Grand Total:</td>
                <td>৳${order.total?.toFixed(2) || "0.00"}</td>
              </tr>
            </table>
          </div>
          <div style="clear:both;"></div>
        </div>

        <div class="footer">
          Thank you for shopping with us ❤️<br/>
          <small>Printed on ${new Date().toLocaleString()}</small>
        </div>
      </body>
    </html>
  `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="max-w-7xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        All Orders
      </h2>

      {/*  Search & Filter */}
      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex justify-start mb-4">
          <div className="relative w-90">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone or product..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="border pl-10 pr-4 py-2 rounded w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        </div>

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
            <option value="returned">Returned</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-2 py-3">#</th>
              <th className="px-2 py-3">Customer</th>
              <th className="px-2 py-3">Address</th>
              <th className="px-2 py-3">Shipping</th>
              <th className="px-2 py-3">Payment</th>
              <th className="px-2 py-3">Cart Items</th>
              <th className="px-2 py-3">Total</th>
              <th className="px-2 py-3">Date & Time</th>
              <th className="px-2 py-3">Status</th>
              <th className="px-2 py-3">Courier</th>
              <th className="px-2 py-3">Actions</th>
              <th className="px-2 py-3">Fraud</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentOrders.map((order, index) => (
              <tr
                key={order._id}
                className="transition duration-200 hover:bg-gray-50"
              >
                <td className="px-2 py-3">{indexOfFirstOrder + index + 1}</td>
                <td className="px-2 py-3">
                  <div className="font-semibold text-gray-800">
                    {order.fullName}
                  </div>
                  <div className="text-gray-500">{order.email}</div>
                  <div className="text-gray-500">{order.phone}</div>
                  <div className="text-gray-500">Order No: {order._id}</div>
                </td>
                <td className="px-2 py-3">{order.address}</td>
                <td className="px-2 py-3">{order.shipping}</td>
                <td className="px-2 py-3">
  <div className="font-semibold">{order.payment}</div>

  {order.payment === "online" && (
    <span
      className={`text-xs px-2 py-1 rounded font-bold mt-1 inline-block
      ${
        order.paymentStatus === "paid"
          ? "bg-green-100 text-green-700"
          : order.paymentStatus === "failed"
          ? "bg-red-100 text-red-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {(order.paymentStatus || "pending").toUpperCase()}
    </span>
  )}
</td>

                <td className="px-2 py-3">
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
                <td className="px-2 py-3 font-bold">৳{order.total}</td>
                <td className="px-2 py-3 font-bold">
                  {new Date(order.createdAt).toLocaleString()}
                </td>

                <td className="px-2 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClasses(
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
                      className="border border-blue-300 rounded px-2 py-1 text-xs focus:ring focus:ring-red-200"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="returned">Returned</option>
                    </select>
                  </div>
                </td>

                <td className="px-2 py-3">
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

                <td className="px-2 py-3 flex items-center justify-center gap-3">
                  <button onClick={() => handlePrint(order)}>
                    <FaPrint className="text-2xl text-blue-500 hover:text-blue-700" />
                  </button>
                  <button onClick={() => handleDelete(order._id)}>
                    <FaTrashAlt className="text-2xl text-red-500 hover:text-red-700" />
                  </button>
                </td>

                <td className="px-2 py-3">
                  {order.fraudCheckStatus && (
                    <div className="mb-1">
                      {order.fraudCheckStatus === "high" && (
                        <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded">
                          HIGH RISK
                        </span>
                      )}
                      {order.fraudCheckStatus === "medium" && (
                        <span className="px-2 py-1 text-xs font-bold bg-yellow-100 text-yellow-700 rounded">
                          MEDIUM
                        </span>
                      )}
                      {order.fraudCheckStatus === "low" && (
                        <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded">
                          SAFE
                        </span>
                      )}
                    </div>
                  )}

                  {order.fraudMessage && (
                    <div className="text-[10px] text-gray-500 mb-1">
                      {order.fraudMessage}
                    </div>
                  )}

                  {order.courierCheckStatus === "success" &&
                    order.courierCheckData && (
                      <div className="mt-1 p-1 bg-gray-50 border border-gray-200 rounded text-[10px]">
                        <div className="text-blue-600 font-semibold">
                          Courier Verified ✅
                        </div>
                        <div>
                          Risk:{" "}
                          <span className="font-semibold">
                            {order.courierCheckData.risk || "N/A"}
                          </span>
                        </div>
                        <div>
                          Score:{" "}
                          <span className="font-semibold">
                            {order.courierCheckData.score || 0}
                          </span>
                        </div>
                        {order.courierCheckData.message && (
                          <div>
                            Message:{" "}
                            <span className="italic">
                              {order.courierCheckData.message}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                  {order.courierCheckStatus === "failed" && (
                    <div className="text-red-500 text-[10px] font-semibold mt-1">
                      Courier Check Failed ❌
                    </div>
                  )}

                  {!order.fraudCheckStatus && !order.courierCheckStatus && (
                    <div className="text-gray-400 text-xs">Not Checked</div>
                  )}
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
