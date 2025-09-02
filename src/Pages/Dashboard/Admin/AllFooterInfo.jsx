import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import axios from "axios";

const AllFooterInfo = () => {
  const { data: footers = [], refetch } = useQuery({
    queryKey: ["footers"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:5000/footerInfo");
      return res.data;
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFooter, setSelectedFooter] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    facebook: "",
    linkedin: "",
    logo: "",
  });

  const openEditModal = (footer) => {
    setSelectedFooter(footer);
    setFormData({ ...footer });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/footerInfo/${selectedFooter._id}`, formData);
      Swal.fire("Updated!", "Footer info has been updated.", "success");
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      Swal.fire("Error", "Failed to update footer info", "error");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This footer info will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/footerInfo/${id}`).then((res) => {
          if (res.data.deletedCount > 0) {
            refetch();
            Swal.fire("Deleted!", "Footer info removed.", "success");
          }
        });
      }
    });
  };

  return (
    <div className="max-w-6xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        All Footer Info
      </h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Logo</th>
              <th className="px-6 py-3">Company Name</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {footers.map((footer, index) => (
              <tr key={footer._id} className="transition duration-200 hover:bg-gray-50">
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4">
                  <img src={footer.logo} alt="Logo" className="object-cover w-20 h-12 border rounded" />
                </td>
                <td className="px-6 py-4">{footer.name}</td>
                <td className="flex gap-4 px-6 py-4">
                  <button onClick={() => openEditModal(footer)}>
                    <FaEdit className="text-2xl text-cyan-500 hover:text-cyan-600" />
                  </button>
                  <button onClick={() => handleDelete(footer._id)}>
                    <FaTrashAlt className="text-2xl text-red-500 hover:text-red-700" />
                  </button>
                </td>
              </tr>
            ))}
            {footers.length === 0 && (
              <tr>
                <td colSpan="4" className="py-6 text-center text-gray-500">
                  No footer info found.
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
            <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-2 text-gray-500 text-xl">✖</button>
            <h3 className="mb-4 text-xl font-semibold">Edit Footer Info</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Company Name" className="w-full p-2 border rounded" required />
              <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border rounded" rows={3} required />
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full p-2 border rounded" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded" />
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="w-full p-2 border rounded" />
              <input type="text" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="Facebook URL" className="w-full p-2 border rounded" />
              <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="LinkedIn URL" className="w-full p-2 border rounded" />
              <input type="text" name="logo" value={formData.logo} onChange={handleChange} placeholder="Logo URL" className="w-full p-2 border rounded" />
              <button type="submit" className="px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600">Update Footer Info</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllFooterInfo;
