import { airportApiClient } from '../../infrastructure/http/httpClients';
import { Airport, AirportCreate } from '../../domain/airport-api/airport-api.types';

export const airportService = {
  async getAllAirports(): Promise<Airport[]> {
    try {
      const response = await airportApiClient.get<any>('/api/airports/');
      console.log('Airports response:', response.data);
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      } else if (response.data && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      
      return [];
    } catch (error: any) {
      console.error('Error fetching airports:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch airports');
    }
  },

  async getAirportById(id: number): Promise<Airport> {
    try {
      const response = await airportApiClient.get<Airport>(`/api/airports/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching airport:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch airport');
    }
  },

  async createAirport(airport: AirportCreate): Promise<Airport> {
    try {
      const response = await airportApiClient.post<Airport>('/api/airports/', airport);
      return response.data;
    } catch (error: any) {
      console.error('Error creating airport:', error);
      throw new Error(error.response?.data?.message || 'Failed to create airport');
    }
  },

  async updateAirport(id: number, airport: Partial<AirportCreate>): Promise<Airport> {
    try {
      const response = await airportApiClient.put<Airport>(`/api/airports/${id}/`, airport);
      return response.data;
    } catch (error: any) {
      console.error('Error updating airport:', error);
      throw new Error(error.response?.data?.message || 'Failed to update airport');
    }
  },

  async patchAirport(id: number, airport: Partial<AirportCreate>): Promise<Airport> {
    try {
      const response = await airportApiClient.patch<Airport>(`/api/airports/${id}/`, airport);
      return response.data;
    } catch (error: any) {
      console.error('Error patching airport:', error);
      throw new Error(error.response?.data?.message || 'Failed to patch airport');
    }
  },

  async deleteAirport(id: number): Promise<void> {
    try {
      await airportApiClient.delete(`/api/airports/${id}/`);
    } catch (error: any) {
      console.error('Error deleting airport:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete airport');
    }
  },
};

export default airportService;
