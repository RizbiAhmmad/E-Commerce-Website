import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const StockReport = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;
  const axiosPublic = useAxiosPublic();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axiosPublic.get(
        "/products"
      );
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  //  stock color
  const getStockColor = (stock) => {
    if (stock === 0) return "bg-red-100 text-red-700 border-red-400";
    if (stock > 0 && stock <= 5)
      return "bg-orange-100 text-orange-700 border-orange-400";
    if (stock > 5 && stock <= 10)
      return "bg-yellow-100 text-yellow-700 border-yellow-400";
    if (stock > 10) return "bg-green-100 text-green-700 border-green-400";
    return "bg-gray-100 text-gray-700 border-gray-400";
  };

  // stock status text
  const getStockStatus = (stock) => {
    if (stock === 0) return "Out of Stock";
    if (stock > 0 && stock <= 5) return "Low Stock";
    if (stock > 5 && stock <= 10) return "Medium Stock";
    if (stock > 10) return "In Stock";
    return "Unknown";
  };

  // search filter
  const filteredProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="pb-4 mb-8 text-3xl font-bold text-center border-b-2 border-gray-200">
        Product Stock Report
      </h2>

      {/* Search */}
      <div className="flex justify-start mb-4">
        <div className="relative w-80">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name or barcode..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="border pl-10 pr-4 py-2 rounded-xl w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Image</th>
              <th className="px-6 py-3">Product Name</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Product Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentProducts.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
            {currentProducts.map((p, index) => (
              <tr
                key={p._id}
                className="hover:bg-gray-50 transition duration-200"
              >
                <td className="px-6 py-4 align-middle">
                  {indexOfFirstProduct + index + 1}
                </td>

                <td className="px-6 py-4 align-middle">
                  {p.images && p.images.length > 0 ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-16 h-16 object-cover rounded border"
                    />
                  ) : (
                    "-"
                  )}
                </td>

                <td className="px-6 py-4 align-middle">
                  <div className="font-semibold">{p.name}</div>
                  {p.barcode && (
                    <div className="text-xs text-gray-500 mt-1">
                      Barcode: {p.barcode}
                    </div>
                  )}
                </td>

                <td className="px-6 mt-4 py-4 flex items-center gap-2 align-middle">
                  {/* colourful stock number */}
                  <span
                    className={`px-3 py-1 rounded-full border text-sm font-bold ${getStockColor(
                      p.stock ?? 0
                    )}`}
                  >
                    {p.stock ?? 0}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    {getStockStatus(p.stock ?? 0)}
                  </span>
                </td>

                <td className="px-6 py-4 align-middle">
                  {p.status === "active" ? (
                    <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs text-red-800 bg-red-100 rounded">
                      Inactive
                    </span>
                  )}
                </td>
              </tr>
            ))}
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

export default StockReport;
