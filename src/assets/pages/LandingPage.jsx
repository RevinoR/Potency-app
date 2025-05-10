import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingBag,
  faArrowRight,
  faStar,
  faChevronRight,
  faBicycle, // For bicycles
  faTshirt, // For clothing
  faHeadSideMask, // For accessories/helmets
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

// Import images with improved naming
import heroBackgroundImage from "../../images/Group 3.png";
import evolutionBackgroundImage from "../../images/image.png";
import reimaginedBikeImage from "../../images/close-up-bicycle-outdoors.png";
import brandIconImage from "../../images/game-icons_new-born.png";

// Lazy load components for better performance
const ProductCard = lazy(() => import("../components/ProductCard"));

// Fallback products if API fails
const fallbackProducts = [
  {
    product_id: 1,
    name: "Carbon Racing Bike",
    subtitle: "Professional Grade Racing Bicycle",
    price: 12500000,
    stock: 5,
    sold: 12,
    type: "bicycle",
    description:
      "High-performance carbon frame racing bicycle for professional cyclists.",
  },
  {
    product_id: 2,
    name: "Premium Cycling Jersey",
    subtitle: "Moisture-wicking Performance Fabric",
    price: 1250000,
    stock: 25,
    sold: 47,
    type: "clothing",
    description: "Premium cycling jersey with advanced moisture management.",
  },
  {
    product_id: 3,
    name: "Aero Cycling Helmet",
    subtitle: "Lightweight & Impact Resistant",
    price: 2750000,
    stock: 8,
    sold: 19,
    type: "accessory",
    description: "Aerodynamic cycling helmet with superior ventilation.",
  },
];

// Fallback product icons based on type
const getProductIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "bicycle":
      return faBicycle;
    case "clothing":
      return faTshirt;
    case "accessory":
      return faHeadSideMask;
    default:
      return faShoppingBag;
  }
};

