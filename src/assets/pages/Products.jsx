import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faSearch, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import heroImage from '../../images/Group 3.png'

const ProductsPage = () => {
  // Static product data
  const staticProducts = [
    { id: 1, name: 'Mountain Bike', price: 799, category: 'Bikes', image: '/mountain-bike.jpg' },
    { id: 2, name: 'Road Bike', price: 1299, category: 'Bikes', image: '/road-bike.jpg' },
    { id: 3, name: 'Hybrid Bike', price: 899, category: 'Bikes', image: '/hybrid-bike.jpg' },
    { id: 4, name: 'Bike Helmet', price: 89, category: 'Accessories', image: '/helmet.jpg' },
    { id: 5, name: 'Cycling Gloves', price: 29, category: 'Accessories', image: '/gloves.jpg' },
    { id: 6, name: 'Bike Light Set', price: 39, category: 'Accessories', image: '/lights.jpg' },
    { id: 7, name: 'Cycling Jersey', price: 69, category: 'Clothing', image: '/jersey.jpg' },
    { id: 8, name: 'Cycling Shorts', price: 59, category: 'Clothing', image: '/shorts.jpg' },
    { id: 9, name: 'Cycling Shoes', price: 119, category: 'Clothing', image: '/shoes.jpg' },
  ];

  // Extract unique categories from products
  const categories = [...new Set(staticProducts.map(product => product.category))];

  // State for filters and search
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products based on category and search query
  const filteredProducts = staticProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen">
    {/* Hero Section */}
    <section className="relative min-h-[80vh] flex flex-col justify-end px-6 md:px-12 py-20 bg-black text-white">

    <div
  className="w-full flex flex-col items-center justify-center relative"
  style={{
    backgroundImage: `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url('/hero-bike.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '4rem 0',
    textAlign: 'center',
    color: 'white'
  }}
>
  <h1 className="text-4xl font-bold mb-4">Explore Our Collection</h1>
  <p className="text-xl">Premium Bikes & Cycling Gear</p>
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
            {categories.map(category => (
            <option key={category} value={category}>{category}</option>
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
        <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
    </div>

    {/* Product Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredProducts.map(product => (
        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="h-56 sm:h-64 md:h-72 bg-gray-200 overflow-hidden">
            <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x300?text=Product+Image';
                }}
            />
            </div>
            <div className="p-5 md:p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
            <p className="text-amber-600 text-lg font-bold mb-4">${product.price}</p>
            <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{product.category}</span>
                <button className="bg-amber-500 hover:bg-amber-600 text-white rounded-full p-2 md:p-3">
                <FontAwesomeIcon icon={faShoppingBag} />
                </button>
            </div>
            </div>
        </div>
        ))}
    </div>
    </div>
    </div>
  );
};

export default ProductsPage;
