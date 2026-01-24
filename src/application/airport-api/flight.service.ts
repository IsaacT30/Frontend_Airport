import { airportApiClient } from '../../infrastructure/http/httpClients';
import { Flight, FlightCreate } from '../../domain/airport-api/airport-api.types';

export const flightService = {
  async getAllFlights(params?: { status?: string; airline?: number }): Promise<Flight[]> {
    try {
      const response = await airportApiClient.get<any>('/api/flights/', { params });
      console.log('Flights response:', response.data);
      
      // Manejar diferentes formatos de respuesta
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        // Paginación DRF
        return response.data.results;
      } else if (response.data && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      
      return [];
    } catch (error: any) {
      console.error('Error fetching flights:', error);
      console.error('Error details:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Failed to fetch flights');
    }
  },

  async getFlightById(id: number): Promise<Flight> {
    try {
      const response = await airportApiClient.get<Flight>(`/api/flights/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching flight:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch flight');
    }
  },

  async createFlight(flight: FlightCreate): Promise<Flight> {
    try {
      const response = await airportApiClient.post<Flight>('/api/flights/', flight);
      return response.data;
    } catch (error: any) {
      console.error('Error creating flight:', error);
      throw new Error(error.response?.data?.message || 'Failed to create flight');
    }
  },

  async updateFlight(id: number, flight: Partial<FlightCreate>): Promise<Flight> {
    try {
      const response = await airportApiClient.put<Flight>(`/api/flights/${id}/`, flight);
      return response.data;
    } catch (error: any) {
      console.error('Error updating flight:', error);
      throw new Error(error.response?.data?.message || 'Failed to update flight');
    }
  },

  async patchFlight(id: number, flight: Partial<FlightCreate>): Promise<Flight> {
    try {
      const response = await airportApiClient.patch<Flight>(`/api/flights/${id}/`, flight);
      return response.data;
    } catch (error: any) {
      console.error('Error patching flight:', error);
      throw new Error(error.response?.data?.message || 'Failed to patch flight');
    }
  },

  async deleteFlight(id: number): Promise<void> {
    try {
      await airportApiClient.delete(`/api/flights/${id}/`);
    } catch (error: any) {
      console.error('Error deleting flight:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete flight');
    }
  },

  async searchFlights(params: {
    origin?: string;
    destination?: string;
    date?: string;
    airline?: number;
    status?: string;
  }): Promise<Flight[]> {
    try {
      const response = await airportApiClient.get<Flight[]>('/api/flights/search/', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error searching flights:', error);
      throw new Error(error.response?.data?.message || 'Failed to search flights');
    }
  },
};

export default flightService;