const LandingPage = ({ onCartClick }) => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Sample testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Professional Cyclist",
      quote:
        "The quality and performance of Potency bikes has completely transformed my training. I've never felt more confident on the road.",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "Weekend Warrior",
      quote:
        "As someone who cycles on weekends, I was looking for something reliable without breaking the bank. Potency delivered exactly what I needed.",
      rating: 5,
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      title: "Cycling Enthusiast",
      quote:
        "From customer service to product quality, my experience with Potency has been nothing short of excellent. Highly recommended!",
      rating: 4,
    },
  ];

  // Format number as currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Updated useEffect to prevent infinite loop
  useEffect(() => {
    // Declare fetchFeaturedProducts outside to prevent recreation on each render
    const fetchFeaturedProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get latest 3 products
        const response = await axios.get("/api/products?limit=3", {
          timeout: 5000, // 5 second timeout
        });

        if (response.data?.success) {
          // Check if there is actual data
          if (response.data.data && response.data.data.length > 0) {
            setFeaturedProducts(response.data.data);
          } else {
            // Use fallback products if API returned empty data array
            console.log("API returned empty data, using fallbacks");
            setFeaturedProducts(fallbackProducts);
          }
        } else {
          // Use fallback products if API doesn't return success
          console.log("API request not successful, using fallbacks");
          setFeaturedProducts(fallbackProducts);
        }
      } catch (err) {
        console.error("Error fetching featured products:", err);

        // Use fallback products on error
        setFeaturedProducts(fallbackProducts);

        // Only set error if it's not a timeout and we've already retried
        if (!axios.isCancel(err) && retryCount >= 1) {
          setError(
            "We're having trouble connecting to the server. Showing fallback products."
          );
        }
      } finally {
        setIsLoading(false);
        // Reset retryCount to prevent further automatic retries
        setRetryCount(0);
      }
    };

    // Only fetch on first load or when manual retry is triggered
    if (retryCount === 0 || retryCount === 1) {
      fetchFeaturedProducts();
    }

    // Auto-rotate testimonials (separate from product fetching)
    const testimonialInterval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);

    return () => clearInterval(testimonialInterval);
  }, [retryCount]); // Only depend on retryCount

  // Add a manual retry button function
  const handleRetryFetch = () => {
    setRetryCount(1); // Trigger a retry
  };

  // Handle add to cart
  const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/signin", { state: { returnUrl: "/" } });
        return;
      }

      // Show loading state or feedback during API call
      const targetProduct = featuredProducts.find(
        (p) => p.product_id === productId
      );
      if (targetProduct) {
        // Create a temporary updated state to show immediate feedback
        setFeaturedProducts((prev) =>
          prev.map((p) =>
            p.product_id === productId ? { ...p, isAddingToCart: true } : p
          )
        );
      }

      await axios.post(
        "/api/cart",
        {
          productId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000, // 5 second timeout
        }
      );

      // Reset loading state
      setFeaturedProducts((prev) =>
        prev.map((p) =>
          p.product_id === productId
            ? { ...p, isAddingToCart: false, addedToCart: true }
            : p
        )
      );

      // Show cart after adding product
      if (onCartClick) {
        setTimeout(() => {
          onCartClick();
        }, 300); // Small delay for better UX
      }
    } catch (error) {
      console.error("Error adding to cart:", error);

      // Reset loading state
      setFeaturedProducts((prev) =>
        prev.map((p) => ({ ...p, isAddingToCart: false }))
      );

      if (error.response?.status === 401) {
        navigate("/signin", { state: { returnUrl: "/" } });
      }
    }
  };

  // Render rating stars
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FontAwesomeIcon
        key={i}
        icon={faStar}
        className={i < rating ? "text-amber-500" : "text-gray-300"}
      />
    ));
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <motion.section
        className="relative min-h-[100vh] flex flex-col justify-center px-6 md:px-12 py-20 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div
          className="absolute w-full h-full y- -z-10"
          style={{
            backgroundImage: `linear-gradient(to right, 
            #FCF9F4 0%, 
            #FCF9F4 20%, 
            transparent 35%
            ), url(${heroBackgroundImage})`,
            backgroundPosition: "right center",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            opacity: "1",
          }}
        />
        <div className="relative z-10 w-full">
          <motion.h1
            className="text-5xl sm:text-[9.8vw] font-bold text-black mb-12 leading-none tracking-wide"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            MOMENTUM RIDE.
          </motion.h1>
          <motion.div
            className="max-w-md"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <p className="text-gray-600 mb-8 text-base md:text-lg">
              Experience the ultimate cycling journey with our premium bikes
              designed for performance, comfort, and style. Elevate your ride
              today.
            </p>
            <div className="flex gap-4">
              <Link
                to="/products"
                className="bg-amber-500 text-white px-8 py-3 hover:bg-gray-800 transition-colors duration-300 flex items-center gap-2 group"
              >
                VIEW PRODUCTS
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="transform group-hover:translate-x-1 transition-transform duration-300"
                />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{
            opacity: { delay: 1.2, duration: 0.5 },
            y: { repeat: Infinity, duration: 1.5 },
          }}
        >
          <div className="w-0.5 h-10 bg-gray-300 mb-2"></div>
          <span className="text-xs">SCROLL</span>
        </motion.div>
      </motion.section>

      {/* Evolution Section */}
      <section className="relative min-h-[110vh] flex items-center text-white px-6 md:px-12">
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-full -z-10"
          style={{
            backgroundImage: `url(${evolutionBackgroundImage})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            filter: "brightness(0.7)",
          }}
        />
        <div className="w-full py-20">
          <div className="max-w-[90%] md:max-w-[85%] mx-auto">
            <motion.h2
              className="text-4xl md:text-6xl font-bold mb-8 max-w-3xl tracking-wide"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              THE NEXT EVOLUTION IN ROAD BIKING EXPERIENCE
            </motion.h2>

            <motion.p
              className="max-w-xl mb-20 text-gray-400 text-base md:text-lg leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              We've reimagined every component of the cycling experience to
              create bikes that respond intuitively to your movements, withstand
              the elements, and turn heads with sleek design elements that speak
              to your distinctive style.
            </motion.p>

            <motion.div
              className="flex flex-wrap items-start gap-8 md:gap-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div>
                <h3 className="text-5xl md:text-6xl font-bold mb-1">500K+</h3>
                <p className="text-gray-400 text-sm leading-tight">
                  Customers
                  <br />
                  Worldwide
                </p>
              </div>

              <div className="hidden md:block h-16 w-[1px] bg-gray-600 self-center"></div>

              <div>
                <h3 className="text-5xl md:text-6xl font-bold mb-1">20+</h3>
                <p className="text-gray-400 text-sm leading-tight">
                  Support
                  <br />
                  Partners
                </p>
              </div>

              <div className="hidden md:block h-16 w-[1px] bg-gray-600 self-center"></div>

              <div>
                <h3 className="text-5xl md:text-6xl font-bold mb-1">4.9</h3>
                <p className="text-gray-400 text-sm leading-tight">
                  Average
                  <br />
                  Rating
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="px-6 md:px-4 py-20 bg-white">
        <div className="max-w-[90%] md:max-w-[80%] mx-auto">
          <div className="flex justify-between items-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-black tracking-tight"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              OUR MOST BELOVED PRODUCTS
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                to="/products"
                className="hidden md:flex items-center text-black hover:text-amber-500 transition-colors"
              >
                View all products
                <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
              </Link>
            </motion.div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {[1, 2, 3].map((_, index) => (
                <div
                  key={index}
                  className="bg-gray-100 animate-pulse rounded-lg overflow-hidden"
                >
                  <div className="aspect-square mb-6"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 mb-3 w-3/4 rounded"></div>
                    <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
                    <div className="h-4 bg-gray-200 w-1/4 mt-4 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div>
              <div className="text-center text-orange-500 py-6 mb-8 bg-orange-50 border border-orange-200 rounded-lg">
                {error}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                {featuredProducts.map((product, index) => (
                  <ProductItem
                    key={product.product_id}
                    product={product}
                    index={index}
                    handleAddToCart={handleAddToCart}
                    formatCurrency={formatCurrency}
                    getProductIcon={getProductIcon}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              <Suspense
                fallback={
                  <div className="col-span-3 text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                  </div>
                }
              >
                {featuredProducts.length > 0
                  ? featuredProducts.map((product, index) => (
                      <ProductItem
                        key={product.product_id}
                        product={product}
                        index={index}
                        handleAddToCart={handleAddToCart}
                        formatCurrency={formatCurrency}
                        getProductIcon={getProductIcon}
                      />
                    ))
                  : // Fallback content if no products are available
                    fallbackProducts.map((product, index) => (
                      <ProductItem
                        key={product.product_id}
                        product={product}
                        index={index}
                        handleAddToCart={handleAddToCart}
                        formatCurrency={formatCurrency}
                        getProductIcon={getProductIcon}
                        isFallback={true}
                      />
                    ))}
              </Suspense>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-block md:hidden px-8 py-3 bg-black text-white hover:bg-gray-800 transition-colors"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <motion.section
        className="px-6 md:px-12 py-20 bg-gray-50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-[90%] md:max-w-[80%] mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-black">
            WHAT OUR CUSTOMERS ARE SAYING
          </h2>

          <div className="max-w-3xl mx-auto relative">
            {/* Testimonial Slider */}
            <div className="overflow-hidden">
              <div
                className="transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${activeTestimonial * 100}%)`,
                }}
              >
                <div className="flex">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={testimonial.id}
                      className="w-full flex-shrink-0 px-4"
                    >
                      <div className="bg-white p-8 md:p-12 shadow-sm rounded-lg text-center">
                        <div className="flex justify-center mb-4">
                          {renderStars(testimonial.rating)}
                        </div>
                        <blockquote className="text-gray-700 text-lg md:text-xl italic mb-6">
                          "{testimonial.quote}"
                        </blockquote>
                        <div className="w-12 h-1 bg-amber-500 mx-auto mb-4"></div>
                        <p className="font-bold">{testimonial.name}</p>
                        <p className="text-gray-500 text-sm">
                          {testimonial.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 mx-1 rounded-full ${
                    index === activeTestimonial ? "bg-amber-500" : "bg-gray-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Reimagined Section */}
      <section className="relative min-h-screen flex items-start text-white px-6 md:px-12 py-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 w-full h-full -z-10"
          style={{
            backgroundImage: `url(${reimaginedBikeImage})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            filter: "brightness(0.7)",
          }}
        />

        <div className="w-full max-w-[90%] md:max-w-[85%] mx-auto">
          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-8"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            A REIMAGINED FORM
          </motion.h2>

          <motion.p
            className="max-w-xl mb-20 text-gray-300 text-base md:text-lg leading-relaxed"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We've redefined cycling through meticulous design, advanced
            materials, and a passion for performance. Every curve, joint, and
            component is engineered for the perfect balance of speed, comfort,
            and durability.
          </motion.p>

          <motion.div
            className="flex flex-col gap-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3 className="text-2xl md:text-3xl font-bold tracking-wider">
              ESTABLISHED SINCE
            </h3>

            <div className="flex items-start gap-4">
              <div className="flex flex-col">
                <span className="text-4xl md:text-5xl font-light leading-none">
                  20
                </span>
                <span className="text-4xl md:text-5xl font-light leading-none">
                  21
                </span>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <img
                  src={brandIconImage}
                  alt="Brand Icon"
                  className="w-16 h-16 object-contain"
                />
                <div className="flex flex-col text-1xl font-light md:text-3xl">
                  <span>delivering excellence</span>
                  <span>in cycling</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="px-6 md:px-12 py-24 bg-black text-white">
        <div className="max-w-[90%] md:max-w-[80%] mx-auto text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            JOIN OUR COMMUNITY
          </motion.h2>

          <motion.p
            className="text-gray-400 max-w-xl mx-auto mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Sign up for our newsletter to receive exclusive offers, cycling
            tips, and be the first to know about new product releases.
          </motion.p>

          <motion.form
            className="max-w-md mx-auto flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-grow px-4 py-3 bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-amber-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white transition-colors"
            >
              Subscribe
            </button>
          </motion.form>
        </div>
      </section>

      {/* Supplier/Partners Section */}
      <section className="px-6 md:px-12 py-20">
        <div className="max-w-[90%] md:max-w-[80%] mx-auto">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-8 text-black">
            Our Partners
          </h2>
          <p className="text-center text-gray-600 mb-16 text-base md:text-lg">
            We collaborate with the best in the industry to bring you premium
            cycling products.
          </p>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
          >
            {[...Array(8)].map((_, index) => (
              <motion.div
                key={index}
                className="aspect-square bg-gray-100 flex items-center justify-center transition-transform duration-300 hover:scale-95 hover:shadow-md"
                whileHover={{ y: -5 }}
              >
                <span className="text-gray-400 text-lg font-light">
                  Partner {index + 1}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section - updated to match site vibe with black background */}
      <section className="px-6 md:px-12 py-24 bg-black text-white text-center">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Ride?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Experience the difference with Potency cycling products.
          </p>
          <Link
            to="/products"
            className="inline-block px-8 py-4 bg-amber-500 text-white text-lg hover:bg-amber-600 transition-colors"
          >
            Shop Now
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

// Separate component for product items to improve readability
const ProductItem = ({
  product,
  index,
  handleAddToCart,
  formatCurrency,
  getProductIcon,
  isFallback = false,
}) => {
  return (
    <motion.div
      key={product.product_id}
      className="group cursor-pointer text-black bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="aspect-square overflow-hidden relative">
        {product.image ? (
          <img
            src={`data:image/jpeg;base64,${product.image}`}
            alt={product.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <FontAwesomeIcon
              icon={getProductIcon(product.type)}
              className="text-gray-400 text-4xl"
            />
          </div>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!product.isAddingToCart) {
              handleAddToCart(product.product_id);
            }
          }}
          disabled={product.isAddingToCart}
          className={`absolute bottom-4 right-4 ${
            product.addedToCart
              ? "bg-green-500"
              : product.isAddingToCart
              ? "bg-gray-400"
              : "bg-black"
          } text-white p-3 rounded-full transform transition-all duration-300 ${
            product.isAddingToCart
              ? "opacity-70"
              : "opacity-0 group-hover:opacity-100 hover:scale-110"
          }`}
          aria-label="Add to cart"
        >
          {product.isAddingToCart ? (
            <span className="animate-spin inline-block h-5 w-5 border-t-2 border-white rounded-full"></span>
          ) : product.addedToCart ? (
            <span className="text-xs">Added</span>
          ) : (
            <FontAwesomeIcon icon={faShoppingBag} />
          )}
        </button>
      </div>
      <div className="p-6">
        <h3 className="font-bold mb-2 text-lg md:text-xl">{product.name}</h3>
        <p className="text-gray-600 text-sm md:text-base mb-3">
          {product.subtitle || "Premium quality product"}
        </p>
        <div className="flex justify-between items-center">
          <span className="font-medium text-lg">
            {formatCurrency(product.price)}
          </span>
          <Link
            to={`/products`}
            className="text-amber-500 hover:text-amber-600"
          >
            View Details
          </Link>
        </div>
        {isFallback && (
          <div className="mt-2 text-xs text-gray-400">Fallback product</div>
        )}
      </div>
    </motion.div>
  );
};

export default LandingPage;
