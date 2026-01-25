import { useEffect, useState } from 'react';
import { PrivateLayout } from '../../layouts/PrivateLayout';
import { flightService } from '../../../application/airport-api/flight.service';
import { airlineService } from '../../../application/airport-api/airline.service';
import { airportService } from '../../../application/airport-api/airport.service';
import { Flight, FlightCreate, Airline, Airport } from '../../../domain/airport-api/airport-api.types';
import { useRole } from '../../../application/auth/useRole';

export const FlightsPage = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);
  const [saving, setSaving] = useState(false);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
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
  }, []);

  const loadFlights = async () => {
    try {
      setLoading(true);
      const data = await flightService.getAllFlights();
      // Asegurar que data sea un array
      setFlights(Array.isArray(data) ? data : []);
      setError('');
    } catch (err: any) {
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
    } catch (err) {
      console.error('Error loading airlines:', err);
    }
  };

  const loadAirports = async () => {
    try {
      const data = await airportService.getAllAirports();
      setAirports(Array.isArray(data) ? data : []);
    } catch (err) {
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
    } catch (err: any) {
      console.error('Error saving flight:', err);
      console.error('Response data:', err.response?.data);
      
      // Extraer mensaje de error más detallado
      let errorMsg = 'Error desconocido';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMsg = err.response.data;
        } else if (err.response.data.detail) {
          errorMsg = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        } else {
          // Mostrar errores de validación de campos
          const errors = Object.entries(err.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('\n');
          errorMsg = errors || err.message;
        }
      } else if (err.message) {
        errorMsg = err.message;
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
      aircraft_type: (flight as any).aircraft_type || 'Boeing 737',
      base_price: (flight as any).base_price || flight.price || 0,
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
            <p className="mt-4 text-gray-600">Loading flights...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flight Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Departure
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Arrival
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flights.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No flights found
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
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(flight.status)}`}>
                          {flight.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">Ver</button>
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
      </div>
    </PrivateLayout>
  );
};
