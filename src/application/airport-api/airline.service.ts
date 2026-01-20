import { airportApiClient } from '../../infrastructure/http/httpClients';
import { Airline, AirlineCreate } from '../../domain/airport-api/airport-api.types';

export const airlineService = {
  async getAllAirlines(): Promise<Airline[]> {
    try {
      const response = await airportApiClient.get<Airline[]>('/api/airlines/');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching airlines:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch airlines');
    }
  },

  async getAirlineById(id: number): Promise<Airline> {
    try {
      const response = await airportApiClient.get<Airline>(`/api/airlines/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching airline:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch airline');
    }
  },

  async createAirline(airline: AirlineCreate): Promise<Airline> {
    try {
      const response = await airportApiClient.post<Airline>('/api/airlines/', airline);
      return response.data;
    } catch (error: any) {
      console.error('Error creating airline:', error);
      throw new Error(error.response?.data?.message || 'Failed to create airline');
    }
  },

  async updateAirline(id: number, airline: Partial<AirlineCreate>): Promise<Airline> {
    try {
      const response = await airportApiClient.put<Airline>(`/api/airlines/${id}/`, airline);
      return response.data;
    } catch (error: any) {
      console.error('Error updating airline:', error);
      throw new Error(error.response?.data?.message || 'Failed to update airline');
    }
  },

  async patchAirline(id: number, airline: Partial<AirlineCreate>): Promise<Airline> {
    try {
      const response = await airportApiClient.patch<Airline>(`/api/airlines/${id}/`, airline);
      return response.data;
    } catch (error: any) {
      console.error('Error patching airline:', error);
      throw new Error(error.response?.data?.message || 'Failed to patch airline');
    }
  },

  async deleteAirline(id: number): Promise<void> {
    try {
      await airportApiClient.delete(`/api/airlines/${id}/`);
    } catch (error: any) {
      console.error('Error deleting airline:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete airline');
    }
  },
};

export default airlineService;
