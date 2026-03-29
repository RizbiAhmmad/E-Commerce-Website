import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaTrashAlt, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const AllExpense = () => {
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();

  const { data: expenses = [], refetch } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await axiosPublic.get("/expenses");
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

  const [searchTerm, setSearchTerm] = useState("");

  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });

  const [appliedDateFilter, setAppliedDateFilter] = useState({
    startDate: "",
    endDate: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const expensesPerPage = 20;

  const handleApplyFilter = () => {
    setAppliedDateFilter(dateFilter);
    setCurrentPage(1);
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch = `${exp.category} ${exp.name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (!appliedDateFilter.startDate || !appliedDateFilter.endDate) {
      return matchesSearch;
    }

    const expenseDate = new Date(exp.date);
    const start = new Date(appliedDateFilter.startDate);
    const end = new Date(appliedDateFilter.endDate);

    return matchesSearch && expenseDate >= start && expenseDate <= end;
  });

  const totalCost = filteredExpenses.reduce(
    (sum, exp) => sum + Number(exp.price || 0),
    0
  );

  const exportToExcel = () => {
    const data = filteredExpenses.map((exp) => ({
      Category: exp.category,
      Name: exp.name,
      Price: exp.price,
      Note: exp.note,
      Date: new Date(exp.date).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(blob, "Expense_Report.xlsx");
  };

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
      await axiosPublic.put(`/expenses/${selectedExpense._id}`, {
        ...formData,
        price: Number(formData.price),
      });

      Swal.fire("Updated!", "Expense updated successfully", "success");

      setIsModalOpen(false);
      refetch();
    } catch {
      Swal.fire("Error", "Failed to update", "error");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Expense?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPublic.delete(`/expenses/${id}`).then((res) => {
          if (res.data.deletedCount > 0) {
            refetch();
            Swal.fire("Deleted!", "", "success");
          }
        });
      }
    });
  };

  return (
    <div className="max-w-7xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b">
        All Expenses
      </h2>

      {/* Top Controls */}
<div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">

  {/* LEFT - Search */}
  <div className="flex items-center border rounded-xl px-3 py-2 w-full lg:w-72">
    <FaSearch className="text-gray-400 mr-2" />
    <input
      type="text"
      placeholder="Search expense..."
      className="outline-none w-full"
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
      }}
    />
  </div>

  {/* MIDDLE - Filter */}
  <div className="flex flex-wrap items-center justify-center gap-3">

    <input
      type="date"
      value={dateFilter.startDate}
      onChange={(e) =>
        setDateFilter({ ...dateFilter, startDate: e.target.value })
      }
      className="border px-3 py-2 rounded-lg"
    />

    <input
      type="date"
      value={dateFilter.endDate}
      onChange={(e) =>
        setDateFilter({ ...dateFilter, endDate: e.target.value })
      }
      className="border px-3 py-2 rounded-lg"
    />

    <button
      onClick={handleApplyFilter}
      className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
    >
      Filter
    </button>

    <button
      onClick={exportToExcel}
      className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600"
    >
      Export
    </button>

  </div>

  {/* RIGHT - Add Expense */}
  <button
    onClick={() => navigate("/dashboard/addExpense")}
    className="flex items-center justify-center gap-2 px-5 py-2 text-white bg-cyan-500 rounded-xl hover:bg-cyan-600"
  >
    <FaPlus /> Add Expense
  </button>

</div>

      {/* Total */}
      <div className="mb-4 text-lg font-semibold">
        Total Cost: <span className="text-cyan-500">৳ {totalCost}</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 uppercase text-gray-700">
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

          <tbody className="divide-y">
            {currentExpenses.map((exp, index) => (
              <tr key={exp._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{indexOfFirstExpense + index + 1}</td>
                <td className="px-6 py-4 font-semibold">{exp.category}</td>
                <td className="px-6 py-4">{exp.name}</td>
                <td className="px-6 py-4">৳ {exp.price}</td>
                <td className="px-6 py-4">{exp.note}</td>
                <td className="px-6 py-4">
                  {new Date(exp.date).toLocaleDateString()}
                </td>

                <td className="flex gap-4 px-6 py-4">
                  <button onClick={() => openEditModal(exp)}>
                    <FaEdit className="text-cyan-500 text-xl" />
                  </button>

                  <button onClick={() => handleDelete(exp._id)}>
                    <FaTrashAlt className="text-red-500 text-xl" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-4 py-2 bg-cyan-500 text-white rounded-lg"
        >
          Previous
        </button>

        <span className="px-4 py-2 bg-gray-100 rounded-lg">
          Page {currentPage} of {totalPages || 1}
        </span>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-4 py-2 bg-cyan-500 text-white rounded-lg"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AllExpense;