import { airportApiClient } from '../../infrastructure/http/httpClients';
import { CrewMember, CrewMemberCreate, FlightCrew } from '../../domain/airport-api/airport-api.types';

export const crewService = {
  async getAllCrewMembers(params?: { status?: string; position?: string }): Promise<CrewMember[]> {
    try {
      console.log('🔍 Fetching crew members from API...');
      const response = await airportApiClient.get<any>('/api/crew/members/', { params });
      console.log('✅ Crew API Response:', response);
      console.log('📦 Crew Data:', response.data);
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
      console.error('❌ Error fetching crew members:', error);
      console.error('❌ Error response:', error.response);
      throw new Error(error.response?.data?.message || 'Failed to fetch crew members');
    }
  },

  async getCrewMemberById(id: number): Promise<CrewMember> {
    try {
      const response = await airportApiClient.get<CrewMember>(`/api/crew/members/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching crew member:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch crew member');
    }
  },

  async createCrewMember(crew: CrewMemberCreate): Promise<CrewMember> {
    try {
      const response = await airportApiClient.post<CrewMember>('/api/crew/members/', crew);
      return response.data;
    } catch (error: any) {
      console.error('Error creating crew member:', error);
      throw new Error(error.response?.data?.message || 'Failed to create crew member');
    }
  },

  async updateCrewMember(id: number, crew: Partial<CrewMemberCreate>): Promise<CrewMember> {
    try {
      const response = await airportApiClient.put<CrewMember>(`/api/crew/members/${id}/`, crew);
      return response.data;
    } catch (error: any) {
      console.error('Error updating crew member:', error);
      throw new Error(error.response?.data?.message || 'Failed to update crew member');
    }
  },

  async patchCrewMember(id: number, crew: Partial<CrewMemberCreate>): Promise<CrewMember> {
    try {
      const response = await airportApiClient.patch<CrewMember>(`/api/crew/members/${id}/`, crew);
      return response.data;
    } catch (error: any) {
      console.error('Error patching crew member:', error);
      throw new Error(error.response?.data?.message || 'Failed to patch crew member');
    }
  },

  async deleteCrewMember(id: number): Promise<void> {
    try {
      await airportApiClient.delete(`/api/crew/members/${id}/`);
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
