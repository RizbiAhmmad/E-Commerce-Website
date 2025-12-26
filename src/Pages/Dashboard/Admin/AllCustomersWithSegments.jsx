import { useEffect, useState } from "react";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const AllCustomersWithSegments = () => {
  const axiosPublic = useAxiosPublic();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const customersPerPage = 20;

  const fetchCustomers = async () => {
    try {
      const res = await axiosPublic.get("/customer-segments");
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

  const filteredCustomers = customers.filter((c) => {
    const matchSearch =
      (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c._id || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchSegment =
      segmentFilter === "" ||
      (c.segment || "").toLowerCase() === segmentFilter.toLowerCase();

    const matchDistrict =
      districtFilter === "" ||
      (c.district || "").toLowerCase() === districtFilter.toLowerCase();

    return matchSearch && matchSegment && matchDistrict;
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
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded-xl px-4 py-2 text-sm shadow-sm w-full md:w-64"
        />

        {/* District Filter */}
        <select
          value={districtFilter}
          onChange={(e) => {
            setDistrictFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded-xl px-4 py-2 text-sm shadow-sm w-full md:w-auto"
        >
          <option value="">All Districts</option>
          <option value="Bagerhat">Bagerhat</option>
          <option value="Bandarban">Bandarban</option>
          <option value="Barguna">Barguna</option>
          <option value="Barishal">Barishal</option>
          <option value="Bhola">Bhola</option>
          <option value="Bogura">Bogura</option>
          <option value="Brahmanbaria">Brahmanbaria</option>
          <option value="Chandpur">Chandpur</option>
          <option value="Chapainawabganj">Chapainawabganj</option>
          <option value="Chattogram">Chattogram</option>
          <option value="Chuadanga">Chuadanga</option>
          <option value="Cox's Bazar">Cox's Bazar</option>
          <option value="Cumilla">Cumilla</option>
          <option value="Dhaka">Dhaka</option>
          <option value="Dinajpur">Dinajpur</option>
          <option value="Faridpur">Faridpur</option>
          <option value="Feni">Feni</option>
          <option value="Gaibandha">Gaibandha</option>
          <option value="Gazipur">Gazipur</option>
          <option value="Gopalganj">Gopalganj</option>
          <option value="Habiganj">Habiganj</option>
          <option value="Jamalpur">Jamalpur</option>
          <option value="Jashore">Jashore</option>
          <option value="Jhalokati">Jhalokati</option>
          <option value="Jhenaidah">Jhenaidah</option>
          <option value="Joypurhat">Joypurhat</option>
          <option value="Khagrachhari">Khagrachhari</option>
          <option value="Khulna">Khulna</option>
          <option value="Kishoreganj">Kishoreganj</option>
          <option value="Kurigram">Kurigram</option>
          <option value="Kushtia">Kushtia</option>
          <option value="Lakshmipur">Lakshmipur</option>
          <option value="Lalmonirhat">Lalmonirhat</option>
          <option value="Madaripur">Madaripur</option>
          <option value="Magura">Magura</option>
          <option value="Manikganj">Manikganj</option>
          <option value="Meherpur">Meherpur</option>
          <option value="Moulvibazar">Moulvibazar</option>
          <option value="Munshiganj">Munshiganj</option>
          <option value="Mymensingh">Mymensingh</option>
          <option value="Naogaon">Naogaon</option>
          <option value="Narail">Narail</option>
          <option value="Narayanganj">Narayanganj</option>
          <option value="Narsingdi">Narsingdi</option>
          <option value="Natore">Natore</option>
          <option value="Netrokona">Netrokona</option>
          <option value="Nilphamari">Nilphamari</option>
          <option value="Noakhali">Noakhali</option>
          <option value="Pabna">Pabna</option>
          <option value="Panchagarh">Panchagarh</option>
          <option value="Patuakhali">Patuakhali</option>
          <option value="Pirojpur">Pirojpur</option>
          <option value="Rajbari">Rajbari</option>
          <option value="Rajshahi">Rajshahi</option>
          <option value="Rangamati">Rangamati</option>
          <option value="Rangpur">Rangpur</option>
          <option value="Satkhira">Satkhira</option>
          <option value="Shariatpur">Shariatpur</option>
          <option value="Sherpur">Sherpur</option>
          <option value="Sirajganj">Sirajganj</option>
          <option value="Sunamganj">Sunamganj</option>
          <option value="Sylhet">Sylhet</option>
          <option value="Tangail">Tangail</option>
          <option value="Thakurgaon">Thakurgaon</option>
        </select>

        {/* Segment Filter */}
        <select
          value={segmentFilter}
          onChange={(e) => {
            setSegmentFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded-xl px-4 py-2 text-sm shadow-sm w-full md:w-auto"
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
              <th className="px-6 py-3">District</th>
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
                <td className="px-6 py-4 font-medium">{c.district}</td>
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
