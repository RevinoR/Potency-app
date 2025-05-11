import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import ScrollToTop from "./assets/components/ScrollToTop";
import Navbar from "./assets/components/Navbar";
import Footer from "./assets/components/Footer";
import LandingPage from "./assets/pages/LandingPage";
import About from "./assets/pages/About";
import SignIn from "./assets/pages/SignIn";
import SignUp from "./assets/pages/SignUp";
import Products from "./assets/pages/Products";
import ProductAdminPage from "./assets/pages/ProductAdmin";
import OrderHistory from "./assets/pages/OrderHistory";
import Cart from "./assets/components/Cart";
import Checkout from "./assets/components/Checkout";
import OrderConfirmation from "./assets/components/OrderConfirmation";

function App() {
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const navbarRef = useRef(null);

  // Handle cart toggle
  const toggleCart = useCallback(() => {
    setShowCart(!showCart);
    if (showCheckout) setShowCheckout(false);
    if (showOrderConfirmation) setShowOrderConfirmation(false);
  }, [showCart, showCheckout, showOrderConfirmation]);

  // Handle checkout
  const handleProceedToCheckout = useCallback(() => {
    setShowCart(false);
    setShowCheckout(true);
  }, []);

  // Handle order complete
  const handleOrderComplete = useCallback((data) => {
    setOrderData(data);
    setShowCheckout(false);
    setShowOrderConfirmation(true);

    // Refresh cart count after order completion
    refreshCartCount();
  }, []);

  // Handle back button from checkout
  const handleBackToCart = useCallback(() => {
    setShowCheckout(false);
    setShowCart(true);
  }, []);

  // Close all modals
  const closeAllModals = useCallback(() => {
    setShowCart(false);
    setShowCheckout(false);
    setShowOrderConfirmation(false);
    // Reset order data when closing the confirmation
    setOrderData(null);
  }, []);

  // Helper function to refresh cart count
  const refreshCartCount = useCallback(() => {
    if (navbarRef.current && navbarRef.current.refreshCartCount) {
      navbarRef.current.refreshCartCount();
    }
  }, []);

  // Reset order data when navigating away from confirmation
  useEffect(() => {
    if (!showOrderConfirmation && orderData !== null) {
      // Use a small timeout to prevent immediate clearing
      // This allows the OrderConfirmation component to access the data before unmounting
      const timer = setTimeout(() => {
        setOrderData(null);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [showOrderConfirmation, orderData]);

  return (
    <BrowserRouter>
      <ScrollToTop />

      {/* Cart Modal */}
      {showCart && (
        <Cart
          onClose={toggleCart}
          onProceedToCheckout={handleProceedToCheckout}
          onCartUpdated={refreshCartCount}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <Checkout
          onBack={handleBackToCart}
          onOrderComplete={handleOrderComplete}
        />
      )}

      {/* Order Confirmation Modal */}
      {showOrderConfirmation && orderData && (
        <OrderConfirmation orderData={orderData} onClose={closeAllModals} />
      )}

      <Routes>
        {/* Routes with Navbar and Footer */}
        <Route
          path="/"
          element={
            <>
              <Navbar ref={navbarRef} onCartClick={toggleCart} />
              <LandingPage
                onCartClick={toggleCart}
                refreshCartCount={refreshCartCount}
              />
              <Footer />
            </>
          }
        />
        <Route
          path="/about"
          element={
            <>
              <Navbar ref={navbarRef} onCartClick={toggleCart} />
              <About />
              <Footer />
            </>
          }
        />
        <Route
          path="/products"
          element={
            <>
              <Navbar ref={navbarRef} onCartClick={toggleCart} />
              <Products refreshCartCount={refreshCartCount} />
              <Footer />
            </>
          }
        />
        <Route path="/orders" element={<OrderHistory />} />

        {/* Routes without Navbar and Footer */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Admin routes - only NavbarAdmin, no Footer or regular Navbar */}
        <Route path="/admin/products" element={<ProductAdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
