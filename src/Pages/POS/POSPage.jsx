import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaSearch, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

const POSPage = () => {
  const [products, setProducts] = useState([]);
  const [posCart, setPosCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const searchInputRef = useRef(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  // Payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [inputAmount, setInputAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");

  // Customer info state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [manualDiscountValue, setManualDiscountValue] = useState("");
  const [manualDiscountType, setManualDiscountType] = useState("flat");

  // NEW: Receipt modal state
  const [receiptData, setReceiptData] = useState(null);
  const receiptRef = useRef(null);
  // Helper to format numbers as currency
  const fmt = (value) =>
    Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Fetch products & coupons
  useEffect(() => {
    axios
      .get("https://e-commerce-server-api.onrender.com/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));

    axios
      .get("https://e-commerce-server-api.onrender.com/coupons?status=active")
      .then((res) => setCoupons(res.data))
      .catch((err) => console.error(err));

    fetchPosCart();
  }, []);

  // Fetch POS cart
  const fetchPosCart = () => {
    axios
      .get("https://e-commerce-server-api.onrender.com/pos/cart")
      .then((res) => setPosCart(res.data))
      .catch((err) => console.error(err));
  };

  // Reset coupon if cart is empty
  // useEffect(() => {
  //   if (posCart.length === 0) {
  //     setAppliedCoupon(null);
  //     setCouponCode("");
  //   }
  // }, [posCart]);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
  body * {
    visibility: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  #printable-receipt, #printable-receipt * {
    visibility: visible !important;
  }

  #printable-receipt {
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 80mm !important;
    max-width: 80mm !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    font-size: 11px !important;
    line-height: 1.2 !important;
  }

  .fixed, .z-50, .z-[60] {
    display: none !important;
  }
}

    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Add to cart
  const addToCart = (product, qty = 1, color = "", size = "", productImage) => {
    axios
      .post("https://e-commerce-server-api.onrender.com/pos/cart", {
        productId: product._id,
        productName: product.name,
        barCode: product.barcode || "",
        price: product.newPrice,
        quantity: qty,
        color,
        size,
        productImage: product.images?.[0] || productImage || "",
        purchasePrice: product.purchasePrice || 0,
      })
      .then(() => {
        fetchPosCart();
        setModalOpen(false);
        searchInputRef.current?.focus();
      })
      .catch((err) => console.error(err));
  };

  // Update quantity
  const updateQuantity = (id, qty) => {
    if (qty < 1) return;
    axios
      .patch(`https://e-commerce-server-api.onrender.com/pos/cart/${id}`, {
        quantity: qty,
      })
      .then(() => fetchPosCart())
      .catch((err) => console.error(err));
  };

  // Delete item
  const deleteItem = (id) => {
    axios
      .delete(`https://e-commerce-server-api.onrender.com/pos/cart/${id}`)
      .then(() => fetchPosCart())
      .catch((err) => console.error(err));
  };

  // Apply coupon
  const handleApplyCoupon = () => {
    const coupon = coupons.find(
      (c) => c.code.toUpperCase() === couponCode.toUpperCase()
    );
    if (!coupon) return alert("Invalid or expired coupon");

    const subtotal = posCart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return alert(
        `Minimum order amount for this coupon is ৳${coupon.minOrderAmount}`
      );
    }

    setAppliedCoupon(coupon);
    alert(`Coupon ${coupon.code} applied successfully!`);
  };

  const subtotal = posCart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Manual discount
  const manualDiscount =
    manualDiscountType === "percentage"
      ? (subtotal * manualDiscountValue) / 100
      : manualDiscountValue;

  // Coupon discount
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discountType === "percentage"
      ? (subtotal * appliedCoupon.discountValue) / 100
      : appliedCoupon.discountValue
    : 0;

  // Final discount (coupon OR manual, preference to manual)
  const totalDiscount = manualDiscount > 0 ? manualDiscount : couponDiscount;

  // Tax (10% on subtotal - discount)
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const tax = taxableAmount * 0.1;

  // Final total
  const total = taxableAmount + tax;

  // Paid & Change
  const paid = parseFloat(inputAmount || "0");
  const change =
    selectedPaymentMethod === "cash" ? Math.max(0, paid - total) : 0;

  // Place order -> returns orderData so we can show receipt
  const placeOrder = async () => {
    if (!posCart.length) {
      alert("Cart is empty!");
      return null;
    }
    if (!customerName || !customerPhone) {
      alert("Please enter customer info!");
      return null;
    }

    const orderData = {
      cartItems: posCart,
      subtotal,
      discount: totalDiscount,
      tax,
      total,
      coupon: appliedCoupon ? appliedCoupon.code : null,
      orderType: "pos",
      status: "paid",
      createdAt: new Date(),
      customer: {
        name: customerName,
        phone: customerPhone,
      },
      payment: {
        method: selectedPaymentMethod,
        amount: paid,
        change: change,
      },
      orderId: `#${Date.now()}`,
    };

    try {
      await axios.post(
        "https://e-commerce-server-api.onrender.com/pos/orders",
        orderData
      );
      // keep a copy for the receipt before we reset
      return orderData;
    } catch (err) {
      console.error(err);
      alert("Order failed!");
      return null;
    }
  };

  // Confirm -> show receipt modal + then reset states
  const handleConfirmAndShowReceipt = async () => {
    if (selectedPaymentMethod === "cash" && paid < total) {
      alert("Received cash is less than total amount!");
      return;
    }

    const order = await placeOrder();
    if (!order) return;

    setReceiptData(order);
    setPaymentModalOpen(false);

    fetchPosCart();
    setAppliedCoupon(null);
    setCouponCode("");
    setCustomerName("");
    setCustomerPhone("");
    setInputAmount("");
    setSelectedPaymentMethod("cash");
    searchInputRef.current?.focus();

    await axios
      .get("https://e-commerce-server-api.onrender.com/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err));

    Swal.fire({
      title: "✅ Order Completed!",
      text: "Receipt is ready. You can print now.",
      icon: "success",
      confirmButtonText: "OK",
    });
  };
  const handlePrint = () => {
    window.print();
    setTimeout(() => setReceiptData(null), 500);
  };

  // Search + Status active filter
  const filteredProducts = products.filter(
    (p) =>
      p.status === "active" &&
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const openModal = (product) => {
    setSelectedProduct(product);
    setSelectedQty(1);
    setSelectedColor(product.colors?.[0] || "");
    setSelectedSize(product.sizes?.[0] || "");
    setModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8">
      {/* Left: Products */}
      <div className="md:col-span-2 border rounded p-4">
        <div className="relative w-full mb-4">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            ref={searchInputRef}
            className="border p-2 w-full rounded text-lg pl-10"
            placeholder="Search product by name or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && filteredProducts.length > 0) {
                const product = filteredProducts[0];
                if (searchTerm === product.barcode) {
                  addToCart(product, 1);
                  setSearchTerm("");
                } else {
                  openModal(product);
                }
              }
            }}
          />
        </div>

        <div className="h-[450px] overflow-y-auto pr-2">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map((p) => (
              <button
                key={p._id}
                onClick={() => openModal(p)}
                disabled={Number(p.stock) === 0}
                className={`border rounded p-2 flex flex-col items-center justify-center transition shadow
          ${Number(p.stock) === 0 ? "bg-red-200 " : "hover:bg-cyan-100"}
        `}
              >
                <img
                  src={p.images?.[0] || "https://via.placeholder.com/60"}
                  alt={p.name}
                  className="w-30 h-30 object-cover mb-2 rounded"
                />
                <span className="text-sm font-bold text-center">{p.name}</span>
                <span className="text-sm text-center">{p.barcode}</span>
                <span className="font-semibold">৳{p.newPrice}</span>
                {p.stock === 0 && (
                  <span className="text-red-500 font-bold text-xs mt-1">
                    Out of Stock
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: POS Cart + Customer Info */}
      <div className="border rounded p-4 flex flex-col">
        <h2 className="font-semibold text-lg mb-4">POS Cart</h2>

        {/* Customer Info */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Customer Name"
            className="border p-2 rounded w-full mb-2"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Number"
            className="border p-2 rounded w-full"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>

        {/* Cart Items */}
        <div className="overflow-y-auto">
          {posCart.length === 0 ? (
            <p>Cart is empty</p>
          ) : (
            posCart.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center border-b py-2"
              >
                <div>
                  <p className="font-semibold">{item.productName}</p>
                  <div className="flex gap-2 mt-1">
                    {item.color && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                        🎨 {item.color}
                      </span>
                    )}
                    {item.size && (
                      <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                        📏 {item.size}
                      </span>
                    )}
                  </div>
                  <p>
                    ৳{item.price} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                  <button
                    onClick={() => deleteItem(item._id)}
                    className="text-red-600 ml-2"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Coupon input */}
        {/* {posCart.length > 0 && (
          <div className="my-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="border p-2 w-full rounded mb-2"
            />
            <button
              onClick={handleApplyCoupon}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mb-2"
            >
              Apply Coupon
            </button>
          </div>
        )} */}

        {posCart.length > 0 && (
          <>
            {/* <hr className="my-2" /> */}
            {/* <div className="flex justify-between font-bold text-lg mb-2">
              <span>Subtotal:</span>
              <span>৳{fmt(subtotal)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between font-bold text-lg mb-2 text-green-600">
                <span>Discount ({appliedCoupon.code}):</span>
                <span>-৳{fmt(subtotal - total)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xl mb-2">
              <span>Total:</span>
              <span>৳{fmt(total)}</span>
            </div> */}

            {/* Manual Discount */}
            <div className="my-2 flex gap-2">
              <h1 className="mt-2 font-bold text-lg">Discount:</h1>
              <select
                value={manualDiscountType}
                onChange={(e) => setManualDiscountType(e.target.value)}
                className="border p-2 w-1/2 rounded"
              >
                <option value="flat">৳ Fixed</option>
                <option value="percentage">% Percentage</option>
              </select>
              <input
                type="number"
                value={manualDiscountValue}
                onChange={(e) => setManualDiscountValue(Number(e.target.value))}
                placeholder="Discount"
                className="border p-2 w-1/2 rounded"
              />
            </div>

            <div className="flex justify-between font-bold text-lg mb-2">
              <span>Subtotal:</span>
              <span>৳{fmt(subtotal)}</span>
            </div>

            {totalDiscount > 0 && (
              <div className="flex justify-between font-bold text-lg mb-2 text-green-600">
                <span>Discount:</span>
                <span>-৳{fmt(totalDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg mb-2 text-blue-600">
              <span>Tax (10%):</span>
              <span>৳{fmt(tax)}</span>
            </div>

            <div className="flex justify-between font-bold text-xl mb-2">
              <span>Total:</span>
              <span>৳{fmt(total)}</span>
            </div>

            <button
              onClick={() => setPaymentModalOpen(true)}
              className="w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600"
            >
              Order Now
            </button>
          </>
        )}
      </div>

      {/* Product Modal (Color & Size Styling Improved) */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded p-6 max-w-xl w-full relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-red-500 font-bold"
            >
              X
            </button>
            <h2 className="text-xl font-bold mb-4">{selectedProduct.name}</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {selectedProduct.images?.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={selectedProduct.name}
                  className="w-full h-60 object-cover rounded"
                />
              ))}
            </div>
            {selectedProduct.colors && (
              <div className="mb-2 font-bold flex items-center gap-2 flex-wrap">
                Color:
                {selectedProduct.colors.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1 border rounded-full ${
                      selectedColor === c
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            {selectedProduct.sizes && (
              <div className="mb-2 font-bold flex items-center gap-2 flex-wrap">
                Size:
                {selectedProduct.sizes.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1 border rounded-full ${
                      selectedSize === s
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="flex font-bold items-center gap-2 mb-4">
              <button
                onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                −
              </button>
              <input
                type="number"
                value={selectedQty}
                onChange={(e) =>
                  setSelectedQty(Math.max(1, Number(e.target.value)))
                }
                className="w-12 text-center border rounded"
              />
              <button
                onClick={() => setSelectedQty(selectedQty + 1)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                +
              </button>
            </div>

            <div className="mb-4 font-bold">Stock: {selectedProduct.stock}</div>

            <button
              onClick={() => {
                if (Number(selectedProduct.stock) === 0) {
                  alert("This product is out of stock!");
                  return;
                }

                addToCart(
                  selectedProduct,
                  selectedQty,
                  selectedColor,
                  selectedSize
                );
              }}
              className="w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-[400px] relative p-6">
            <button
              onClick={() => setPaymentModalOpen(false)}
              className="absolute top-4 right-4 text-red-500 font-bold"
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Order Payment</h2>

            {/* Total */}
            <div className="flex justify-between items-center bg-gray-100 rounded p-3 mb-4">
              <span className="font-medium">Total Amount</span>
              <span className="text-orange-500 font-bold text-lg">
                ৳{fmt(total)}
              </span>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Select Payment Method</h3>
              <div className="grid grid-cols-4 gap-2">
                {["cash", "card", "mfs", "other"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setSelectedPaymentMethod(method)}
                    className={`border rounded p-2 text-sm hover:bg-gray-100 ${
                      selectedPaymentMethod === method
                        ? "ring-2 ring-orange-400"
                        : ""
                    }`}
                  >
                    {method === "cash" && "💵 Cash"}
                    {method === "card" && "💳 Card"}
                    {method === "mfs" && "📱 MFS"}
                    {method === "other" && "🧾 Other"}
                  </button>
                ))}
              </div>
            </div>

            {/* Input field */}
            <div className="mb-4">
              {selectedPaymentMethod === "cash" && (
                <>
                  <h3 className="font-semibold mb-2">Cash Received</h3>
                  <input
                    type="text"
                    className="border rounded w-full p-2 text-lg mb-3"
                    placeholder="Enter Cash Amount"
                    value={inputAmount}
                    onChange={(e) =>
                      setInputAmount(e.target.value.replace(/[^0-9.]/g, ""))
                    }
                  />
                </>
              )}
              {selectedPaymentMethod === "card" && (
                <>
                  <h3 className="font-semibold mb-2">Last 4 Digits of Card</h3>
                  <input
                    type="text"
                    maxLength={4}
                    className="border rounded w-full p-2 text-lg mb-3"
                    placeholder="1234"
                    value={inputAmount}
                    onChange={(e) =>
                      setInputAmount(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                </>
              )}
              {selectedPaymentMethod === "mfs" && (
                <>
                  <h3 className="font-semibold mb-2">Mobile Number</h3>
                  <input
                    type="text"
                    className="border rounded w-full p-2 text-lg mb-3"
                    placeholder="01XXXXXXXXX"
                    value={inputAmount}
                    onChange={(e) =>
                      setInputAmount(e.target.value.replace(/[^0-9]/g, ""))
                    }
                  />
                </>
              )}
              {selectedPaymentMethod === "other" && (
                <>
                  <h3 className="font-semibold mb-2">Reference</h3>
                  <input
                    type="text"
                    className="border rounded w-full p-2 text-lg mb-3"
                    placeholder="Write reference..."
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                  />
                </>
              )}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                "00",
                "0",
                ".",
              ].map((num, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputAmount(inputAmount + num)}
                  className="border rounded py-3 text-lg font-semibold hover:bg-gray-100"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => setInputAmount(inputAmount.slice(0, -1))}
                className="col-span-1 border rounded py-3 text-lg font-semibold hover:bg-gray-100"
              >
                ⌫
              </button>
              <button
                onClick={() => setInputAmount("")}
                className="col-span-2 border rounded py-3 text-lg font-semibold hover:bg-gray-100"
              >
                Clear
              </button>
            </div>

            {/* Confirm */}
            <button
              onClick={handleConfirmAndShowReceipt}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              Confirm Order & Download/Print Receipt
            </button>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {receiptData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div
            id="printable-receipt"
            ref={receiptRef}
            className="bg-white rounded-lg shadow w-[420px] p-6 relative"
          >
            {/* Header buttons */}
            <div className="absolute top-3 left-3">
              <button
                onClick={() => setReceiptData(null)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Close
              </button>
            </div>
            <div className="absolute top-3 right-3">
              <button
                onClick={handlePrint}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Print Invoice
              </button>
            </div>

            {/* Receipt content */}
            <div className="text-center mt-4">
              <h2 className="text-xl font-bold">Sostay Kini</h2>
              <p className="text-sm">
                eCommerce CMS with POS & WhatsApp Ordering | Inventory
                Management
              </p>
              <p className="text-xs mt-1">
                House : 35, Road No: 15, Uttora 14, Dhaka
              </p>
              <p className="text-xs mb-3">Tel: +880 1815109616</p>
            </div>

            <hr className="border-t-2 border-dashed border-gray-400 my-3" />
            <div className="flex justify-between text-sm">
              <span>Order ID {receiptData.orderId}</span>
              <span>
                {new Date(receiptData.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="text-sm mt-1">
              {new Date(receiptData.createdAt).toLocaleDateString()}
            </div>
            <hr className="border-t-2 border-dashed border-gray-400 my-3" />

            <div className="text-sm font-semibold mb-1">Items</div>
            <div className="space-y-2 text-sm">
              {receiptData.cartItems.map((it, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <div>{it.productName}</div>
                    <div className="text-xs text-gray-500">
                      {it.color ? ` ${it.color}` : ""}
                      {it.size ? ` | ${it.size}` : ""}
                    </div>
                    <div className="text-xs">Qty: {it.quantity}</div>
                  </div>
                  <div>৳{fmt(it.price * it.quantity)}</div>
                </div>
              ))}
            </div>

            <hr className="border-t-2 border-dashed border-gray-400 my-3" />
            <div className="flex justify-between text-sm">
              <span>SUBTOTAL:</span>
              <span>৳{fmt(receiptData.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>DISCOUNT:</span>
              <span>৳{fmt(receiptData.discount || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>TAX (10%):</span>
              <span>৳{fmt(receiptData.tax || 0)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base mt-1">
              <span>TOTAL:</span>
              <span>৳{fmt(receiptData.total)}</span>
            </div>

            <hr className="border-t-2 border-dashed border-gray-400 my-3" />
            <div className="text-sm">
              <div className="flex justify-between">
                <span>Payment Type:</span>
                <span className="capitalize">{receiptData.payment.method}</span>
              </div>

              {receiptData.payment.method === "cash" && (
                <>
                  <div className="flex justify-between">
                    <span>Cash:</span>
                    <span>৳{fmt(receiptData.payment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change :</span>
                    <span>৳{fmt(receiptData.payment.change)}</span>
                  </div>
                </>
              )}

              {receiptData.payment.method === "card" && (
                <div className="flex justify-between">
                  <span>Card Last 4 digits:</span>
                  <span>{receiptData.payment.amount}</span>
                </div>
              )}

              {receiptData.payment.method === "mfs" && (
                <div className="flex justify-between">
                  <span>Mobile Number:</span>
                  <span>{receiptData.payment.amount}</span>
                </div>
              )}

              {receiptData.payment.method === "other" && (
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span>{receiptData.payment.amount}</span>
                </div>
              )}
            </div>

            <div className="text-center mt-6 text-sm">
              <div>Thank You</div>
              <div>Please Come Again</div>
            </div>

            <div className="text-[10px] text-center text-gray-500 mt-4">
              Sostay Kini eCommerce CMS with POS & WhatsApp Ordering | Inventory
              Management
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPage;
