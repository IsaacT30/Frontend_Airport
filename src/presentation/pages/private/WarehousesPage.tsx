import { PrivateLayout } from '../../layouts/PrivateLayout';

export const WarehousesPage = () => {
  return (
    <PrivateLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🏭 Almacenes</h1>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-yellow-900 mb-2">Módulo No Disponible</h2>
          <p className="text-yellow-800 mb-4">
            Este módulo requiere el endpoint <code className="bg-yellow-100 px-2 py-1 rounded">/api/warehouses/</code> que no está desplegado en el backend actual.
          </p>
          <p className="text-sm text-yellow-700">
            Backend: <strong>https://vuelos-api.desarrollo-software.xyz</strong>
          </p>
        </div>
      </div>
    </PrivateLayout>
  );
};
