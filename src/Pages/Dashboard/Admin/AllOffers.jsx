import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AllOffers = () => {
  const { data: offers = [], refetch } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/offers");
      return res.data;
    },
  });

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [formData, setFormData] = useState({
    status: "active",
    image: "",
  });

  const openEditModal = (offer) => {
    setSelectedOffer(offer);
    setFormData({
      status: offer.status,
      image: offer.image,
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
      await axios.put(`http://localhost:5000/offers/${selectedOffer._id}`, formData);
      Swal.fire("Updated!", "Offer has been updated.", "success");
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      Swal.fire("Error", "Failed to update offer", "error");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This offer will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/offers/${id}`).then((res) => {
          if (res.data.deletedCount > 0) {
            refetch();
            Swal.fire("Deleted!", "Offer removed.", "success");
          }
        });
      }
    });
  };

  return (
    <div className="max-w-6xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        All Offers
      </h2>

      {/* Add Offer Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate("/dashboard/addOffer")}
          className="flex items-center gap-2 px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
        >
          <FaPlus /> Add Offer
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Image</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {offers.map((offer, index) => (
              <tr key={offer._id} className="transition duration-200 hover:bg-gray-50">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4">
                  <img src={offer.image} alt="Offer" className="object-cover w-10 h-10 border rounded" />
                </td>
                <td className="px-6 py-4">
                  {offer.status === "active" ? (
                    <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded">Active</span>
                  ) : (
                    <span className="px-2 py-1 text-xs text-red-800 bg-red-100 rounded">Inactive</span>
                  )}
                </td>
                <td className="flex gap-4 px-6 py-4">
                  <button onClick={() => openEditModal(offer)}>
                    <FaEdit className="text-2xl text-green-500 hover:text-green-600" />
                  </button>
                  <button onClick={() => handleDelete(offer._id)}>
                    <FaTrashAlt className="text-2xl text-red-500 hover:text-red-700" />
                  </button>
                </td>
              </tr>
            ))}
            {offers.length === 0 && (
              <tr>
                <td colSpan="4" className="py-6 text-center text-gray-500">
                  No offers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
            <h3 className="mb-4 text-xl font-semibold">Edit Offer</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleModalChange}
                  className="w-full p-2 border rounded"
                  required
                />
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
                className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
              >
                Update Offer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOffers;
