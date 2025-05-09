import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import Rimage from '../../images/freepik__upload__41561.png';

const SignUp = () => {
  const navigate = useNavigate();

  // State for form fields
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Enhanced validation
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!form.name || !form.email || !form.password) {
      setError('Please fill all required fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Password strength validation
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      // Send POST request to backend
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed');
      } else {
        // Registration successful, redirect to sign in
        navigate('/signin');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Server error, please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-black">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 p-8 md:p-12">
        <Link to="/" className="font-['Terano'] text-xl">
          POTENCY.
        </Link>

        <div className="mt-15 max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-8">Sign Up</h1>

          {/* Error Message */}
          {error && (
            <div className="mb-4 text-red-600 bg-red-100 border border-red-300 p-2 rounded">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Complete Name */}
            <div>
              <label className="block text-sm mb-2">Full Name</label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faUser} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="w-full pl-10 py-3 border border-gray-300 rounded-none focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm mb-2">Email Address</label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faEnvelope} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full pl-10 py-3 border border-gray-300 rounded-none focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm mb-2">Password</label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faLock} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password (min 6 characters)"
                  className="w-full pl-10 py-3 border border-gray-300 rounded-none focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm mb-2">Confirm Password</label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faLock} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full pl-10 py-3 border border-gray-300 rounded-none focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-amber-500 text-white py-3 hover:bg-gray-900 transition-colors disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create My Account"}
            </button>
          </form>

          {/* Redirect to Sign In */}
          <p className="text-center text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/signin" className="text-black hover:underline font-bold">
              sign in here
            </Link>
          </p>
          {/* Go Back Button */}
          <p className="text-center mt-2">
            <Link to="/" className="text-gray-700">
              Back to Home
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Placeholder Image */}
      <div 
        className="hidden md:block w-1/2 bg-cover bg-center" 
        style={{
          backgroundImage: `url(${Rimage})`,
          backgroundPosition: 'center'
        }}
      ></div>
    </div>
  );
};

export default SignUp;
