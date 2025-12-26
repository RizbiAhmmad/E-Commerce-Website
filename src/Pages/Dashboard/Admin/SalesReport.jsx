import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
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
import useAxiosPublic from "@/Hooks/useAxiosPublic";

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
  const [filter, setFilter] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const axiosPublic = useAxiosPublic();

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
        const res = await axiosPublic.get("/sales-report");
        setReport(res.data);
        setOrders(res.data.allOrders || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReport();
  }, []);

  // filtering logic
  const getFilteredOrders = () => {
    const now = new Date();
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);

      if (filter === "today")
        return orderDate.toDateString() === now.toDateString();

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

      if (filter === "range" && startDate && endDate) {
        const sd = new Date(startDate);
        const ed = new Date(endDate);
        return orderDate >= sd && orderDate <= ed;
      }

      return true;
    });
  };

  const getTotalSoldProducts = () => {
    const filtered = getFilteredOrders();

    const map = {};

    filtered.forEach((order) => {
      (order.cartItems || []).forEach((item) => {
        const name = item.productName || item.name;
        if (!map[name]) {
          map[name] = 0;
        }
        map[name] += item.quantity;
      });
    });

    return Object.entries(map).map(([name, total]) => ({ name, total }));
  };
  const exportToExcel = () => {
    const filteredOrders = getFilteredOrders().flatMap((order) =>
      (order.cartItems || []).map((p) => ({
        ProductName: p.productName || p.name || p.title,
        Price: p.price,
        Quantity: p.quantity,
        Total: p.price * p.quantity,
        Discount: order.discount || 0,
        Tax: Number(order.tax || 0).toFixed(2),
        Date: new Date(order.createdAt).toLocaleDateString(),
        OrderType: order.orderType,
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(filteredOrders);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");
    XLSX.writeFile(workbook, "sales_report.xlsx");
  };

  const exportSummaryToExcel = () => {
    const summary = getTotalSoldProducts();
    const worksheet = XLSX.utils.json_to_sheet(summary);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Summary");
    XLSX.writeFile(workbook, "product_summary.xlsx");
  };

  const getSalesSummary = () => {
    const filteredOrders = getFilteredOrders();

    let price = 0;
    let quantity = 0;
    let total = 0;
    let discount = 0;
    let tax = 0;

    filteredOrders.forEach((order) => {
      discount += Number(order.discount || 0);
      tax += Number(order.tax || 0);

      (order.cartItems || []).forEach((p) => {
        price += Number(p.price || 0);
        quantity += Number(p.quantity || 0);
        total += Number(p.price || 0) * Number(p.quantity || 0);
      });
    });

    return { price, quantity, total, discount, tax };
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h2 className="pb-4 mb-8 text-2xl md:text-3xl font-bold text-center border-b-2 border-gray-200">
        📊 Product Sales Report
      </h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 mb-10">
        <div className="bg-blue-100 p-4 rounded-lg shadow text-center">
          <h3 className="text-gray-600 text-sm md:text-base">All Time</h3>
          <p className="text-xl md:text-2xl font-bold">৳{report.allTime}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow text-center">
          <h3 className="text-gray-600 text-sm md:text-base">This Month</h3>
          <p className="text-xl md:text-2xl font-bold">৳{report.thisMonth}</p>
        </div>
        <div className="bg-cyan-100 p-4 rounded-lg shadow text-center">
          <h3 className="text-gray-600 text-sm md:text-base">This Week</h3>
          <p className="text-xl md:text-2xl font-bold">৳{report.thisWeek}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg shadow text-center">
          <h3 className="text-gray-600 text-sm md:text-base">Today</h3>
          <p className="text-xl md:text-2xl font-bold">৳{report.today}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* Bar Chart */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-center font-semibold mb-4">Bar Chart</h3>
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
          <h3 className="text-center font-semibold mb-4">Pie Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={120}
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
          <h3 className="text-center font-semibold mb-4">Line Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Chart */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-center font-semibold mb-4">Sales Comparison</h3>
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

      {/* Product Table Section */}
      <div className="bg-white shadow rounded-lg p-4 mt-10">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold">Sold Products</h3>

          {/* Date Filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-3 py-1 rounded"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-3 py-1 rounded"
            />

            <button
              onClick={() => setFilter("range")}
              className="px-3 py-2 bg-blue-600 text-white rounded"
            >
              Apply
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-purple-600 text-white rounded shadow"
            >
              📥 Export to Excel
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {["all", "today", "week", "month"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-sm md:text-base ${
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

        {/* TABLE */}
        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="table-auto min-w-[800px] w-full border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
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
                    <td className="px-4 py-2 border">৳{p.price}</td>
                    <td className="px-4 py-2 border">{p.quantity}</td>
                    <td className="px-4 py-2 border">
                      ৳{p.price * p.quantity}
                    </td>
                    <td className="px-4 py-2 border">৳{order.discount || 0}</td>
                    <td className="px-4 py-2 border">
                      ৳{Number(order.tax || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 border">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border">{order.orderType}</td>
                  </tr>
                ))
              )}

              {/* Grand Total Row */}
              {(() => {
                const sum = getSalesSummary();
                return (
                  <tr className="font-semibold bg-gray-100">
                    <td className="border px-4 py-2">Grand Total</td>
                    <td className="border px-4 py-2">৳{sum.price}</td>
                    <td className="border px-4 py-2">{sum.quantity}</td>
                    <td className="border px-4 py-2">৳{sum.total}</td>
                    <td className="border px-4 py-2">৳{sum.discount}</td>
                    <td className="border px-4 py-2">
                      ৳{Number(sum.tax).toFixed(2)}
                    </td>
                    <td className="border px-4 py-2"></td>
                    <td className="border px-4 py-2"></td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>

        <div className="bg-white shadow rounded-lg p-4 mt-10">
          <div className="flex justify-left items-center mb-4">
            <h3 className="text-lg font-semibold mx-2">
              📌 Total Product Sold Summary
            </h3>
            <button
              onClick={exportSummaryToExcel}
              className="px-4 py-2 bg-purple-600 text-white rounded"
            >
              📥 Export Summary
            </button>
          </div>

          <table className="table-auto w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Product Name</th>
                <th className="border px-4 py-2">Total Sold</th>
              </tr>
            </thead>

            <tbody>
              {getTotalSoldProducts().map((p, idx) => (
                <tr key={idx}>
                  <td className="border px-4 py-2">{p.name}</td>
                  <td className="border px-4 py-2 font-semibold">{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
