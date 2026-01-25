import { useEffect, useState } from 'react';
import { PrivateLayout } from '../../layouts/PrivateLayout';
import { crewService } from '../../../application/airport-api/crew.service';
import { useRole } from '../../../application/auth/useRole';
import { CrewMember, CrewMemberCreate } from '../../../domain/airport-api/airport-api.types';

export const CrewPage = () => {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingCrew, setViewingCrew] = useState<CrewMember | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CrewMemberCreate>({
    first_name: '',
    last_name: '',
    employee_id: '',
    position: '',
    license_number: '',
    hire_date: '',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);
  const { canCreate, canEdit, canDelete } = useRole();

  useEffect(() => {
    loadCrewMembers();
  }, []);

  const loadCrewMembers = async () => {
    try {
      setLoading(true);
      const data = await crewService.getAllCrewMembers();
      setCrewMembers(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Error loading crew members:', err);
      setError('Error al cargar tripulación');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await crewService.updateCrewMember(editingId, formData);
        alert('✅ Miembro de tripulación actualizado exitosamente!');
      } else {
        await crewService.createCrewMember(formData);
        alert('✅ Miembro de tripulación creado exitosamente!');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ 
        first_name: '', 
        last_name: '', 
        employee_id: '',
        position: '', 
        license_number: '', 
        hire_date: '', 
        status: 'active' 
      });
      loadCrewMembers();
    } catch (err) {
      console.error('Error saving crew member:', err);
      alert('❌ Error al guardar miembro de tripulación');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (crew: CrewMember) => {
    setEditingId(crew.id);
    setFormData({
      first_name: crew.first_name,
      last_name: crew.last_name,
      employee_id: crew.employee_id,
      position: crew.position,
      license_number: crew.license_number || '',
      hire_date: crew.hire_date,
      status: crew.status,
    });
    setShowModal(true);
  };

  const handleView = (crew: CrewMember) => {
    setViewingCrew(crew);
    setShowViewModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ 
      first_name: '', 
      last_name: '', 
      employee_id: '',
      position: '', 
      license_number: '', 
      hire_date: '', 
      status: 'active' 
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este miembro de tripulación?')) return;
    try {
      await crewService.deleteCrewMember(id);
      alert('✅ Miembro de tripulación eliminado');
      loadCrewMembers();
    } catch (err) {
      console.error('Error deleting crew member:', err);
      alert('❌ Error al eliminar');
    }
  };

  return (
    <PrivateLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">👨‍✈️ Tripulación</h1>
          {canCreate() && (
            <button 
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              + Nuevo Miembro
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
            <p className="text-gray-600">Cargando tripulación...</p>
          </div>
        ) : crewMembers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No hay miembros de tripulación registrados</p>
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
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Licencia
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
                {crewMembers.map((crew) => (
                  <tr key={crew.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {crew.first_name} {crew.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{crew.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{crew.license_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        crew.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {crew.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleView(crew)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Ver
                      </button>
                      {canEdit() && (
                        <button 
                          onClick={() => handleEdit(crew)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Editar
                        </button>
                      )}
                      {canDelete() && (
                        <button 
                          onClick={() => handleDelete(crew.id)}
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

        {/* Modal para crear/editar miembro de tripulación */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full">
              <h2 className="text-2xl font-bold mb-6">
                {editingId ? 'Editar Miembro de Tripulación' : 'Agregar Miembro de Tripulación'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID de Empleado</label>
                    <input
                      type="text"
                      required
                      value={formData.employee_id}
                      onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="EMP-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Posición</label>
                    <select
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="pilot">Piloto</option>
                      <option value="copilot">Copiloto</option>
                      <option value="flight_attendant">Auxiliar de vuelo</option>
                      <option value="engineer">Ingeniero de vuelo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de Licencia</label>
                    <input
                      type="text"
                      required
                      value={formData.license_number}
                      onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Contratación</label>
                    <input
                      type="date"
                      required
                      value={formData.hire_date}
                      onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
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
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
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

        {/* Modal para ver detalles de miembro de tripulación */}
        {showViewModal && viewingCrew && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-6">Detalles de Miembro de Tripulación</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nombre Completo</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {viewingCrew.first_name} {viewingCrew.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">ID de Empleado</label>
                    <p className="text-lg text-gray-900">{viewingCrew.employee_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Posición</label>
                    <p className="text-lg text-gray-900">{viewingCrew.position}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Número de Licencia</label>
                    <p className="text-lg text-gray-900">{viewingCrew.license_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fecha de Contratación</label>
                    <p className="text-lg text-gray-900">
                      {new Date(viewingCrew.hire_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Estado</label>
                    <p className="text-lg text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        viewingCrew.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {viewingCrew.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fecha de Creación</label>
                    <p className="text-lg text-gray-900">
                      {viewingCrew.created_at ? new Date(viewingCrew.created_at).toLocaleDateString() : 'N/A'}
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
