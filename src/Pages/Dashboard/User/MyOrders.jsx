import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "@/provider/AuthProvider";
import { FaCircle } from "react-icons/fa";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const MyOrders = () => {
  const { user } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user?.email) {
      axiosPublic
        .get(`/orders?email=${user.email}`)
        .then((res) => setOrders(res.data))
        .catch((err) => console.error(err));
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
      case "returned":
        return "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black dark:text-white px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-center text-black dark:text-white">
        My Orders
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center">
          No orders found.
        </p>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-gray-900 shadow-lg hover:shadow-2xl rounded-xl overflow-hidden transition transform hover:-translate-y-1 duration-300"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-500 to-blue-400 text-white px-4 md:px-6 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <div>
                  <h3 className="font-semibold text-lg break-all">
                    Order: {order._id}
                  </h3>
                  <p className="text-sm opacity-90">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <span
                  className={`flex items-center gap-2 px-3 py-1 rounded-full font-medium text-sm w-fit ${getStatusColor(
                    order.status || "pending"
                  )}`}
                >
                  <FaCircle className="text-xs" />
                  {(order.status || "pending").toUpperCase()}
                </span>
              </div>

              {/* Products */}
              <div className="p-4 md:p-6 space-y-4">
                {order.cartItems?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0"
                  >
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full sm:w-20 aspect-square object-cover rounded-lg shadow-sm"
                    />

                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 break-words">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Color: <span className="capitalize">{item.color}</span>{" "}
                        | Size: {item.size}
                      </p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Qty: {item.quantity} × ৳{item.price}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ৳{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Courier Info */}
              <div className="px-4 md:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                {order.courier ? (
                  <div className="space-y-1">
                    <p className="text-sm dark:text-gray-300">
                      Courier:{" "}
                      <span className="capitalize font-medium">
                        {order.courier}
                      </span>
                    </p>
                    {order.courierTrackingId && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer break-all">
                        Tracking ID: {order.courierTrackingId}
                      </p>
                    )}
                    {order.courierStatus && (
                      <p className="text-sm dark:text-gray-300">
                        Status:{" "}
                        <span
                          className={
                            order.courierStatus === "delivered"
                              ? "text-green-600 dark:text-green-400 font-medium"
                              : "text-purple-600 dark:text-purple-400 font-medium"
                          }
                        >
                          {order.courierStatus}
                        </span>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Courier info: N/A
                  </p>
                )}
              </div>

              {/* Footer / Total */}
              <div className="bg-gray-50 dark:bg-gray-800 px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Payment:{" "}
                  <span className="font-semibold">
                    {(order.payment || "Not Specified").toUpperCase()}
                  </span>
                </p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">
                  Total (With delivery charges) : ৳{order.total}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
