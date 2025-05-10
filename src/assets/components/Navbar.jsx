import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import useScrollPosition from "./ScrollDetection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingBag,
  faUser,
  faSignOutAlt,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const Navbar = ({ onCartClick }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const { scrollDirection, scrollY, isBlurActive } = useScrollPosition();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is logged in and get cart count
  useEffect(() => {
    const checkUserLoggedIn = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        fetchCartCount();
      } else {
        setUser(null);
        setCartCount(0);
      }
    };

    checkUserLoggedIn();

    // Optional: add event listener to detect login/logout from other tabs
    window.addEventListener("storage", checkUserLoggedIn);
    return () => window.removeEventListener("storage", checkUserLoggedIn);
  }, []);

  // Fetch cart count
  const fetchCartCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setCartLoading(true);
      const response = await axios.get("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success && response.data.data) {
        setCartCount(response.data.data.items.length);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setCartLoading(false);
    }
  };

  // Handle navbar visibility based on scroll
  useEffect(() => {
    if (scrollDirection === "down" && scrollY > 100) {
      setIsVisible(false);
    } else if (scrollDirection === "up") {
      setIsVisible(true);
    }
  }, [scrollDirection, scrollY]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setCartCount(0);
    navigate("/");
  };

  // Handle cart click
  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      // Fallback if no cart click handler is provided
      if (!user) {
        navigate("/signin", { state: { returnUrl: location.pathname } });
      } else {
        // Placeholder for future implementation
        console.log("Cart clicked, but no handler provided");
      }
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 px-6 md:px-12 py-4 transition-all duration-300 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        } ${
          scrollY > 100
            ? "backdrop-blur-md bg-white/75 dark:bg-white/25 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-['Terano'] text-xl text-black">
            POTENCY.
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-black focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <FontAwesomeIcon
              icon={isMobileMenuOpen ? faTimes : faBars}
              size="lg"
            />
          </button>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-8 text-black">
            {/* Home Link */}
            <Link
              to="/"
              className={`transition-colors duration-300 ${
                location.pathname === "/"
                  ? "text-amber-500"
                  : "hover:text-gray-600"
              } ${
                !isBlurActive && location.pathname !== "/"
                  ? "text-gray-600"
                  : ""
              }`}
            >
              Home
            </Link>
            {/* Products Link */}
            <Link
              to="/products"
              className={`transition-colors duration-300 ${
                location.pathname === "/products"
                  ? "text-amber-500"
                  : "hover:text-gray-600"
              } ${
                !isBlurActive && location.pathname !== "/products"
                  ? "text-gray-600"
                  : ""
              }`}
            >
              Products
            </Link>
            {/* About us Link */}
            <Link
              to="/about"
              className={`transition-colors duration-300 ${
                location.pathname === "/about"
                  ? "text-amber-500"
                  : "hover:text-gray-600"
              } ${
                !isBlurActive && location.pathname !== "/about"
                  ? "text-gray-600"
                  : ""
              }`}
            >
              About us
            </Link>
          </div>

          {/* Auth Buttons or User Info - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              // User is logged in - show user info and logout button
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-black">
                  <FontAwesomeIcon icon={faUser} />
                  <span className="font-medium">{user.name || user.email}</span>
                </div>
                {user.role === "admin" && (
                  <Link
                    to="/admin/products"
                    className="text-amber-500 hover:text-amber-600"
                    title="Admin Dashboard"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/orders"
                  className="text-black hover:text-gray-600"
                  title="My Orders"
                >
                  Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-black hover:text-gray-600"
                  title="Logout"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} />
                </button>
              </div>
            ) : (
              // User is not logged in - show auth buttons
              <>
                <Link
                  to="/signin"
                  className="px-7 py-1.5 bg-amber-500 text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/signup" className="text-black hover:text-gray-600">
                  Sign Up
                </Link>
              </>
            )}
            <button
              className="p-2 text-black transition-colors cursor-pointer relative"
              onClick={handleCartClick}
              aria-label="Shopping Cart"
            >
              <FontAwesomeIcon icon={faShoppingBag} size="lg" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
              {cartLoading && (
                <span className="absolute top-0 right-0 w-3 h-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-white z-40 transition-transform duration-300 transform ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
        style={{ paddingTop: "80px" }}
      >
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col gap-6">
            <Link
              to="/"
              className={`text-2xl font-medium ${
                location.pathname === "/" ? "text-amber-500" : "text-black"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`text-2xl font-medium ${
                location.pathname === "/products"
                  ? "text-amber-500"
                  : "text-black"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              to="/about"
              className={`text-2xl font-medium ${
                location.pathname === "/about" ? "text-amber-500" : "text-black"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About us
            </Link>

            <div className="border-t border-gray-200 my-4 pt-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <FontAwesomeIcon icon={faUser} className="text-gray-600" />
                    <span className="font-medium">
                      {user.name || user.email}
                    </span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Link
                      to="/orders"
                      className="text-black hover:text-gray-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        to="/admin/products"
                        className="text-amber-500"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 text-red-500"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link
                    to="/signin"
                    className="bg-amber-500 text-white py-3 px-6 rounded-md text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="border border-gray-300 text-black py-3 px-6 rounded-md text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            <button
              className="flex items-center justify-center gap-2 bg-black text-white py-3 px-6 rounded-md mt-4"
              onClick={() => {
                handleCartClick();
                setIsMobileMenuOpen(false);
              }}
            >
              <FontAwesomeIcon icon={faShoppingBag} />
              <span>View Cart {cartCount > 0 && `(${cartCount})`}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
