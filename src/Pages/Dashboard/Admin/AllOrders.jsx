import { useState, useEffect, useContext } from "react";
import Swal from "sweetalert2";
import { FaPrint, FaSearch, FaTrashAlt } from "react-icons/fa";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import * as XLSX from "xlsx";
import { AuthContext } from "@/provider/AuthProvider";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const ordersPerPage = 20;
  const axiosPublic = useAxiosPublic();

  const [showCourierModal, setShowCourierModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const [deliveryType, setDeliveryType] = useState("");
  const [itemType, setItemType] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemWeight, setItemWeight] = useState("");
  const [selectedCourierName, setSelectedCourierName] = useState("");
  const [specialInstruction, setSpecialInstruction] = useState("");

  const [showFraudModal, setShowFraudModal] = useState(false);
  const [selectedFraudData, setSelectedFraudData] = useState(null);
  const [selectedOrderNo, setSelectedOrderNo] = useState("");
  const [footerInfo, setFooterInfo] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const { user } = useContext(AuthContext);
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
  const fetchFooterInfo = async () => {
    try {
      const res = await axiosPublic.get("/footer");
      setFooterInfo(res.data[0]);
    } catch (err) {
      console.error("Footer info fetch failed", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCouriers();
    fetchFooterInfo();
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

  const submitCourierData = async () => {
    if (!deliveryType || !itemType || !itemQuantity || !itemWeight) {
      return Swal.fire("Error", "All fields are required!", "error");
    }

    try {
      const res = await axiosPublic.patch(
        `/orders/${selectedOrderId}/courier`,
        {
          courierName: selectedCourierName,
          deliveryType: Number(deliveryType),
          itemType: Number(itemType),
          itemQuantity: Number(itemQuantity),
          itemWeight: Number(itemWeight),
          specialInstruction,
        }
      );

      if (res.data.success) {
        Swal.fire("Success", "Courier Assigned Successfully!", "success");
        fetchOrders();
        setShowCourierModal(false);

        // Reset fields
        setDeliveryType("");
        setItemType("");
        setItemQuantity("");
        setItemWeight("");
      } else {
        Swal.fire("Error", res.data.message, "error");
      }
    } catch (error) {
      console.log(error);
      Swal.fire("Error", "Failed to assign courier", "error");
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

  const getOrderSourceBadge = (source) => {
    if (source === "landing") {
      return (
        <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-pink-100 text-pink-700 border border-pink-300">
          Landing
        </span>
      );
    }

    if (source === "website") {
      return (
        <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-cyan-100 text-cyan-700 border border-cyan-300">
          Website
        </span>
      );
    }

    return null;
  };

  // Search + Filter Orders
  const searchedOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.fullName?.toLowerCase().includes(term) ||
      order.email?.toLowerCase().includes(term) ||
      order.phone?.toLowerCase().includes(term) ||
      order._id?.toLowerCase().includes(term) ||
      order.orderSource?.toLowerCase().includes(term) ||
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
      <title>Invoice - ${order._id}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f5f5f5;
        }
        .invoice {
          max-width: 800px;
          margin: 20px auto;
          background: #fff;
          padding: 30px;
          border: 1px solid #ddd;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
        }
        .logo img {
          height: 70px;
        }
        .from {
          text-align: right;
          font-size: 13px;
          line-height: 1.5;
        }
        .invoice-title {
          margin: 30px 0 10px;
          font-size: 26px;
          font-weight: bold;
        }
        .bill-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
        }
        .bill-box {
          font-size: 14px;
          line-height: 1.6;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        th {
          background: #f2f2f2;
        }
        .total-box {
          width: 300px;
          margin-left: auto;
          margin-top: 20px;
        }
        .total-box td {
          padding: 8px;
        }
        .grand {
          font-weight: bold;
          font-size: 16px;
          border-top: 2px solid #000;
        }
        .footer {
          text-align: center;
          margin-top: 50px;
          font-size: 13px;
          color: gray;
        }
      </style>
    </head>

    <body>
      <div class="invoice">

        <!-- Header -->
        <div class="header">
          <div class="logo">
            ${footerInfo?.logo ? `<img src="${footerInfo.logo}" />` : ""}
          </div>

          <div class="from">
            <strong>${footerInfo?.name || ""}</strong><br/>
            ${footerInfo?.address || ""}<br/>
            Phone: ${footerInfo?.phone || ""}<br/>
            ${footerInfo?.email || ""}
          </div>
        </div>

        <div class="invoice-title">INVOICE</div>

        <!-- Billing Info -->
        <div class="bill-section">
          <div class="bill-box">
            <strong>Bill To</strong><br/>
            ${order.fullName}<br/>
            ${order.address}<br/>
            Phone: ${order.phone}
          </div>

          <div class="bill-box">
            <strong>Invoice No:</strong> ${order._id}<br/>
            <strong>Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString()}<br/>
            <strong>Payment:</strong> ${order.payment}<br/>
            <strong>Shipping:</strong> ${
              order.shipping === "inside" ? "Inside Dhaka" : "Outside Dhaka"
            }
          </div>
        </div>

        <!-- Products -->
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Size</th>
              <th>Color</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.cartItems
              .map(
                (item) => `
              <tr>
                <td>${item.productName} ${
                  item.barcode ? `(${item.barcode})` : ""
                }</td>
                <td>${item.size || "-"}</td>
                <td>${item.color || "-"}</td>
                <td>${item.quantity}</td>
                <td>৳${item.price}</td>
                <td>৳${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <!-- Totals -->
        <table class="total-box">
          <tr>
            <td>Subtotal</td>
            <td align="right">৳${order.subtotal || 0}</td>
          </tr>
          <tr>
            <td>Shipping</td>
            <td align="right">৳${order.shippingCost || 0}</td>
          </tr>
          ${
            order.discount > 0
              ? `<tr><td>Discount</td><td align="right">-৳${order.discount}</td></tr>`
              : ""
          }
          <tr class="grand">
            <td>Grand Total</td>
            <td align="right">৳${order.total}</td>
          </tr>
        </table>

        <!-- Footer -->
        <div class="footer">
          Thank You ❤️<br/>
        </div>

      </div>
    </body>
  </html>
  `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const exportOrdersToExcel = () => {
    if (!orders || orders.length === 0) return;

    const dataForExcel = orders.map((order) => ({
      OrderID: order._id,
      CustomerName: order.fullName,
      Email: order.email,
      Phone: order.phone,
      Address: order.address,
      Shipping: order.shipping === "inside" ? "Inside Dhaka" : "Outside Dhaka",
      PaymentMethod: order.payment,
      CartItems: (order.cartItems || [])
        .map(
          (item) =>
            `${item.productName} (Size: ${item.size || "-"}, Color: ${
              item.color || "-"
            }, Qty: ${item.quantity})`
        )
        .join("; "),
      Subtotal: order.subtotal || 0,
      ShippingCost: order.shippingCost || 0,
      Discount: order.discount || 0,
      Total: order.total || 0,
      Status: order.status || "Pending",
      Courier: order.courier || "-",
      Date: new Date(order.createdAt).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    XLSX.writeFile(workbook, "all_orders.xlsx");
  };

  return (
    <div className="max-w-7xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        All Orders
      </h2>

      {/*  Search & Filter */}
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/*  Search */}
        <div className="relative w-full md:max-w-md">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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

        {/*  Filter + Export */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center w-full md:w-auto">
          <label
            htmlFor="statusFilter"
            className="text-sm font-medium text-gray-700"
          >
            Filter by Status
          </label>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded px-3 py-2 text-sm shadow-sm w-full sm:w-auto"
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

          <button
            onClick={exportOrdersToExcel}
            className="px-4 py-2 bg-green-500 text-white rounded-xl shadow w-full sm:w-auto"
          >
            📥 Export All Orders
          </button>
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
                <td className="px-2 py-3">
                  <div className="flex flex-col gap-1">
                    <span className="capitalize">
                      {order.shipping === "inside"
                        ? "Inside Dhaka"
                        : "Outside Dhaka"}
                    </span>

                    {/*  Order Source Badge (next line) */}
                    {getOrderSourceBadge(order.orderSource)}
                  </div>
                </td>

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
                      const val = e.target.value;
                      if (val) {
                        setSelectedOrderId(order._id);
                        setSelectedCourierName(val);
                        setShowCourierModal(true);
                      }
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
                   {currentUserRole === "admin" && (
                  <button onClick={() => handleDelete(order._id)}>
                    <FaTrashAlt className="text-2xl text-red-500 hover:text-red-700" />
                  </button>
                   )}
                </td>

                <td className="px-2 py-3">
                  {order.courierCheckStatus === "success" ? (
                    <button
                      onClick={() => {
                        setSelectedFraudData(order.courierCheckData);
                        setSelectedOrderNo(order._id);
                        setShowFraudModal(true);
                      }}
                      className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      View Fraud Data
                    </button>
                  ) : order.courierCheckStatus === "failed" ? (
                    <span className="text-red-500 text-xs font-semibold">
                      Check Failed
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">Not Checked</span>
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

        {showCourierModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Assign Courier</h2>

              <p className="mb-2 text-gray-700">
                Courier: {selectedCourierName}
              </p>

              {/* Delivery Type */}
              <label className="block text-sm mb-1 font-semibold">
                Delivery Type
              </label>
              <input
                type="number"
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-3"
                placeholder="Enter Delivery Type (e.g. 48)"
              />

              {/* Item Type */}
              <label className="block text-sm mb-1 font-semibold">
                Item Type
              </label>
              <input
                type="number"
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-3"
                placeholder="Enter Item Type (e.g. 2)"
              />

              {/* Item Quantity */}
              <label className="block text-sm mb-1 font-semibold">
                Quantity
              </label>
              <input
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-3"
                placeholder="Enter Quantity"
              />

              {/* Item Weight */}
              <label className="block text-sm mb-1 font-semibold">
                Weight (KG)
              </label>
              <input
                type="number"
                value={itemWeight}
                onChange={(e) => setItemWeight(e.target.value)}
                className="w-full border px-3 py-2 rounded mb-4"
                placeholder="Enter Weight (kg)"
              />
              <label className="block text-sm mb-1 font-semibold">
                Special Instruction (Optional)
              </label>

              <textarea
                value={specialInstruction}
                onChange={(e) => setSpecialInstruction(e.target.value)}
                placeholder="e.g. Deliver before 5 PM / Call before delivery"
                className="w-full border px-3 py-2 rounded mb-4"
                rows={2}
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCourierModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={submitCourierData}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {showFraudModal && selectedFraudData && (
          <div className="fixed inset-0 bg-white bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
              <h2 className="text-xl font-bold mb-2">Courier Fraud Report</h2>

              <p className="text-sm text-gray-500 mb-4">
                Order No: {selectedOrderNo}
              </p>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {Object.entries(selectedFraudData.courierData || {}).map(
                  ([courier, data]) =>
                    data?.total_parcel ? (
                      <div
                        key={courier}
                        className="border rounded p-3 bg-gray-50"
                      >
                        <div className="font-semibold capitalize mb-1">
                          {courier}
                        </div>

                        <div className="text-sm">
                          Total Parcel: {data.total_parcel}
                        </div>
                        <div className="text-sm">
                          Success: {data.success_parcel}
                        </div>
                        <div className="text-sm">
                          Cancelled: {data.cancelled_parcel}
                        </div>

                        <div className="text-sm mt-1">
                          Success Ratio:{" "}
                          <span
                            className={`font-bold ${
                              data.success_ratio >= 80
                                ? "text-green-600"
                                : data.success_ratio >= 50
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {data.success_ratio}%
                          </span>
                        </div>
                      </div>
                    ) : null
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowFraudModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
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
