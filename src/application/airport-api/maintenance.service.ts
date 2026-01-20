import { airportApiClient } from '../../infrastructure/http/httpClients';
import { MaintenanceRecord, MaintenanceRecordCreate } from '../../domain/airport-api/airport-api.types';

export const maintenanceService = {
  async getAllMaintenanceRecords(params?: { status?: string; aircraft_id?: string }): Promise<MaintenanceRecord[]> {
    try {
      const response = await airportApiClient.get<MaintenanceRecord[]>('/api/maintenance/', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching maintenance records:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch maintenance records');
    }
  },

  async getMaintenanceRecordById(id: number): Promise<MaintenanceRecord> {
    try {
      const response = await airportApiClient.get<MaintenanceRecord>(`/api/maintenance/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching maintenance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch maintenance record');
    }
  },

  async getMaintenanceByAircraft(aircraftId: string): Promise<MaintenanceRecord[]> {
    try {
      const response = await airportApiClient.get<MaintenanceRecord[]>('/api/maintenance/', {
        params: { aircraft_id: aircraftId },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching maintenance by aircraft:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch maintenance records');
    }
  },

  async createMaintenanceRecord(record: MaintenanceRecordCreate): Promise<MaintenanceRecord> {
    try {
      const response = await airportApiClient.post<MaintenanceRecord>('/api/maintenance/', record);
      return response.data;
    } catch (error: any) {
      console.error('Error creating maintenance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to create maintenance record');
    }
  },

  async updateMaintenanceRecord(id: number, record: Partial<MaintenanceRecordCreate>): Promise<MaintenanceRecord> {
    try {
      const response = await airportApiClient.put<MaintenanceRecord>(`/api/maintenance/${id}/`, record);
      return response.data;
    } catch (error: any) {
      console.error('Error updating maintenance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to update maintenance record');
    }
  },

  async patchMaintenanceRecord(id: number, record: Partial<MaintenanceRecordCreate>): Promise<MaintenanceRecord> {
    try {
      const response = await airportApiClient.patch<MaintenanceRecord>(`/api/maintenance/${id}/`, record);
      return response.data;
    } catch (error: any) {
      console.error('Error patching maintenance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to patch maintenance record');
    }
  },

  async completeMaintenanceRecord(id: number): Promise<MaintenanceRecord> {
    try {
      const response = await airportApiClient.post<MaintenanceRecord>(`/api/maintenance/${id}/complete/`, {});
      return response.data;
    } catch (error: any) {
      console.error('Error completing maintenance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to complete maintenance record');
    }
  },

  async cancelMaintenanceRecord(id: number): Promise<MaintenanceRecord> {
    try {
      const response = await airportApiClient.post<MaintenanceRecord>(`/api/maintenance/${id}/cancel/`, {});
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling maintenance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel maintenance record');
    }
  },

  async deleteMaintenanceRecord(id: number): Promise<void> {
    try {
      await airportApiClient.delete(`/api/maintenance/${id}/`);
    } catch (error: any) {
      console.error('Error deleting maintenance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete maintenance record');
    }
  },
};

export default maintenanceService;
