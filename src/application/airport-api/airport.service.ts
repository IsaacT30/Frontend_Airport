import { airportApiClient } from '../../infrastructure/http/httpClients';
import { Airport } from '../../domain/airport-api/airport-api.types';

export const airportService = {
  async getAllAirports(): Promise<Airport[]> {
    const response = await airportApiClient.get<Airport[]>('/api/airports/');
    return response.data;
  },

  async getAirportById(id: number): Promise<Airport> {
    const response = await airportApiClient.get<Airport>(`/api/airports/${id}/`);
    return response.data;
  },

  async createAirport(airport: Omit<Airport, 'id'>): Promise<Airport> {
    const response = await airportApiClient.post<Airport>('/api/airports/', airport);
    return response.data;
  },

  async updateAirport(id: number, airport: Partial<Airport>): Promise<Airport> {
    const response = await airportApiClient.put<Airport>(`/api/airports/${id}/`, airport);
    return response.data;
  },

  async deleteAirport(id: number): Promise<void> {
    await airportApiClient.delete(`/api/airports/${id}/`);
  },
};
