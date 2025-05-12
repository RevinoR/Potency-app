import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../components/NavbarAdmin";
import ProductGrid from "../components/ProductGrid";
import ProductDetail from "../components/ProductDetail";
import AddProductModal from "../components/AddProductModal";
import axios from "axios";

const ProductAdminPage = () => {
  // State management
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Changed from refreshTrigger to refreshKey
  const navigate = useNavigate();

  // Check if user is authenticated and is admin - only runs once on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/signin", { state: { returnUrl: "/admin/products" } });
          return;
        }

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.role !== "admin") {
          setError("You do not have permission to access this page");
          setTimeout(() => {
            navigate("/");
          }, 3000);
          return;
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setError("Authentication failed");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Memoized product selection handler
  const handleProductSelect = useCallback((product) => {
    setSelectedProduct(product);

    // In mobile view, scroll to detail section
    if (window.innerWidth < 768) {
      const detailSection = document.getElementById("product-detail-mobile");
      if (detailSection) {
        detailSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  // Product update handler - memoized to prevent unnecessary re-renders
  const handleProductUpdate = useCallback((updatedProduct) => {
    // Update selected product if it's the one that was updated
    setSelectedProduct((prev) =>
      prev && prev.product_id === updatedProduct.product_id
        ? updatedProduct
        : prev
    );

    // Trigger a refresh of the product grid
    setRefreshKey((key) => key + 1);
  }, []);

  // Product delete handler - memoized to prevent unnecessary re-renders
  const handleProductDelete = useCallback((productId) => {
    // Clear selected product if it's the one that was deleted
    setSelectedProduct((prev) =>
      prev && prev.product_id === productId ? null : prev
    );

    // Trigger a refresh of the product grid
    setRefreshKey((key) => key + 1);
  }, []);

  // Add product handler - memoized to prevent unnecessary re-renders
  const handleAddProduct = useCallback(async (productData) => {
    try {
      const formData = new FormData();

      // Add product data to form
      formData.append("name", productData.name);
      formData.append("price", productData.price);
      formData.append("type", productData.type || "general");
      formData.append("stock", productData.stock || 0);
      formData.append("subtitle", productData.subtitle || "");
      formData.append("description", productData.description || "");

      // Add image if available
      if (productData.image instanceof File) {
        formData.append("image", productData.image);
      }

      // Send request to create product
      const token = localStorage.getItem("token");
      const response = await axios.post("/api/products", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Only close modal if API call is successful
      setIsAddModalOpen(false);

      // Select the newly created product if it exists in the response
      if (response.data && response.data.data) {
        setSelectedProduct(response.data.data);
        // Refresh product grid after successful creation
        setRefreshKey((key) => key + 1);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert(
        "Failed to add product: " +
          (error.response?.data?.message || "Unknown error")
      );
    }
  }, []);

  // If still checking auth, show loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // If error (e.g., not admin), show error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavbarAdmin />

      {/* Add Product Button - Always visible */}
      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-full p-4 shadow-lg transition-all"
          aria-label="Add product"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>

      <div className="pt-16 pb-8 container mx-auto px-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex gap-6">
          <div className="w-2/3 bg-white rounded-lg shadow-sm p-6">
            <ProductGrid
              onSelect={handleProductSelect}
              refreshKey={refreshKey} // Changed prop name to refreshKey
            />
          </div>

          <div className="w-1/3 bg-white rounded-lg shadow-sm">
            <ProductDetail
              product={selectedProduct}
              onUpdate={handleProductUpdate}
              onDelete={handleProductDelete}
            />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <ProductGrid
              onSelect={handleProductSelect}
              refreshKey={refreshKey} // Changed prop name to refreshKey
            />
          </div>

          {selectedProduct && (
            <div
              id="product-detail-mobile"
              className="bg-white rounded-lg shadow-sm"
            >
              <ProductDetail
                product={selectedProduct}
                onUpdate={handleProductUpdate}
                onDelete={handleProductDelete}
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
};

export default ProductAdminPage;
