import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const AllPolicies = () => {
  const axiosPublic = useAxiosPublic();
  const { data: policies = [], refetch } = useQuery({
    queryKey: ["policies"],
    queryFn: async () => {
      const res = await axiosPublic.get("/policies");
      return res.data;
    },
  });

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    status: "active",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(policies.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentPolicies = policies.slice(indexOfFirst, indexOfLast);

  const openEditModal = (policy) => {
    setSelectedPolicy(policy);
    setFormData({
      title: policy.title,
      content: policy.content,
      status: policy.status,
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
      await axiosPublic.put(
        `/policies/${selectedPolicy._id}`,
        formData
      );

      Swal.fire("Updated!", "Policy has been updated.", "success");
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      Swal.fire("Error", "Failed to update policy", "error");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This policy will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPublic.delete(`/policies/${id}`).then((res) => {
          if (res.data.deletedCount > 0) {
            refetch();
            Swal.fire("Deleted!", "Policy removed.", "success");
          }
        });
      }
    });
  };

  // short description
  const truncate = (text, wordLimit) => {
    const words = text.split(" ");
    return words.length > wordLimit ? words.slice(0, wordLimit).join(" ") + "..." : text;
  };

  return (
    <div className="max-w-6xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        All Policies
      </h2>

      {/* Add Policy Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/dashboard/addPolicy")}
          className="flex items-center gap-2 px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
        >
          <FaPlus /> Add Policy
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentPolicies.map((policy, index) => (
              <tr key={policy._id} className="transition duration-200 hover:bg-gray-50">
                <td className="px-6 py-4">{indexOfFirst + index + 1}</td>
                <td className="px-6 py-4 font-semibold text-gray-800">{policy.title}</td>
                <td className="px-6 py-4 text-gray-600">
                  {truncate(policy.content, 12)}
                </td>
                <td className="px-6 py-4">
                  {policy.status === "active" ? (
                    <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs text-red-800 bg-red-100 rounded">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="flex gap-4 px-6 py-4">
                  <button onClick={() => openEditModal(policy)}>
                    <FaEdit className="text-2xl text-cyan-500 hover:text-cyan-600" />
                  </button>
                  <button onClick={() => handleDelete(policy._id)}>
                    <FaTrashAlt className="text-2xl text-red-500 hover:text-red-700" />
                  </button>
                </td>
              </tr>
            ))}
            {policies.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-500">
                  No policies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {policies.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          {[...Array(totalPages).keys()].map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === num + 1
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {num + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              ✖
            </button>
            <h3 className="mb-4 text-xl font-semibold">Edit Policy</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <select
                  name="title"
                  value={formData.title}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="Privacy Policy">Privacy Policy</option>
                  <option value="Return & Refund Policy">Return & Refund Policy</option>
                  <option value="Terms & Conditions">Terms & Conditions</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleModalChange}
                  rows="6"
                  className="w-full p-2 border rounded"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
              >
                Update Policy
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPolicies;
