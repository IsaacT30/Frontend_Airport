import { airportApiClient } from '../../infrastructure/http/httpClients';
import { CrewMember, CrewMemberCreate, FlightCrew } from '../../domain/airport-api/airport-api.types';

export const crewService = {
  async getAllCrewMembers(params?: { status?: string; position?: string }): Promise<CrewMember[]> {
    try {
      const response = await airportApiClient.get<any>('/api/crew/', { params });
      console.log('Crew response:', response.data);
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        return response.data.results;
      } else if (response.data && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      
      return [];
    } catch (error: any) {
      console.error('Error fetching crew members:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch crew members');
    }
  },

  async getCrewMemberById(id: number): Promise<CrewMember> {
    try {
      const response = await airportApiClient.get<CrewMember>(`/api/crew/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching crew member:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch crew member');
    }
  },

  async createCrewMember(crew: CrewMemberCreate): Promise<CrewMember> {
    try {
      const response = await airportApiClient.post<CrewMember>('/api/crew/', crew);
      return response.data;
    } catch (error: any) {
      console.error('Error creating crew member:', error);
      throw new Error(error.response?.data?.message || 'Failed to create crew member');
    }
  },

  async updateCrewMember(id: number, crew: Partial<CrewMemberCreate>): Promise<CrewMember> {
    try {
      const response = await airportApiClient.put<CrewMember>(`/api/crew/${id}/`, crew);
      return response.data;
    } catch (error: any) {
      console.error('Error updating crew member:', error);
      throw new Error(error.response?.data?.message || 'Failed to update crew member');
    }
  },

  async patchCrewMember(id: number, crew: Partial<CrewMemberCreate>): Promise<CrewMember> {
    try {
      const response = await airportApiClient.patch<CrewMember>(`/api/crew/${id}/`, crew);
      return response.data;
    } catch (error: any) {
      console.error('Error patching crew member:', error);
      throw new Error(error.response?.data?.message || 'Failed to patch crew member');
    }
  },

  async deleteCrewMember(id: number): Promise<void> {
    try {
      await airportApiClient.delete(`/api/crew/${id}/`);
    } catch (error: any) {
      console.error('Error deleting crew member:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete crew member');
    }
  },

  async getFlightCrew(flightId: number): Promise<FlightCrew[]> {
    try {
      const response = await airportApiClient.get<FlightCrew[]>(`/api/flights/${flightId}/crew/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching flight crew:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch flight crew');
    }
  },

  async assignCrewToFlight(flightId: number, crewMemberId: number, role: string): Promise<FlightCrew> {
    try {
      const response = await airportApiClient.post<FlightCrew>('/api/flight-crew/', {
        flight: flightId,
        crew_member: crewMemberId,
        role,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error assigning crew to flight:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign crew to flight');
    }
  },

  async removeCrewFromFlight(flightCrewId: number): Promise<void> {
    try {
      await airportApiClient.delete(`/api/flight-crew/${flightCrewId}/`);
    } catch (error: any) {
      console.error('Error removing crew from flight:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove crew from flight');
    }
  },
};

export default crewService;
