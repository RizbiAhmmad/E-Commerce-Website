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
        const res = await axios.get("http://localhost:5000/sales-report");
        setReport(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReport();
  }, []);

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

          {/* Custom Legend for Pie */}
          <div className="flex justify-center flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-sm"
                style={{ background: "#0088FE" }}
              ></span>
              <span className="text-gray-700 font-medium">All Time</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-sm"
                style={{ background: "#00C49F" }}
              ></span>
              <span className="text-gray-700 font-medium">This Month</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-sm"
                style={{ background: "#FFBB28" }}
              ></span>
              <span className="text-gray-700 font-medium">This Week</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-sm"
                style={{ background: "#FF8042" }}
              ></span>
              <span className="text-gray-700 font-medium">Today</span>
            </div>
          </div>
        </div>
        
        {/* Line Chart */}{" "}
        <div className="bg-white shadow rounded-lg p-4">
          {" "}
          <h3 className="text-lg font-semibold mb-4 text-center">
            Line Chart
          </h3>{" "}
          <ResponsiveContainer width="100%" height={300}>
            {" "}
            <LineChart data={chartData}>
              {" "}
              <CartesianGrid strokeDasharray="3 3" /> <XAxis dataKey="name" />{" "}
              <YAxis /> <Tooltip /> <Legend />{" "}
              <Line type="monotone" dataKey="value" stroke="#82ca9d" />{" "}
            </LineChart>{" "}
          </ResponsiveContainer>{" "}
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

          {/* Custom Legend for Comparison */}
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-sm"
                style={{ background: "#0088FE" }}
              ></span>
              <span className="text-gray-700 font-medium">
                Current (This Month/Week/Today)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-sm"
                style={{ background: "#FF8042" }}
              ></span>
              <span className="text-gray-700 font-medium">
                Previous (Last Month/Week/Yesterday)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
