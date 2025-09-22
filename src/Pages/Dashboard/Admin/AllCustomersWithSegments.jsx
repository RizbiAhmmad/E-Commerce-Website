import { useEffect, useState } from "react";
import axios from "axios";

const AllCustomersWithSegments = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");
  const customersPerPage = 20;

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(
        "https://e-commerce-server-api.onrender.com/customer-segments"
      );
      setCustomers(res.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const getSegmentClasses = (segment) => {
    switch (segment?.toLowerCase()) {
      case "loyal":
        return "bg-green-100 text-green-800 border border-green-300";
      case "high spender":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
      case "regular":
        return "bg-blue-100 text-blue-800 border border-blue-300";
      case "one-time":
        return "bg-gray-100 text-gray-800 border border-cyan-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  // Search + Segment filter
  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c._id || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchSegment =
      segmentFilter === "" ||
      (c.segment || "").toLowerCase() === segmentFilter.toLowerCase();

    return matchSearch && matchSegment;
  });

  // Pagination logic
  const indexOfLast = currentPage * customersPerPage;
  const indexOfFirst = indexOfLast - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-xl font-semibold text-gray-600">
        Loading customer segments...
      </div>
    );
  }

  return (
    <div className="max-w-7xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        Customer Segments
      </h2>

      {/* Search + Filter Bar */}
      <div className="mb-4 flex justify-between items-center gap-4">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset page on search
          }}
          className="border border-gray-300 rounded px-4 py-2 text-sm shadow-sm w-64"
        />

        {/* Segment Filter */}
        <select
          value={segmentFilter}
          onChange={(e) => {
            setSegmentFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded px-4 py-2 text-sm shadow-sm"
        >
          <option value="">All Segments</option>
          <option value="Loyal">Loyal</option>
          <option value="High Spender">High Spender</option>
          <option value="Regular">Regular</option>
          <option value="One-time">New Customer</option>
        </select>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Total Orders</th>
              <th className="px-6 py-3">Total Spend</th>
              <th className="px-6 py-3">Last Order</th>
              <th className="px-6 py-3">Segment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentCustomers.map((c, index) => (
              <tr
                key={c._id}
                className="transition duration-200 hover:bg-gray-50"
              >
                <td className="px-6 py-4">{indexOfFirst + index + 1}</td>
                <td className="px-6 py-4 font-semibold text-gray-800">
                  {c.name || "N/A"}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  <div>{c._id}</div>
                  <div>{c.phone || "-"}</div>
                </td>
                <td className="px-6 py-4 font-medium">{c.totalOrders}</td>
                <td className="px-6 py-4 font-bold">৳{c.totalSpend}</td>
                <td className="px-6 py-4">
                  {c.lastOrder ? new Date(c.lastOrder).toLocaleString() : "N/A"}
                </td>
                <td className="px-6 py-4">
                  
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getSegmentClasses(
                      c.segment
                    )}`}
                    style={{
                      maxWidth: "120px",
                      display: "inline-block",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {c.segment === "One-time" ? "New Customer" : c.segment}
                  </span>
                </td>
              </tr>
            ))}

            {filteredCustomers.length === 0 && (
              <tr>
                <td colSpan="7" className="py-6 text-center text-gray-500">
                  No customer data found.
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

export default AllCustomersWithSegments;
