import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const mask = (s) => (s ? `${String(s).slice(0, 4)}••••` : "-");

const CourierSettings = () => {
  const axiosPublic = useAxiosPublic();
  const [couriers, setCouriers] = useState([]);

  const defaultForm = {
    courierName: "",
    status: "inactive",
    baseUrl: "",
    // Pathao OAuth fields
    clientId: "",
    clientSecret: "",
    username: "",
    password: "",
    storeId: "",
    // Generic API fields (for RedX/Steadfast)
    apiKey: "",
    secretKey: "",
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchCouriers();
  }, []);

  const fetchCouriers = async () => {
    try {
      const res = await axiosPublic.get("/courier/settings");
      setCouriers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch couriers error:", err);
      setCouriers([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation per courier
    if (!formData.courierName) return Swal.fire("Select courier", "", "warning");
    if (!formData.baseUrl) return Swal.fire("Base URL required", "", "warning");

    if (formData.courierName === "pathao") {
      if (!formData.clientId || !formData.clientSecret || !formData.username || !formData.password || !formData.storeId) {
        return Swal.fire("Fill all Pathao fields", "", "warning");
      }
    } else if (formData.courierName === "redx" || formData.courierName === "steadfast") {
      if (!formData.apiKey) return Swal.fire("API Key required", "", "warning");
    }

    try {
      // Clean object: remove empty keys to avoid storing unnecessary data
      const payload = { ...formData };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "" || payload[k] == null) delete payload[k];
      });

      await axiosPublic.post("/courier/settings", payload);
      Swal.fire("Saved!", "Courier settings updated", "success");

      setFormData(defaultForm);
      fetchCouriers();
    } catch (err) {
      console.error("Save courier error:", err);
      Swal.fire("Error", "Failed to save courier settings", "error");
    }
  };

  const cardClasses = "border rounded-lg p-4 shadow-md mb-4 bg-white";

  const renderCourierFields = () => {
    switch (formData.courierName) {
      case "pathao":
        return (
          <>
            <input name="baseUrl" type="hidden" value={formData.baseUrl} /> {/* keep common */}
            <input type="text" name="storeId" value={formData.storeId} onChange={handleChange} placeholder="Store ID" className="border p-2 rounded"  />
            <input type="text" name="clientId" value={formData.clientId} onChange={handleChange} placeholder="Client ID" className="border p-2 rounded" required />
            <input type="text" name="clientSecret" value={formData.clientSecret} onChange={handleChange} placeholder="Client Secret" className="border p-2 rounded" required />
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" className="border p-2 rounded" required />
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="border p-2 rounded" required />
          </>
        );

      case "steadfast":
        return (
          <>
            <input type="text" name="apiKey" value={formData.apiKey} onChange={handleChange} placeholder="API Key" className="border p-2 rounded" required />
            <input type="text" name="secretKey" value={formData.secretKey} onChange={handleChange} placeholder="Secret Key (optional)" className="border p-2 rounded" />
          </>
        );

      case "redx":
        return (
          <>
            <input type="text" name="apiKey" value={formData.apiKey} onChange={handleChange} placeholder="API Key" className="border p-2 rounded" required />
            <input type="text" name="secretKey" value={formData.secretKey} onChange={handleChange} placeholder="Secret Key (optional)" className="border p-2 rounded" />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-auto flex flex-col items-center justify-center p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6">Courier Settings</h2>

      <form onSubmit={handleSubmit} className="grid gap-4 w-full max-w-lg bg-gray-20 p-6 rounded-lg shadow-lg mb-8">
        <select name="courierName" value={formData.courierName} onChange={handleChange} className="border p-2 rounded" required>
          <option value="">Select Courier</option>
          <option value="pathao">Pathao</option>
          <option value="steadfast">Steadfast</option>
          <option value="redx">RedX</option>
        </select>

        <select name="status" value={formData.status} onChange={handleChange} className="border p-2 rounded">
          <option value="inactive">Inactive</option>
          <option value="active">Active</option>
        </select>

        <input type="text" name="baseUrl" value={formData.baseUrl} onChange={handleChange} placeholder="Base URL" className="border p-2 rounded" required />

        {renderCourierFields()}

        <button className="bg-cyan-500 text-white px-4 py-2 rounded-xl hover:bg-cyan-600 transition">Save</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
        {couriers.length > 0 ? (
          couriers.map((c) => (
            <div key={c._id} className={cardClasses}>
              <h3 className="text-lg font-bold mb-2">{c.courierName}</h3>
              <p><strong>Status:</strong> <span className={c.status === "active" ? "text-green-600" : "text-red-600"}>{c.status}</span></p>
              <p><strong>Base URL:</strong> {c.baseUrl || "-"}</p>

              {/* Show relevant fields per courier, mask secrets */}
              {c.courierName === "pathao" && (
                <>
                  <p><strong>Store ID:</strong> {c.storeId || "-"}</p>
                  <p><strong>Client ID:</strong> {mask(c.clientId)}</p>
                  <p><strong>Client Secret:</strong> {mask(c.clientSecret)}</p>
                  <p><strong>Username:</strong> {c.username ? mask(c.username) : "-"}</p>
                </>
              )}

              {(c.courierName === "redx" || c.courierName === "steadfast") && (
                <>
                  <p><strong>API Key:</strong> {mask(c.apiKey)}</p>
                  <p><strong>Secret Key:</strong> {mask(c.secretKey)}</p>
                </>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  className={`px-3 py-1 rounded-xl text-white ${c.status === "active" ? "bg-red-500" : "bg-green-500"}`}
                  onClick={async () => {
                    try {
                      const newStatus = c.status === "active" ? "inactive" : "active";
                      await axiosPublic.patch(`/courier/${c._id}/status`, { status: newStatus });
                      Swal.fire("Updated!", `Courier status set to ${newStatus}`, "success");
                      fetchCouriers();
                    } catch (err) {
                      console.error("Toggle status error:", err);
                      Swal.fire("Error", "Failed to update status", "error");
                    }
                  }}
                >
                  {c.status === "active" ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full">No active couriers</p>
        )}
      </div>
    </div>
  );
};

export default CourierSettings;