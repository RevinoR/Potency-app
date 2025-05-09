import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductDetail = ({ product, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState('descriptions');
  const [stockValue, setStockValue] = useState(product?.stock || 0);
  const [priceValue, setPriceValue] = useState(product?.price || 0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setStockValue(product.stock);
      setPriceValue(product.price);
    }
  }, [product]);

  const handleStockChange = (e) => {
    setStockValue(parseInt(e.target.value) || 0);
  };

  const handlePriceChange = (e) => {
    setPriceValue(parseInt(e.target.value) || 0);
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      setError('');
      const response = await axios.put(
        `/api/products/${product.product_id}`,
        { stock: stockValue, price: priceValue },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (onUpdate) onUpdate(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
      console.error('Update error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (window.confirm('Are you sure you want to delete this product?')) {
        await axios.delete(`/api/products/${product.product_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (onDelete) onDelete(product.product_id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
      console.error('Delete error:', err);
    }
  };

  if (!product) {
    return (
      <div className="p-4 text-gray-400 text-center h-full flex items-center justify-center">
        Select a product to view details
      </div>
    );
  }

  return (
    <div className="p-4">
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      <div className="flex justify-between items-center mb-4">
        <span className="font-medium text-black">Edit Product</span>
        <button 
          onClick={handleDelete}
          className="bg-black text-white text-xs px-3 py-1 hover:bg-gray-800"
        >
          DELETE
        </button>
      </div>

      <div className="border-b pb-2 mb-4">
        <div className="flex space-x-4 text-sm text-black">
          <button
            className={`pb-1 ${activeTab === 'descriptions' ? 'font-medium border-b-2 border-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab('descriptions')}
          >
            Descriptions
          </button>
          <button
            className={`pb-1 ${activeTab === 'inventory' ? 'font-medium border-b-2 border-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
          <button
            className={`pb-1 ${activeTab === 'pricing' ? 'font-medium border-b-2 border-black' : 'text-gray-500'}`}
            onClick={() => setActiveTab('pricing')}
          >
            Pricing
          </button>
        </div>
      </div>

      {/* Descriptions Tab Content */}
      {activeTab === 'descriptions' && (
        <>
          <div className="bg-gray-200 w-full aspect-square flex items-center justify-center mb-4">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M8.5 8.5a1.5 1.5 0 1 1 0 0.001" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">Product name</div>
            <div className="text-sm mb-2 text-black">{product.name} {product.subtitle}</div>
            <div className="text-xs text-gray-500 mb-1">Product description</div>
            <div className="text-xs text-gray-700 mb-4">
              {product.description || "No description provided."}
            </div>
          </div>
        </>
      )}

      {/* Inventory Tab Content */}
      {activeTab === 'inventory' && (
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
            <div className="ml-2 text-xs text-gray-500">Current: {product.stock}</div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-1">Units Sold</div>
            <div className="text-sm">{product.sold}</div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-1">Inventory Status</div>
            <div className={`text-sm ${stockValue > 100 ? 'text-green-600' : stockValue > 20 ? 'text-yellow-600' : 'text-red-600'}`}>
              {stockValue > 100 ? 'In Stock' : stockValue > 20 ? 'Low Stock' : 'Critical Stock'}
            </div>
          </div>
        </div>
      )}

      {/* Pricing Tab Content */}
      {activeTab === 'pricing' && (
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
            Display: Rp {priceValue.toLocaleString('id-ID')}
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
        >
          Discard
        </button>
        <button 
          className="bg-black text-white px-4 py-1 text-sm hover:bg-gray-800 disabled:bg-gray-400"
          onClick={handleUpdate}
          disabled={isUpdating}
        >
          {isUpdating ? 'Updating...' : 'Update Product'}
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
