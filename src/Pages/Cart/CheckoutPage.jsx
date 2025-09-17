import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { AuthContext } from "@/provider/AuthProvider";
import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";

const CheckoutPage = () => {
  const { user } = useContext(AuthContext);
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cartItems = [], productsMap = {} } = state || {};

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [shipping, setShipping] = useState("outside");
  const [payment, setPayment] = useState("cash on delivery");

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

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
  const total = subtotal + shippingCost - discount;

  // Apply coupon
  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      return Swal.fire("Error!", "Please enter a coupon code", "error");
    }
    try {
      // IMPORTANT: discount against subtotal (products only), not shipping
      const res = await axios.post("http://localhost:5000/apply-coupon", {
        code,
        totalAmount: subtotal,
      });

      const { discount: serverDiscount, code: applied } = res.data || {};
      setDiscount(serverDiscount || 0);
      setAppliedCoupon({ code: applied });

      Swal.fire("Success!", `Coupon applied: -৳${serverDiscount}`, "success");
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to apply coupon";
      setDiscount(0);
      setAppliedCoupon(null);
      Swal.fire("Invalid!", msg, "error");
    }
  };

  const handlePlaceOrder = async () => {
    if (!fullName || !phone || !email || !address) {
      return Swal.fire("Error", "Please fill all required fields", "error");
    }

    //  Stock Check
    const outOfStockItems = cartItems.filter((item) => {
      const product = productsMap[item.productId];
      return (
        Number(product?.stock) === 0 || item.quantity > Number(product?.stock)
      );
    });

    if (outOfStockItems.length > 0) {
      return Swal.fire(
        "Out of Stock",
        `These items are out of stock: ${outOfStockItems
          .map((i) => productsMap[i.productId]?.name)
          .join(", ")}`,
        "error"
      );
    }

    const orderCartItems = cartItems.map((item) => {
      const product = productsMap[item.productId];
      return {
        productId: item.productId,
        productName: product?.name || "Product",
        productImage: product?.images?.[0] || "https://via.placeholder.com/80",
        price: product?.newPrice || 0,
        color: item.selectedColor || product?.colors?.[0] || "-",
        size: item.selectedSize || product?.sizes?.[0] || "-",
        quantity: item.quantity,
      };
    });

    const orderData = {
      fullName,
      phone,
      email,
      address,
      shipping,
      payment,
      cartItems: orderCartItems,
      subtotal,
      shippingCost,
      discount,
      total,
      coupon: appliedCoupon?.code || null,
      status: payment === "cash on delivery" ? "pending" : "initiated",
      tran_id: `order_${Date.now()}`,
      createdAt: new Date(),
    };

    try {
      // Save order first
      await axios.post("http://localhost:5000/orders", orderData);

      // Online payment flow
      if (payment === "online") {
        const { data } = await axios.post(
          "http://localhost:5000/sslcommerz/init",
          {
            orderId: orderData.tran_id,
            totalAmount: total,
            fullName,
            email,
            phone,
            address,
          }
        );

        if (data?.GatewayPageURL) {
          window.location.href = data.GatewayPageURL;
        } else {
          Swal.fire("Error", "Failed to initiate online payment", "error");
        }
        return;
      }

      // Cash on delivery
      Swal.fire("Success!", "Order placed successfully", "success");
      navigate("/dashboard/myorders");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="min-h-screen dark:bg-black dark:text-white">
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
                required
              />
              <input
                type="number"
                placeholder="Phone Number *"
                className="border p-2 rounded"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                className="border p-2 rounded md:col-span-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <textarea
                placeholder="Delivery Address *"
                className="border p-2 rounded md:col-span-2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
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

          <div className="border rounded-2xl p-6 shadow-md dark:bg-black dark:text-white bg-white">
            <h2 className="font-semibold text-xl mb-5 text-black dark:text-white">
              Select Payment Method
            </h2>

            <div className="grid gap-4">
              {/* Cash on Delivery */}
              <label
                className={`flex items-center gap-4 border p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  payment === "cash on delivery"
                    ? "border-green-500 bg-green-50 ring-2 ring-green-400"
                    : "hover:border-green-400 hover:bg-green-50"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cash on delivery"
                  checked={payment === "cash on delivery"}
                  onChange={() => setPayment("cash on delivery")}
                  className="hidden"
                />
                <FaMoneyBillWave
                  className={`text-2xl ${
                    payment === "cash on delivery"
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                />
                <span className="font-medium text-gray-700">
                  Cash on Delivery
                </span>
              </label>

              {/* Online Payment */}
              <label
                className={`flex items-center gap-4 border p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  payment === "online"
                    ? "border-cyan-500 bg-cyan-50 ring-2 ring-cyan-400"
                    : "hover:border-cyan-400 hover:bg-cyan-50"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={payment === "online"}
                  onChange={() => setPayment("online")}
                  className="hidden"
                />
                <FaCreditCard
                  className={`text-2xl ${
                    payment === "online" ? "text-cyan-600" : "text-gray-400"
                  }`}
                />
                <span className="font-medium text-gray-700">
                  Online Payment
                </span>
              </label>
            </div>
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
          {discount > 0 && (
            <div className="flex justify-between mb-2 text-green-600">
              <span>Discount ({appliedCoupon?.code})</span>
              <span>-৳{discount}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>৳{total}</span>
          </div>

          {/* Coupon Input */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 border p-2 rounded"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              className="px-4 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Apply
            </button>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="mt-6 w-full bg-cyan-500 text-white py-3 rounded hover:bg-cyan-600 transition"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
