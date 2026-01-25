import { useEffect, useState } from 'react';
import { PrivateLayout } from '../../layouts/PrivateLayout';
import { maintenanceService } from '../../../application/airport-api/maintenance.service';
import { useRole } from '../../../application/auth/useRole';
import { MaintenanceRecord, MaintenanceRecordCreate } from '../../../domain/airport-api/airport-api.types';

export const MaintenancePage = () => {
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<MaintenanceRecord | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<MaintenanceRecordCreate>({
    aircraft_id: '',
    maintenance_type: '',
    scheduled_date: '',
    completed_date: '',
    description: '',
    technician: '',
    status: 'scheduled',
  });
  const [saving, setSaving] = useState(false);
  const { canCreate, canEdit, canDelete } = useRole();

  useEffect(() => {
    loadMaintenanceRecords();
  }, []);

  const loadMaintenanceRecords = async () => {
    try {
      setLoading(true);
      const data = await maintenanceService.getAllMaintenanceRecords();
      setMaintenanceRecords(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error loading maintenance records:', err);
      setError('Error al cargar registros de mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await maintenanceService.updateMaintenanceRecord(editingId, formData);
        alert('✅ Registro de mantenimiento actualizado exitosamente!');
      } else {
        await maintenanceService.createMaintenanceRecord(formData);
        alert('✅ Registro de mantenimiento creado exitosamente!');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ 
        aircraft_id: '',
        maintenance_type: '',
        scheduled_date: '',
        completed_date: '',
        description: '',
        technician: '',
        status: 'scheduled',
      });
      loadMaintenanceRecords();
    } catch (err) {
      console.error('Error saving maintenance record:', err);
      alert('❌ Error al guardar registro de mantenimiento');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (record: MaintenanceRecord) => {
    setEditingId(record.id);
    setFormData({
      aircraft_id: record.aircraft_id,
      maintenance_type: record.maintenance_type,
      scheduled_date: record.scheduled_date,
      completed_date: record.completed_date || '',
      description: record.description,
      technician: record.technician || '',
      status: record.status,
    });
    setShowModal(true);
  };

  const handleView = (record: MaintenanceRecord) => {
    setViewingRecord(record);
    setShowViewModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ 
      aircraft_id: '',
      maintenance_type: '',
      scheduled_date: '',
      completed_date: '',
      description: '',
      technician: '',
      status: 'scheduled',
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este registro de mantenimiento?')) return;
    try {
      await maintenanceService.deleteMaintenanceRecord(id);
      alert('✅ Registro de mantenimiento eliminado');
      loadMaintenanceRecords();
    } catch (err) {
      console.error('Error deleting maintenance record:', err);
      alert('❌ Error al eliminar');
    }
  };

  return (
    <PrivateLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🔧 Mantenimiento</h1>
          {canCreate() && (
            <button 
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              + Nuevo Registro
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
            <p className="text-gray-600">Cargando registros de mantenimiento...</p>
          </div>
        ) : maintenanceRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No hay registros de mantenimiento</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {maintenanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(record.scheduled_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{record.maintenance_type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {record.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : record.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleView(record)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Ver
                      </button>
                      {canEdit() && (
                        <button 
                          onClick={() => handleEdit(record)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Editar
                        </button>
                      )}
                      {canDelete() && (
                        <button 
                          onClick={() => handleDelete(record.id)}
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

        {/* Modal para crear/editar registro de mantenimiento */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                {editingId ? 'Editar Registro de Mantenimiento' : 'Agregar Registro de Mantenimiento'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID de Aeronave</label>
                    <input
                      type="text"
                      required
                      value={formData.aircraft_id}
                      onChange={(e) => setFormData({...formData, aircraft_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Mantenimiento</label>
                    <select
                      required
                      value={formData.maintenance_type}
                      onChange={(e) => setFormData({...formData, maintenance_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="routine">Rutinario</option>
                      <option value="inspection">Inspección</option>
                      <option value="repair">Reparación</option>
                      <option value="overhaul">Revisión Mayor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Programada</label>
                    <input
                      type="date"
                      required
                      value={formData.scheduled_date}
                      onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Completación (Opcional)</label>
                    <input
                      type="date"
                      value={formData.completed_date}
                      onChange={(e) => setFormData({...formData, completed_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Técnico (Opcional)</label>
                    <input
                      type="text"
                      value={formData.technician}
                      onChange={(e) => setFormData({...formData, technician: e.target.value})}
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
                      <option value="scheduled">Programado</option>
                      <option value="in_progress">En Progreso</option>
                      <option value="completed">Completado</option>
                    </select>
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

        {/* Modal para ver detalles de registro de mantenimiento */}
        {showViewModal && viewingRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-6">Detalles de Mantenimiento</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">ID de Aeronave</label>
                    <p className="text-lg font-semibold text-gray-900">{viewingRecord.aircraft_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Tipo de Mantenimiento</label>
                    <p className="text-lg text-gray-900">{viewingRecord.maintenance_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fecha Programada</label>
                    <p className="text-lg text-gray-900">
                      {new Date(viewingRecord.scheduled_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fecha de Completación</label>
                    <p className="text-lg text-gray-900">
                      {viewingRecord.completed_date 
                        ? new Date(viewingRecord.completed_date).toLocaleDateString() 
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Descripción</label>
                    <p className="text-lg text-gray-900">{viewingRecord.description}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Técnico</label>
                    <p className="text-lg text-gray-900">{viewingRecord.technician || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Estado</label>
                    <p className="text-lg text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        viewingRecord.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : viewingRecord.status === 'in_progress'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {viewingRecord.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fecha de Creación</label>
                    <p className="text-lg text-gray-900">
                      {viewingRecord.created_at ? new Date(viewingRecord.created_at).toLocaleDateString() : 'N/A'}
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
