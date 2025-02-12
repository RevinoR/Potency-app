import { Link } from 'react-router-dom';
// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import Rimage from '../../images/freepik__upload__41561.png';

const SignUp = () => {
  return (
    <div className="min-h-screen flex text-black">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 p-8 md:p-12">
        <Link to="/" className="font-['Terano'] text-xl">
          POTENCY.
        </Link>

        <div className="mt-15 max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-8">Sign Up</h1>

          <form className="space-y-4">
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
                  placeholder="Write your correct input here"
                  className="w-full pl-10 py-3 border border-gray-300 rounded-none focus:outline-none"
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
                  placeholder="Write your correct input here"
                  className="w-full pl-10 py-3 border border-gray-300 rounded-none focus:outline-none"
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
                  placeholder="Write your correct input here"
                  className="w-full pl-10 py-3 border border-gray-300 rounded-none focus:outline-none"
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
                  placeholder="Write your correct input here"
                  className="w-full pl-10 py-3 border border-gray-300 rounded-none focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-amber-500 text-white py-3 hover:bg-gray-900 transition-colors"
            >
              Create My Account
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
