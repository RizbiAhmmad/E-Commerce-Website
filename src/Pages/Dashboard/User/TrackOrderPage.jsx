import React, { useEffect, useState } from "react";
import useAxiosPublic from "@/Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import { FaSearch, FaBoxOpen, FaTruck } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const TrackOrderPage = () => {
  const axiosPublic = useAxiosPublic();
  const location = useLocation();

  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (location?.state?.orderData) {
      setOrder(location.state.orderData);
    }
  }, [location]);

  const handleSearch = async () => {
    if (!orderId.trim()) {
      return Swal.fire("Error", "Please enter Order ID", "warning");
    }

    try {
      const res = await axiosPublic.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch {
      Swal.fire("Not Found", "Invalid Order ID", "error");
      setOrder(null);
    }
  };

  const steps = ["pending", "processing", "shipped", "delivered"];
  const currentStep = steps.indexOf(order?.status);

  return (
    <div className="min-h-screen py-24 px-4 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-900 dark:to-black flex justify-center">

      <div className="w-full max-w-3xl">

        {/* SEARCH BOX */}
        {!order && (
          <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl text-center border border-gray-200 dark:border-gray-700">

            <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
              Track Your Order
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Enter your order ID to see delivery updates
            </p>

            <div className="flex justify-center gap-3">
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter Order ID"
                className="w-80 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-cyan-500 outline-none"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />

              <button
                onClick={handleSearch}
                className="flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-xl hover:bg-cyan-700 transition"
              >
                <FaSearch />
                Track
              </button>
            </div>

          </div>
        )}

        {order && (
          <>
            {/* ORDER SUMMARY */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg mb-6 flex justify-between flex-wrap gap-4 border border-gray-200 dark:border-gray-700">

              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Order #{order._id.slice(-6)}
                </h2>

                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {order.fullName} • {order.phone}
                </p>
              </div>

              <div className="text-right">
                <span className="px-4 py-1 bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-semibold capitalize">
                  {order.status}
                </span>

                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-2">
                  ৳{order.total}
                </p>
              </div>

            </div>

            {/* DELIVERY TIMELINE */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg mb-6 border border-gray-200 dark:border-gray-700">

              <div className="flex items-center gap-2 mb-8 font-semibold text-gray-700 dark:text-gray-200">
                <FaTruck className="text-cyan-600" />
                Delivery Progress
              </div>

              <div className="relative">

                <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded"></div>

                <div
                  className="absolute top-4 left-0 h-1 bg-cyan-600 rounded transition-all duration-500"
                  style={{
                    width: `${(currentStep / (steps.length - 1)) * 100}%`,
                  }}
                ></div>

                <div className="flex justify-between relative">

                  {steps.map((step, i) => (
                    <div key={i} className="flex flex-col items-center">

                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                        ${
                          i <= currentStep
                            ? "bg-cyan-600 text-white"
                            : "bg-gray-300 dark:bg-gray-700 text-gray-600"
                        }`}
                      >
                        ✓
                      </div>

                      <p className="text-xs mt-2 capitalize text-gray-600 dark:text-gray-400">
                        {step}
                      </p>

                    </div>
                  ))}

                </div>
              </div>

            </div>

            {/* COURIER INFO */}
            {order.courier && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg mb-6 border border-gray-200 dark:border-gray-700">

                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  Courier Information
                </h3>

                <p className="text-gray-600 dark:text-gray-400">
                  Courier: {order.courier}
                </p>

                {order.courierTrackingId && (
                  <p className="text-gray-600 dark:text-gray-400">
                    Tracking ID: {order.courierTrackingId}
                  </p>
                )}

              </div>
            )}

            {/* ORDER ITEMS */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700">

              <h3 className="font-semibold mb-6 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <FaBoxOpen />
                Ordered Items
              </h3>

              <div className="grid md:grid-cols-2 gap-4">

                {order.cartItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border border-gray-200 dark:border-gray-700 p-4 rounded-xl hover:shadow-md transition"
                  >
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {item.productName}
                      </p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <p className="font-bold text-cyan-600 text-lg">
                      ৳{item.price}
                    </p>
                  </div>
                ))}

              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;