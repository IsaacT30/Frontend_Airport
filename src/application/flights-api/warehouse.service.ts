import { flightsApiClient } from '../../infrastructure/http/httpClients';
import { Warehouse, WarehouseCreate, WarehouseInventory, WarehouseInventoryCreate } from '../../domain/flights-api/flights-api.types';

export const warehouseService = {
  async getAllWarehouses(params?: { is_active?: boolean; location?: string }): Promise<Warehouse[]> {
    try {
      const response = await flightsApiClient.get<Warehouse[]>('/api/warehouses/', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching warehouses:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch warehouses');
    }
  },

  async getWarehouseById(id: number): Promise<Warehouse> {
    try {
      const response = await flightsApiClient.get<Warehouse>(`/api/warehouses/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching warehouse:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch warehouse');
    }
  },

  async createWarehouse(warehouse: WarehouseCreate): Promise<Warehouse> {
    try {
      const response = await flightsApiClient.post<Warehouse>('/api/warehouses/', warehouse);
      return response.data;
    } catch (error: any) {
      console.error('Error creating warehouse:', error);
      throw new Error(error.response?.data?.message || 'Failed to create warehouse');
    }
  },

  async updateWarehouse(id: number, warehouse: Partial<WarehouseCreate>): Promise<Warehouse> {
    try {
      const response = await flightsApiClient.put<Warehouse>(`/api/warehouses/${id}/`, warehouse);
      return response.data;
    } catch (error: any) {
      console.error('Error updating warehouse:', error);
      throw new Error(error.response?.data?.message || 'Failed to update warehouse');
    }
  },

  async patchWarehouse(id: number, warehouse: Partial<WarehouseCreate>): Promise<Warehouse> {
    try {
      const response = await flightsApiClient.patch<Warehouse>(`/api/warehouses/${id}/`, warehouse);
      return response.data;
    } catch (error: any) {
      console.error('Error patching warehouse:', error);
      throw new Error(error.response?.data?.message || 'Failed to patch warehouse');
    }
  },

  async deleteWarehouse(id: number): Promise<void> {
    try {
      await flightsApiClient.delete(`/api/warehouses/${id}/`);
    } catch (error: any) {
      console.error('Error deleting warehouse:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete warehouse');
    }
  },

  async getWarehouseInventory(warehouseId: number): Promise<WarehouseInventory[]> {
    try {
      const response = await flightsApiClient.get<WarehouseInventory[]>(
        `/api/warehouses/${warehouseId}/inventory/`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching warehouse inventory:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch warehouse inventory');
    }
  },

  async getAllInventory(params?: { warehouse?: number; product?: number }): Promise<WarehouseInventory[]> {
    try {
      const response = await flightsApiClient.get<WarehouseInventory[]>('/api/inventory/', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching inventory:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch inventory');
    }
  },

  async createInventoryItem(item: WarehouseInventoryCreate): Promise<WarehouseInventory> {
    try {
      const response = await flightsApiClient.post<WarehouseInventory>('/api/inventory/', item);
      return response.data;
    } catch (error: any) {
      console.error('Error creating inventory item:', error);
      throw new Error(error.response?.data?.message || 'Failed to create inventory item');
    }
  },

  async updateInventoryItem(id: number, item: Partial<WarehouseInventoryCreate>): Promise<WarehouseInventory> {
    try {
      const response = await flightsApiClient.put<WarehouseInventory>(`/api/inventory/${id}/`, item);
      return response.data;
    } catch (error: any) {
      console.error('Error updating inventory item:', error);
      throw new Error(error.response?.data?.message || 'Failed to update inventory item');
    }
  },

  async patchInventoryItem(id: number, item: Partial<WarehouseInventoryCreate>): Promise<WarehouseInventory> {
    try {
      const response = await flightsApiClient.patch<WarehouseInventory>(`/api/inventory/${id}/`, item);
      return response.data;
    } catch (error: any) {
      console.error('Error patching inventory item:', error);
      throw new Error(error.response?.data?.message || 'Failed to patch inventory item');
    }
  },

  async deleteInventoryItem(id: number): Promise<void> {
    try {
      await flightsApiClient.delete(`/api/inventory/${id}/`);
    } catch (error: any) {
      console.error('Error deleting inventory item:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete inventory item');
    }
  },
};

export default warehouseService;
