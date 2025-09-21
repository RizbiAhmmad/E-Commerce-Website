import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaTrashAlt, FaSearch } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AllExpense = () => {
  const navigate = useNavigate();

  // Fetch expenses
  const { data: expenses = [], refetch } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/expenses");
      return res.data;
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    price: "",
    note: "",
    date: "",    
  });

  //  Search
  const [searchTerm, setSearchTerm] = useState("");

  //  Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const expensesPerPage = 20;

  //  Filter expenses by category or name
  const filteredExpenses = expenses.filter((exp) =>
    `${exp.category} ${exp.name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  //  Calculate total cost of filtered expenses
  const totalCost = filteredExpenses.reduce(
    (sum, exp) => sum + Number(exp.price || 0),
    0
  );

  // Page slicing
  const indexOfLastExpense = currentPage * expensesPerPage;
  const indexOfFirstExpense = indexOfLastExpense - expensesPerPage;
  const currentExpenses = filteredExpenses.slice(
    indexOfFirstExpense,
    indexOfLastExpense
  );

  const totalPages = Math.ceil(filteredExpenses.length / expensesPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const openEditModal = (exp) => {
    setSelectedExpense(exp);
    setFormData({
      category: exp.category,
      name: exp.name,
      price: exp.price,
      note: exp.note,
      date: exp.date?.split("T")[0] || "",
    });
    setIsModalOpen(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/expenses/${selectedExpense._id}`, {
        ...formData,
        price: Number(formData.price),
      });
      Swal.fire("Updated!", "Expense has been updated.", "success");
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      Swal.fire("Error", "Failed to update expense", "error");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This expense will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/expenses/${id}`).then((res) => {
          if (res.data.deletedCount > 0) {
            refetch();
            Swal.fire("Deleted!", "Expense removed.", "success");
          }
        });
      }
    });
  };

  return (
    <div className="max-w-6xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        All Expenses
      </h2>

      {/* Search + Add Expense Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <div className="flex items-center w-full md:w-1/4 border rounded px-3 py-2">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search by category or name..."
            className="w-full outline-none"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <button
          onClick={() => navigate("/dashboard/addExpense")}
          className="flex items-center gap-2 px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
        >
          <FaPlus /> Add Expense
        </button>
      </div>

      {/*  Total Cost */}
      <div className="mb-4 text-lg font-semibold text-gray-700">
        Total Cost: <span className="text-cyan-500">৳ {totalCost}</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Note</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentExpenses.map((exp, index) => (
              <tr
                key={exp._id}
                className="transition duration-200 hover:bg-gray-50"
              >
                <td className="px-6 py-4">{indexOfFirstExpense + index + 1}</td>
                <td className="px-6 py-4 font-semibold text-gray-800">
                  {exp.category}
                </td>
                <td className="px-6 py-4">{exp.name}</td>
                <td className="px-6 py-4">৳ {exp.price}</td>
                <td className="px-6 py-4">{exp.note}</td>
                <td className="px-6 py-4">
                  {new Date(exp.date).toLocaleDateString()}
                </td>
                <td className="flex gap-4 px-6 py-4">
                  <button onClick={() => openEditModal(exp)}>
                    <FaEdit className="text-2xl text-cyan-500 hover:text-cyan-600" />
                  </button>
                  <button onClick={() => handleDelete(exp._id)}>
                    <FaTrashAlt className="text-2xl text-red-500 hover:text-red-700" />
                  </button>
                </td>
              </tr>
            ))}
            {filteredExpenses.length === 0 && (
              <tr>
                <td colSpan="6" className="py-6 text-center text-gray-500">
                  No expenses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-4 py-2 rounded-lg font-semibold text-white ${
            currentPage === totalPages || totalPages === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-cyan-500 hover:bg-cyan-600"
          }`}
        >
          Next
        </button>
      </div>

      {/*  Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              ✖
            </button>
            <h3 className="mb-4 text-xl font-semibold">Edit Expense</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Note</label>
                <input
                  type="text"
                  name="note"
                  value={formData.note}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
              >
                Update Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllExpense;
