import { useState, useContext } from "react";
import { AuthContext } from "../../../provider/AuthProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const AddCategory = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    status: "active",
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const image = e.target.files[0];
    const form = new FormData();
    form.append("file", image);
    form.append("upload_preset", "your_upload_preset");
    form.append("cloud_name", "your_cloud_name");
    setUploading(true);

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/image/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      setFormData({ ...formData, image: data.secure_url });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Image upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://your-server.com/categories", formData);
      if (res.data.insertedId) {
        Swal.fire("Success", "Category added successfully!", "success");
        navigate("/dashboard/allCategories");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="max-w-xl p-6 mx-auto mt-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center">Add New Category</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
          {formData.image && <img src={formData.image} alt="preview" className="w-20 mt-2 rounded" />}
        </div>

        <div>
          <label className="block mb-1 font-semibold">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 border rounded"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
        >
          Add Category
        </button>
      </form>
    </div>
  );
};

export default AddCategory;