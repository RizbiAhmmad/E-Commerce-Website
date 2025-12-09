import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaTrashAlt, FaSearch, FaPrint } from "react-icons/fa";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import * as XLSX from "xlsx";

const AllPOSOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 20;
  const axiosPublic = useAxiosPublic();
  const [couriers, setCouriers] = useState([]);
  const [footerInfo, setFooterInfo] = useState(null);

  // Fetch couriers
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

  // Footer Info
  useEffect(() => {
    axiosPublic
      .get("/footer")
      .then((res) => {
        if (res.data.length > 0) setFooterInfo(res.data[0]);
      })
      .catch(() => setFooterInfo(null));
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

  // courier assign
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

  const handleReturn = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This order will be returned and stock restored!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, return it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosPublic.patch(`/pos/orders/${id}/return`);
          if (res.data.success) {
            Swal.fire("Returned!", res.data.message, "success");
            fetchOrders(); // Refresh table
          }
        } catch (err) {
          Swal.fire(
            "Error!",
            err.response?.data?.message || "Return failed",
            "error"
          );
        }
      }
    });
  };

  // search filter
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.orderId?.toLowerCase().includes(term) ||
      order._id?.toLowerCase().includes(term) ||
      order.customer?.name?.toLowerCase().includes(term) ||
      order.customer?.phone?.toLowerCase().includes(term) ||
      order.payment?.method?.toLowerCase().includes(term)
    );
  });

  // pagination
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

    const companyLogo = footerInfo?.logo
      ? `<img src="${footerInfo.logo}" style="width:60px;margin:auto;display:block;" />`
      : "";

    const companyInfo = footerInfo
      ? `
        <div class="center bold">${footerInfo?.name || ""}</div>
        <div class="center" style="font-size:10px;">${
          footerInfo?.address || ""
        }</div>
        <div class="center" style="font-size:10px;">${
          footerInfo?.phone || ""
        }</div>
      `
      : "";

    const htmlContent = `
    <html>
    <head>
      <title>Receipt - ${order.orderId}</title>

      <style>
      body {
        font-family: Arial, sans-serif;
      }

      @media print {
        body {
          margin: 0;
          padding: 0;
        }

        #receipt {
          width: 80mm;
          max-width: 80mm;
          padding: 10px;
          margin: 0 auto;
          font-size: 11px;
          line-height: 1.3;
        }

        .center { text-align: center; }
        .bold { font-weight: bold; }
        .flex-between { display: flex; justify-content: space-between; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        td { padding: 3px 0; }
        hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
      }
      </style>
    </head>

    <body>
      <div id="receipt">

        ${companyLogo}
        ${companyInfo}

        <hr />

        <div><b>Order ID:</b> ${order.orderId}</div>
        <div><b>Name:</b> ${order.customer?.name || ""}</div>
        <div><b>Phone:</b> ${order.customer?.phone || ""}</div>
        <div><b>Address:</b> ${order.customer?.address || ""}</div>
        <div><b>District:</b> ${order.customer?.district || ""}</div>
        <div><b>Note:</b> ${order.customer?.note || ""}</div>
        <div><b>Date:</b> ${new Date(order.createdAt).toLocaleString()}</div>

        <hr />

        <table>
          <tbody>
            ${order.cartItems
              ?.map(
                (item) => `
              <tr><td colspan="2"><b>${item.productName}</b></td></tr>
              <tr>
                <td>Qty: ${item.quantity} × ৳${item.price}</td>
                <td style="text-align:right;">৳${
                  item.quantity * item.price
                }</td>
              </tr>
              <tr>
                <td colspan="2" style="font-size:10px;color:gray;">
                  Size: ${item.size || "-"} | Color: ${item.color || "-"}
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>

        <hr />

        <div class="flex-between"><span>Subtotal:</span><span>৳${
          order.subtotal
        }</span></div>

        ${
          order.discount > 0
            ? `<div class="flex-between"><span>Discount:</span><span>-৳${order.discount}</span></div>`
            : ""
        }

        ${
          order.tax > 0
            ? `<div class="flex-between"><span>Tax:</span><span>৳${order.tax}</span></div>`
            : ""
        }

        ${
          order.shippingCharge > 0
            ? `<div class="flex-between"><span>Shipping:</span><span>৳${order.shippingCharge}</span></div>`
            : ""
        }

        <hr />

        <div class="flex-between bold" style="font-size:13px;">
          <span>Total:</span>
          <span>৳${order.total}</span>
        </div>

        <hr />

        <div class="center" style="margin-top: 10px;">Thank you ❤️</div>
      </div>

      <script>
        window.onload = () => {
          window.print();
          window.close();
        };
      </script>

    </body>
    </html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const exportPOSOrdersToExcel = () => {
    if (!orders || orders.length === 0) return;

    const dataForExcel = orders.map((order) => ({
      OrderID: order.orderId,
      MongoID: order._id,
      CustomerName: order.customer?.name || "",
      Email: order.customer?.email || "",
      Phone: order.customer?.phone || "",
      Address: order.customer?.address || "",
      District: order.customer?.district || "",
      Note: order.customer?.note || "",
      PaymentMethod: order.payment?.method || "",
      CartItems: (order.cartItems || [])
        .map(
          (item) =>
            `${item.productName} (Size: ${item.size || "-"}, Color: ${
              item.color || "-"
            }, Qty: ${item.quantity}, Price: ${item.price})`
        )
        .join("; "),
      Subtotal: order.subtotal || 0,
      Discount: order.discount || 0,
      Tax: order.tax || 0,
      Shipping: order.shippingCharge || 0,
      Total: order.total || 0,
      Courier: order.courier || "",
      Date: new Date(order.createdAt).toLocaleString(),
      Returned: order.isReturned ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "POS Orders");

    XLSX.writeFile(workbook, "pos_orders.xlsx");
  };

  return (
    <div className="max-w-7xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        All POS Orders
      </h2>

      {/* Search */}
      <div className="flex justify-between mb-4">
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
        <div className="">
          <button
            onClick={exportPOSOrdersToExcel}
            className="px-4 py-2 bg-green-500 text-white rounded-xl shadow"
          >
            📥 Export POS Orders
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Courier</th>
              <th className="px-4 py-3">Date & Time</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {currentOrders.map((order, index) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{indexOfFirstOrder + index + 1}</td>
                <td className="px-4 py-3 font-semibold">
                  OrderID: {order.orderId}
                  <br />
                  MongoID: {order._id}
                  <br />
                  {order.isReturned && (
                    <span className="ml-2 px-2 py-1 text-xs bg-red-200 text-red-800 rounded">
                      Returned
                    </span>
                  )}
                </td>

                <td className="px-4 py-3">
                  <div className="font-semibold text-gray-800">
                    {order.customer?.name}
                  </div>
                  <div className="font-semibold">{order.customer?.address}</div>
                  <div className="font-semibold">
                    {order.customer?.district}
                  </div>
                  <div className="font-semibold">{order.customer?.note}</div>
                  <div className="text-gray-600">{order.customer?.phone}</div>
                </td>

                <td className="px-4 py-3 capitalize">
                  {order.payment?.method || "-"}
                </td>

                <td className="px-4 py-3">
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

                <td className="px-4 py-3 font-bold">৳{order.discount}</td>
                <td className="px-4 py-3 font-bold">৳{order.total}</td>

                {/* Courier */}
                <td className="px-4 py-3">
                  <select
                    value={order.courier || ""}
                    onChange={(e) =>
                      handleCourierAssign(order._id, e.target.value)
                    }
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

                <td className="px-4 py-3">
                  {new Date(order.createdAt).toLocaleDateString()}{" "}
                  {new Date(order.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>

                {/* Actions */}
                <td className="flex gap-4 px-4 py-3">
                  <button onClick={() => handlePrint(order)}>
                    <FaPrint className="text-2xl text-blue-500 hover:text-blue-700" />
                  </button>

                  <button onClick={() => handleDelete(order._id)}>
                    <FaTrashAlt className="text-2xl text-red-500 hover:text-red-700" />
                  </button>
                  {!order.isReturned && (
                    <button
                      onClick={() => handleReturn(order._id)}
                      className="text-red-500 hover:text-red-600 border-2 border-red-500 p-2 rounded-xl"
                    >
                      Return
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="10" className="py-6 text-center text-gray-500">
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
