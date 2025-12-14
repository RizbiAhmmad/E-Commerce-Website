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
  const [district, setDistrict] = useState("");
  const [shippingData, setShippingData] = useState({
    insideDhaka: 0,
    outsideDhaka: 0,
  });
  const [loadingShipping, setLoadingShipping] = useState(true);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const axiosPublic = useAxiosPublic();
  const [localCartItems, setLocalCartItems] = useState([]);

  useEffect(() => {
    if (state?.cartItems) {
      setLocalCartItems(state.cartItems);
    }
  }, [state]);

  useEffect(() => {
    if (user) {
      setFullName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const res = await axiosPublic.get("/shipping");
        setShippingData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingShipping(false);
      }
    };

    fetchShipping();
  }, []);

  useEffect(() => {
    let sessionId = localStorage.getItem("checkoutSessionId");
    if (!sessionId) {
      sessionId = "session_" + Date.now();
      localStorage.setItem("checkoutSessionId", sessionId);
    }
  }, []);

  useEffect(() => {
    const sessionId = localStorage.getItem("checkoutSessionId");
    if (!sessionId) return;

    const timeout = setTimeout(() => {
      const incomplete = {
        sessionId,
        fullName,
        phone,
        email,
        district,
        address,
        shipping,
        payment,
        cartItems: localCartItems,
      };

      axiosPublic.post("/incomplete-orders", incomplete);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [fullName, phone, email, district, address, shipping, payment, cartItems]);

  const isAllFreeShipping = cartItems.every((item) => {
    const product = productsMap[item.productId];
    return product?.freeShipping === true;
  });

  const shippingCost = isAllFreeShipping
    ? 0
    : shipping === "inside"
    ? Number(shippingData.insideDhaka)
    : Number(shippingData.outsideDhaka);

  const subtotal = cartItems.reduce((total, item) => {
    const product = productsMap[item.productId];
    return total + (product?.newPrice || 0) * item.quantity;
  }, 0);

  const total = subtotal + shippingCost - discount;

  const formatGtmItems = () => {
    return cartItems.map((item) => {
      const product = productsMap[item.productId];
      return {
        item_id: item.productId,
        item_name: product?.name,
        price: product?.newPrice,
        quantity: item.quantity,
      };
    });
  };

  useEffect(() => {
    if (!cartItems.length) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "begin_checkout",
      ecommerce: {
        currency: "BDT",
        value: total,
        items: formatGtmItems(),
      },
    });

    console.log("GTM Fired: begin_checkout");
  }, []);

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

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "order_click",
      ecommerce: {
        currency: "BDT",
        value: total,
        items: formatGtmItems(),
      },
    });

    console.log("GTM Fired: order_click");

    if (!fullName || !phone || !address) {
      return Swal.fire("Error", "Please fill all required fields", "error");
    }

    if (!/^01\d{9}$/.test(phone)) {
      return Swal.fire(
        "Invalid Phone",
        "Please enter a valid 11-digit Bangladeshi phone number",
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

    let normalizedPhone = phone.toString().replace(/\D/g, "");

    if (normalizedPhone.startsWith("0")) {
      normalizedPhone = "88" + normalizedPhone;
    } else if (!normalizedPhone.startsWith("88")) {
      normalizedPhone = "88" + normalizedPhone;
    }

    const orderData = {
      fullName,
      phone: normalizedPhone,
      email,
      district,
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
      await axiosPublic.delete(
        "/incomplete-orders/" + localStorage.getItem("checkoutSessionId")
      );
      localStorage.removeItem("checkoutSessionId");

      const res = await axiosPublic.post("/orders", orderData);
      const savedOrder = {
        ...orderData,
        _id: res.data.insertedId,
      };

      localStorage.setItem("pendingOrderId", res.data.insertedId);

      if (payment === "online") {
        const { data } = await axiosPublic.post("/sslcommerz/init", {
          tran_id: orderData.tran_id,
          orderId: orderData.tran_id,
          totalAmount: total,
          fullName,
          email: email || "N/A",
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
      navigate("/myorder", { state: { orderData: savedOrder } });

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
              <select
                className="input-field md:col-span-2"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="">Select District *</option>

                <option value="Bagerhat">Bagerhat</option>
                <option value="Bandarban">Bandarban</option>
                <option value="Barguna">Barguna</option>
                <option value="Barishal">Barishal</option>
                <option value="Bhola">Bhola</option>
                <option value="Bogura">Bogura</option>
                <option value="Brahmanbaria">Brahmanbaria</option>
                <option value="Chandpur">Chandpur</option>
                <option value="Chapainawabganj">Chapainawabganj</option>
                <option value="Chattogram">Chattogram</option>
                <option value="Chuadanga">Chuadanga</option>
                <option value="Cox's Bazar">Cox's Bazar</option>
                <option value="Cumilla">Cumilla</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Dinajpur">Dinajpur</option>
                <option value="Faridpur">Faridpur</option>
                <option value="Feni">Feni</option>
                <option value="Gaibandha">Gaibandha</option>
                <option value="Gazipur">Gazipur</option>
                <option value="Gopalganj">Gopalganj</option>
                <option value="Habiganj">Habiganj</option>
                <option value="Jamalpur">Jamalpur</option>
                <option value="Jashore">Jashore</option>
                <option value="Jhalokati">Jhalokati</option>
                <option value="Jhenaidah">Jhenaidah</option>
                <option value="Joypurhat">Joypurhat</option>
                <option value="Khagrachhari">Khagrachhari</option>
                <option value="Khulna">Khulna</option>
                <option value="Kishoreganj">Kishoreganj</option>
                <option value="Kurigram">Kurigram</option>
                <option value="Kushtia">Kushtia</option>
                <option value="Lakshmipur">Lakshmipur</option>
                <option value="Lalmonirhat">Lalmonirhat</option>
                <option value="Madaripur">Madaripur</option>
                <option value="Magura">Magura</option>
                <option value="Manikganj">Manikganj</option>
                <option value="Meherpur">Meherpur</option>
                <option value="Moulvibazar">Moulvibazar</option>
                <option value="Munshiganj">Munshiganj</option>
                <option value="Mymensingh">Mymensingh</option>
                <option value="Naogaon">Naogaon</option>
                <option value="Narail">Narail</option>
                <option value="Narayanganj">Narayanganj</option>
                <option value="Narsingdi">Narsingdi</option>
                <option value="Natore">Natore</option>
                <option value="Netrokona">Netrokona</option>
                <option value="Nilphamari">Nilphamari</option>
                <option value="Noakhali">Noakhali</option>
                <option value="Pabna">Pabna</option>
                <option value="Panchagarh">Panchagarh</option>
                <option value="Patuakhali">Patuakhali</option>
                <option value="Pirojpur">Pirojpur</option>
                <option value="Rajbari">Rajbari</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Rangamati">Rangamati</option>
                <option value="Rangpur">Rangpur</option>
                <option value="Satkhira">Satkhira</option>
                <option value="Shariatpur">Shariatpur</option>
                <option value="Sherpur">Sherpur</option>
                <option value="Sirajganj">Sirajganj</option>
                <option value="Sunamganj">Sunamganj</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Tangail">Tangail</option>
                <option value="Thakurgaon">Thakurgaon</option>
              </select>

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
                    ৳
                    {type === "inside"
                      ? shippingData.insideDhaka
                      : shippingData.outsideDhaka}
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
                  disabled
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
              <div key={item._id} className="flex justify-between mb-3 text-sm">
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
