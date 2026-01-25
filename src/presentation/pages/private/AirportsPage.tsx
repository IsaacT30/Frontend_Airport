import { useEffect, useState } from 'react';
import { PrivateLayout } from '../../layouts/PrivateLayout';
import { airportService } from '../../../application/airport-api/airport.service';
import { useRole } from '../../../application/auth/useRole';
import { Airport, AirportCreate } from '../../../domain/airport-api/airport-api.types';

export const AirportsPage = () => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingAirport, setViewingAirport] = useState<Airport | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AirportCreate>({
    name: '',
    code: '',
    city: '',
    country: '',
    timezone: '',
  });
  const [saving, setSaving] = useState(false);
  const { canCreate, canEdit, canDelete } = useRole();

  useEffect(() => {
    loadAirports();
  }, []);

  const loadAirports = async () => {
    try {
      setLoading(true);
      const data = await airportService.getAllAirports();
      setAirports(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error loading airports:', err);
      setError('Error al cargar aeropuertos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await airportService.updateAirport(editingId, formData);
        alert('✅ Aeropuerto actualizado exitosamente!');
      } else {
        await airportService.createAirport(formData);
        alert('✅ Aeropuerto creado exitosamente!');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', code: '', city: '', country: '', timezone: '' });
      loadAirports();
    } catch (err) {
      console.error('Error saving airport:', err);
      alert('❌ Error al guardar aeropuerto');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (airport: Airport) => {
    setEditingId(airport.id);
    setFormData({
      name: airport.name,
      code: airport.code,
      city: airport.city,
      country: airport.country,
      timezone: airport.timezone || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', code: '', city: '', country: '', timezone: '' });
  };

  const handleView = (airport: Airport) => {
    setViewingAirport(airport);
    setShowViewModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este aeropuerto?')) return;
    try {
      await airportService.deleteAirport(id);
      alert('✅ Aeropuerto eliminado');
      loadAirports();
    } catch (err) {
      console.error('Error deleting airport:', err);
      alert('❌ Error al eliminar');
    }
  };

  return (
    <PrivateLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🏛️ Aeropuertos</h1>
          {canCreate() && (
            <button 
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              + Nuevo Aeropuerto
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
            <p className="text-gray-600">Cargando aeropuertos...</p>
          </div>
        ) : airports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No hay aeropuertos registrados</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ciudad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    País
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {airports.map((airport) => (
                  <tr key={airport.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{airport.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{airport.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{airport.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{airport.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleView(airport)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Ver
                      </button>
                      {canEdit() && (
                        <button 
                          onClick={() => handleEdit(airport)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Editar
                        </button>
                      )}
                      {canDelete() && (
                        <button 
                          onClick={() => handleDelete(airport.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal para crear/editar aeropuerto */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-6">
                {editingId ? 'Editar Aeropuerto' : 'Agregar Aeropuerto'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código (IATA)</label>
                    <input
                      type="text"
                      required
                      maxLength={3}
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="EZE"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zona Horaria (Opcional)</label>
                    <input
                      type="text"
                      value={formData.timezone}
                      onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="America/Buenos_Aires"
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
                    {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal para ver detalles de aeropuerto */}
        {showViewModal && viewingAirport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-6">Detalles de Aeropuerto</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nombre</label>
                    <p className="text-lg font-semibold text-gray-900">{viewingAirport.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Código IATA</label>
                    <p className="text-lg font-semibold text-gray-900">{viewingAirport.code}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Ciudad</label>
                    <p className="text-lg text-gray-900">{viewingAirport.city}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">País</label>
                    <p className="text-lg text-gray-900">{viewingAirport.country}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Zona Horaria</label>
                    <p className="text-lg text-gray-900">{viewingAirport.timezone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fecha de Creación</label>
                    <p className="text-lg text-gray-900">
                      {viewingAirport.created_at ? new Date(viewingAirport.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  );
};
