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
} from "@fortawesome/free-solid-svg-icons";

const NavbarAdmin = () => {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Get user info from localStorage
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        // Not logged in, redirect to login
        navigate("/signin", { state: { returnUrl: window.location.pathname } });
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      // Check if user is admin
      if (parsedUser.role !== "admin") {
        // Not an admin, redirect to home
        navigate("/");
        return;
      }

      setUser(parsedUser);
    };

    checkAuth();

    // Listen for login/logout changes in other tabs
    const handleStorage = () => {
      const updatedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!updatedUser || !token) {
        navigate("/signin");
        return;
      }

      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Loading state or not authenticated
  if (!user) {
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
          <div className="relative">
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
                <Link
                  to="/admin/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faTachometerAlt} className="mr-2" />
                  Dashboard
                </Link>
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
              to="/admin/products"
              className="text-gray-700 hover:text-amber-500 py-2 flex items-center"
            >
              <FontAwesomeIcon icon={faBox} className="mr-3 w-5 text-center" />
              <span>Products</span>
            </Link>
            <Link
              to="/admin/orders"
              className="text-gray-700 hover:text-amber-500 py-2 flex items-center"
            >
              <FontAwesomeIcon icon={faList} className="mr-3 w-5 text-center" />
              <span>Orders</span>
            </Link>
            <Link
              to="/"
              className="text-gray-700 hover:text-amber-500 py-2 flex items-center"
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
