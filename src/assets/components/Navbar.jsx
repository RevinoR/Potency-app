import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import useScrollPosition from '../components/ScrollDetection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [user, setUser] = useState(null);
  const { scrollDirection, scrollY, isBlurActive } = useScrollPosition();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const checkUserLoggedIn = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    checkUserLoggedIn();
    
    // Optional: add event listener to detect login/logout from other tabs
    window.addEventListener('storage', checkUserLoggedIn);
    return () => window.removeEventListener('storage', checkUserLoggedIn);
  }, []);

  // Handle navbar visibility based on scroll
  useEffect(() => {
    if (scrollDirection === 'down') {
      setIsVisible(false);
    } else if (scrollDirection === 'up') {
      setIsVisible(true);
    }
  }, [scrollDirection]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 px-6 md:px-12 py-4 transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${scrollY > 100 ? 'backdrop-blur-md bg-white/75 dark:bg-white/25' : 'bg-transparent'}`}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-['Terano'] text-xl text-black">
          POTENCY.
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-black">
          {/* Home Link */}
          <Link
            to="/"
            className={`transition-colors duration-300 ${
              location.pathname === '/' ? 'text-orange-500' : 'hover:text-gray-600'
            } ${!isBlurActive && location.pathname !== '/' ? 'text-gray-600' : ''}`}
          >
            Home
          </Link>
          {/* Products Link */}
          <Link
            to="/products"
            className={`transition-colors duration-300 ${
              location.pathname === '/products' ? 'text-orange-500' : 'hover:text-gray-600'
            } ${!isBlurActive && location.pathname !== '/products' ? 'text-gray-600' : ''}`}
          >
            Products
          </Link>
          {/* About us Link */}
          <Link
            to="/about"
            className={`transition-colors duration-300 ${
              location.pathname === '/about' ? 'text-orange-500' : 'hover:text-gray-600'
            } ${!isBlurActive && location.pathname !== '/about' ? 'text-gray-600' : ''}`}
          >
            About us
          </Link>
        </div>

        {/* Auth Buttons or User Info */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            // User is logged in - show user info and logout button
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-black">
                <FontAwesomeIcon icon={faUser} />
                <span className="font-medium">{user.name || user.email}</span>
              </div>
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
                className="px-7 py-1.5 bg-amber-500 text-white rounded-4xl hover:bg-gray-800"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="text-black hover:text-gray-600"
              >
                Sign Up
              </Link>
            </>
          )}
          <button
            className="p-2 text-black transition-colors cursor-pointer"
            onClick={() => console.log('Shopping Bag Clicked!')}
          >
            <FontAwesomeIcon icon={faShoppingBag} size="lg" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
