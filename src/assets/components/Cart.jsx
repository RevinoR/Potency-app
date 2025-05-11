import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPlus,
  faMinus,
  faArrowLeft,
  faExclamationTriangle,
  faShoppingBasket,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const Cart = ({ onClose, onProceedToCheckout, onCartUpdated }) => {
  const [cart, setCart] = useState({
    items: [],
    summary: { subtotal: 0, tax: 0, total: 0, itemCount: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [networkError, setNetworkError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef(null);

  // Format number as currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Fetch cart data with improved error handling
  const fetchCart = async (retry = false) => {
    try {
      setLoading(true);
      setError(null);
      setNetworkError(false);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view your cart");
        setLoading(false);
        return;
      }

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Set timeout to prevent hanging requests
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, 8000);

      const response = await axios.get("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: abortControllerRef.current.signal,
      });

      clearTimeout(timeoutId);

      if (response.data && response.data.data) {
        setCart(response.data.data);

        // Reset retry count on successful fetch
        if (retry) {
          setRetryCount(0);
        }

        // Notify parent component to update cart count
        if (onCartUpdated) {
          onCartUpdated();
        }
      } else {
        setError("Failed to load cart data");
      }
    } catch (err) {
      console.error("Error fetching cart:", err);

      if (err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else if (err.code === "ERR_NETWORK") {
        setNetworkError(true);
      } else {
        setError(err.response?.data?.message || "Failed to load cart");
      }
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity with error handling
  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Optimistically update UI
      const updatedCart = {
        ...cart,
        items: cart.items.map((item) =>
          item.cart_item_id === cartItemId
            ? { ...item, quantity: newQuantity, isUpdating: true }
            : item
        ),
      };
      setCart(updatedCart);

      await axios.put(
        `/api/cart/${cartItemId}`,
        {
          quantity: newQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh cart data to get updated totals
      fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);

      if (err.code === "ERR_NETWORK") {
        setNetworkError(true);
      } else {
        setError(err.response?.data?.message || "Failed to update quantity");
      }

      // Revert to original cart state on error
      fetchCart();
    }
  };

  // Remove item from cart with error handling
  const removeItem = async (cartItemId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Optimistically update UI
      const updatedCart = {
        ...cart,
        items: cart.items.filter((item) => item.cart_item_id !== cartItemId),
      };
      setCart(updatedCart);

      await axios.delete(`/api/cart/${cartItemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh cart data
      fetchCart();
    } catch (err) {
      console.error("Error removing item:", err);

      if (err.code === "ERR_NETWORK") {
        setNetworkError(true);
      } else {
        setError(err.response?.data?.message || "Failed to remove item");
      }

      // Revert to original cart state on error
      fetchCart();
    }
  };

  // Clear entire cart with error handling
  const clearCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Confirm before clearing
      if (!window.confirm("Are you sure you want to clear your cart?")) {
        return;
      }

      // Optimistically update UI
      setCart({
        items: [],
        summary: { subtotal: 0, tax: 0, total: 0, itemCount: 0 },
      });

      await axios.delete("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh cart data
      fetchCart();
    } catch (err) {
      console.error("Error clearing cart:", err);

      if (err.code === "ERR_NETWORK") {
        setNetworkError(true);
      } else {
        setError(err.response?.data?.message || "Failed to clear cart");
      }

      // Revert to original cart state on error
      fetchCart();
    }
  };

  // Fetch cart on component mount
  useEffect(() => {
    fetchCart();

    // Clean up on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle retry logic
  const handleRetry = () => {
    // Increment retry count to track attempts
    setRetryCount((prev) => prev + 1);
    fetchCart(true);
  };

  // Handle checkout button click
  const handleCheckout = () => {
    if (cart.items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    onProceedToCheckout();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <button
            onClick={onClose}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            <span>Continue Shopping</span>
          </button>
          <h2 className="text-xl font-medium">Your Cart</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        ) : networkError ? (
          <div className="p-12 text-center">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-amber-500 text-4xl mb-4"
            />
            <p className="text-lg text-gray-800 mb-4">Network Error</p>
            <p className="text-gray-600 mb-6">
              We're having trouble connecting to the server. Please check your
              internet connection.
            </p>
            <button
              onClick={handleRetry}
              className="flex items-center justify-center mx-auto px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
            >
              <FontAwesomeIcon icon={faSync} className="mr-2" />
              Retry Connection ({retryCount})
            </button>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Try Again
            </button>
          </div>
        ) : cart.items.length === 0 ? (
          <div className="p-12 text-center">
            <FontAwesomeIcon
              icon={faShoppingBasket}
              className="text-gray-300 text-5xl mb-4"
            />
            <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
            <p className="text-gray-500 mb-6">
              Add some products to your cart and they will appear here
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-black text-white hover:bg-gray-800"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="p-6">
              {cart.items.map((item) => (
                <div
                  key={item.cart_item_id}
                  className={`flex items-start py-4 border-b ${
                    item.isUpdating ? "opacity-60" : ""
                  }`}
                >
                  <div className="w-20 h-20 bg-gray-200 mr-4 flex-shrink-0">
                    {item.image ? (
                      <img
                        src={`data:image/jpeg;base64,${item.image}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.subtitle}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.cart_item_id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l"
                          disabled={item.isUpdating}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.cart_item_id, item.quantity + 1)
                          }
                          className={`w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r ${
                            item.quantity >= item.stock
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={
                            item.quantity >= item.stock || item.isUpdating
                          }
                          title={
                            item.quantity >= item.stock
                              ? `Max stock: ${item.stock}`
                              : ""
                          }
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.cart_item_id)}
                        className="text-red-500 hover:text-red-700"
                        disabled={item.isUpdating}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                    {item.quantity >= item.stock && (
                      <p className="text-xs text-amber-600 mt-1">
                        Max stock reached ({item.stock})
                      </p>
                    )}
                  </div>

                  <div className="ml-4 text-right">
                    <p className="font-medium">{formatCurrency(item.price)}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex justify-end mt-4">
                <button
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Clear cart
                </button>
              </div>
            </div>

            <div className="p-6 bg-gray-50">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>{formatCurrency(cart.summary.subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax (10%)</span>
                <span>{formatCurrency(cart.summary.tax)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg mb-6">
                <span>Total</span>
                <span>{formatCurrency(cart.summary.total)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-black text-white font-medium hover:bg-gray-800"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
