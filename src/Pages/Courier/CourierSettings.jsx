import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const CourierSettings = () => {
  const axiosPublic = useAxiosPublic();
  const [couriers, setCouriers] = useState([]);

  const [formData, setFormData] = useState({
    courierName: "",
    status: "inactive",
    baseUrl: "",
    apiKey: "",
    secretKey: "",
    storeId: "", // only for pathao
  });

  useEffect(() => {
    fetchCouriers();
  }, []);

  const fetchCouriers = async () => {
    try {
      const res = await axiosPublic.get("/courier/settings");
      setCouriers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setCouriers([]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosPublic.post("/courier/settings", formData);
      Swal.fire("Saved!", "Courier settings updated", "success");

      setFormData({
        courierName: "",
        status: "inactive",
        baseUrl: "",
        apiKey: "",
        secretKey: "",
        storeId: "",
      });

      fetchCouriers();
    } catch (err) {
      Swal.fire("Error", "Failed to save courier settings", "error");
    }
  };

  const cardClasses = "border rounded-lg p-4 shadow-md mb-4 bg-white";

  // Courier Specific Field Logic
  const renderCourierFields = () => {
    switch (formData.courierName) {
      case "pathao":
        return (
          <>
            <input
              type="text"
              name="storeId"
              value={formData.storeId}
              onChange={handleChange}
              placeholder="Store ID"
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              placeholder="API Key"
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="secretKey"
              value={formData.secretKey}
              onChange={handleChange}
              placeholder="Secret Key"
              className="border p-2 rounded"
            />
          </>
        );

      case "steadfast":
        return (
          <>
            <input
              type="text"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              placeholder="API Key"
              className="border p-2 rounded"
              required
            />
          </>
        );

      case "redx":
        return (
          <>
            <input
              type="text"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              placeholder="API Key"
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              name="secretKey"
              value={formData.secretKey}
              onChange={handleChange}
              placeholder="Secret Key"
              className="border p-2 rounded"
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-auto flex flex-col items-center justify-center p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6">Courier Settings</h2>

      {/* Courier Form */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 w-full max-w-lg bg-gray-20 p-6 rounded-lg shadow-lg mb-8"
      >
        <select
          name="courierName"
          value={formData.courierName}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Courier</option>
          <option value="pathao">Pathao</option>
          <option value="steadfast">Steadfast</option>
          <option value="redx">RedX</option>
        </select>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="border p-2 rounded"
        >
          <option value="inactive">Inactive</option>
          <option value="active">Active</option>
        </select>

        {/* BASE URL (common for all) */}
        <input
          type="text"
          name="baseUrl"
          value={formData.baseUrl}
          onChange={handleChange}
          placeholder="Base URL"
          className="border p-2 rounded"
          required
        />

        {/* Courier-specific fields */}
        {renderCourierFields()}

        <button className="bg-cyan-500 text-white px-4 py-2 rounded-xl hover:bg-cyan-600 transition">
          Save
        </button>
      </form>

      {/* Active Courier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
        {couriers.length > 0 ? (
          couriers.map((c) => (
            <div key={c._id} className={cardClasses}>
              <h3 className="text-lg font-bold mb-2">{c.courierName}</h3>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    c.status === "active" ? "text-green-600" : "text-red-600"
                  }
                >
                  {c.status}
                </span>
              </p>
              <p>
                <strong>Base URL:</strong> {c.baseUrl || "-"}
              </p>
              <p>
                <strong>API Key:</strong> {c.apiKey || "-"}
              </p>
              <p>
                <strong>Secret Key:</strong> {c.secretKey || "-"}
              </p>
              {c.storeId && (
                <p>
                  <strong>Store ID:</strong> {c.storeId}
                </p>
              )}
              {/* Toggle Button */}
              <button
                className={`mt-2 px-3 py-1 rounded-xl text-white ${
                  c.status === "active" ? "bg-red-500" : "bg-green-500"
                }`}
                onClick={async () => {
                  try {
                    const newStatus =
                      c.status === "active" ? "inactive" : "active";
                    await axiosPublic.patch(`/courier/${c._id}/status`, {
                      status: newStatus,
                    });
                    Swal.fire(
                      "Updated!",
                      `Courier status set to ${newStatus}`,
                      "success"
                    );
                    fetchCouriers(); // Refresh the list
                  } catch (err) {
                    Swal.fire("Error", "Failed to update status", "error");
                  }
                }}
              >
                {c.status === "active" ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full"></p>
        )}
      </div>
    </div>
  );
};

export default CourierSettings;
