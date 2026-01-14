import { useEffect, useState } from 'react';
import { PrivateLayout } from '../../layouts/PrivateLayout';
import { catalogService } from '../../../application/flights-api/catalog.service';
import { Product } from '../../../domain/flights-api/flights-api.types';

export const CatalogPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await catalogService.getAllProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrivateLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">📦 Product Catalog</h1>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            + Add Product
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-indigo-600">${product.price}</span>
                  <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700">
                    Edit
                  </button>
                  <button className="flex-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-500">
                No products found
              </div>
            )}
          </div>
        )}
      </div>
    </PrivateLayout>
  );
};
