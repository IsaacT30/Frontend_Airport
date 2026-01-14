import { airportApiClient } from '../../infrastructure/http/httpClients';
import { MaintenanceRecord } from '../../domain/airport-api/airport-api.types';

export const maintenanceService = {
  async getAllMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    const response = await airportApiClient.get<MaintenanceRecord[]>('/api/maintenance/');
    return response.data;
  },

  async getMaintenanceRecordById(id: number): Promise<MaintenanceRecord> {
    const response = await airportApiClient.get<MaintenanceRecord>(`/api/maintenance/${id}/`);
    return response.data;
  },

  async createMaintenanceRecord(record: Omit<MaintenanceRecord, 'id'>): Promise<MaintenanceRecord> {
    const response = await airportApiClient.post<MaintenanceRecord>('/api/maintenance/', record);
    return response.data;
  },

  async updateMaintenanceRecord(id: number, record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> {
    const response = await airportApiClient.put<MaintenanceRecord>(`/api/maintenance/${id}/`, record);
    return response.data;
  },

  async deleteMaintenanceRecord(id: number): Promise<void> {
    await airportApiClient.delete(`/api/maintenance/${id}/`);
  },

  async completeMaintenanceRecord(id: number): Promise<MaintenanceRecord> {
    const response = await airportApiClient.patch<MaintenanceRecord>(`/api/maintenance/${id}/complete/`);
    return response.data;
  },
};
