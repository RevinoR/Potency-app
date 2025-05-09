// ProductCard.jsx
import React from 'react';

const ProductCard = ({ product, isSelected, onClick }) => {
  if (!product) return null;

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div
      onClick={() => onClick(product.product_id)}
      className={`bg-white cursor-pointer border ${
        isSelected ? 'border-black shadow-lg' : 'border-gray-200 hover:shadow'
      } transition-all duration-200`}
    >
      <div className="bg-gray-200 w-full aspect-square flex items-center justify-center">
        {product.image ? (
          <img
            src={typeof product.image === 'string' && product.image.startsWith('data:')
              ? product.image
              : `data:image/jpeg;base64,${product.image}`
            }
            alt={product.subtitle || product.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M8.5 8.5a1.5 1.5 0 1 1 0 0.001" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        )}
      </div>
      <div className="p-2">
        <div className="text-sm font-semibold mb-1">{product.name}</div>
        <div className="text-xs text-gray-700">{product.subtitle}</div>
        <div className="text-sm mt-1">{formatCurrency(product.price)}</div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <div>Stock {product.stock}</div>
          <div>Sold {product.sold || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
