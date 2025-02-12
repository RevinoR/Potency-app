import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-['Terano'] text-xl text-black">
          POTENCY.
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-black">
          <Link
            to="/"
            className={`transition-colors duration-300 ${
              location.pathname === '/' ? 'text-orange-500' : 'hover:text-gray-600'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/products" 
            className={`transition-colors duration-300 ${
              location.pathname === '/products' ? 'text-orange-500' : 'hover:text-gray-600'
            }`}
          >
            Products
          </Link>
          <Link
            to="/about"
            className={`transition-colors duration-300 ${
              location.pathname === '/about' ? 'text-orange-500' : 'hover:text-gray-600'
            }`}
          >
            About us
          </Link>
          
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {/* Use Link for navigation */}
          <Link
            to="/signin"
            className="px-7 py-1.5 bg-amber-500 text-white rounded-4xl hover:bg-gray-800"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="text-black"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
