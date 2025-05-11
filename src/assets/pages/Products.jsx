import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faSearch,
  faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import heroImage from "../../images/Group 3.png";

const ProductsPage = () => {
  const navigate = useNavigate();

  // State for products and UI
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [addingToCart, setAddingToCart] = useState(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get("/api/products?limit=20");

        if (response.data.success) {
          const productData = response.data.data || [];
          setProducts(productData);

          // Extract unique categories
          const uniqueCategories = [
            ...new Set(productData.map((product) => product.type)),
          ];
          setCategories(uniqueCategories);
        } else {
          setError("Failed to load products");
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Error loading products. Please try again later.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex flex-col justify-center items-center px-6 md:px-12">
        <div
          className="absolute inset-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay",
          }}
        >
          <div className="text-center text-white z-10">
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
          <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              No products found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.product_id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-56 sm:h-64 md:h-72 bg-gray-200 overflow-hidden">
                  {product.image ? (
                    <img
                      src={`data:image/jpeg;base64,${product.image}`}
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
                      onClick={() => handleAddToCart(product.product_id)}
                      disabled={addingToCart === product.product_id}
                      className={`${
                        product.addedToCart
                          ? "bg-green-500"
                          : "bg-amber-500 hover:bg-amber-600"
                      } text-white rounded-full p-2 md:p-3 transition-colors focus:outline-none`}
                    >
                      {addingToCart === product.product_id ? (
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
