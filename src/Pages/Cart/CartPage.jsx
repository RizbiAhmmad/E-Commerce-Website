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

  // Fetch cart items for logged-in user
  useEffect(() => {
    if (!user?.email) return;

    setLoading(true);
    axios
      .get(`https://e-commerce-server-api.onrender.com/cart?email=${user.email}`)
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
      .patch(`https://e-commerce-server-api.onrender.com/cart/${itemId}`, { selected: newSelected })
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
      .patch(`https://e-commerce-server-api.onrender.com/cart/${itemId}`, { quantity: newQty })
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

  if (loading) return <p>Loading cart...</p>;
  if (!cartItems.length) return <p>Your cart is empty.</p>;

  return (
    <div className="min-h-screen dark:bg-black dark:text-white">
      <div className="max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {cartItems.map((item) => {
            const product = productsMap[item.productId];
            if (!product) return null;

            return (
              <div
                key={item._id}
                className="flex gap-4 items-center border-b pb-4"
              >
                <input
                  type="checkbox"
                  checked={!!item.selected}
                  onChange={() => toggleSelect(item._id)}
                  className="w-5 h-5"
                />
                <img
                  src={product.images?.[0] || "https://via.placeholder.com/80"}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex flex-col flex-grow">
                  <p className="font-semibold text-lg">{product.name}</p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">Color:</span>
                    <span className="px-2 py-1 dark:bg-black dark:text-white bg-gray-200 rounded text-sm">
                      {item.selectedColor || product.colors?.[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">Size:</span>
                    <span className="px-2 py-1 dark:bg-black dark:text-white bg-gray-200 rounded text-sm">
                      {item.selectedSize || product.sizes?.[0]}
                    </span>
                  </div>
                </div>

                <div className="text-cyan-500 font-semibold text-lg whitespace-nowrap">
                  BDT {product.newPrice.toLocaleString()}
                </div>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="px-3 py-1 dark:bg-black dark:text-white bg-gray-100 hover:bg-gray-200"
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
                    className="w-12 text-center"
                  />
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="px-3 py-1 dark:bg-black dark:text-white bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => deleteItem(item._id)}
                  className="text-red-600 hover:text-red-800 ml-3"
                  aria-label="Delete item"
                >
                  <FaTrashAlt size={20} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="border rounded p-6 h-fit">
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
