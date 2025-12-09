import { useEffect, useState } from "react";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import * as XLSX from "xlsx";

const ProfitLossReport = () => {
  const axiosPublic = useAxiosPublic();
  const [report, setReport] = useState({});
  const [expenseReport, setExpenseReport] = useState({});
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateRangeStats, setDateRangeStats] = useState(null);

  // FETCH PROFIT REPORT
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axiosPublic.get("/profit-loss-report");
        setReport(res.data);
        setOrders(res.data.allOrders || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReport();
  }, []);

  // FETCH EXPENSE REPORT
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await axiosPublic.get("/expenses/report");
        setExpenseReport(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExpense();
  }, []);

  // NET PROFIT CALCULATOR
  const getNetStats = () => {
    const profitToday = report.today?.profit || 0;
    const expenseToday = expenseReport.today || 0;

    const profitWeek = report.thisWeek?.profit || 0;
    const expenseWeek = expenseReport.thisWeek || 0;

    const profitMonth = report.thisMonth?.profit || 0;
    const expenseMonth = expenseReport.thisMonth || 0;

    const profitAll = report.allTime?.profit || 0;
    const expenseAll = expenseReport.total || 0;

    return {
      today: profitToday - expenseToday,
      week: profitWeek - expenseWeek,
      month: profitMonth - expenseMonth,
      total: profitAll - expenseAll,
    };
  };

  // FILTER ORDERS
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

      if (filter === "range" && startDate && endDate) {
        const sd = new Date(startDate);
        const ed = new Date(endDate);
        return orderDate >= sd && orderDate <= ed;
      }

      return true;
    });
  };

  // EXPORT EXCEL
  const exportToExcel = () => {
    const filteredOrders = getFilteredOrders().flatMap((order) =>
      (order.cartItems || []).map((p) => {
        const totalSale = p.price * p.quantity;
        const totalCost = (p.purchasePrice || 0) * p.quantity;
        const profit =
          totalSale - totalCost - (order.discount || 0) + (order.tax || 0);

        return {
          ProductName: p.productName || p.name || p.title,
          PurchasePrice: p.purchasePrice || 0,
          SalePrice: p.price,
          Quantity: p.quantity,
          TotalSale: totalSale,
          TotalCost: totalCost,
          Discount: order.discount || 0,
          Tax: Number(order.tax || 0).toFixed(2),
          ProfitOrLoss: profit,
          Date: new Date(order.createdAt).toLocaleDateString(),
          OrderType: order.orderType,
        };
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(filteredOrders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Profit Loss Report");

    XLSX.writeFile(workbook, "profit_loss_report.xlsx");
  };

  const fetchDateRangeStats = async () => {
    if (!startDate || !endDate) return;

    // 1️⃣ profit from orders
    const res1 = await axiosPublic.get("/profit-loss-report");
    const orders = res1.data.allOrders || [];

    const sd = new Date(startDate);
    const ed = new Date(endDate);

    const filteredOrders = orders.filter(
      (o) => new Date(o.createdAt) >= sd && new Date(o.createdAt) <= ed
    );

    let sales = 0,
      cost = 0,
      discount = 0,
      tax = 0;

    filteredOrders.forEach((order) => {
      discount += Number(order.discount || 0);
      tax += Number(order.tax || 0);

      (order.cartItems || []).forEach((p) => {
        const totalSell = p.price * p.quantity;
        const totalCost = (p.purchasePrice || 0) * p.quantity;

        sales += totalSell;
        cost += totalCost;
      });
    });

    const profit = sales - cost - discount + tax;

    // 2️⃣ expense from backend
    const res2 = await axiosPublic.get(
      `/expenses/report?startDate=${startDate}&endDate=${endDate}`
    );

    const expenseTotal = res2.data.total || 0;

    setDateRangeStats({
      profit,
      expense: expenseTotal,
      net: profit - expenseTotal,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="pb-4 mb-8 text-3xl font-bold text-center border-b-2 border-gray-200">
        💰 Profit, Expense & Net Profit Report
      </h2>

      {/* 🔥 TOP TOTAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-green-100 p-5 rounded-lg shadow text-center">
          <h3 className="text-gray-700 font-semibold">Total Profit</h3>
          <p className="text-3xl font-bold">৳{report.allTime?.profit || 0}</p>
        </div>

        <div className="bg-red-100 p-5 rounded-lg shadow text-center">
          <h3 className="text-gray-700 font-semibold">Total Expense</h3>
          <p className="text-3xl font-bold">৳{expenseReport.total || 0}</p>
        </div>

        <div className="bg-blue-100 p-5 rounded-lg shadow text-center">
          <h3 className="text-gray-700 font-semibold">Net Profit</h3>
          <p className="text-3xl font-bold">৳{getNetStats().total}</p>
        </div>
      </div>

      {dateRangeStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
          <div className="bg-green-50 p-4 rounded-lg text-center shadow">
            <h3 className="font-semibold text-gray-700">Date Wise Profit</h3>
            <p className="text-2xl font-bold text-green-600">
              ৳{dateRangeStats.profit}
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg text-center shadow">
            <h3 className="font-semibold text-gray-700">Date Wise Expense</h3>
            <p className="text-2xl font-bold text-red-600">
              ৳{dateRangeStats.expense}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg text-center shadow">
            <h3 className="font-semibold text-gray-700">Net Profit</h3>
            <p className="text-2xl font-bold text-blue-600">
              ৳{dateRangeStats.net}
            </p>
          </div>
        </div>
      )}

      {/* 🔥 PERIOD SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-green-50 p-4 rounded-lg shadow text-center">
          <h3 className="font-medium">
            Today Profit: ৳{report.today?.profit || 0}
          </h3>
          <h3 className="mt-1">Today Expense: ৳{expenseReport.today || 0}</h3>
          <h3 className="mt-1 font-bold text-blue-600">
            Net Today: ৳{getNetStats().today}
          </h3>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg shadow text-center">
          <h3 className="font-medium">
            This Week Profit: ৳{report.thisWeek?.profit || 0}
          </h3>
          <h3 className="mt-1">
            This Week Expense: ৳{expenseReport.thisWeek || 0}
          </h3>
          <h3 className="mt-1 font-bold text-blue-600">
            Net Week: ৳{getNetStats().week}
          </h3>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg shadow text-center">
          <h3 className="font-medium">
            This Month Profit: ৳{report.thisMonth?.profit || 0}
          </h3>
          <h3 className="mt-1">
            This Month Expense: ৳{expenseReport.thisMonth || 0}
          </h3>
          <h3 className="mt-1 font-bold text-blue-600">
            Net Month: ৳{getNetStats().month}
          </h3>
        </div>
      </div>

      {/* PRODUCT TABLE */}
      <div className="bg-white shadow rounded-lg p-4 mt-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-lg font-semibold w-full md:w-auto">
            Products (Profit / Loss)
          </h3>

          <div className="flex flex-wrap items-center gap-2">
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
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Data
            </button>
            <button
              onClick={fetchDateRangeStats}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Stat
            </button>

            <button
              onClick={exportToExcel}
              className="px-4 py-1 bg-green-600 text-white rounded shadow"
            >
              📥 Export
            </button>
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
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
                      <td className="px-4 py-2 border font-medium">
                        {p.productName || p.name || p.title}
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
                      <td className="px-4 py-2 border">
                        ৳{Number(order.tax || 0).toFixed(2)}
                      </td>
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
