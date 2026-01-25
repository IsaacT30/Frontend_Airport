import { useEffect, useState } from 'react';
import { PrivateLayout } from '../../layouts/PrivateLayout';
import { airlineService } from '../../../application/airport-api/airline.service';
import { useRole } from '../../../application/auth/useRole';
import { Airline, AirlineCreate } from '../../../domain/airport-api/airport-api.types';

export const AirlinesPage = () => {
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingAirline, setViewingAirline] = useState<Airline | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AirlineCreate>({
    name: '',
    code: '',
    country: '',
    contact_email: '',
    contact_phone: '',
  });
  const [saving, setSaving] = useState(false);
  const { canCreate, canEdit, canDelete } = useRole();

  useEffect(() => {
    loadAirlines();
  }, []);

  const loadAirlines = async () => {
    try {
      setLoading(true);
      const data = await airlineService.getAllAirlines();
      setAirlines(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error loading airlines:', err);
      setError('Error al cargar aerolíneas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await airlineService.updateAirline(editingId, formData);
        alert('✅ Aerolínea actualizada exitosamente!');
      } else {
        await airlineService.createAirline(formData);
        alert('✅ Aerolínea creada exitosamente!');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', code: '', country: '', contact_email: '', contact_phone: '' });
      loadAirlines();
    } catch (err) {
      console.error('Error saving airline:', err);
      alert('❌ Error al guardar aerolínea');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (airline: Airline) => {
    setEditingId(airline.id);
    setFormData({
      name: airline.name,
      code: airline.code,
      country: airline.country,
      contact_email: airline.contact_email || '',
      contact_phone: airline.contact_phone || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', code: '', country: '', contact_email: '', contact_phone: '' });
  };

  const handleView = (airline: Airline) => {
    setViewingAirline(airline);
    setShowViewModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta aerolínea?')) return;
    try {
      await airlineService.deleteAirline(id);
      alert('✅ Aerolínea eliminada');
      loadAirlines();
    } catch (err) {
      console.error('Error deleting airline:', err);
      alert('❌ Error al eliminar');
    }
  };

  return (
    <PrivateLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🏢 Aerolíneas</h1>
          {canCreate() && (
            <button 
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              + Nueva Aerolínea
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
            <p className="text-gray-600">Cargando aerolíneas...</p>
          </div>
        ) : airlines.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No hay aerolíneas registradas</p>
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
                    País
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {airlines.map((airline) => (
                  <tr key={airline.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{airline.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{airline.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{airline.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleView(airline)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Ver
                      </button>
                      {canEdit() && (
                        <button 
                          onClick={() => handleEdit(airline)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Editar
                        </button>
                      )}
                      {canDelete() && (
                        <button 
                          onClick={() => handleDelete(airline.id)}
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

        {/* Modal para crear/editar aerolínea */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-6">
                {editingId ? 'Editar Aerolínea' : 'Agregar Aerolínea'}
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
                      maxLength={2}
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="AR"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email de Contacto</label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono de Contacto</label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
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
                    {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal para ver detalles de aerolínea */}
        {showViewModal && viewingAirline && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-6">Detalles de Aerolínea</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nombre</label>
                    <p className="text-lg font-semibold text-gray-900">{viewingAirline.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Código IATA</label>
                    <p className="text-lg font-semibold text-gray-900">{viewingAirline.code}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">País</label>
                    <p className="text-lg text-gray-900">{viewingAirline.country}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email de Contacto</label>
                    <p className="text-lg text-gray-900">{viewingAirline.contact_email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Teléfono de Contacto</label>
                    <p className="text-lg text-gray-900">{viewingAirline.contact_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fecha de Creación</label>
                    <p className="text-lg text-gray-900">
                      {viewingAirline.created_at ? new Date(viewingAirline.created_at).toLocaleDateString() : 'N/A'}
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
