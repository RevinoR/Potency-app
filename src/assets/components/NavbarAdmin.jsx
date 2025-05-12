import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSignOutAlt,
  faTachometerAlt,
  faBox,
  faShoppingBag,
  faList,
  faBars,
  faTimes,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { isAuthenticated, isAdmin, logout, getUser } from "../../utils/auth";

const NavbarAdmin = () => {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated and is admin
  useEffect(() => {
    const checkAuth = () => {
      setIsLoading(true);
      setAuthError(null);

      // Check if user is authenticated
      if (!isAuthenticated()) {
        setAuthError("You must be logged in to access the admin area.");
        setTimeout(
          () =>
            navigate("/signin", {
              state: { returnUrl: window.location.pathname },
            }),
          2000
        );
        return;
      }

      // Check if user is admin
      if (!isAdmin()) {
        setAuthError("You do not have permission to access the admin area.");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      // Get user data
      const userData = getUser();
      setUser(userData);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (logout in other tabs)
    const handleStorageChange = () => {
      if (!isAuthenticated()) {
        navigate("/signin");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signin");
    } catch (error) {
      console.error("Logout error:", error);
      // Still navigate away even if the logout API call fails
      navigate("/signin");
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggle user dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Show auth error
  if (authError) {
    return (
      <div className="fixed top-0 w-full z-50 bg-red-100 text-red-800 p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="mr-3 text-red-600"
          />
          <span>{authError}</span>
          <span className="ml-3 text-sm">Redirecting...</span>
        </div>
      </div>
    );
  }

  // Loading state or not authenticated
  if (isLoading || !user) {
    return (
      <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-4 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <Link to="/" className="font-['Terano'] text-xl text-black">
            POTENCY.
          </Link>
          <div className="animate-pulse h-5 w-24 bg-gray-200 rounded"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-4 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-['Terano'] text-xl text-black">
          <span className="text-amber-500">POTENCY.</span>
          <span className="text-sm ml-2 text-gray-600">admin</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/admin/dashboard"
            className="text-gray-700 hover:text-amber-500 flex items-center"
          >
            <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/products"
            className="text-gray-700 hover:text-amber-500 flex items-center"
          >
            <FontAwesomeIcon icon={faBox} className="mr-2" />
            <span>Products</span>
          </Link>
          <Link
            to="/admin/orders"
            className="text-gray-700 hover:text-amber-500 flex items-center"
          >
            <FontAwesomeIcon icon={faList} className="mr-2" />
            <span>Orders</span>
          </Link>
          <Link
            to="/"
            className="text-gray-700 hover:text-amber-500 flex items-center"
          >
            <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
            <span>Store Front</span>
          </Link>
        </div>

        {/* User Info and Logout - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative dropdown-container">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 text-gray-700 hover:text-black px-3 py-2 rounded-md hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={faUser} />
              <span className="font-medium">{user.name || user.email}</span>
              <span className="border-l border-gray-300 pl-2 text-xs text-amber-500">
                ADMIN
              </span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 hover:text-black focus:outline-none"
          onClick={toggleMobileMenu}
        >
          <FontAwesomeIcon
            icon={isMobileMenuOpen ? faTimes : faBars}
            size="lg"
          />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden pt-4 pb-4">
          <div className="flex flex-col space-y-3">
            <div className="py-3 px-4 bg-amber-50 rounded-md flex items-center gap-2 mb-2">
              <FontAwesomeIcon icon={faUser} className="text-amber-500" />
              <div>
                <p className="font-medium">{user.name || user.email}</p>
                <p className="text-xs text-amber-500">Admin Account</p>
              </div>
            </div>

            <Link
              to="/admin/dashboard"
              className="text-gray-700 hover:text-amber-500 py-2 flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FontAwesomeIcon
                icon={faTachometerAlt}
                className="mr-3 w-5 text-center"
              />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/admin/products"
              className="text-gray-700 hover:text-amber-500 py-2 flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faBox} className="mr-3 w-5 text-center" />
              <span>Products</span>
            </Link>
            <Link
              to="/admin/orders"
              className="text-gray-700 hover:text-amber-500 py-2 flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faList} className="mr-3 w-5 text-center" />
              <span>Orders</span>
            </Link>
            <Link
              to="/"
              className="text-gray-700 hover:text-amber-500 py-2 flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FontAwesomeIcon
                icon={faShoppingBag}
                className="mr-3 w-5 text-center"
              />
              <span>Store Front</span>
            </Link>

            <div className="pt-3 mt-3 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-800 flex items-center w-full py-2"
              >
                <FontAwesomeIcon
                  icon={faSignOutAlt}
                  className="mr-3 w-5 text-center"
                />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavbarAdmin;
