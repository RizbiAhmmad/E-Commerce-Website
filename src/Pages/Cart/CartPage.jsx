import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "@/provider/AuthProvider";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch cart items
  useEffect(() => {
    if (!user?.email) return;

    setLoading(true);
    axios
      .get(
        `https://e-commerce-server-api.onrender.com/cart?email=${user.email}`
      )
      .then(async (res) => {
        const items = res.data;
        const productIds = items.map((item) => item.productId);

        const productDetails = await Promise.all(
          productIds.map((id) =>
            axios
              .get(`https://e-commerce-server-api.onrender.com/products/${id}`)
              .then((res) => res.data)
          )
        );

        const map = {};
        productDetails.forEach((product) => {
          map[product._id] = product;
        });

        setProductsMap(map);
        setCartItems(items);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch cart items:", error);
        setLoading(false);
      });
  }, [user]);

  const totalPrice = cartItems.reduce((total, item) => {
    if (!item.selected) return total;
    const product = productsMap[item.productId];
    if (!product) return total;
    return total + product.newPrice * item.quantity;
  }, 0);

  const toggleSelect = (itemId) => {
    const item = cartItems.find((i) => i._id === itemId);
    if (!item) return;
    const newSelected = !item.selected;

    axios
      .patch(`https://e-commerce-server-api.onrender.com/cart/${itemId}`, {
        selected: newSelected,
      })
      .then(() => {
        setCartItems((prev) =>
          prev.map((i) =>
            i._id === itemId ? { ...i, selected: newSelected } : i
          )
        );
      })
      .catch((err) => console.error("Failed to update selection", err));
  };

  const updateQuantity = (itemId, newQty) => {
    if (newQty < 1) return;

    axios
      .patch(`https://e-commerce-server-api.onrender.com/cart/${itemId}`, {
        quantity: newQty,
      })
      .then(() => {
        setCartItems((prev) =>
          prev.map((item) =>
            item._id === itemId ? { ...item, quantity: newQty } : item
          )
        );
      })
      .catch((err) => {
        console.error("Failed to update quantity", err);
      });
  };

  const deleteItem = (itemId) => {
    axios
      .delete(`https://e-commerce-server-api.onrender.com/cart/${itemId}`)
      .then(() => {
        setCartItems((prev) => prev.filter((item) => item._id !== itemId));
        window.dispatchEvent(new Event("cartUpdated"));
      })
      .catch((err) => {
        console.error("Failed to delete item", err);
      });
  };

  const handleCheckout = () => {
    const selectedItems = cartItems.filter((item) => item.selected);
    if (selectedItems.length === 0) {
      alert("Please select at least one item to checkout.");
      return;
    }
    navigate("/checkout", {
      state: { cartItems: selectedItems, productsMap },
    });
  };

  if (loading) return <p className="p-6 text-center">Loading cart...</p>;
  if (!cartItems.length)
    return <p className="p-6 text-center">Your cart is empty.</p>;

  return (
    <div className="min-h-screen dark:bg-black dark:text-white px-4 sm:px-6 lg:px-8 py-24">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => {
            const product = productsMap[item.productId];
            if (!product) return null;

            return (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border rounded-lg p-4 shadow-sm"
              >
                {/* Left section */}
                <div className="flex gap-4 items-center flex-1">
                  <input
                    type="checkbox"
                    checked={!!item.selected}
                    onChange={() => toggleSelect(item._id)}
                    className="w-5 h-5 md:w-6 md:h-6 lg:w-6 lg:h-6 transform scale-125"
                  />

                  <img
                    src={
                      product.images?.[0] || "https://via.placeholder.com/80"
                    }
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex flex-col flex-grow">
                    <p className="font-semibold text-base sm:text-lg">
                      {product.name}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">
                        Color: {item.selectedColor || product.colors?.[0]}
                      </span>
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">
                        Size: {item.selectedSize || product.sizes?.[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-6 w-full">
                  {/* Price */}
                  <div className="text-cyan-500 font-semibold text-lg text-left sm:text-right">
                    BDT {product.newPrice.toLocaleString()}
                  </div>

                  {/* Quantity + Delete */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item._id,
                            Math.max(1, Number(e.target.value))
                          )
                        }
                        className="w-12 text-center border-x bg-transparent"
                      />
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => deleteItem(item._id)}
                      className="text-red-600 hover:text-red-800 flex justify-center"
                      aria-label="Delete item"
                    >
                      <FaTrashAlt size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="border rounded-lg p-6 h-fit shadow-md">
          <h2 className="font-semibold text-xl mb-6">Order Summary</h2>
          {cartItems
            .filter((item) => item.selected)
            .map((item) => {
              const product = productsMap[item.productId];
              if (!product) return null;

              return (
                <div
                  key={item._id}
                  className="flex justify-between items-center mb-3"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        product.images?.[0] || "https://via.placeholder.com/40"
                      }
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <span className="text-sm">{product.name}</span>
                  </div>
                  <span className="font-semibold">
                    BDT {(product.newPrice * item.quantity).toLocaleString()}
                  </span>
                </div>
              );
            })}
          <hr className="my-4" />
          <div className="flex justify-between font-semibold text-lg">
            <span>Subtotal</span>
            <span>BDT {totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-xl mt-2">
            <span>TOTAL</span>
            <span>BDT {totalPrice.toLocaleString()}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="mt-6 w-full bg-cyan-500 text-white py-3 rounded hover:bg-cyan-600 transition"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
