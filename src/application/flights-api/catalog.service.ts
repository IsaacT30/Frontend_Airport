import { flightsApiClient } from '../../infrastructure/http/httpClients';
import { Product, ProductCreate } from '../../domain/flights-api/flights-api.types';

export const catalogService = {
  async getAllProducts(params?: { category?: string; is_active?: boolean; search?: string }): Promise<Product[]> {
    try {
      const response = await flightsApiClient.get<Product[]>('/api/catalog/products/', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching products:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },

  async getProductById(id: number): Promise<Product> {
    try {
      const response = await flightsApiClient.get<Product>(`/api/catalog/products/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching product:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch product');
    }
  },

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await flightsApiClient.get<Product[]>('/api/catalog/products/', {
        params: { search: query },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error searching products:', error);
      throw new Error(error.response?.data?.message || 'Failed to search products');
    }
  },

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await flightsApiClient.get<Product[]>('/api/catalog/products/', {
        params: { category },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching products by category:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },

  async createProduct(product: ProductCreate): Promise<Product> {
    try {
      const response = await flightsApiClient.post<Product>('/api/catalog/products/', product);
      return response.data;
    } catch (error: any) {
      console.error('Error creating product:', error);
      throw new Error(error.response?.data?.message || 'Failed to create product');
    }
  },

  async updateProduct(id: number, product: Partial<ProductCreate>): Promise<Product> {
    try {
      const response = await flightsApiClient.put<Product>(`/api/catalog/products/${id}/`, product);
      return response.data;
    } catch (error: any) {
      console.error('Error updating product:', error);
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  },

  async patchProduct(id: number, product: Partial<ProductCreate>): Promise<Product> {
    try {
      const response = await flightsApiClient.patch<Product>(`/api/catalog/products/${id}/`, product);
      return response.data;
    } catch (error: any) {
      console.error('Error patching product:', error);
      throw new Error(error.response?.data?.message || 'Failed to patch product');
    }
  },

  async deleteProduct(id: number): Promise<void> {
    try {
      await flightsApiClient.delete(`/api/catalog/products/${id}/`);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
  },
};

export default catalogService;
