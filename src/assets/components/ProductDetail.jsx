import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductDetail = ({ product, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState("descriptions");
  const [stockValue, setStockValue] = useState(product?.stock || 0);
  const [priceValue, setPriceValue] = useState(product?.price || 0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(null);

  // Update local state when product changes
  useEffect(() => {
    if (product) {
      setStockValue(product.stock);
      setPriceValue(product.price);

      // Reset operation states when product changes
      setIsUpdating(false);
      setIsDeleting(false);
      setError("");

      // Handle image URL
      setImageUrl(null); // Reset first
      if (product.product_id) {
        // Use a direct URL to the image endpoint
        setImageUrl(
          `/api/products/${product.product_id}/image?v=${new Date().getTime()}`
        );
      }
    }
  }, [product]);

  const handleStockChange = (e) => {
    setStockValue(parseInt(e.target.value) || 0);
  };

  const handlePriceChange = (e) => {
    setPriceValue(parseInt(e.target.value) || 0);
  };

  const handleUpdate = async () => {
    if (!product) return;

    try {
      setIsUpdating(true);
      setError("");

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `/api/products/${product.product_id}`,
        { stock: stockValue, price: priceValue },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Show success message
      toast.success("Product updated successfully");

      // Call the update callback with the updated product
      if (onUpdate) onUpdate(response.data.data);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to update product";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Update error:", err);
    } finally {
      // Always reset updating state, regardless of success or failure
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    try {
      // Confirm deletion
      if (!window.confirm("Are you sure you want to delete this product?")) {
        return;
      }

      setIsDeleting(true);

      const token = localStorage.getItem("token");
      await axios.delete(`/api/products/${product.product_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Show success message
      toast.success("Product deleted successfully");

      // Call the delete callback
      if (onDelete) onDelete(product.product_id);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Failed to delete product";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Delete error:", err);
    } finally {
      // Always reset deleting state, regardless of success or failure
      setIsDeleting(false);
    }
  };

  // Handle image error
  const handleImageError = () => {
    setImageUrl(null); // Clear the URL on error
  };

  if (!product) {
    return (
      <div className="p-4 text-gray-400 text-center h-full flex items-center justify-center">
        Select a product to view details
      </div>
    );
  }

  return (
    <div className="p-4 text-black">
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <div className="flex justify-between items-center mb-4">
        <span className="font-medium text-black">Edit Product</span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`bg-black text-white text-xs px-3 py-1 hover:bg-gray-800 flex items-center ${
            isDeleting ? "opacity-70" : ""
          }`}
        >
          {isDeleting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              DELETING...
            </>
          ) : (
            "DELETE"
          )}
        </button>
      </div>

      <div className="border-b pb-2 mb-4">
        <div className="flex space-x-4 text-sm text-black">
          <button
            className={`pb-1 ${
              activeTab === "descriptions"
                ? "font-medium border-b-2 border-black"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("descriptions")}
          >
            Descriptions
          </button>
          <button
            className={`pb-1 ${
              activeTab === "inventory"
                ? "font-medium border-b-2 border-black"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("inventory")}
          >
            Inventory
          </button>
          <button
            className={`pb-1 ${
              activeTab === "pricing"
                ? "font-medium border-b-2 border-black"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("pricing")}
          >
            Pricing
          </button>
        </div>
      </div>

      {/* Descriptions Tab Content */}
      {activeTab === "descriptions" && (
        <>
          <div className="bg-gray-200 w-full aspect-square flex items-center justify-center mb-4 overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="object-cover w-full h-full"
                onError={handleImageError}
              />
            ) : (
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M8.5 8.5a1.5 1.5 0 1 1 0 0.001" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            )}
          </div>
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">Product name</div>
            <div className="text-sm mb-2 text-black">
              {product.name} {product.subtitle}
            </div>
            <div className="text-xs text-gray-500 mb-1">
              Product description
            </div>
            <div className="text-xs text-gray-700 mb-4">
              {product.description || "No description provided."}
            </div>
          </div>
        </>
      )}

      {/* Inventory Tab Content */}
      {activeTab === "inventory" && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Stock Quantity</div>
          <div className="flex items-center text-black">
            <input
              type="number"
              value={stockValue}
              onChange={handleStockChange}
              className="w-28 p-2 border border-gray-300 rounded text-sm appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              min="0"
            />
            <div className="ml-2 text-xs text-gray-500">
              Current: {product.stock}
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-1">Units Sold</div>
            <div className="text-sm">{product.sold || 0}</div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-1">Inventory Status</div>
            <div
              className={`text-sm ${
                stockValue > 100
                  ? "text-green-600"
                  : stockValue > 20
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {stockValue > 100
                ? "In Stock"
                : stockValue > 20
                ? "Low Stock"
                : "Critical Stock"}
            </div>
          </div>
        </div>
      )}

      {/* Pricing Tab Content */}
      {activeTab === "pricing" && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Current Price</div>
          <input
            type="number"
            value={priceValue}
            onChange={handlePriceChange}
            className="w-40 p-2 border border-gray-300 rounded text-sm mb-3"
            min="0"
          />
          <div className="text-xs text-gray-500">
            Display: Rp {priceValue.toLocaleString("id-ID")}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2 mt-4">
        <button
          className="border border-gray-300 px-4 py-1 text-sm hover:bg-gray-50"
          onClick={() => {
            setStockValue(product.stock);
            setPriceValue(product.price);
          }}
          disabled={isUpdating}
        >
          Discard
        </button>
        <button
          className={`bg-black text-white px-4 py-1 text-sm hover:bg-gray-800 disabled:bg-gray-400 flex items-center`}
          onClick={handleUpdate}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Updating...
            </>
          ) : (
            "Update Product"
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
