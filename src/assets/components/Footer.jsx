// components/Footer.jsx
const Footer = () => {
    return (
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-6">
          {/* Upper Footer */}
          <div className="mb-8">
            <h3 className="font-['Terano'] text-lg mb-2">Potency.</h3>
            <p className="text-sm text-gray-400 max-w-md">
              Lorem ipsum dolor amet, consectetur adipiscing elit.
            </p>
            <button className="mt-4 border border-white px-6 py-2 text-sm hover:bg-white hover:text-black">
              Contact us
            </button>
          </div>
  
          {/* Social Links */}
          <div className="flex gap-6 mb-8">
            <a href="#" className="hover:text-gray-400"><i className="fab fa-facebook"></i></a>
            <a href="#" className="hover:text-gray-400"><i className="fab fa-instagram"></i></a>
            <a href="#" className="hover:text-gray-400"><i className="fab fa-youtube"></i></a>
          </div>
  
          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-3xl">POTENCY BIKE.</h2>
              <p className="text-sm text-gray-400">© 2025 Revino Redison</p>
            </div>
          </div>
        </div>
      </footer>
    )
  }

export default Footer;