import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard.jsx';
import Pagination from '../components/Pagination.jsx';
import AddProductModal from '../components/AddProductModal.jsx';

const PRODUCTS_PER_PAGE = 8;

const ProductGrid = ({ onSelect }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Direct query to match your database structure
        const response = await axios.get(`http://localhost:3000/api/products?page=${currentPage}&limit=${PRODUCTS_PER_PAGE}`);
        console.log('API Response:', response.data);
        
        // Try multiple data extraction approaches
        let productData = [];
        
        if (response.data && Array.isArray(response.data.data)) {
          // Standard API response format with nested data array
          productData = response.data.data;
        } else if (Array.isArray(response.data)) {
          // Direct array response
          productData = response.data;
        } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          // Single product object
          productData = [response.data];
        }
        
        console.log('Extracted Product Data:', productData);
        
        // Set products regardless of length to handle empty arrays properly
        setProducts(productData);
        
        // Set pagination if available
        if (response.data && response.data.pagination) {
          setTotalPages(response.data.pagination.pages || 1);
        } else {
          setTotalPages(Math.ceil(productData.length / PRODUCTS_PER_PAGE) || 1);
        }
        
        // Select first product if available
        if (productData.length > 0) {
          setSelectedId(productData[0].product_id);
          onSelect(productData[0]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, onSelect]);

  const handleProductClick = (productId) => {
    setSelectedId(productId);
    const selectedProduct = products.find(p => p.product_id === productId);
    if (selectedProduct) {
      onSelect(selectedProduct);
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      const formData = new FormData();
      
      // Map fields to match database schema
      formData.append('name', productData.name || productData.title);
      formData.append('price', productData.price);
      formData.append('type', productData.type || 'clothing');
      formData.append('stock', productData.stock);
      formData.append('subtitle', productData.subtitle || '');
      formData.append('description', productData.description || '');
      
      // Handle image file
      if (productData.image instanceof File) {
        formData.append('image', productData.image);
      }
      
      const response = await axios.post('http://localhost:3000/api/products', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Product added:', response.data);
      
      // Refresh product list after adding
      const updatedResponse = await axios.get(`http://localhost:3000/api/products?page=${currentPage}&limit=${PRODUCTS_PER_PAGE}`);
      
      // Apply same data extraction logic
      let updatedProductData = [];
      if (updatedResponse.data && Array.isArray(updatedResponse.data.data)) {
        updatedProductData = updatedResponse.data.data;
      } else if (Array.isArray(updatedResponse.data)) {
        updatedProductData = updatedResponse.data;
      }
      
      setProducts(updatedProductData);
      
    } catch (error) {
      console.error('Product submission error:', error.response?.data);
      setError(error.response?.data?.message || 'Failed to add product');
    }
  };

  // Loading state with skeleton UI
  if (loading) {
    return (
      <div className="px-4 md:px-0">
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-bold text-lg">Products</h1>
          <button className="border text-black border-gray-400 px-4 py-1 text-sm flex items-center gap-1">
            Add new product <span className="text-lg">+</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array(6).fill().map((_, index) => (
            <div key={index} className="bg-white border border-gray-200 animate-pulse">
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

  // Error state
  if (error) {
    return (
      <div className="px-4 md:px-0 text-black">
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-bold text-lg">Products</h1>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="border border-gray-400 px-4 py-1 text-sm flex items-center gap-1"
          >
            Add new product <span className="text-lg">+</span>
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-0 text-black">
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-bold text-lg">Products</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="border border-gray-400 px-4 py-1 text-sm flex items-center gap-1 hover:bg-gray-50"
        >
          Add new product <span className="text-lg">+</span>
        </button>
      </div>
      
      {/* Add debug button */}
      <button 
        onClick={async () => {
          try {
            const response = await axios.get('http://localhost:3000/api/products');
            console.log('Direct API test:', response);
            alert(`API returned ${response.data ? (Array.isArray(response.data.data) ? response.data.data.length : 'object') : 'no'} products. Check console.`);
          } catch (err) {
            console.error('API test error:', err);
            alert('API test failed: ' + (err.message || 'Unknown error'));
          }
        }}
        className="mb-4 px-3 py-1 bg-gray-200 text-xs rounded"
      >
        Test API
      </button>
      
      {products.length === 0 ? (
        <div className="bg-white border border-gray-200 p-6 text-center text-gray-500">
          No products found. Add a new product to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map(product => (
            <ProductCard
              key={product.product_id}
              product={product}
              isSelected={selectedId === product.product_id}
              onClick={handleProductClick}
            />
          ))}
        </div>
      )}
      
      {products.length > 0 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
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
