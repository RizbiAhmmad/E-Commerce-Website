import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle, FaHome, FaShoppingBag } from "react-icons/fa";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const OrderSuccessPage = () => {
  const { state } = useLocation();
  const axiosPublic = useAxiosPublic();

  const [order, setOrder] = useState(state?.orderData || null);

  useEffect(() => {
  if (!order?._id) return;

  const interval = setInterval(() => {
    axiosPublic.get(`/orders/${order._id}`)
      .then(res => {
        if (res?.data?.status) {
          setOrder(prev => ({ ...prev, status: res.data.status }));
        }
      })
      .catch(console.error);
  }, 5000); 

  return () => clearInterval(interval);
}, [order?._id]);


  if (!order) {
    return (
      <div className="h-screen flex items-center justify-center text-xl">
        No Order Data Found!
      </div>
    );
  }

  // Status Color Function
  const getStatusColor = status => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black py-24 px-4">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-neutral-700"
      >
        {/* SUCCESS ICON */}
        <div className="flex justify-center mb-4">
          <FaCheckCircle className="text-green-500 text-6xl" />
        </div>

        <h1 className="text-3xl font-bold text-center bg-gradient-to-r 
                       from-green-400 to-cyan-500 bg-clip-text text-transparent mb-3">
          Order Placed Successfully!
        </h1>

        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
          Thank you for your purchase! Your order details are below.
        </p>

        {/* ORDER BOX */}
        <div className="bg-gray-50 dark:bg-neutral-800 p-6 rounded-xl border">
          <h2 className="text-xl font-bold mb-4 text-gray-700 dark:text-white">
            Order Details
          </h2>

          {/* ORDER INFO */}
          <div className="space-y-3 text-gray-700 dark:text-gray-300">

            <p>
              <strong>Order ID:</strong>{" "}
              <span className="ml-2 px-3 py-1 bg-cyan-100 text-cyan-800 rounded-lg border border-cyan-300">
                {order._id}
              </span>
            </p>

            <p className="flex items-center gap-2">
              <strong>Status:</strong>
              <span
                className={`px-3 py-1 rounded-lg border text-sm font-semibold capitalize ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </p>

            <p>
              <strong>Name:</strong> {order.fullName}
            </p>
            <p>
              <strong>Phone:</strong> {order.phone}
            </p>
            <p>
              <strong>Address:</strong> {order.address}
            </p>
            <p>
              <strong>Shipping:</strong> {order.shipping}
            </p>
            <p>
              <strong>Payment:</strong> {order.payment}
            </p>
            <p>
              <strong>Total Amount:</strong>{" "}
              <span className="font-bold text-green-600 dark:text-green-400">
                ৳{order.total}
              </span>
            </p>
          </div>

          <hr className="my-5 border-gray-300 dark:border-gray-700" />

          {/* PRODUCT LIST */}
          <h3 className="text-lg font-semibold mb-3">Products</h3>

          <div className="space-y-4">
            {order.cartItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-white dark:bg-neutral-900 
                           p-3 rounded-lg shadow-sm border"
              >
                <img
                  src={item.productImage}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Qty: {item.quantity} | Price: ৳{item.price}
                  </p>
                </div>
                <p className="font-bold">৳{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-center gap-4 mt-8">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-600 
                       hover:bg-cyan-700 text-white shadow-lg"
          >
            <FaHome /> Back to Home
          </Link>

          {/* <Link
            to="/products"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-600 
                       hover:bg-green-700 text-white shadow-lg"
          >
            <FaShoppingBag /> Continue Shopping
          </Link> */}
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccessPage;
