import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function ExpenseReport() {
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });

  const { data: report = {}, isLoading, refetch } = useQuery({
    queryKey: ["expenseReport", dateFilter],
    queryFn: async () => {
      const res = await axios.get("https://e-commerce-server-api.onrender.com/expenses/report", {
        params: dateFilter.startDate && dateFilter.endDate ? dateFilter : {},
      });
      return res.data;
    },
  });

  if (isLoading) return <p>Loading...</p>;

  const chartData = [
    { name: "Today", value: report.today },
    { name: "This Week", value: report.thisWeek },
    { name: "This Month", value: report.thisMonth },
    { name: "Total", value: report.total },
  ];

  const comparisonData = [
    { name: "Month", ThisMonth: report.thisMonth, PreviousMonth: report.previousMonth },
    { name: "Week", ThisWeek: report.thisWeek, PreviousWeek: report.previousWeek },
    { name: "Today vs Yesterday", Today: report.today, Yesterday: report.yesterday },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6">Expense Report</h2>

      {/* Date Filter */}
      <div className="flex items-center gap-4 mb-6 justify-center">
        <input
          type="date"
          value={dateFilter.startDate}
          onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          type="date"
          value={dateFilter.endDate}
          onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={() => refetch()}
          className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Apply Filter
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-100 shadow p-4 rounded-lg text-center">
          <p className="text-gray-500">Total</p>
          <h3 className="text-xl font-bold text-cyan-600">৳{report.total}</h3>
        </div>
        <div className="bg-green-100 shadow p-4 rounded-lg text-center">
          <p className="text-gray-500">This Month</p>
          <h3 className="text-xl font-bold text-cyan-600">৳{report.thisMonth}</h3>
        </div>
        <div className="bg-cyan-100 shadow p-4 rounded-lg text-center">
          <p className="text-gray-500">This Week</p>
          <h3 className="text-xl font-bold text-cyan-600">৳{report.thisWeek}</h3>
        </div>
        <div className="bg-red-100 shadow p-4 rounded-lg text-center">
          <p className="text-gray-500">Today</p>
          <h3 className="text-xl font-bold text-cyan-600">৳{report.today}</h3>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Expense Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Comparison Bar Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-center">Expense Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ThisMonth" fill="#0088FE" />
              <Bar dataKey="PreviousMonth" fill="#FF8042" />
              <Bar dataKey="ThisWeek" fill="#00C49F" />
              <Bar dataKey="PreviousWeek" fill="#FFBB28" />
              <Bar dataKey="Today" fill="#00CED1" />
              <Bar dataKey="Yesterday" fill="#A52A2A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
