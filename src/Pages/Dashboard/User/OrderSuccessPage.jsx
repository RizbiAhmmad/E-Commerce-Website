import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaHome,
  FaBoxOpen,
  FaUser,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCreditCard,
  FaTruck,
  FaShippingFast,
} from "react-icons/fa";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const OrderSuccessPage = () => {
  const { state } = useLocation();
  const axiosPublic = useAxiosPublic();
  const [order, setOrder] = useState(state?.orderData || null);

  // Fetch latest order data every 5 seconds
  useEffect(() => {
    if (!order?._id) return;

    const interval = setInterval(async () => {
      try {
        const res = await axiosPublic.get(`/orders/${order._id}`);
        if (res?.data) {
          // Update order status and courier info dynamically
          setOrder((prev) => ({
            ...prev,
            status: res.data.status,
            courier: res.data.courier,
            courierTrackingId: res.data.courierTrackingId,
            courierStatus: res.data.courierStatus,
          }));
        }
      } catch (err) {
        console.error(err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [order?._id, axiosPublic]);

  if (!order) {
    return (
      <div className="h-screen flex items-center justify-center text-xl font-semibold text-gray-500">
        No Order Data Found!
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statusSteps = [
    { key: "pending", label: "Pending", icon: FaBoxOpen },
    { key: "processing", label: "Processing", icon: FaShippingFast },
    { key: "shipped", label: "Shipped", icon: FaTruck },
    { key: "delivered", label: "Delivered", icon: FaCheckCircle },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50 py-24 px-4">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-10"
      >
        {/* HEADER */}
        <div className="text-center mb-12">
          {/* SUCCESS ICON */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="mx-auto w-24 h-24 rounded-full bg-green-100 flex items-center justify-center shadow-lg"
          >
            <FaCheckCircle className="text-green-500 text-6xl" />
          </motion.div>

          {/* TITLE */}
          <h1 className="mt-6 text-4xl font-extrabold bg-gradient-to-r from-green-500 to-cyan-500 bg-clip-text text-transparent">
            Order Placed Successfully!
          </h1>

          <p className="text-gray-600 mt-3 text-lg">
            Your order has been confirmed. Thank you for shopping with us 🎉
          </p>

          {/* ORDER ID */}
          <div className="mt-5 flex justify-center">
            <span className="px-5 py-2 rounded-full bg-cyan-100 text-cyan-800 font-semibold tracking-wide">
              Order ID: {order._id}
            </span>
          </div>

          {/* ORDER STATUS BADGE */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-5 flex justify-center"
          >
            <div
              className={`flex items-center gap-2 px-5 py-2 rounded-full shadow-md text-sm font-semibold capitalize
        ${getStatusColor(order.status)}
      `}
            >
              {/* status dot */}
              <span className="w-2.5 h-2.5 rounded-full bg-current opacity-70"></span>

              <span>{order.status}</span>
            </div>
          </motion.div>
        </div>

        {/* CUSTOMER & ORDER INFO */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <Info icon={<FaUser />} label="Customer" value={order.fullName} />
          <Info icon={<FaPhoneAlt />} label="Phone" value={order.phone} />
          <Info
            icon={<FaMapMarkerAlt />}
            label="Address"
            value={order.address}
            className="sm:col-span-2"
          />
          <Info
            icon={<FaTruck />}
            label="Shipping Method"
            value={order.shipping}
          />
          <Info icon={<FaCreditCard />} label="Payment" value={order.payment} />
          <Info
            icon={<FaShippingFast />}
            label="Shipping Charge"
            value={`৳${order.shippingCost || 0}`}
          />

          {/* Courier Info */}
          {order.courier && (
            <div className="sm:col-span-2 flex flex-col gap-1">
              <span className="font-semibold">Courier:</span>
              <span className="capitalize">{order.courier}</span>
              {order.courierTrackingId && (
                <span className="text-blue-600 hover:underline break-all cursor-pointer">
                  Tracking ID: {order.courierTrackingId}
                </span>
              )}
              {order.courierStatus && (
                <span>
                  Courier Status:{" "}
                  <span
                    className={
                      order.courierStatus === "delivered"
                        ? "text-green-600 font-semibold"
                        : "text-purple-600 font-semibold"
                    }
                  >
                    {order.courierStatus}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* PRODUCTS */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-5 flex items-center gap-3">
            <FaBoxOpen className="text-cyan-600" />
            Ordered Items
          </h2>
          <div className="space-y-4">
            {order.cartItems.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl shadow-sm border hover:shadow-lg transition"
              >
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-lg">{item.productName}</p>
                  <p className="text-gray-500 text-sm">
                    Color: {item.color} | Size: {item.size} | Qty:{" "}
                    {item.quantity}
                  </p>
                </div>
                <p className="font-bold text-green-600 text-lg">
                  ৳{item.price * item.quantity}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* TOTAL */}
        <div className="flex justify-between items-center border-t pt-6">
          <span className="text-xl font-semibold">Total Amount</span>
          <span className="text-3xl font-extrabold text-green-600">
            ৳{order.total}
          </span>
        </div>

        {/* ORDER STATUS TIMELINE */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-6 text-center text-gray-800">
            Order Progress
          </h3>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isActive = index === currentStepIndex;

              return (
                <div key={step.key} className="flex-1 flex items-center">
                  {/* Step */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isActive
                    ? "bg-cyan-500 text-white animate-pulse"
                    : "bg-gray-200 text-gray-500"
                }
              `}
                    >
                      <Icon className="text-xl" />
                    </div>
                    <span
                      className={`mt-2 text-sm font-semibold ${
                        isCompleted || isActive
                          ? "text-gray-800"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Line */}
                  {index !== statusSteps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded ${
                        index < currentStepIndex
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="flex justify-center mt-10">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-cyan-600 text-white font-semibold text-lg shadow-lg hover:bg-cyan-700 transition"
          >
            <FaHome /> Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

const Info = ({ label, value, icon, className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    {icon && <span className="text-cyan-600">{icon}</span>}
    {label && <span className="font-semibold">{label}:</span>}
    <span className="text-gray-700">{value}</span>
  </div>
);

export default OrderSuccessPage;
