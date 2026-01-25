import { useEffect, useState } from 'react';
import { PrivateLayout } from '../../layouts/PrivateLayout';
import { passengerService } from '../../../application/airport-api/passenger.service';
import { Passenger, PassengerCreate } from '../../../domain/airport-api/airport-api.types';
import { useRole } from '../../../application/auth/useRole';

export const PassengersPage = () => {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [editingPassenger, setEditingPassenger] = useState<Passenger | null>(null);
  const [formData, setFormData] = useState<PassengerCreate>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    nationality: '',
    document_type: 'PASSPORT',
    document_number: '',
  });
  const [saving, setSaving] = useState(false);
  const { canCreate, canEdit, canDelete, role } = useRole();

  useEffect(() => {
    loadPassengers();
  }, []);

  const loadPassengers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await passengerService.getAllPassengers();
      console.log('Passengers loaded:', data);
      console.log('Is array?', Array.isArray(data));
      console.log('Length:', data?.length);
      setPassengers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load passengers:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.detail || err.message || 'Error al cargar pasajeros';
      setError(errorMessage);
      setPassengers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPassenger) {
        // Editar pasajero existente
        console.log('Updating passenger:', editingPassenger.id, formData);
        await passengerService.updatePassenger(editingPassenger.id, formData);
        alert('✅ Pasajero actualizado exitosamente!');
      } else {
        // Crear nuevo pasajero
        console.log('Creating passenger with data:', formData);
        await passengerService.createPassenger(formData);
        alert('✅ Pasajero creado exitosamente!');
      }
      setShowModal(false);
      setEditingPassenger(null);
      resetForm();
      loadPassengers();
    } catch (err: any) {
      console.error('Error creating passenger:', err);
      console.error('Error response:', err.response?.data);
      
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
      
      alert(`❌ Error al ${editingPassenger ? 'actualizar' : 'crear'} pasajero:\n${errorMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetails = (passenger: Passenger) => {
    setSelectedPassenger(passenger);
    setShowDetailModal(true);
  };

  const handleEdit = (passenger: Passenger) => {
    setEditingPassenger(passenger);
    
    // Formatear fecha para input tipo date (YYYY-MM-DD)
    const formatDateForInput = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    setFormData({
      first_name: passenger.first_name,
      last_name: passenger.last_name,
      email: passenger.email,
      phone: passenger.phone,
      date_of_birth: formatDateForInput(passenger.date_of_birth),
      nationality: passenger.nationality,
      document_type: passenger.document_type,
      document_number: passenger.document_number,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      nationality: '',
      document_type: 'PASSPORT',
      document_number: '',
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPassenger(null);
    resetForm();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este pasajero?')) return;
    try {
      await passengerService.deletePassenger(id);
      alert('✅ Pasajero eliminado');
      loadPassengers();
    } catch (err) {
      console.error('Error deleting passenger:', err);
      alert('❌ Error al eliminar');
    }
  };

  return (
    <PrivateLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👤 Pasajeros</h1>
            <p className="text-sm text-gray-500 mt-1">Tu rol: {role}</p>
          </div>
          {canCreate() && (
            <button 
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              + Agregar Pasajero
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <strong>Error:</strong> {error}
            <div className="text-xs mt-2">Abre la consola del navegador (F12) para más detalles</div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando pasajeros...</p>
          </div>
        ) : passengers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay pasajeros registrados</h3>
            <p className="text-gray-600 mb-4">Comienza agregando tu primer pasajero</p>
            {canCreate() && (
              <button 
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
              >
                + Agregar Primer Pasajero
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nacionalidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">F. Nacimiento</th>
                  {(canEdit() || canDelete()) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {passengers.map((passenger) => (
                  <tr key={passenger.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {passenger.first_name} {passenger.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{passenger.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{passenger.document_number}</div>
                      <div className="text-xs text-gray-500">{passenger.document_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{passenger.nationality}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{new Date(passenger.date_of_birth).toLocaleDateString()}</div>
                    </td>
                    {(canEdit() || canDelete()) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleViewDetails(passenger)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Ver
                        </button>
                        {canEdit() && (
                          <button 
                            onClick={() => handleEdit(passenger)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Editar
                          </button>
                        )}
                        {canDelete() && (
                          <button 
                            onClick={() => handleDelete(passenger.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal para crear/editar pasajero */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                {editingPassenger ? '✏️ Editar Pasajero' : '➕ Agregar Pasajero'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento</label>
                    <select
                      required
                      value={formData.document_type}
                      onChange={(e) => setFormData({...formData, document_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="PASSPORT">Pasaporte</option>
                      <option value="ID_CARD">Cédula/DNI</option>
                      <option value="DRIVER_LICENSE">Licencia de Conducir</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de Documento</label>
                    <input
                      type="text"
                      required
                      value={formData.document_number}
                      onChange={(e) => setFormData({...formData, document_number: e.target.value.toUpperCase()})}
                      placeholder="ABC123456"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nacionalidad</label>
                    <input
                      type="text"
                      required
                      value={formData.nationality}
                      onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      required
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
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
                    {saving ? 'Guardando...' : (editingPassenger ? 'Actualizar Pasajero' : 'Guardar Pasajero')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Detalles del Pasajero */}
        {showDetailModal && selectedPassenger && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">👤 Detalles del Pasajero</h2>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-xl font-bold text-indigo-900">
                    {selectedPassenger.first_name} {selectedPassenger.last_name}
                  </h3>
                  <p className="text-sm text-indigo-600">{selectedPassenger.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                  <p className="text-lg font-semibold">
                    {selectedPassenger.document_type === 'PASSPORT' ? 'Pasaporte' : 
                     selectedPassenger.document_type === 'ID_CARD' ? 'Cédula/DNI' : 
                     'Licencia de Conducir'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de Documento</label>
                  <p className="text-lg font-semibold">{selectedPassenger.document_number}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
                  <p className="font-semibold">{selectedPassenger.nationality}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                  <p className="font-semibold">{new Date(selectedPassenger.date_of_birth).toLocaleDateString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <p className="font-semibold">{selectedPassenger.phone}</p>
                </div>

                {selectedPassenger.gender && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                    <p className="font-semibold">
                      {selectedPassenger.gender === 'M' ? 'Masculino' : 
                       selectedPassenger.gender === 'F' ? 'Femenino' : 'Otro'}
                    </p>
                  </div>
                )}

                {selectedPassenger.address && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <p className="font-semibold">{selectedPassenger.address}</p>
                  </div>
                )}

                {(selectedPassenger.city || selectedPassenger.country) && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                    <p className="font-semibold">
                      {selectedPassenger.city}{selectedPassenger.city && selectedPassenger.country ? ', ' : ''}
                      {selectedPassenger.country}
                    </p>
                  </div>
                )}

                {selectedPassenger.frequent_flyer_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Viajero Frecuente</label>
                    <p className="font-semibold">{selectedPassenger.frequent_flyer_number}</p>
                  </div>
                )}

                {selectedPassenger.special_needs && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Necesidades Especiales</label>
                    <p className="font-semibold text-orange-600">{selectedPassenger.special_needs}</p>
                  </div>
                )}

                <div className="col-span-2 pt-2 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                    selectedPassenger.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedPassenger.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
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
