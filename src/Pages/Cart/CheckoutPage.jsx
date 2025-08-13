import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { AuthContext } from "@/provider/AuthProvider";

const CheckoutPage = () => {
  const { user } = useContext(AuthContext);
  const { state } = useLocation();
  const { cartItems = [], productsMap = {} } = state || {};

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [shipping, setShipping] = useState("outside");
  const [payment, setPayment] = useState("cod");

  // Autofill name and email if logged in
  useEffect(() => {
    if (user) {
      setFullName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const shippingCost = shipping === "inside" ? 60 : 120;
  const subtotal = cartItems.reduce((total, item) => {
    const product = productsMap[item.productId];
    return total + (product?.newPrice || 0) * item.quantity;
  }, 0);
  const total = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    // Simple validation
    if (!fullName || !phone || !email || !address) {
      return Swal.fire({
        icon: "error",
        title: "Missing Fields",
        text: "Please fill all required fields!",
      });
    }

    const orderData = {
      fullName,
      phone,
      email,
      address,
      shipping,
      payment,
      cartItems,
      total,
      createdAt: new Date(),
    };

    try {
      await axios.post("http://localhost:5000/orders", orderData);

      Swal.fire({
        icon: "success",
        title: "Order Placed!",
        text: "Your order has been placed successfully.",
      });

      // Optionally, you can redirect the user or clear the cart
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-24 grid md:grid-cols-3 gap-8">
      {/* Left */}
      <div className="md:col-span-2 space-y-6">
        {/* Customer Information */}
        <div className="border rounded p-6">
          <h2 className="font-semibold text-lg mb-4">Customer Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name *"
              className="border p-2 rounded"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Phone Number *"
              className="border p-2 rounded"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email Address"
              className="border p-2 rounded md:col-span-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <textarea
              placeholder="Delivery Address *"
              className="border p-2 rounded md:col-span-2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Shipping */}
        <div className="border rounded p-6">
          <h2 className="font-semibold text-lg mb-4">Shipping Information</h2>
          <label className="flex justify-between items-center border p-3 rounded mb-3 cursor-pointer">
            <div>
              <input
                type="radio"
                name="shipping"
                value="inside"
                checked={shipping === "inside"}
                onChange={() => setShipping("inside")}
              />{" "}
              Inside Dhaka
              <div className="text-sm text-gray-500">
                Delivery within 1-2 business days
              </div>
            </div>
            <span>৳60</span>
          </label>
          <label className="flex justify-between items-center border p-3 rounded cursor-pointer">
            <div>
              <input
                type="radio"
                name="shipping"
                value="outside"
                checked={shipping === "outside"}
                onChange={() => setShipping("outside")}
              />{" "}
              Outside Dhaka
              <div className="text-sm text-gray-500">
                Delivery within 3-5 business days
              </div>
            </div>
            <span>৳120</span>
          </label>
        </div>

        {/* Payment */}
        <div className="border rounded p-6">
          <h2 className="font-semibold text-lg mb-4">Payment Method</h2>
          <label className="flex items-center gap-3 border p-3 rounded mb-3 cursor-pointer">
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={payment === "cod"}
              onChange={() => setPayment("cod")}
            />{" "}
            Cash on Delivery
          </label>
          <label className="flex items-center gap-3 border p-3 rounded cursor-pointer opacity-50">
            <input type="radio" name="payment" value="online" disabled /> Online
            Payment (Coming Soon)
          </label>
        </div>
      </div>

      {/* Right: Order Summary */}
      <div className="border rounded p-6 h-fit">
        <h2 className="font-semibold text-xl mb-6">Order Summary</h2>
        {cartItems.map((item) => {
          const product = productsMap[item.productId];
          return (
            <div key={item._id} className="flex justify-between mb-3">
              <span>
                {product?.name} × {item.quantity}
              </span>
              <span>৳{(product?.newPrice || 0) * item.quantity}</span>
            </div>
          );
        })}
        <hr className="my-4" />
        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>৳{subtotal}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Shipping</span>
          <span>৳{shippingCost}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>৳{total}</span>
        </div>
        <button
          onClick={handlePlaceOrder}
          className="mt-6 w-full bg-cyan-500 text-white py-3 rounded hover:bg-cyan-600 transition"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
