import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaTrashAlt } from "react-icons/fa";

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

  // Fetch products & active coupons
  useEffect(() => {
    axios.get("http://localhost:5000/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));

    axios.get("http://localhost:5000/coupons?status=active")
      .then(res => setCoupons(res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch POS cart
  const fetchPosCart = () => {
    axios.get("http://localhost:5000/pos/cart")
      .then(res => setPosCart(res.data))
      .catch(err => console.error(err));
  };
// Reset coupon if cart is empty
useEffect(() => {
  if (posCart.length === 0) {
    setAppliedCoupon(null);
    setCouponCode("");
  }
}, [posCart]);


  // Add product to cart
  const addToCart = (product, qty = 1, color = "", size = "") => {
    axios.post("http://localhost:5000/pos/cart", {
      productId: product._id,
      productName: product.name,
      price: product.newPrice,
      quantity: qty,
      color,
      size,
    }).then(() => {
      fetchPosCart();
      setModalOpen(false);
      searchInputRef.current.focus();
    }).catch(err => console.error(err));
  };

  // Update quantity
  const updateQuantity = (id, qty) => {
    if (qty < 1) return;
    axios.patch(`http://localhost:5000/pos/cart/${id}`, { quantity: qty })
      .then(() => fetchPosCart())
      .catch(err => console.error(err));
  };

  // Delete item
  const deleteItem = (id) => {
    axios.delete(`http://localhost:5000/pos/cart/${id}`)
      .then(() => fetchPosCart())
      .catch(err => console.error(err));
  };

  // Apply coupon
  const handleApplyCoupon = () => {
    const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
    if (!coupon) return alert("Invalid or expired coupon");

    const subtotal = posCart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return alert(`Minimum order amount for this coupon is ৳${coupon.minOrderAmount}`);
    }

    setAppliedCoupon(coupon);
    alert(`Coupon ${coupon.code} applied successfully!`);
  };

  // Calculate totals
  const subtotal = posCart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  let total = subtotal;
  if (appliedCoupon) {
    total = appliedCoupon.discountType === "percentage"
      ? subtotal - (subtotal * appliedCoupon.discountValue / 100)
      : subtotal - appliedCoupon.discountValue;
  }

  // Place POS order
  const placeOrder = () => {
    if (!posCart.length) return alert("Cart is empty!");
    const orderData = {
      cartItems: posCart,
      subtotal,
      total,
      coupon: appliedCoupon ? appliedCoupon.code : null,
      discount: appliedCoupon ? appliedCoupon.discountValue : 0,
      orderType: "pos",
      status: "paid",
      createdAt: new Date(),
    };
    axios.post("http://localhost:5000/pos/orders", orderData)
      .then(() => {
        alert("POS Sale Completed!");
        fetchPosCart();
        setAppliedCoupon(null);
        setCouponCode("");
        searchInputRef.current.focus();
      }).catch(err => console.error(err));
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <input
          type="text"
          ref={searchInputRef}
          className="border p-2 w-full rounded mb-4 text-lg"
          placeholder="Search product or scan barcode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && filteredProducts.length > 0) openModal(filteredProducts[0]);
          }}
        />
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {filteredProducts.slice(0, 20).map(p => (
            <button
              key={p._id}
              onClick={() => openModal(p)}
              className="border rounded p-2 flex flex-col items-center justify-center hover:bg-cyan-100 transition shadow"
            >
              <img src={p.images?.[0] || "https://via.placeholder.com/60"} alt={p.name} className="w-30 h-30 object-cover mb-2 rounded" />
              <span className="text-sm text-center">{p.name}</span>
              <span className="font-semibold">৳{p.newPrice}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: POS Cart */}
      <div className="border rounded p-4 flex flex-col h-full">
        <h2 className="font-semibold text-lg mb-4">POS Cart</h2>
        <div className="flex-grow overflow-y-auto">
          {posCart.length === 0 ? <p>Cart is empty</p> :
            posCart.map(item => (
              <div key={item._id} className="flex justify-between items-center border-b py-2">
                <div>
                  <p className="font-semibold">{item.productName}</p>
                  <p>{item.color && `Color: ${item.color} `}{item.size && `Size: ${item.size}`}</p>
                  <p>৳{item.price} × {item.quantity}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-2 py-1 bg-gray-200 rounded">−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="px-2 py-1 bg-gray-200 rounded">+</button>
                  <button onClick={() => deleteItem(item._id)} className="text-red-600 ml-2"><FaTrashAlt /></button>
                </div>
              </div>
            ))
          }
        </div>

        {/* Coupon input */}
        {posCart.length > 0 && (
          <div className="my-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter coupon code"
              className="border p-2 w-full rounded mb-2"
            />
            <button onClick={handleApplyCoupon} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mb-2">
              Apply Coupon
            </button>
          </div>
        )}

        {posCart.length > 0 && (
          <>
            <hr className="my-2" />
            <div className="flex justify-between font-bold text-lg mb-2">
              <span>Subtotal:</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between font-bold text-lg mb-2 text-green-600">
                <span>Discount ({appliedCoupon.code}):</span>
                <span>-৳{(subtotal - total).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xl mb-2">
              <span>Total:</span>
              <span>৳{total.toLocaleString()}</span>
            </div>
            <button onClick={placeOrder} className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">
              Order Now
            </button>
          </>
        )}
      </div>

      {/* Modal */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded p-6 max-w-xl w-full relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-red-500 font-bold">X</button>
            <h2 className="text-xl font-bold mb-4">{selectedProduct.name}</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {selectedProduct.images?.map((img, idx) => (
                <img key={idx} src={img} alt={selectedProduct.name} className="w-full h-60 object-cover rounded"/>
              ))}
            </div>
            {selectedProduct.colors && (
              <div className="mb-2">
                <label className="font-semibold mr-2">Color:</label>
                <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="border p-1 rounded">
                  {selectedProduct.colors.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
                </select>
              </div>
            )}
            {selectedProduct.sizes && (
              <div className="mb-2">
                <label className="font-semibold mr-2">Size:</label>
                <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="border p-1 rounded">
                  {selectedProduct.sizes.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))} className="px-3 py-1 bg-gray-200 rounded">−</button>
              <input type="number" value={selectedQty} onChange={(e) => setSelectedQty(Math.max(1, Number(e.target.value)))} className="w-12 text-center border rounded"/>
              <button onClick={() => setSelectedQty(selectedQty + 1)} className="px-3 py-1 bg-gray-200 rounded">+</button>
            </div>
            <button onClick={() => addToCart(selectedProduct, selectedQty, selectedColor, selectedSize)} className="w-full bg-cyan-500 text-white py-2 rounded hover:bg-cyan-600">Add to Cart</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSPage;
