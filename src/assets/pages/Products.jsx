import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faSearch,
  faShoppingBag,
  faExclamationTriangle,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import groupie from "../../images/freepik__adjust__77620.png";

const ProductsPage = () => {
  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  // State for products and UI
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [addingToCart, setAddingToCart] = useState(null);
  const [responseDebug, setResponseDebug] = useState(null);

  // Fetch products from API with better error handling
  useEffect(() => {
    // Set mounted flag
    isMountedRef.current = true;

    const fetchProducts = async () => {
      try {
        if (isMountedRef.current) {
          setLoading(true);
          setError(null);
        }

        console.log("Fetching products...");
        const response = await axios.get("/api/products?limit=20");
        console.log("API Response:", response);

        if (isMountedRef.current) {
          // Store response data for debugging if needed
          setResponseDebug(response.data);

          // Handle different API response structures
          let productData = [];

          if (
            response.data &&
            response.data.success &&
            Array.isArray(response.data.data)
          ) {
            // Standard format with success flag and data array
            productData = response.data.data;
            console.log(
              `Loaded ${productData.length} products from data array`
            );
          } else if (response.data && Array.isArray(response.data)) {
            // Direct array response
            productData = response.data;
            console.log(
              `Loaded ${productData.length} products from direct array`
            );
          } else if (response.data && response.data.data) {
            // Try to handle non-array data
            const dataValue = response.data.data;
            if (typeof dataValue === "object" && !Array.isArray(dataValue)) {
              // Handle object with product properties (convert to array)
              productData = Object.values(dataValue);
              console.log(
                `Loaded ${productData.length} products from object values`
              );
            }
          }

          // Check for empty products array
          if (productData.length === 0) {
            console.warn("API returned empty products array");
            setError("No products available at this time");
          }

          // Filter out any invalid products (must have at least id, name, and price)
          const validProducts = productData.filter(
            (product) =>
              product &&
              (product.product_id || product.id) &&
              product.name &&
              (product.price || product.price === 0)
          );

          // Log if any invalid products were filtered out
          if (validProducts.length < productData.length) {
            console.warn(
              `Filtered out ${
                productData.length - validProducts.length
              } invalid products`
            );
          }

          // Set products state
          setProducts(validProducts);

          // Extract unique categories
          const uniqueCategories = [
            ...new Set(
              validProducts.map((product) => product.type).filter(Boolean)
            ),
          ]; // Remove any undefined/null values

          setCategories(uniqueCategories);

          // If no products, set appropriate error
          if (validProducts.length === 0 && productData.length > 0) {
            setError("Products data is invalid. Please try again later.");
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        if (isMountedRef.current) {
          setError("Error loading products. Please try again later.");
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    // Cleanup
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Format number as currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filter products based on category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.type === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.subtitle &&
        product.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Handle add to cart
  const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/signin", { state: { returnUrl: "/products" } });
        return;
      }

      setAddingToCart(productId);

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
        }
      );

      // Update the UI to show success feedback
      const productsCopy = [...products];
      const productIndex = productsCopy.findIndex(
        (p) => p.product_id === productId
      );
      if (productIndex !== -1) {
        productsCopy[productIndex].addedToCart = true;
        setProducts(productsCopy);
      }

      setTimeout(() => {
        const updatedProducts = [...products];
        const index = updatedProducts.findIndex(
          (p) => p.product_id === productId
        );
        if (index !== -1) {
          updatedProducts[index].addedToCart = false;
          setProducts(updatedProducts);
        }
      }, 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Failed to add product to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  // Handle retry fetching products
  const handleRetry = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get("/api/products?limit=20");
      console.log("Retry API Response:", response);

      if (response.data?.success && Array.isArray(response.data?.data)) {
        setProducts(response.data.data);

        const uniqueCategories = [
          ...new Set(
            response.data.data.map((product) => product.type).filter(Boolean)
          ),
        ];
        setCategories(uniqueCategories);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);

        const uniqueCategories = [
          ...new Set(
            response.data.map((product) => product.type).filter(Boolean)
          ),
        ];
        setCategories(uniqueCategories);
      } else {
        setError("Failed to load products");
      }
    } catch (err) {
      console.error("Error retrying product fetch:", err);
      setError("Error loading products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Display API debugging information (only in development)
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV !== "production" && responseDebug) {
      return (
        <div className="mt-4 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-40">
          <h4 className="font-bold mb-2">API Response (Debug):</h4>
          <pre>{JSON.stringify(responseDebug, null, 2)}</pre>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Updated with new image path */}
      <section className="relative h-[60vh] flex flex-col justify-center items-center px-6 md:px-12">
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center -z-10"
          style={{
            backgroundImage: `url(${groupie})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay",
            filter: "brightness(0.3)",
          }}
        >
          <div className="text-center uppercase text-white z-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explore Our Collection
            </h1>
            <p className="text-xl md:text-2xl">Premium Bikes & Cycling Gear</p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-12">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
          <div className="w-full sm:w-auto flex items-center text-black">
            <FontAwesomeIcon icon={faFilter} className="mr-3 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto border-gray-300 border rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64 md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full border-gray-300 border rounded-md py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* Loading and Error States */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4">
            <div className="flex items-center mb-2">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
              <p className="font-semibold">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="mt-2 flex items-center bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded"
            >
              <FontAwesomeIcon icon={faSync} className="mr-2" />
              Retry Loading Products
            </button>
            {renderDebugInfo()}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              No products found. Try adjusting your filters.
            </p>
            {products.length > 0 && (
              <p className="text-gray-500 text-sm mt-2">
                ({products.length} products available in other categories)
              </p>
            )}
            {renderDebugInfo()}
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.product_id || product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-56 sm:h-64 md:h-72 bg-gray-200 overflow-hidden">
                  {product.image ? (
                    <img
                      src={
                        typeof product.image === "string" &&
                        product.image.startsWith("data:")
                          ? product.image
                          : `data:image/jpeg;base64,${product.image}`
                      }
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/300x300?text=Product+Image";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FontAwesomeIcon icon={faShoppingBag} size="3x" />
                    </div>
                  )}
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  {product.subtitle && (
                    <p className="text-gray-600 mb-2 text-sm">
                      {product.subtitle}
                    </p>
                  )}
                  <p className="text-amber-600 text-lg font-bold mb-4">
                    {formatCurrency(product.price)}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {product.type &&
                        product.type.charAt(0).toUpperCase() +
                          product.type.slice(1)}
                    </span>
                    <button
                      onClick={() =>
                        handleAddToCart(product.product_id || product.id)
                      }
                      disabled={
                        addingToCart === (product.product_id || product.id)
                      }
                      className={`${
                        product.addedToCart
                          ? "bg-green-500"
                          : "bg-amber-500 hover:bg-amber-600"
                      } text-white rounded-full p-2 md:p-3 transition-colors focus:outline-none`}
                    >
                      {addingToCart === (product.product_id || product.id) ? (
                        <span className="block h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                      ) : product.addedToCart ? (
                        <span className="text-xs px-1">Added!</span>
                      ) : (
                        <FontAwesomeIcon icon={faShoppingBag} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
