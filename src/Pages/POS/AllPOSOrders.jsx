import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaTrashAlt, FaSearch, FaPrint } from "react-icons/fa";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const AllPOSOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 20;
  const axiosPublic = useAxiosPublic();
  const [couriers, setCouriers] = useState([]);

  const fetchCouriers = async () => {
    try {
      const res = await axiosPublic.get("/courier/settings");
      setCouriers(res.data);
    } catch (error) {
      console.error(error);
      setCouriers([]);
    }
  };

  // fetch POS orders
  const fetchOrders = async () => {
    try {
      const res = await axiosPublic.get("/pos/orders");
      setOrders(res.data);
    } catch (error) {
      console.error(error);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCouriers();
  }, []);

  // delete POS order
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This POS order will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPublic.delete(`/pos/orders/${id}`).then((res) => {
          if (res.data.deletedCount > 0) {
            fetchOrders();
            Swal.fire("Deleted!", "Order removed.", "success");
          }
        });
      }
    });
  };
  const handleCourierAssign = async (orderId, courierName) => {
    if (!courierName) return;

    try {
      const res = await axiosPublic.patch(`/pos/orders/${orderId}/courier`, {
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

  // filter orders by multiple fields
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.orderId?.toLowerCase().includes(term) ||
      order.customer?.name?.toLowerCase().includes(term) ||
      order.customer?.phone?.toLowerCase().includes(term) ||
      order.payment?.method?.toLowerCase().includes(term)
    );
  });

  // pagination logic
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
        <title>POS Invoice - ${order.orderId}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          h2 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          table, th, td { border: 1px solid #ddd; }
          th, td { padding: 8px; text-align: left; }
          .totalBox { width: 300px; float: right; margin-top: 20px; }
          .totalRow { display: flex; justify-content: space-between; padding: 6px 0; }
          .footer { text-align:center; margin-top:50px; color:gray; }
        </style>
      </head>
      <body>

        <h2>POS Invoice</h2>
        
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Customer:</strong> ${order.customer?.name || ""}</p>
        <p><strong>Address:</strong> ${order.customer?.address || ""}</p>
        <p><strong>Phone:</strong> ${order.customer?.phone || ""}</p>
        <p><strong>Date:</strong> ${new Date(
          order.createdAt
        ).toLocaleString()}</p>

        <table>
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
                <td>৳${item.price * item.quantity}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>

        <!-- Summary Section -->
        <div class="totalBox">
          <div class="totalRow"><strong>Subtotal:</strong> ৳${
            order.subtotal
          }</div>

          ${
            order.discount > 0
              ? `<div class="totalRow"><strong>Discount:</strong> -৳${order.discount}</div>`
              : ""
          }

          ${
            order.tax > 0
              ? `<div class="totalRow"><strong>Tax:</strong> ৳${order.tax}</div>`
              : ""
          }

          ${
            order.shippingCharge > 0
              ? `<div class="totalRow"><strong>Shipping:</strong> ৳${order.shippingCharge}</div>`
              : ""
          }

          <div class="totalRow" style="border-top:1px solid #000; margin-top:10px; padding-top:10px;">
            <strong>Total:</strong> ৳${order.total}
          </div>
        </div>

        <div class="footer">
          Thank you ❤️
        </div>

      </body>
    </html>
  `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="max-w-7xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        All POS Orders
      </h2>

      {/* Search Bar */}
      <div className="flex justify-start mb-4">
        <div className="relative w-100">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer, Phone, Payment..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border pl-10 pr-4 py-2 rounded w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Payment</th>
              <th className="px-6 py-3">Products</th>
              <th className="px-6 py-3">Discount</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Courier</th>
              <th className="px-6 py-3">Date & Time</th>
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
                <td className="px-6 py-4 font-semibold">{order.orderId}</td>

                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-800">
                    {order.customer?.name}
                  </div>
                  <div className="font-semibold text-gray-800">
                    {order.customer?.address}
                  </div>
                  <div className="text-gray-500">{order.customer?.phone}</div>
                </td>

                <td className="px-6 py-4 capitalize">
                  {order.payment?.method || "-"}
                </td>

                <td className="px-6 py-4">
                  {order.cartItems?.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
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

                <td className="px-6 py-4 font-bold">৳{order.discount}</td>
                <td className="px-6 py-4 font-bold">৳{order.total}</td>

                <td className="px-3 py-3">
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

                <td className="px-6 py-4">
                  {new Date(order.createdAt).toLocaleDateString()}{" "}
                  {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>

                <td className="flex gap-4 px-6 py-6">
                  <button onClick={() => handlePrint(order)}>
                    <FaPrint className="text-2xl text-blue-500 hover:text-blue-700" />
                  </button>

                  {/* Delete Button */}
                  {/* <button onClick={() => handleDelete(order._id)}>
    <FaTrashAlt className="text-2xl text-red-500 hover:text-red-700" />
  </button> */}
                </td>
              </tr>
            ))}

            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="9" className="py-6 text-center text-gray-500">
                  No POS orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
    </div>
  );
};

export default AllPOSOrders;
