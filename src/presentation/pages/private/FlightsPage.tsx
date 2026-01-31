import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrivateLayout } from '../../layouts/PrivateLayout';
import { flightService } from '../../../application/airport-api/flight.service';
import { airlineService } from '../../../application/airport-api/airline.service';
import { airportService } from '../../../application/airport-api/airport.service';
import { passengerService } from '../../../application/airport-api/passenger.service';
import { bookingService } from '../../../application/airport-api/booking.service';
import { Flight, FlightCreate, Airline, Airport, Passenger } from '../../../domain/airport-api/airport-api.types';
import { useRole } from '../../../application/auth/useRole';
import { useAuth } from '../../../application/auth/useAuth';

export const FlightsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [saving, setSaving] = useState(false);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [currentPassenger, setCurrentPassenger] = useState<Passenger | null>(null);
  const [formData, setFormData] = useState<FlightCreate>({
    flight_number: '',
    airline: 0,
    origin_airport: 0,
    destination_airport: 0,
    departure_time: '',
    arrival_time: '',
    status: 'SCHEDULED',
    available_seats: 100,
    total_seats: 100,
    price: 0,
    aircraft_type: '',
    base_price: 0,
  });
  const { canCreate, canEdit, canDelete, role } = useRole();

  useEffect(() => {
    loadFlights();
    loadAirlines();
    loadAirports();
    if (role === 'CLIENTE') {
      loadCurrentPassenger();
    }
  }, [role]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCurrentPassenger = async () => {
    if (!user) return;
    try {
      const passengers = await passengerService.getAllPassengers();
      const found = passengers.find((p: Passenger) => p.user === Number(user.id) || p.email === user.email);
      if (found) {
        setCurrentPassenger(found);
      }
    } catch (err) {
      console.error('Error identifying passenger:', err);
    }
  };

  const handleBook = async (flight: Flight) => {
    if ((flight.available_seats || 0) <= 0) {
      alert('⚠️ Lo sentimos, este vuelo no tiene asientos disponibles.');
      return;
    }

    if (!currentPassenger) {
      // Si no hay pasajero, abrir modal para crear perfil y reservar
      setSelectedFlight(flight);
      setShowBookingModal(true);
      return;
    }

    const precio = Number(flight.price || flight.base_price || 0).toFixed(2);
    const mensaje = `🎫 Confirmar Reserva\n\n` +
                   `Vuelo: ${flight.flight_number}\n` +
                   `Ruta: ${flight.origin_airport_name} → ${flight.destination_airport_name}\n` +
                   `Precio: $${precio}\n\n` +
                   `¿Deseas continuar con la reserva?`;
    
    if (!confirm(mensaje)) {
      return;
    }

    try {
      setLoading(true);
      await bookingService.createBooking({
        flight: flight.id,
        passenger: currentPassenger.id,
        seat_number: 'ANY',
        total_price: Number(flight.price || flight.base_price || 0),
        status: 'pending'
      });
      alert(`✅ ¡Vuelo reservado exitosamente!\n\nTotal a pagar: $${precio}\n\nSerás redirigido a tus reservas donde podrás completar el pago.`);
      navigate('/bookings');
    } catch (err: unknown) {
      console.error('Error booking flight:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as { response?: { data?: { detail?: string } }; message?: string };
      const errorMsg = error.response?.data?.detail || error.message || 'Error al reservar';
      alert(`❌ Error al reservar: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const loadFlights = async () => {
    try {
      setLoading(true);
      const data = await flightService.getAllFlights();
      // Asegurar que data sea un array
      setFlights(Array.isArray(data) ? data : []);
      setError('');
    } catch (err: unknown) {
      setError('Error al cargar vuelos. Verifica tu conexión.');
      console.error('Error loading flights:', err);
      setFlights([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAirlines = async () => {
    try {
      const data = await airlineService.getAllAirlines();
      setAirlines(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error('Error loading airlines:', err);
    }
  };

  const loadAirports = async () => {
    try {
      const data = await airportService.getAllAirports();
      setAirports(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error('Error loading airports:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Preparar datos con formato correcto de fechas
      const flightData = {
        ...formData,
        departure_time: formData.departure_time.includes('T') 
          ? new Date(formData.departure_time).toISOString() 
          : formData.departure_time,
        arrival_time: formData.arrival_time.includes('T') 
          ? new Date(formData.arrival_time).toISOString() 
          : formData.arrival_time,
      };

      if (editingFlight) {
        // Editar vuelo existente
        console.log('Updating flight:', editingFlight.id, flightData);
        await flightService.updateFlight(editingFlight.id, flightData);
        alert('✅ Vuelo actualizado exitosamente!');
      } else {
        // Crear nuevo vuelo
        console.log('Creating flight:', flightData);
        await flightService.createFlight(flightData);
        alert('✅ Vuelo creado exitosamente!');
      }
      setShowModal(false);
      setEditingFlight(null);
      resetForm();
      loadFlights();
    } catch (err: unknown) {
      console.error('Error saving flight:', err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as { response?: { data?: any }; message?: string };
      console.error('Response data:', error.response?.data);
      
      // Extraer mensaje de error más detallado
      let errorMsg = 'Error desconocido';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        } else if (error.response.data.detail) {
          errorMsg = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMsg = error.response.data.message;
        } else {
          // Mostrar errores de validación de campos
          const errors = Object.entries(error.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
          errorMsg = errors || error.message || 'Error desconocido';
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      alert(`❌ Error al guardar vuelo:\n${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (flight: Flight) => {
    setEditingFlight(flight);
    
    // Formatear fechas para datetime-local input
    const formatForInput = (dateStr: string) => {
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };
    
    setFormData({
      flight_number: flight.flight_number,
      airline: flight.airline,
      origin_airport: flight.origin_airport,
      destination_airport: flight.destination_airport,
      departure_time: formatForInput(flight.departure_time),
      arrival_time: formatForInput(flight.arrival_time),
      status: flight.status,
      available_seats: flight.available_seats || 100,
      total_seats: flight.total_seats || 100,
      price: flight.price || 0,
      aircraft_type: (flight as Flight & { aircraft_type?: string }).aircraft_type || 'Boeing 737',
      base_price: (flight as Flight & { base_price?: number }).base_price || flight.price || 0,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      flight_number: '',
      airline: 0,
      origin_airport: 0,
      destination_airport: 0,
      departure_time: '',
      arrival_time: '',
      status: 'SCHEDULED',
      available_seats: 100,
      total_seats: 100,
      price: 0,
      aircraft_type: '',
      base_price: 0,
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFlight(null);
    resetForm();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este vuelo?')) return;
    try {
      await flightService.deleteFlight(id);
      alert('✅ Vuelo eliminado');
      loadFlights();
    } catch (err) {
      console.error('Error deleting flight:', err);
      alert('❌ Error al eliminar vuelo');
    }
  };

  const handleViewFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setShowDetailModal(true);
  };



  const handleBookingSubmit = async (bookingData: { 
    passenger_name: string; 
    passenger_email: string; 
    passenger_phone: string; 
    seat_number: string;
    travel_class: string;
    checked_baggage: number;
    carry_on_baggage: number;
    meal_preference: string;
    special_requests: string;
  }) => {
    if (!selectedFlight) return;
    
    try {
      console.log('Creando reserva pendiente...');
      
      // Buscar o crear pasajero
      let passenger;
      try {
        const existingPassengers = await passengerService.getAllPassengers();
        passenger = existingPassengers.find((p: Passenger) => p.user === Number(user?.id));
        
        if (!passenger) {
          const passengerData = {
            user: Number(user?.id),
            first_name: bookingData.passenger_name.split(' ')[0],
            last_name: bookingData.passenger_name.split(' ').slice(1).join(' ') || bookingData.passenger_name,
            email: bookingData.passenger_email,
            phone: bookingData.passenger_phone,
            date_of_birth: '2000-01-01',
            nationality: 'MX',
            document_type: 'PASSPORT',
            document_number: 'TEMP' + Date.now(),
          };
          passenger = await passengerService.createPassenger(passengerData);
        }
      } catch (error) {
        console.error('Error al obtener/crear pasajero:', error);
        throw error;
      }
      
      // Crear reserva con estado pending y todos los detalles
      const reservaData = {
        flight: selectedFlight.id,
        passenger: passenger.id,
        seat_number: bookingData.seat_number || 'AUTO',
        total_price: Number(selectedFlight.price || selectedFlight.base_price || 100),
        status: 'pending',
        travel_class: bookingData.travel_class as 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST_CLASS',
        checked_baggage: bookingData.checked_baggage,
        carry_on_baggage: bookingData.carry_on_baggage,
        meal_preference: bookingData.meal_preference,
        special_requests: bookingData.special_requests,
      };
      
      await bookingService.createBooking(reservaData);
      
      setShowBookingModal(false);
      setSelectedFlight(null);
      
      const precio = Number(selectedFlight.price || selectedFlight.base_price || 0).toFixed(2);
      alert(`✅ Reserva creada exitosamente!\n\nTotal a pagar: $${precio}\n\nSerás redirigido a tus reservas donde podrás completar el pago.`);
      
      navigate('/bookings');
    } catch (error) {
      console.error('Error al crear reserva:', error);
      alert('❌ Error al crear la reserva. Por favor intenta de nuevo.');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      BOARDING: 'bg-yellow-100 text-yellow-800',
      DEPARTED: 'bg-indigo-100 text-indigo-800',
      IN_FLIGHT: 'bg-purple-100 text-purple-800',
      LANDED: 'bg-teal-100 text-teal-800',
      ARRIVED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      DELAYED: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <PrivateLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">✈️ Vuelos</h1>
            <p className="text-sm text-gray-500 mt-1">Tu rol: {role}</p>
          </div>
          {canCreate() && (
            <button 
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              + Agregar Vuelo
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando vuelos...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número de Vuelo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ruta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salida
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Llegada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flights.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No se encontraron vuelos
                    </td>
                  </tr>
                ) : (
                  flights.map((flight) => (
                    <tr key={flight.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {flight.flight_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {flight.origin_airport_name || flight.origin_airport} → {flight.destination_airport_name || flight.destination_airport}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(flight.departure_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(flight.arrival_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-green-600">
                          ${Number(flight.price || flight.base_price || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(flight.status)}`}>
                          {flight.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {role === 'CLIENTE' && (
                          <button
                            onClick={() => handleBook(flight)}
                            className="text-green-600 hover:text-green-900 mr-3 font-bold"
                          >
                            Reservar
                          </button>
                        )}
                        <button 
                          onClick={() => handleViewFlight(flight)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Ver
                        </button>
                        {canEdit() && (
                          <button 
                            onClick={() => handleEdit(flight)}
                            className="text-yellow-600 hover:text-yellow-900 mr-3"
                          >
                            Editar
                          </button>
                        )}
                        {canDelete() && (
                          <button 
                            onClick={() => handleDelete(flight.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Crear/Editar Vuelo */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingFlight ? '✏️ Editar Vuelo' : '➕ Agregar Nuevo Vuelo'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de Vuelo</label>
                    <input
                      type="text"
                      required
                      value={formData.flight_number}
                      onChange={(e) => setFormData({...formData, flight_number: e.target.value.toUpperCase()})}
                      placeholder="AA123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aerolínea</label>
                    <select
                      required
                      value={formData.airline}
                      onChange={(e) => setFormData({...formData, airline: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={0}>Seleccione aerolínea</option>
                      {airlines.map(airline => (
                        <option key={airline.id} value={airline.id}>
                          {airline.name} ({airline.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aeropuerto Origen</label>
                    <select
                      required
                      value={formData.origin_airport}
                      onChange={(e) => setFormData({...formData, origin_airport: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={0}>Seleccione origen</option>
                      {airports.map(airport => (
                        <option key={airport.id} value={airport.id}>
                          {airport.city} - {airport.name} ({airport.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aeropuerto Destino</label>
                    <select
                      required
                      value={formData.destination_airport}
                      onChange={(e) => setFormData({...formData, destination_airport: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={0}>Seleccione destino</option>
                      {airports.map(airport => (
                        <option key={airport.id} value={airport.id}>
                          {airport.city} - {airport.name} ({airport.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha y Hora de Salida</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.departure_time}
                      onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha y Hora de Llegada</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.arrival_time}
                      onChange={(e) => setFormData({...formData, arrival_time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="SCHEDULED">Programado</option>
                      <option value="BOARDING">Abordando</option>
                      <option value="DEPARTED">Despegado</option>
                      <option value="IN_FLIGHT">En Vuelo</option>
                      <option value="LANDED">Aterrizado</option>
                      <option value="ARRIVED">Arribado</option>
                      <option value="CANCELLED">Cancelado</option>
                      <option value="DELAYED">Retrasado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Aeronave *</label>
                    <input
                      type="text"
                      required
                      value={formData.aircraft_type}
                      onChange={(e) => setFormData({...formData, aircraft_type: e.target.value})}
                      placeholder="Boeing 737, Airbus A320..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total de Asientos</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.total_seats}
                      onChange={(e) => {
                        const total = Number(e.target.value);
                        setFormData({
                          ...formData, 
                          total_seats: total,
                          available_seats: editingFlight ? formData.available_seats : total
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Asientos Disponibles</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max={formData.total_seats}
                      value={formData.available_seats}
                      onChange={(e) => setFormData({...formData, available_seats: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio Base ($) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.base_price}
                      onChange={(e) => {
                        const basePrice = Number(e.target.value);
                        setFormData({
                          ...formData, 
                          base_price: basePrice,
                          price: basePrice
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio Final ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : (editingFlight ? 'Actualizar Vuelo' : 'Guardar Vuelo')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Detalles del Vuelo */}
        {showDetailModal && selectedFlight && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Detalles del Vuelo</h2>
                  <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                    <div className="text-center mb-4">
                      <h3 className="text-3xl font-bold text-gray-900">{selectedFlight.flight_number}</h3>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedFlight.status)}`}>
                        {selectedFlight.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Origen</p>
                        <p className="font-bold text-lg">{selectedFlight.origin_airport_name || selectedFlight.origin_airport}</p>
                        <p className="text-gray-700">{new Date(selectedFlight.departure_time).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Destino</p>
                        <p className="font-bold text-lg">{selectedFlight.destination_airport_name || selectedFlight.destination_airport}</p>
                        <p className="text-gray-700">{new Date(selectedFlight.arrival_time).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm mb-1">Asientos Disponibles</p>
                      <p className="text-2xl font-bold text-gray-900">{selectedFlight.available_seats || 0}</p>
                      <p className="text-gray-500 text-sm">de {selectedFlight.total_seats || 0} totales</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm mb-1">Aerolínea</p>
                      <p className="text-xl font-bold text-gray-900">{selectedFlight.airline_name || 'N/A'}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-sm mb-1">Precio</p>
                      <p className="text-3xl font-bold text-green-600">
                        ${Number(selectedFlight.price || selectedFlight.base_price || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Modal de Reserva */}
        {showBookingModal && selectedFlight && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Reservar Vuelo</h2>
                  <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-lg mb-2">Detalles del Vuelo</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Vuelo:</span>
                      <span className="ml-2 font-semibold">{selectedFlight.flight_number}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Precio:</span>
                      <span className="ml-2 font-semibold text-green-600">
                        ${Number(selectedFlight.price || selectedFlight.base_price || 0).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Origen:</span>
                      <span className="ml-2 font-semibold">{selectedFlight.origin_airport_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Destino:</span>
                      <span className="ml-2 font-semibold">{selectedFlight.destination_airport_name}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleBookingSubmit({
                    passenger_name: formData.get('passenger_name') as string,
                    passenger_email: formData.get('passenger_email') as string,
                    passenger_phone: formData.get('passenger_phone') as string,
                    seat_number: formData.get('seat_number') as string,
                    travel_class: formData.get('travel_class') as string,
                    checked_baggage: Number(formData.get('checked_baggage')),
                    carry_on_baggage: Number(formData.get('carry_on_baggage')),
                    meal_preference: formData.get('meal_preference') as string,
                    special_requests: formData.get('special_requests') as string,
                  });
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
                    <input
                      type="text"
                      name="passenger_name"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="passenger_email"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="juan@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                    <input
                      type="tel"
                      name="passenger_phone"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="+52 123 456 7890"
                    />
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Detalles de la Reserva</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Clase de Viaje *</label>
                        <select
                          name="travel_class"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="ECONOMY">Económica</option>
                          <option value="PREMIUM_ECONOMY">Económica Premium</option>
                          <option value="BUSINESS">Ejecutiva</option>
                          <option value="FIRST_CLASS">Primera Clase</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Número de Asiento *</label>
                        <input
                          type="text"
                          name="seat_number"
                          placeholder="Ej: 12A"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Deja en blanco para asignación automática</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Maletas Facturadas</label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.currentTarget.nextElementSibling as HTMLInputElement;
                              if (input && Number(input.value) > 0) input.value = String(Number(input.value) - 1);
                            }}
                            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            <span className="text-xl">-</span>
                          </button>
                          <input
                            type="number"
                            name="checked_baggage"
                            defaultValue="1"
                            min="0"
                            max="5"
                            className="w-16 text-center px-2 py-2 border border-gray-300 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              if (input && Number(input.value) < 5) input.value = String(Number(input.value) + 1);
                            }}
                            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            <span className="text-xl">+</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Equipaje de Mano</label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.currentTarget.nextElementSibling as HTMLInputElement;
                              if (input && Number(input.value) > 0) input.value = String(Number(input.value) - 1);
                            }}
                            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            <span className="text-xl">-</span>
                          </button>
                          <input
                            type="number"
                            name="carry_on_baggage"
                            defaultValue="1"
                            min="0"
                            max="2"
                            className="w-16 text-center px-2 py-2 border border-gray-300 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                              if (input && Number(input.value) < 2) input.value = String(Number(input.value) + 1);
                            }}
                            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            <span className="text-xl">+</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferencia de Comida</label>
                      <select
                        name="meal_preference"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sin preferencia</option>
                        <option value="vegetarian">Vegetariana</option>
                        <option value="vegan">Vegana</option>
                        <option value="gluten_free">Sin Gluten</option>
                        <option value="kosher">Kosher</option>
                        <option value="halal">Halal</option>
                        <option value="diabetic">Diabética</option>
                      </select>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Solicitudes Especiales (Opcional)</label>
                      <textarea
                        name="special_requests"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Asiento cerca de la salida, asistencia especial, etc."
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                    ℹ️ Tu reserva quedará en estado PENDIENTE hasta que completes el pago en la sección de Reservas.
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowBookingModal(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      Crear Reserva
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}


      </div>
    </PrivateLayout>
  );
};
