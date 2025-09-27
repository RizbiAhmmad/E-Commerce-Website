import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const SalesReport = () => {
  const [report, setReport] = useState({
    allTime: 0,
    thisMonth: 0,
    lastMonth: 0,
    thisWeek: 0,
    lastWeek: 0,
    today: 0,
    yesterday: 0,
  });
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("today"); // all | today | week | month

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const chartData = [
    { name: "All Time", value: report.allTime },
    { name: "This Month", value: report.thisMonth },
    { name: "This Week", value: report.thisWeek },
    { name: "Today", value: report.today },
  ];

  const comparisonData = [
    { name: "Month", Current: report.thisMonth, Previous: report.lastMonth },
    { name: "Week", Current: report.thisWeek, Previous: report.lastWeek },
    { name: "Today", Current: report.today, Previous: report.yesterday },
  ];

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(
          "https://e-commerce-server-api.onrender.com/sales-report"
        );
        // console.log("Sales report data:", res.data);
        setReport(res.data);
        setOrders(res.data.allOrders || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReport();
  }, []);

  // helper for filtering orders
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
      return true; // all
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="pb-4 mb-8 text-3xl font-bold text-center border-b-2 border-gray-200">
        📊 Product Sales Report
      </h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-blue-100 p-4 rounded-lg shadow">
          <h3 className="text-gray-600">All Time</h3>
          <p className="text-2xl font-bold">৳{report.allTime}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h3 className="text-gray-600">This Month</h3>
          <p className="text-2xl font-bold">৳{report.thisMonth}</p>
        </div>
        <div className="bg-cyan-100 p-4 rounded-lg shadow">
          <h3 className="text-gray-600">This Week</h3>
          <p className="text-2xl font-bold">৳{report.thisWeek}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg shadow">
          <h3 className="text-gray-600">Today</h3>
          <p className="text-2xl font-bold">৳{report.today}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Bar Chart */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">Bar Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#604cf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">Pie Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">Line Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" /> <XAxis dataKey="name" />
              <YAxis /> <Tooltip /> <Legend />
              <Line type="monotone" dataKey="value" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Chart */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">
            Sales Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Current" fill="#0088FE" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Previous" fill="#FF8042" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Details Table */}
      <div className="bg-white shadow rounded-lg p-4 mt-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Sold Products</h3>
          {/* Filter Buttons */}
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
                {/* <th className="px-4 py-2 border">Order ID</th> */}
                <th className="px-4 py-2 border">Product Name</th>
                <th className="px-4 py-2 border">Price</th>
                <th className="px-4 py-2 border">Quantity</th>
                <th className="px-4 py-2 border">Total</th>
                <th className="px-4 py-2 border">Discount</th>
                <th className="px-4 py-2 border">Tax</th>
                <th className="px-4 py-2 border">Date</th>
                <th className="px-4 py-2 border">Order Type</th>

              </tr>
            </thead>
            <tbody>
  {getFilteredOrders().flatMap((order) =>
    (order.cartItems || []).map((p, idx) => (
      <tr key={`${order._id}-${idx}`}>
        <td className="px-4 py-2 border">{p.productName || p.name || p.title}</td>
        <td className="px-4 py-2 border">৳{p.price}</td>
        <td className="px-4 py-2 border">{p.quantity}</td>
        <td className="px-4 py-2 border">৳{p.price * p.quantity}</td>
        <td className="px-4 py-2 border">৳{order.discount || 0}</td>
        <td className="px-4 py-2 border">৳{order.tax || 0}</td>
        <td className="px-4 py-2 border">{new Date(order.createdAt).toLocaleDateString()}</td>
        <td className="px-4 py-2 border">{order.orderType}</td>
      </tr>
    ))
  )}
</tbody>


          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
