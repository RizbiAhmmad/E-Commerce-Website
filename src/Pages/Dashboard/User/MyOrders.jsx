import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "@/provider/AuthProvider";
import { FaCircle } from "react-icons/fa";

const MyOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user?.email) {
      axios
        .get(`http://localhost:5000/orders?email=${user.email}`)
        .then((res) => setOrders(res.data))
        .catch((err) => console.error(err));
    }
  }, [user]);

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

  return (
    <div className="max-w-5xl dark:bg-black dark:text-white mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold mb-8 text-black dark:text-white">My Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white shadow-lg hover:shadow-2xl rounded-xl overflow-hidden transition transform hover:-translate-y-1 duration-300"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-500 to-blue-400 text-white px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">Order #{order._id}</h3>
                  <p className="text-sm opacity-90">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <span
                  className={`flex items-center gap-2 px-3 py-1 rounded-full font-medium text-sm ${getStatusColor(
                    order.status || "pending"
                  )}`}
                >
                  <FaCircle className="text-xs" />
                  {(order.status || "pending").toUpperCase()}
                </span>
              </div>

              {/* Products */}
              <div className="p-6 space-y-4">
                {order.cartItems?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 border-b pb-3 last:border-b-0"
                  >
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-20 h-20 object-cover rounded-lg shadow-sm"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{item.productName}</h4>
                      <p className="text-sm text-gray-500">
                        Color: <span className="capitalize">{item.color}</span> | Size: {item.size}
                      </p>
                      <p className="text-sm text-gray-700 font-medium">
                        Qty: {item.quantity} × ৳{item.price}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ৳{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Courier Info */}
              <div className="px-6 py-4 border-t">
                {order.courier ? (
                  <div className="space-y-1">
                    <p className="text-sm">
                      Courier: <span className="capitalize font-medium">{order.courier}</span>
                    </p>
                    {order.courierTrackingId && (
                      <p className="text-sm text-blue-600 hover:underline cursor-pointer">
                        Tracking ID: {order.courierTrackingId}
                      </p>
                    )}
                    {order.courierStatus && (
                      <p className="text-sm">
                        Status:{" "}
                        <span
                          className={
                            order.courierStatus === "delivered"
                              ? "text-green-600 font-medium"
                              : "text-purple-600 font-medium"
                          }
                        >
                          {order.courierStatus}
                        </span>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Courier info: </p>
                )}
              </div>

              {/* Footer / Total */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
                <p className="text-sm text-gray-600">
                  Payment: <span className="font-semibold">{(order.payment || "Not Specified").toUpperCase()}</span>
                </p>
                <p className="font-bold text-gray-900 text-lg">
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
