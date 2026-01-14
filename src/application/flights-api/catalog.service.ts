import { flightsApiClient } from '../../infrastructure/http/httpClients';
import { Product } from '../../domain/flights-api/flights-api.types';

export const catalogService = {
  async getAllProducts(): Promise<Product[]> {
    const response = await flightsApiClient.get<Product[]>('/api/catalog/products/');
    return response.data;
  },

  async getProductById(id: number): Promise<Product> {
    const response = await flightsApiClient.get<Product>(`/api/catalog/products/${id}/`);
    return response.data;
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    const response = await flightsApiClient.post<Product>('/api/catalog/products/', product);
    return response.data;
  },

  async updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    const response = await flightsApiClient.put<Product>(`/api/catalog/products/${id}/`, product);
    return response.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await flightsApiClient.delete(`/api/catalog/products/${id}/`);
  },
};
