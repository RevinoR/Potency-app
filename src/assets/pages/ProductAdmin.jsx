import React, { useState } from 'react';
import NavbarLoggedIn from '../components/NavbarAdmin';
import ProductGrid from '../components/ProductGrid';
import ProductDetail from '../components/ProductDetail';

const ProductAdminPage = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100">
      <NavbarLoggedIn />
      
      <div className="pt-16">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-3/4 p-4">
            <ProductGrid onSelect={setSelectedProduct} />
          </div>
          
          <div className="hidden md:block w-full md:w-1/4 bg-white border-l">
            <ProductDetail product={selectedProduct} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAdminPage;
