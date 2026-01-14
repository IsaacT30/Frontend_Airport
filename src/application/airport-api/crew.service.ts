import { airportApiClient } from '../../infrastructure/http/httpClients';
import { CrewMember, FlightCrew } from '../../domain/airport-api/airport-api.types';

export const crewService = {
  async getAllCrewMembers(): Promise<CrewMember[]> {
    const response = await airportApiClient.get<CrewMember[]>('/api/crew/');
    return response.data;
  },

  async getCrewMemberById(id: number): Promise<CrewMember> {
    const response = await airportApiClient.get<CrewMember>(`/api/crew/${id}/`);
    return response.data;
  },

  async createCrewMember(crew: Omit<CrewMember, 'id'>): Promise<CrewMember> {
    const response = await airportApiClient.post<CrewMember>('/api/crew/', crew);
    return response.data;
  },

  async updateCrewMember(id: number, crew: Partial<CrewMember>): Promise<CrewMember> {
    const response = await airportApiClient.put<CrewMember>(`/api/crew/${id}/`, crew);
    return response.data;
  },

  async deleteCrewMember(id: number): Promise<void> {
    await airportApiClient.delete(`/api/crew/${id}/`);
  },

  async getFlightCrew(flightId: number): Promise<FlightCrew[]> {
    const response = await airportApiClient.get<FlightCrew[]>(`/api/flights/${flightId}/crew/`);
    return response.data;
  },

  async assignCrewToFlight(flightId: number, crewMemberId: number, role: string): Promise<FlightCrew> {
    const response = await airportApiClient.post<FlightCrew>('/api/flight-crew/', {
      flight: flightId,
      crew_member: crewMemberId,
      role,
    });
    return response.data;
  },
};
