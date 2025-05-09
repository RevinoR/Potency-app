import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import Rimage from '../../images/freepik__upload__55187.png';

const SignIn = () => {
  const navigate = useNavigate();
  
  // State for form fields
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Handle input changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.email || !form.password) {
      setError('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      // Send POST request to backend
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Login failed');
      } else {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect based on role
        if (data.user.role === 'admin') {
          navigate('/admin/products');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      setError('Server error, please try again later.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="w-full md:w-1/2 p-8 md:p-12 text-black">
        <Link to="/" className="font-['Terano'] text-xl">
          POTENCY.
        </Link>

        <div className="mt-20 max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-8">Sign In</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  placeholder="E-Mail"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 py-3 border border-gray-300 rounded-none focus:outline-none"
                />
              </div>
            </div>

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
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 py-3 border border-gray-300 rounded-none focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 text-white py-3 hover:bg-gray-900 disabled:bg-gray-400"
            >
              {loading ? 'Signing In...' : 'Sign In to my Account'}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-gray-700 font-bold hover:underline">
              click here
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

      {/* Right Side */}
      <div 
        className="hidden md:block w-1/2 bg-cover bg-center" 
        style={{
          backgroundImage: `url(${Rimage})`
        }}
      ></div>
    </div>
  );
};

export default SignIn;
