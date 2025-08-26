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
  RadialBarChart,
  RadialBar,
} from "recharts";

const SalesReport = () => {
  const [report, setReport] = useState({
    allTime: 0,
    thisMonth: 0,
    thisWeek: 0,
    today: 0,
  });

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const chartData = [
    { name: "All Time", value: report.allTime },
    { name: "This Month", value: report.thisMonth },
    { name: "This Week", value: report.thisWeek },
    { name: "Today", value: report.today },
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
      <div className="grid grid-cols-4 gap-6 mb-10">
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
              <Bar dataKey="value" fill="#8884d8" />
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
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radial Chart */}
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-center">Radial Chart</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="10%"
              outerRadius="80%"
              barSize={15}
              data={chartData}
            >
              <RadialBar
                minAngle={15}
                label={{ position: "insideStart", fill: "#fff" }}
                background
                clockWise
                dataKey="value"
              />
              <Legend
                iconSize={10}
                layout="vertical"
                verticalAlign="middle"
                wrapperStyle={{ right: 0 }}
              />
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
