import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddProductModal = ({ isOpen, onClose, onAddProduct }) => {
  const [formData, setFormData] = useState({
    name: "Pas Normal Studios",
    subtitle: "Balance T-Shirt AW24 - Dusty Brown",
    price: 1890000,
    stock: 975,
    type: "clothing",
    image: null,
    description: "",
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? parseInt(value) : value,
    }));

    // Clear error when user changes a field
    if (error) {
      setError("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        toast.error("Please upload an image file");
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      !formData.type
    ) {
      const errorMsg = "Please fill all required fields";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setIsSubmitting(true);

      // Pass data to parent component and wait for result
      // onAddProduct now returns a promise that resolves to true if successful
      const success = await onAddProduct(formData);

      if (success) {
        toast.success("Product added successfully!");
        onClose(); // Only close modal on success
      }
    } catch (err) {
      console.error("Error adding product:", err);
      const errorMsg = err.message || "Failed to add product";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when modal opens/closes
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-medium text-black">Add New Product</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 text-black">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Image upload */}
            <div>
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Product Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center relative">
                  {imagePreview ? (
                    <div className="relative aspect-square">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="object-cover w-full h-full rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData((prev) => ({ ...prev, image: null }));
                        }}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                        disabled={isSubmitting}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        Click to upload or drag and drop
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    name="image"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Right column - Product details */}
            <div>
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-black"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Subtitle *
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-black"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Type *
                </label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-black"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Price (Rp) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-black"
                  min="0"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-black"
                  min="0"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-black"
                  rows="3"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded text-sm text-black"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded text-sm flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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
                  Adding...
                </>
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
