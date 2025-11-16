import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "@/provider/AuthProvider";
import { FaMoneyBillWave, FaCreditCard } from "react-icons/fa";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

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

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const axiosPublic = useAxiosPublic();

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

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      return Swal.fire("Error!", "Please enter a coupon code", "error");
    }
    try {
      const res = await axiosPublic.post("/apply-coupon", {
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
    if (!/^01\d{9}$/.test(phone)) {
      return Swal.fire(
        "Invalid Phone",
        "Please enter a valid 11-digit Bangladeshi phone number starting with 01",
        "error"
      );
    }

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
        barcode: product?.barcode || 0,
        productImage: product?.images?.[0] || "https://via.placeholder.com/80",
        price: product?.newPrice || 0,
        purchasePrice: product?.purchasePrice || 0,
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
      orderType: "Online",
    };

    try {
      await axiosPublic.post("/orders", orderData);

      if (payment === "online") {
        const { data } = await axiosPublic.post("/sslcommerz/init", {
          orderId: orderData.tran_id,
          totalAmount: total,
          fullName,
          email,
          phone,
          address,
        });

        if (data?.GatewayPageURL) {
          window.location.href = data.GatewayPageURL;
        } else {
          Swal.fire("Error", "Failed to initiate online payment", "error");
        }
        return;
      }

      Swal.fire("Success!", "Order placed successfully", "success");
      navigate("/dashboard/myorders");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  return (
    <div className="min-h-screen dark:bg-black bg-gray-50 dark:text-white py-24">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">

        {/* LEFT SIDE */}
        <div className="md:col-span-2 space-y-8">

          {/* CUSTOMER INFO */}
          <div className="bg-white dark:bg-neutral-900 shadow-lg rounded-2xl p-6 border border-gray-200 dark:border-neutral-700">
            <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              Customer Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name *"
                className="input-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <input
                type="number"
                placeholder="Phone Number *"
                className="input-field"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,11}$/.test(value)) setPhone(value);
                }}
              />

              <input
                type="email"
                placeholder="Email Address"
                className="input-field md:col-span-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <textarea
                placeholder="Delivery Address *"
                className="input-field md:col-span-2 h-24"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              ></textarea>
            </div>
          </div>

          {/* SHIPPING */}
          <div className="bg-white dark:bg-neutral-900 shadow-lg rounded-2xl p-6 border border-gray-200 dark:border-neutral-700">
            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
              Shipping Information
            </h2>
                <div className="grid gap-4">
            {/* Option */}
            {["inside", "outside"].map((type) => (
              <label
                key={type}
                className={`shipping-card ${
                  shipping === type ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  checked={shipping === type}
                  onChange={() => setShipping(type)}
                  className="hidden"
                />
                <div>
                  <p className="font-semibold">
                    {type === "inside" ? "Inside Dhaka" : "Outside Dhaka"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {type === "inside"
                      ? "Delivery within 1-2 business days"
                      : "Delivery within 3-5 business days"}
                  </p>
                </div>
                <span className="font-semibold">
                  ৳{type === "inside" ? 60 : 120}
                </span>
              </label>

              
            ))}
            </div>
          </div>

          {/* PAYMENT */}
          <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-6 border border-gray-200 dark:border-neutral-700">
            <h2 className="font-semibold text-xl mb-5">
              Select Payment Method
            </h2>

            <div className="grid gap-4">
              <label
                className={`pay-card ${
                  payment === "cash on delivery" ? "selected-pay" : ""
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
                <FaMoneyBillWave className="icon" />
                <span>Cash on Delivery</span>
              </label>

              <label
                className={`pay-card ${
                  payment === "online" ? "selected-pay-online" : ""
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
                <FaCreditCard className="icon" />
                <span>Online Payment</span>
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl p-6 h-fit border border-gray-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>

          {cartItems.map((item) => {
            const product = productsMap[item.productId];
            return (
              <div
                key={item._id}
                className="flex justify-between mb-3 text-sm"
              >
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

          {/* COUPON */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="border p-2 rounded-lg w-full"
            />
            <button
              onClick={handleApplyCoupon}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Apply
            </button>
          </div>

          {/* ORDER BUTTON */}
          <button
            onClick={handlePlaceOrder}
            className="mt-6 w-full bg-cyan-600 text-white py-3 rounded-xl hover:bg-cyan-700 shadow-lg transition"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
