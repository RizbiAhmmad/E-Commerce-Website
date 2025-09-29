import { useEffect, useState } from "react";
import axios from "axios";

const ProfitLossReport = () => {
  const [report, setReport] = useState({});
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("today");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(
          "https://e-commerce-server-api.onrender.com/profit-loss-report"
        );
        setReport(res.data);
        setOrders(res.data.allOrders || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReport();
  }, []);

  const getFilteredOrders = () => {
    const now = new Date();
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      if (filter === "today") {
        return orderDate.toDateString() === now.toDateString();
      }
      if (filter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return orderDate >= weekAgo;
      }
      if (filter === "month") {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="pb-4 mb-8 text-3xl font-bold text-center border-b-2 border-gray-200">
        💰 Profit & Loss Report
      </h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-blue-100 p-4 rounded-lg shadow">
          <h3 className="text-gray-600">All Time Profit</h3>
          <p className="text-2xl font-bold">৳{report.allTime?.profit}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h3 className="text-gray-600">This Month</h3>
          <p className="text-2xl font-bold">৳{report.thisMonth?.profit}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg shadow">
          <h3 className="text-gray-600">Today</h3>
          <p className="text-2xl font-bold">৳{report.today?.profit}</p>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white shadow rounded-lg p-4 mt-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Products (Profit/Loss)</h3>
          <div className="flex gap-2">
            {["all", "today", "week", "month"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {f === "all"
                  ? "All"
                  : f === "today"
                  ? "Today"
                  : f === "week"
                  ? "This Week"
                  : "This Month"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Product</th>
                <th className="px-4 py-2 border">Purchase Price</th>
                <th className="px-4 py-2 border">Sale Price</th>
                <th className="px-4 py-2 border">Qty</th>
                <th className="px-4 py-2 border">Total Sale</th>
                <th className="px-4 py-2 border">Total Cost</th>
                <th className="px-4 py-2 border">Discount</th>
                <th className="px-4 py-2 border">Tax</th>
                <th className="px-4 py-2 border">Profit/Loss</th>
                <th className="px-4 py-2 border">Order Type</th>
                <th className="px-4 py-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredOrders().flatMap((order) =>
                (order.cartItems || []).map((p, idx) => {
                  const totalSale = p.price * p.quantity;
                  const totalCost = (p.purchasePrice || 0) * p.quantity;
                  const profit =
                    totalSale -
                    totalCost -
                    (order.discount || 0) +
                    (order.tax || 0);

                  return (
                    <tr key={`${order._id}-${idx}`}>
                      <td className="px-4 py-2 border">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {p.productName || p.name || p.title}
                          </span>
                          {p.barcode && (
                            <span className="text-xs text-gray-500">
                              Code: {p.barcode}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-2 border">
                        ৳{p.purchasePrice || 0}
                      </td>
                      <td className="px-4 py-2 border">৳{p.price}</td>
                      <td className="px-4 py-2 border">{p.quantity}</td>
                      <td className="px-4 py-2 border">৳{totalSale}</td>
                      <td className="px-4 py-2 border">৳{totalCost}</td>
                      <td className="px-4 py-2 border">
                        ৳{order.discount || 0}
                      </td>
                      <td className="px-4 py-2 border">৳{order.tax || 0}</td>
                      <td
                        className={`px-4 py-2 border font-bold ${
                          profit >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ৳{profit}
                      </td>
                      <td className="px-4 py-2 border">{order.orderType}</td>
                      <td className="px-4 py-2 border">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossReport;
