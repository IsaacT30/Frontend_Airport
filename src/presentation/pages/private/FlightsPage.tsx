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
    status: 'scheduled',
    available_seats: 100,
    total_seats: 100,
    price: 0,
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
      await flightService.createFlight(formData);
      alert('✅ Vuelo creado exitosamente!');
      setShowModal(false);
      setFormData({
        flight_number: '',
        airline: 0,
        origin_airport: 0,
        destination_airport: 0,
        departure_time: '',
        arrival_time: '',
        status: 'scheduled',
        available_seats: 100,
        total_seats: 100,
        price: 0,
      });
      loadFlights();
    } catch (err: any) {
      console.error('Error creating flight:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Error desconocido';
      alert(`❌ Error al crear vuelo: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
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
      scheduled: 'bg-blue-100 text-blue-800',
      boarding: 'bg-yellow-100 text-yellow-800',
      departed: 'bg-green-100 text-green-800',
      arrived: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      delayed: 'bg-orange-100 text-orange-800',
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
                          <button className="text-yellow-600 hover:text-yellow-900 mr-3">Editar</button>
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

        {/* Modal Crear Vuelo */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Agregar Nuevo Vuelo</h2>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total de Asientos</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.total_seats}
                      onChange={(e) => setFormData({...formData, total_seats: Number(e.target.value), available_seats: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio ($)</label>
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
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar Vuelo'}
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
