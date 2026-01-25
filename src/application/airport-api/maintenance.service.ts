import { airportApiClient } from '../../infrastructure/http/httpClients';
import { MaintenanceRecord, MaintenanceRecordCreate } from '../../domain/airport-api/airport-api.types';

export const maintenanceService = {
  async getAllMaintenanceRecords(params?: { status?: string; aircraft_id?: string }): Promise<MaintenanceRecord[]> {
    try {
      console.log('🔍 Fetching maintenance records from API...');
      const response = await airportApiClient.get<any>('/api/maintenance/records/', { params });
      console.log('✅ Maintenance API Response:', response);
      console.log('📦 Maintenance Data:', response.data);
      console.log('📊 Data type:', typeof response.data);
      console.log('📊 Is Array:', Array.isArray(response.data));
      console.log('📊 Object keys:', response.data ? Object.keys(response.data) : 'null');
      
      if (Array.isArray(response.data)) {
        console.log('✅ Returning array directly:', response.data.length, 'items');
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        console.log('✅ Returning results array:', response.data.results.length, 'items');
        return response.data.results;
      } else if (response.data && response.data.data) {
        console.log('✅ Returning data.data:', response.data.data);
        return Array.isArray(response.data.data) ? response.data.data : [];
      } else if (response.data && typeof response.data === 'object') {
        // Buscar cualquier propiedad que sea un array
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            console.log(`✅ Found array in property "${key}":`, response.data[key].length, 'items');
            return response.data[key];
          }
        }
      }
      
      console.warn('⚠️ No valid data structure found, returning empty array');
      console.warn('Full response data:', JSON.stringify(response.data));
      return [];
    } catch (error: any) {
      console.error('❌ Error fetching maintenance records:', error);
      console.error('❌ Error response:', error.response);
      throw new Error(error.response?.data?.message || 'Failed to fetch maintenance records');
    }
  },

  async getMaintenanceRecordById(id: number): Promise<MaintenanceRecord> {
    try {
      const response = await airportApiClient.get<MaintenanceRecord>(`/api/maintenance/records/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching maintenance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch maintenance record');
    }
  },

  async getMaintenanceByAircraft(aircraftId: string): Promise<MaintenanceRecord[]> {
    try {
      const response = await airportApiClient.get<MaintenanceRecord[]>('/api/maintenance/records/', {
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
      const response = await airportApiClient.post<MaintenanceRecord>('/api/maintenance/records/', record);
      return response.data;
    } catch (error: any) {
      console.error('Error creating maintenance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to create maintenance record');
    }
  },

  async updateMaintenanceRecord(id: number, record: Partial<MaintenanceRecordCreate>): Promise<MaintenanceRecord> {
    try {
      const response = await airportApiClient.put<MaintenanceRecord>(`/api/maintenance/records/${id}/`, record);
      return response.data;
    } catch (error: any) {
      console.error('Error updating maintenance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to update maintenance record');
    }
  },

  async patchMaintenanceRecord(id: number, record: Partial<MaintenanceRecordCreate>): Promise<MaintenanceRecord> {
    try {
      const response = await airportApiClient.patch<MaintenanceRecord>(`/api/maintenance/records/${id}/`, record);
      return response.data;
    } catch (error: any) {
      console.error('Error patching maintenance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to patch maintenance record');
    }
  },

  async completeMaintenanceRecord(id: number): Promise<MaintenanceRecord> {
    try {
      const response = await airportApiClient.post<MaintenanceRecord>(`/api/maintenance/records/${id}/complete/`, {});
      return response.data;
    } catch (error: any) {
      console.error('Error completing maintenance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to complete maintenance record');
    }
  },

  async cancelMaintenanceRecord(id: number): Promise<MaintenanceRecord> {
    try {
      const response = await airportApiClient.post<MaintenanceRecord>(`/api/maintenance/records/${id}/cancel/`, {});
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling maintenance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel maintenance record');
    }
  },

  async deleteMaintenanceRecord(id: number): Promise<void> {
    try {
      await airportApiClient.delete(`/api/maintenance/records/${id}/`);
    } catch (error: any) {
      console.error('Error deleting maintenance record:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete maintenance record');
    }
  },
};

export default maintenanceService;
