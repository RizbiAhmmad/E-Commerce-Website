import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const OrderSuccess = () => {
  const { tran_id } = useParams();
  const axiosPublic = useAxiosPublic();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    axiosPublic.get(`/orders/transaction/${tran_id}`).then(res => {
      setOrder(res.data);
    });
  }, [tran_id]);

  if (!order) return <p>Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold text-green-600 text-center">
        Order Confirmed 🎉
      </h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-3">Customer Information</h2>
        <p><strong>Name:</strong> {order.fullName}</p>
        <p><strong>Phone:</strong> {order.phone}</p>
        <p><strong>Address:</strong> {order.address}</p>
        <p><strong>District:</strong> {order.district}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-3">Order Summary</h2>
        {order.cartItems.map((item, i) => (
          <div key={i} className="border-b py-3">
            <p>{item.productName}</p>
            <p>Size: {item.size}</p>
            <p>Color: {item.color}</p>
            <p>Qty: {item.quantity}</p>
            <p>Price: ৳{item.price}</p>
          </div>
        ))}

        <p className="font-bold mt-3">Subtotal: ৳{order.subtotal}</p>
        <p>Shipping: ৳{order.shippingCost}</p>
        <p className="text-xl font-bold text-green-600">
          Total: ৳{order.total}
        </p>

        <p className="mt-3">
          <strong>Status:</strong> {order.status}
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;
