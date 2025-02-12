import { Link } from 'react-router-dom';
// Import Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import Rimage from '../../images/freepik__upload__55187.png';

const SignIn = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="w-full md:w-1/2 p-8 md:p-12 text-black">
        <Link to="/" className="font-['Terano'] text-xl">
          POTENCY.
        </Link>

        <div className="mt-20 max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-8">Sign In</h1>

          <form className="space-y-6">
            <div>
              <label className="block text-sm mb-2">Email Address</label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faEnvelope} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  placeholder="E-Mail"
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
                  placeholder="Password"
                  className="w-full pl-10 py-3 border border-gray-300 rounded-none focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 text-white py-3 hover:bg-gray-900"
            >
              Sign In to my Account
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
