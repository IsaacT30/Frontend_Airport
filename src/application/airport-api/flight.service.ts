import { airportApiClient } from '../../infrastructure/http/httpClients';
import { Flight } from '../../domain/airport-api/airport-api.types';

export const flightService = {
  async getAllFlights(): Promise<Flight[]> {
    const response = await airportApiClient.get<Flight[]>('/api/flights/');
    return response.data;
  },

  async getFlightById(id: number): Promise<Flight> {
    const response = await airportApiClient.get<Flight>(`/api/flights/${id}/`);
    return response.data;
  },

  async createFlight(flight: Omit<Flight, 'id'>): Promise<Flight> {
    const response = await airportApiClient.post<Flight>('/api/flights/', flight);
    return response.data;
  },

  async updateFlight(id: number, flight: Partial<Flight>): Promise<Flight> {
    const response = await airportApiClient.put<Flight>(`/api/flights/${id}/`, flight);
    return response.data;
  },

  async deleteFlight(id: number): Promise<void> {
    await airportApiClient.delete(`/api/flights/${id}/`);
  },

  async searchFlights(params: {
    origin?: string;
    destination?: string;
    date?: string;
  }): Promise<Flight[]> {
    const response = await airportApiClient.get<Flight[]>('/api/flights/search/', { params });
    return response.data;
  },
};
