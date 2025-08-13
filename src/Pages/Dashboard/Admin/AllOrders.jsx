import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaTrashAlt } from "react-icons/fa";
import axios from "axios";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/orders");
      const ordersData = res.data;

      // For each order, fetch product details for cart items
      const ordersWithProducts = await Promise.all(
        ordersData.map(async (order) => {
          const cartItemsWithDetails = await Promise.all(
            order.cartItems.map(async (item) => {
              try {
                const productRes = await axios.get(
                  `http://localhost:5000/products/${item.productId}`
                );
                const product = productRes.data;
                return {
                  ...item, // Keep size, color, quantity from DB
                  productName: product.name || item.productName,
                  productImage:
                    product.images?.[0] ||
                    item.productImage ||
                    "https://via.placeholder.com/50",
                  price: product.newPrice || item.price || 0,
                };
              } catch (err) {
                console.error("Error fetching product:", err);
                return item; // fallback to original item
              }
            })
          );

          return { ...order, cartItems: cartItemsWithDetails };
        })
      );

      setOrders(ordersWithProducts);
    } catch (error) {
      console.error(error);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This order will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/orders/${id}`).then((res) => {
          if (res.data.deletedCount > 0) {
            fetchOrders(); // refetch after delete
            Swal.fire("Deleted!", "Order removed.", "success");
          }
        });
      }
    });
  };

  return (
    <div className="max-w-7xl p-6 mx-auto">
      <h2 className="pb-4 mb-8 text-4xl font-bold text-center border-b-2 border-gray-200">
        All Orders
      </h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full text-sm text-left table-auto">
          <thead className="tracking-wider text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Address</th>
              <th className="px-6 py-3">Shipping</th>
              <th className="px-6 py-3">Payment</th>
              <th className="px-6 py-3">Cart Items</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order, index) => (
              <tr
                key={order._id}
                className="transition duration-200 hover:bg-gray-50"
              >
                <td className="px-6 py-4">{index + 1}</td>

                {/* Customer Info */}
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-800">
                    {order.fullName}
                  </div>
                  <div className="text-gray-500">{order.email}</div>
                  <div className="text-gray-500">{order.phone}</div>
                </td>

                {/* Address */}
                <td className="px-6 py-4">{order.address}</td>

                {/* Shipping */}
                <td className="px-6 py-4">{order.shipping}</td>

                {/* Payment */}
                <td className="px-6 py-4">{order.payment}</td>

                {/* Cart Items */}
                <td className="px-6 py-4">
                  {order.cartItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-2 mb-2"
                    >
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <div>
                        <div className="font-semibold">{item.productName}</div>
                        <div className="text-sm text-gray-500">
                          Size: {item.size || "-"}, Color:{" "}
                          {item.color || "-"}, Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </td>

                {/* Total */}
                <td className="px-6 py-4 font-bold">৳{order.total}</td>

                {/* Actions */}
                <td className="flex gap-4 px-6 py-4">
                  <button onClick={() => handleDelete(order._id)}>
                    <FaTrashAlt className="text-2xl text-red-500 hover:text-red-700" />
                  </button>
                </td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td colSpan="8" className="py-6 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllOrders;
