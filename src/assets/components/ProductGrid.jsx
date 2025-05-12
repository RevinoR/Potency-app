import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductCard from "./ProductCard.jsx";
import Pagination from "./Pagination.jsx";
import AddProductModal from "./AddProductModal.jsx";

const PRODUCTS_PER_PAGE = 8;
const MAX_RETRIES = 1; // Limit retries to prevent flooding the server

const ProductGrid = ({ onSelect, refreshKey }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const retryCountRef = useRef(0);
  const apiFailedRef = useRef(false);

  // Mock products for when API fails
  const mockProducts = [
    {
      product_id: "mock1",
      name: "Sample Product",
      subtitle: "API is currently unavailable",
      price: 0,
      stock: 0,
      image: null,
    },
  ];

  // Fetch products with proper error handling and fallback
  const fetchProducts = useCallback(async () => {
    // Don't fetch if already fetching or if we've hit retry limit on failed API
    if (
      isFetching ||
      (apiFailedRef.current && retryCountRef.current >= MAX_RETRIES)
    )
      return;

    try {
      setIsFetching(true);
      setLoading(true);

      // Get token for API call
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      console.log(
        `Attempting to fetch products: page ${currentPage}, limit ${PRODUCTS_PER_PAGE}`
      );

      // Make API call with proper URL and parameters
      const response = await axios.get(`/api/products`, {
        params: {
          page: currentPage,
          limit: PRODUCTS_PER_PAGE,
        },
        headers,
        timeout: 5000, // Set a timeout to prevent hanging requests
      });

      console.log("Product API Response:", response.data);

      // Reset API failure flag if successful
      apiFailedRef.current = false;
      retryCountRef.current = 0;

      // Extract product data safely
      let productData = [];

      if (response.data && response.data.data) {
        productData = Array.isArray(response.data.data)
          ? response.data.data
          : [];
      } else if (Array.isArray(response.data)) {
        productData = response.data;
      } else if (response.data && typeof response.data === "object") {
        // Single product object
        productData = [response.data];
      }

      // Set products and handle pagination
      setProducts(productData);
      setError(null);

      // Set pagination if available
      if (response.data && response.data.pagination) {
        setTotalPages(response.data.pagination.pages || 1);
      } else {
        setTotalPages(Math.ceil(productData.length / PRODUCTS_PER_PAGE) || 1);
      }

      // Select first product if available and no product is currently selected
      if (productData.length > 0 && !selectedId) {
        setSelectedId(productData[0].product_id);
        onSelect(productData[0]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);

      // Track API failures
      apiFailedRef.current = true;
      retryCountRef.current += 1;

      // Format error message
      let errorMessage = "Failed to load products from the server.";

      if (error.response) {
        // Server responded with an error
        errorMessage = `Server error (${error.response.status}): ${
          error.response.data?.message || "Unknown error"
        }`;
      } else if (error.request) {
        // No response from server
        errorMessage =
          "Could not connect to the server. Please check your connection.";
      }

      setError(errorMessage);

      // If we've hit retry limit, show mock products as fallback
      if (retryCountRef.current >= MAX_RETRIES) {
        console.log("Using mock products as fallback after API failure");
        setProducts(mockProducts);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [currentPage, onSelect, selectedId]);

  // Only fetch on mount, page change, or deliberate refresh
  useEffect(() => {
    // Reset retry count on intentional refreshes
    if (refreshKey) {
      retryCountRef.current = 0;
      apiFailedRef.current = false;
    }

    fetchProducts();

    // Cleanup function to handle component unmount
    return () => {
      // Any cleanup needed
    };
  }, [fetchProducts, refreshKey]);

  // Handle product click
  const handleProductClick = useCallback(
    (productId) => {
      setSelectedId(productId);
      const selectedProduct = products.find((p) => p.product_id === productId);
      if (selectedProduct) {
        onSelect(selectedProduct);
      }
    },
    [products, onSelect]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage !== currentPage) {
        // Reset API failure tracking on manual page change
        retryCountRef.current = 0;
        apiFailedRef.current = false;

        setCurrentPage(newPage);
        // Scroll to top on page change
        window.scrollTo(0, 0);
      }
    },
    [currentPage]
  );

  // Handle forced refresh
  const handleForceRefresh = useCallback(() => {
    // Reset failure tracking
    retryCountRef.current = 0;
    apiFailedRef.current = false;

    // Show toast for refresh attempt
    toast.info("Refreshing products...");

    // Fetch products
    fetchProducts();
  }, [fetchProducts]);

  // Add the handleAddProduct function with toast notifications
  const handleAddProduct = useCallback(
    async (productData) => {
      try {
        const formData = new FormData();

        // Map fields to match database schema
        formData.append("name", productData.name || productData.title);
        formData.append("price", productData.price);
        formData.append("type", productData.type || "general");
        formData.append("stock", productData.stock);
        formData.append("subtitle", productData.subtitle || "");
        formData.append("description", productData.description || "");

        // Handle image file
        if (productData.image instanceof File) {
          formData.append("image", productData.image);
        }

        // Get token for API call
        const token = localStorage.getItem("token");

        const response = await axios.post("/api/products", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Product added:", response.data);

        // Toast success notification
        toast.success("Product added successfully!");

        // Close modal is now handled in the modal component

        // Refresh product list - go to first page
        setCurrentPage(1);

        // Reset failure tracking on successful add
        retryCountRef.current = 0;
        apiFailedRef.current = false;

        // Force refresh products
        fetchProducts();

        // If we have data and a newly created product, select it
        if (response.data && response.data.data) {
          setSelectedId(response.data.data.product_id);
          onSelect(response.data.data);
        }

        // Return true to indicate success to the modal
        return true;
      } catch (error) {
        console.error("Product submission error:", error);

        let errorMessage = "Failed to add product";

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        // Display error in toast
        toast.error(errorMessage);

        // Set error state
        setError(errorMessage);

        // Return false to indicate failure to the modal
        return false;
      }
    },
    [fetchProducts, onSelect]
  );

  // Loading state with skeleton UI
  if (loading) {
    return (
      <div className="px-4 md:px-0">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-bold text-lg text-black">Products</h1>
          <button className="border text-black border-gray-400 px-4 py-1 text-sm flex items-center gap-1">
            Add new product <span className="text-lg">+</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array(6)
            .fill()
            .map((_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 animate-pulse"
              >
                <div className="bg-gray-200 aspect-square"></div>
                <div className="p-2 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="flex justify-between">
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-0 text-black">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-bold text-lg text-black">Products</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="border border-gray-400 px-4 py-1 text-sm flex items-center gap-1 hover:bg-gray-50 text-black"
        >
          Add new product <span className="text-lg">+</span>
        </button>
      </div>

      {/* Error message banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
          <div className="flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 mt-0.5 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium text-red-700">{error}</p>
              <p className="text-sm mt-1 text-red-600">
                There may be an issue with the server. You can still add
                products.
              </p>
            </div>
          </div>
          <button
            onClick={handleForceRefresh}
            className="mt-3 bg-red-700 text-white px-4 py-2 rounded text-sm hover:bg-red-800"
          >
            Try Again
          </button>
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-white border border-gray-200 p-6 text-center text-gray-500">
          No products found. Add a new product to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              isSelected={selectedId === product.product_id}
              onClick={handleProductClick}
            />
          ))}
        </div>
      )}

      {products.length > 0 && totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
};

export default ProductGrid;
