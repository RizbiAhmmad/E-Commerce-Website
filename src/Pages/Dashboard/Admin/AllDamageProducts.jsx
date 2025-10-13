import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { FaEdit, FaPlus, FaSearch, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const AllDamageProducts = () => {
  const { data: damageProducts = [], refetch } = useQuery({
    queryKey: ["damageProducts"],
    queryFn: async () => {
      const res = await axiosPublic.get(
        "/damage-products"
      );
      return res.data;
    },
  });

  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const axiosPublic = useAxiosPublic();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    barcode: "",
    referenceNo: "",
    price: "",
    quantity: "",
    note: "",
    image: "",
  });
  const [newImageFile, setNewImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Search + Pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch all products for dropdown
  useEffect(() => {
    axiosPublic
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));
  }, []);

  const productOptions = products.map((p) => ({
    value: p._id,
    label: `${p.name} (${p.barcode}) - ${p.newPrice}৳`,
    name: p.name,
    barcode: p.barcode,
    price: p.newPrice,
  }));

  const filteredProducts = damageProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.barcode &&
        product.barcode.toLowerCase().includes(search.toLowerCase())) ||
      (product.note &&
        product.note.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      productId: product.productId || "",
      name: product.name,
      barcode: product.barcode || "",
      referenceNo: product.referenceNo,
      price: product.price,
      quantity: product.quantity,
      note: product.note,
      image: product.image,
    });
    setNewImageFile(null);
    setIsModalOpen(true);
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductSelect = (selected) => {
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        productId: selected.value,
        name: selected.name,
        barcode: selected.barcode,
        price: selected.price,
      }));
    }
  };

  const handleImageChange = (e) => {
    setNewImageFile(e.target.files[0]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = formData.image;

      if (newImageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", newImageFile);
        fd.append("upload_preset", "eCommerce");
        const uploadRes = await axiosPublic.post(
          "https://api.cloudinary.com/v1_1/dt3bgis04/image/upload",
          fd
        );
        imageUrl = uploadRes.data.secure_url;
        setUploading(false);
      }

      await axiosPublic.put(
        `/damage-products/${selectedProduct._id}`,
        { ...formData, image: imageUrl }
      );

      Swal.fire("Updated!", "Damage product has been updated.", "success");
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update product", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This product will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPublic
          .delete(
            `/damage-products/${id}`
          )
          .then((res) => {
            if (res.data.deletedCount > 0) {
              refetch();
              Swal.fire("Deleted!", "Product removed.", "success");
            }
          });
      }
    });
  };

  return (
    <div className="max-w-6xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        All Damaged Products
      </h2>

      {/* Top Controls */}
      <div className="flex flex-col items-center justify-between gap-4 mb-4 md:flex-row">
        <div className="flex justify-start mb-4">
          <div className="relative w-80">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, barcode, or note..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border pl-10 pr-4 py-2 rounded w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard/addDamageProduct")}
          className="flex items-center gap-2 px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600"
        >
          <FaPlus /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Product Name</th>
              <th className="px-4 py-3">Barcode</th>
              <th className="px-4 py-3">Reference No</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Note</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedProducts.map((product, index) => (
              <tr
                key={product._id}
                className="transition duration-200 hover:bg-gray-50"
              >
                <td className="px-4 py-4">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-4 py-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-10 h-10 border rounded"
                  />
                </td>
                <td className="px-4 py-4 font-semibold text-gray-800">
                  {product.name}
                </td>
                <td className="px-4 py-4 font-semibold text-gray-800">
                  {product.barcode}
                </td>
                <td className="px-4 py-4">{product.referenceNo}</td>
                <td className="px-4 py-4">{product.price}</td>
                <td className="px-4 py-4">{product.quantity}</td>
                <td className="px-4 py-4">{product.note || "-"}</td>
                <td className="flex gap-4 px-6 py-4">
                  <button onClick={() => openEditModal(product)}>
                    <FaEdit className="text-2xl text-cyan-500 hover:text-cyan-600" />
                  </button>
                  {/* <button onClick={() => handleDelete(product._id)}>
                    <FaTrashAlt className="text-2xl text-red-500 hover:text-red-700" />
                  </button> */}
                </td>
              </tr>
            ))}
            {paginatedProducts.length === 0 && (
              <tr>
                <td colSpan="8" className="py-6 text-center text-gray-500">
                  No damaged products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 text-sm rounded ${
                currentPage === i + 1
                  ? "bg-cyan-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50"
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
            <h3 className="mb-4 text-xl font-semibold">Edit Damaged Product</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Product Dropdown */}
              <div>
                <label className="block mb-1 font-semibold">
                  Select Product
                </label>
                <Select
                  options={productOptions}
                  value={
                    formData.productId
                      ? productOptions.find(
                          (p) => p.value === formData.productId
                        )
                      : null
                  }
                  onChange={handleProductSelect}
                  placeholder="Search by product name or barcode..."
                  isSearchable
                  isClearable
                />
              </div>

              {/* Auto-filled Fields */}
              <input
                type="text"
                name="name"
                value={formData.name}
                readOnly
                className="w-full p-2 border rounded bg-gray-100"
                placeholder="Product Name"
                required
              />
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                readOnly
                className="w-full p-2 border rounded bg-gray-100"
                placeholder="Barcode"
              />
              <input
                type="number"
                name="referenceNo"
                value={formData.referenceNo}
                onChange={handleModalChange}
                className="w-full p-2 border rounded"
                placeholder="Reference No"
                required
              />
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleModalChange}
                className="w-full p-2 border rounded"
                placeholder="Price"
                required
              />
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleModalChange}
                className="w-full p-2 border rounded"
                placeholder="Quantity"
                required
              />
              <textarea
                name="note"
                value={formData.note}
                onChange={handleModalChange}
                className="w-full p-2 border rounded"
                placeholder="Note"
              />

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium">
                  Product Image
                </label>
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="newImage"
                    className="px-4 py-2 text-white bg-cyan-500 rounded cursor-pointer hover:bg-cyan-600"
                  >
                    Choose File
                  </label>
                  <span className="text-sm text-gray-600">
                    {newImageFile ? newImageFile.name : "Keep current image"}
                  </span>
                </div>
                <input
                  id="newImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="current"
                    className="w-16 h-16 mt-2 border rounded object-cover"
                  />
                )}
                {uploading && (
                  <p className="text-sm text-gray-500 mt-1">Uploading...</p>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="px-4 py-2 text-white bg-cyan-500 rounded hover:bg-cyan-600 disabled:opacity-60"
              >
                Update Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllDamageProducts;
