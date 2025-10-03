import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import axios from "axios";

const AllFooterInfo = () => {
  const [footers, setFooters] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFooter, setSelectedFooter] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    facebook: "",
    youtube: "",
    instagram: "",
    linkedin: "",
    tiktok: "",
    logo: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchFooters = async () => {
    try {
      const res = await axios.get("https://e-commerce-server-api.onrender.com/footer");
      setFooters(res.data);
    } catch (err) {
      console.error("Error fetching footers:", err);
    }
  };

  useEffect(() => {
    fetchFooters();
  }, []);

  const openEditModal = (footer) => {
    setSelectedFooter(footer);
    setFormData({
      name: footer.name,
      description: footer.description,
      phone: footer.phone,
      email: footer.email,
      address: footer.address,
      facebook: footer.facebook,
      youtube: footer.youtube,
      instagram: footer.instagram,
      linkedin: footer.linkedin,
      tiktok: footer.tiktok,
      logo: footer.logo,
    });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let logoUrl = formData.logo;
      if (logoFile) {
        const cloudinaryData = new FormData();
        cloudinaryData.append("file", logoFile);
        cloudinaryData.append("upload_preset", "eCommerce");

        const cloudRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dt3bgis04/image/upload",
          cloudinaryData
        );
        logoUrl = cloudRes.data.secure_url;
      }

      await axios.put(`https://e-commerce-server-api.onrender.com/footer/${selectedFooter._id}`, {
        ...formData,
        logo: logoUrl,
      });

      Swal.fire("Updated!", "Footer info has been updated.", "success");
      setIsModalOpen(false);
      setLogoFile(null);
      fetchFooters();
    } catch (err) {
      console.error("Update Footer Error:", err);
      Swal.fire("Error", "Failed to update footer info", "error");
    } finally {
      setLoading(false);
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(`https://e-commerce-server-api.onrender.com/footer/${id}`);
          if (res.data.deletedCount > 0) {
            Swal.fire("Deleted!", "Footer info removed.", "success");
            fetchFooters();
          }
        } catch (err) {
          Swal.fire("Error", "Failed to delete footer info", "error");
        }
      }
    });
  };

  return (
    <div className="max-w-6xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        All Information
      </h2>

      {/* Add Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => window.location.href = "/dashboard/addFooterInfo"}
          className="flex items-center gap-2 px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
        >
          <FaPlus /> Add Information
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Logo</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Social Links</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {footers.map((footer, index) => (
              <tr key={footer._id} className="transition duration-200 hover:bg-gray-50">
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3">
                  <img
                    src={footer.logo}
                    alt={footer.name}
                    className="object-cover w-12 h-12 border rounded"
                  />
                </td>
                <td className="px-4 py-3 font-semibold text-gray-800">{footer.name}</td>
                <td className="px-4 py-3">{footer.phone}</td>
                <td className="px-4 py-3">{footer.email}</td>
                <td className="px-4 py-3">{footer.address}</td>
                <td className="px-4 py-3 space-y-1">
                  {footer.facebook && <div>{footer.facebook}</div>}
                  {footer.youtube && <div>{footer.youtube}</div>}
                  {footer.instagram && <div>{footer.instagram}</div>}
                  {footer.linkedin && <div>{footer.linkedin}</div>}
                  {footer.tiktok && <div>{footer.tiktok}</div>}
                </td>
                <td className="flex gap-4 px-4 py-3">
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
                <td colSpan="8" className="py-6 text-center text-gray-500">
                  No information found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white p-4 rounded shadow-lg w-full max-w-lg relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 text-xl"
            >
              ✖
            </button>
            <h3 className="mb-2 text-xl text-center font-semibold">Edit Information</h3>
            <form onSubmit={handleUpdate} className="space-y-2">
              {/* Logo Upload */}
              <div>
                <label className="block mb-1 font-semibold">Logo</label>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="logo"
                    className="px-4 py-2 text-white transition bg-cyan-500 rounded-lg shadow cursor-pointer hover:bg-cyan-600"
                  >
                    Choose File
                  </label>
                  <span className="text-sm text-gray-600">
                    {logoFile ? logoFile.name : formData.logo ? "Existing logo" : "No file chosen"}
                  </span>
                </div>
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  onChange={handleLogoChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Company Name"
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Company Description"
                className="w-full p-2 border rounded"
                rows={2}
                required
              />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="w-full p-2 border rounded"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                placeholder="Facebook URL"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="youtube"
                value={formData.youtube}
                onChange={handleChange}
                placeholder="YouTube URL"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="Instagram URL"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="LinkedIn URL"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="tiktok"
                value={formData.tiktok}
                onChange={handleChange}
                placeholder="TikTok URL"
                className="w-full p-2 border rounded"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
              >
                {loading ? "Updating..." : "Update Information"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllFooterInfo;
