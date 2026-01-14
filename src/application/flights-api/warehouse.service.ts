import { flightsApiClient } from '../../infrastructure/http/httpClients';
import { Warehouse, WarehouseInventory } from '../../domain/flights-api/flights-api.types';

export const warehouseService = {
  async getAllWarehouses(): Promise<Warehouse[]> {
    const response = await flightsApiClient.get<Warehouse[]>('/api/warehouses/');
    return response.data;
  },

  async getWarehouseById(id: number): Promise<Warehouse> {
    const response = await flightsApiClient.get<Warehouse>(`/api/warehouses/${id}/`);
    return response.data;
  },

  async createWarehouse(warehouse: Omit<Warehouse, 'id'>): Promise<Warehouse> {
    const response = await flightsApiClient.post<Warehouse>('/api/warehouses/', warehouse);
    return response.data;
  },

  async updateWarehouse(id: number, warehouse: Partial<Warehouse>): Promise<Warehouse> {
    const response = await flightsApiClient.put<Warehouse>(`/api/warehouses/${id}/`, warehouse);
    return response.data;
  },

  async deleteWarehouse(id: number): Promise<void> {
    await flightsApiClient.delete(`/api/warehouses/${id}/`);
  },

  async getWarehouseInventory(warehouseId: number): Promise<WarehouseInventory[]> {
    const response = await flightsApiClient.get<WarehouseInventory[]>(
      `/api/warehouses/${warehouseId}/inventory/`
    );
    return response.data;
  },
};
