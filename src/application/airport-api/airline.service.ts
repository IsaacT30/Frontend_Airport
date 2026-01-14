import { airportApiClient } from '../../infrastructure/http/httpClients';
import { Airline } from '../../domain/airport-api/airport-api.types';

export const airlineService = {
  async getAllAirlines(): Promise<Airline[]> {
    const response = await airportApiClient.get<Airline[]>('/api/airlines/');
    return response.data;
  },

  async getAirlineById(id: number): Promise<Airline> {
    const response = await airportApiClient.get<Airline>(`/api/airlines/${id}/`);
    return response.data;
  },

  async createAirline(airline: Omit<Airline, 'id'>): Promise<Airline> {
    const response = await airportApiClient.post<Airline>('/api/airlines/', airline);
    return response.data;
  },

  async updateAirline(id: number, airline: Partial<Airline>): Promise<Airline> {
    const response = await airportApiClient.put<Airline>(`/api/airlines/${id}/`, airline);
    return response.data;
  },

  async deleteAirline(id: number): Promise<void> {
    await airportApiClient.delete(`/api/airlines/${id}/`);
  },
};
