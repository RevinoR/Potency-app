import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const NavbarAdmin = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Get user info from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    setUser(storedUser ? JSON.parse(storedUser) : null);

    // Listen for login/logout changes in other tabs
    const handleStorage = () => {
      const updatedUser = localStorage.getItem('user');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-4 transition-all duration-300 bg-white/75 backdrop-blur-md">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-['Terano'] text-xl text-black">
          POTENCY. admin
        </Link>

        {/* User Info and Logout */}
        <div className="flex items-center gap-4">
          {user && (
            <>
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
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarAdmin;
