// Airport API Domain Types

// Airline Types
export interface Airline {
  id: number;
  name: string;
  code: string;
  country: string;
  contact_email?: string;
  contact_phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AirlineCreate {
  name: string;
  code: string;
  country: string;
  contact_email?: string;
  contact_phone?: string;
}

// Airport Types
export interface Airport {
  id: number;
  name: string;
  code: string;
  city: string;
  country: string;
  timezone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AirportCreate {
  name: string;
  code: string;
  city: string;
  country: string;
  timezone?: string;
}

// Flight Types
export interface Flight {
  id: number;
  flight_number: string;
  airline: number;
  airline_name?: string;
  airline_details?: Airline;
  origin_airport: number;
  origin_airport_name?: string;
  origin_airport_details?: Airport;
  destination_airport: number;
  destination_airport_name?: string;
  destination_airport_details?: Airport;
  departure_time: string;
  arrival_time: string;
  status: 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'cancelled' | 'delayed';
  available_seats?: number;
  total_seats?: number;
  price?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FlightCreate {
  flight_number: string;
  airline: number;
  origin_airport: number;
  destination_airport: number;
  departure_time: string;
  arrival_time: string;
  status?: string;
  available_seats?: number;
  total_seats?: number;
  price?: number;
}

// Booking Types
export interface Booking {
  id: number;
  booking_reference: string;
  flight: number;
  flight_details?: Flight;
  passenger: number;
  passenger_details?: Passenger;
  passenger_name?: string;
  seat_number?: string;
  booking_date: string;
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  total_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface BookingCreate {
  flight: number;
  passenger: number;
  seat_number?: string;
  total_price: number;
  status?: string;
}

// Passenger Types
export interface Passenger {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  passport_number: string;
  nationality: string;
  date_of_birth: string;
  created_at?: string;
  updated_at?: string;
}

export interface PassengerCreate {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  passport_number: string;
  nationality: string;
  date_of_birth: string;
}

// Crew Types
export interface CrewMember {
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
  position: 'pilot' | 'co-pilot' | 'flight_attendant' | 'engineer';
  license_number?: string;
  hire_date: string;
  status: 'active' | 'on_leave' | 'retired';
  created_at?: string;
  updated_at?: string;
}

export interface CrewMemberCreate {
  first_name: string;
  last_name: string;
  employee_id: string;
  position: string;
  license_number?: string;
  hire_date: string;
  status?: string;
}

export interface FlightCrew {
  id: number;
  flight: number;
  crew_member: number;
  crew_member_details?: CrewMember;
  crew_member_name?: string;
  role: string;
  created_at?: string;
}

// Maintenance Types
export interface MaintenanceRecord {
  id: number;
  aircraft_id: string;
  aircraft_model?: string;
  maintenance_type: 'routine' | 'repair' | 'inspection' | 'overhaul';
  description: string;
  scheduled_date: string;
  completed_date?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  technician?: string;
  cost?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MaintenanceRecordCreate {
  aircraft_id: string;
  aircraft_model?: string;
  maintenance_type: string;
  description: string;
  scheduled_date: string;
  completed_date?: string;
  status?: string;
  technician?: string;
  cost?: number;
  notes?: string;
}
