import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPlus,
  faMinus,
  faArrowLeft,
  faExclamationTriangle,
  faShoppingBasket,
  faSync,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const Cart = ({ onClose, onProceedToCheckout, onCartUpdated }) => {
  // Consolidated state management
  const [cart, setCart] = useState({
    items: [],
    summary: { subtotal: 0, tax: 0, total: 0, itemCount: 0 },
  });
  const [status, setStatus] = useState({
    loading: true,
    error: null,
    networkError: false,
  });

  // Format number as currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Simplified fetch cart logic
  const fetchCart = async (showRefreshToast = false) => {
    try {
      setStatus({ loading: true, error: null, networkError: false });

      const token = localStorage.getItem("token");
      if (!token) {
        setStatus({
          loading: false,
          error: "You must be logged in to view your cart",
          networkError: false,
        });
        toast.error("You must be logged in to view your cart");
        return;
      }

      const response = await axios.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000, // Set a reasonable timeout
      });

      if (response.data && response.data.data) {
        setCart(response.data.data);

        // Notify parent component to update cart count
        if (onCartUpdated) {
          onCartUpdated();
        }

        // Show refresh toast if requested
        if (showRefreshToast) {
          toast.success("Cart refreshed successfully");
        }
      } else {
        setStatus({
          loading: false,
          error: "Failed to load cart data",
          networkError: false,
        });
        toast.error("Failed to load cart data");
      }
    } catch (err) {
      console.error("Error fetching cart:", err);

      if (err.code === "ECONNABORTED" || err.name === "TimeoutError") {
        setStatus({
          loading: false,
          error: "Request timed out. Please try again.",
          networkError: false,
        });
        toast.error("Request timed out. Please try again.");
      } else if (err.code === "ERR_NETWORK") {
        setStatus({ loading: false, error: null, networkError: true });
        toast.error("Network error. Please check your connection.");
      } else {
        const errorMessage =
          err.response?.data?.message || "Failed to load cart";
        setStatus({
          loading: false,
          error: errorMessage,
          networkError: false,
        });
        toast.error(errorMessage);
      }
    } finally {
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  // Update item quantity with optimistic updates
  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in");
        return;
      }

      // Find the item to update
      const itemToUpdate = cart.items.find(
        (item) => item.cart_item_id === cartItemId
      );
      if (!itemToUpdate) return;

      // Show a message if trying to exceed stock
      if (newQuantity > itemToUpdate.stock) {
        toast.warning(`Maximum stock available is ${itemToUpdate.stock}`);
        return;
      }

      // Optimistically update UI
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.map((item) =>
          item.cart_item_id === cartItemId
            ? { ...item, quantity: newQuantity, isUpdating: true }
            : item
        ),
      }));

      await axios.put(
        `/api/cart/${cartItemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh cart data to get updated totals
      fetchCart();
      toast.success("Cart updated");
    } catch (err) {
      console.error("Error updating quantity:", err);

      if (err.code === "ERR_NETWORK") {
        setStatus({ loading: false, error: null, networkError: true });
        toast.error("Network error. Please check your connection.");
      } else {
        const errorMessage =
          err.response?.data?.message || "Failed to update quantity";
        setStatus({
          loading: false,
          error: errorMessage,
          networkError: false,
        });
        toast.error(errorMessage);
      }

      // Revert to original cart state on error
      fetchCart();
    }
  };

  // Remove item from cart with optimistic updates
  const removeItem = async (cartItemId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in");
        return;
      }

      // Get item info for toast
      const itemToRemove = cart.items.find(
        (item) => item.cart_item_id === cartItemId
      );
      const itemName = itemToRemove?.name || "Item";

      // Optimistically update UI
      setCart((prevCart) => ({
        ...prevCart,
        items: prevCart.items.filter(
          (item) => item.cart_item_id !== cartItemId
        ),
      }));

      await axios.delete(`/api/cart/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh cart data
      fetchCart();
      toast.success(`${itemName} removed from cart`);
    } catch (err) {
      console.error("Error removing item:", err);

      if (err.code === "ERR_NETWORK") {
        setStatus({ loading: false, error: null, networkError: true });
        toast.error("Network error. Please check your connection.");
      } else {
        const errorMessage =
          err.response?.data?.message || "Failed to remove item";
        setStatus({
          loading: false,
          error: errorMessage,
          networkError: false,
        });
        toast.error(errorMessage);
      }

      // Revert to original cart state on error
      fetchCart();
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in");
        return;
      }

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
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh cart data
      fetchCart();
      toast.success("Cart cleared successfully");
    } catch (err) {
      console.error("Error clearing cart:", err);

      if (err.code === "ERR_NETWORK") {
        setStatus({ loading: false, error: null, networkError: true });
        toast.error("Network error. Please check your connection.");
      } else {
        const errorMessage =
          err.response?.data?.message || "Failed to clear cart";
        setStatus({
          loading: false,
          error: errorMessage,
          networkError: false,
        });
        toast.error(errorMessage);
      }

      // Revert to original cart state on error
      fetchCart();
    }
  };

  // Fetch cart on component mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Handle checkout button click
  const handleCheckout = () => {
    if (cart.items.length === 0) {
      setStatus((prev) => ({ ...prev, error: "Your cart is empty" }));
      toast.error("Your cart is empty");
      return;
    }
    onProceedToCheckout();
  };

  // Handle refresh button click
  const handleRefresh = () => {
    fetchCart(true); // Show refresh toast
  };

  // Render a placeholder for missing images
  const renderImagePlaceholder = (itemName) => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-400">
      <FontAwesomeIcon icon={faImage} className="text-2xl mb-1" />
      <span className="text-xs text-center px-1 truncate w-full">
        {itemName}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} />
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

        {/* Loading state */}
        {status.loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        ) : status.networkError ? (
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
              onClick={handleRefresh}
              className="flex items-center justify-center mx-auto px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
            >
              <FontAwesomeIcon icon={faSync} className="mr-2" />
              Retry Connection
            </button>
          </div>
        ) : status.error ? (
          <div className="p-12 text-center">
            <p className="text-red-500 mb-4">{status.error}</p>
            <button
              onClick={handleRefresh}
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
              className="px-6 py-2 bg-black text-white hover:bg-gray-800 rounded"
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
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-200 mr-4 flex-shrink-0 overflow-hidden rounded">
                    {item.image ? (
                      <img
                        src={`data:image/jpeg;base64,${item.image}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentElement.innerHTML =
                            renderImagePlaceholder(item.name).outerHTML;
                        }}
                      />
                    ) : (
                      renderImagePlaceholder(item.name)
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-grow">
                    <h3 className="font-medium text-black">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.subtitle || "Product"}
                    </p>
                    <div className="mt-2 flex justify-between items-center">
                      {/* Quantity Controls */}
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.cart_item_id,
                              Math.max(1, item.quantity - 1)
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l hover:bg-gray-100"
                          disabled={item.isUpdating}
                          aria-label="Decrease quantity"
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300 text-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.cart_item_id, item.quantity + 1)
                          }
                          className={`w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r hover:bg-gray-100 ${
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
                          aria-label="Increase quantity"
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.cart_item_id)}
                        className="text-red-500 hover:text-red-700"
                        disabled={item.isUpdating}
                        aria-label="Remove item"
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

                  {/* Price Information */}
                  <div className="ml-4 text-right">
                    <p className="font-medium text-black">
                      {formatCurrency(item.price)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                    <p className="text-sm font-medium text-black mt-1">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Cart Actions */}
              <div className="flex justify-end mt-4">
                <div className="flex gap-4">
                  <button
                    onClick={handleRefresh}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                    aria-label="Refresh cart"
                  >
                    <FontAwesomeIcon icon={faSync} className="mr-1" />
                    Refresh
                  </button>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-500 hover:text-red-700"
                    aria-label="Clear cart"
                  >
                    Clear cart
                  </button>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-6 bg-gray-50">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Subtotal</span>
                <span className="text-black font-medium">
                  {formatCurrency(cart.summary.subtotal)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Tax (10%)</span>
                <span className="text-black">
                  {formatCurrency(cart.summary.tax)}
                </span>
              </div>
              <div className="flex justify-between font-medium text-lg mb-6 pt-3 border-t border-gray-200">
                <span className="text-black">Total</span>
                <span className="text-black">
                  {formatCurrency(cart.summary.total)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-black text-white font-medium hover:bg-gray-800 rounded"
                disabled={cart.items.length === 0}
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
