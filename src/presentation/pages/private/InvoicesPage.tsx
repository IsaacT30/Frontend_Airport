import { useEffect, useState } from 'react';
import { PrivateLayout } from '../../layouts/PrivateLayout';
import { Invoice } from '../../../domain/flights-api/flights-api.types';

export const InvoicesPage = () => {
  const [_invoices, _setInvoices] = useState<Invoice[]>([]);
  const [_loading, _setLoading] = useState(false);

  useEffect(() => {
    // Este módulo no está disponible en el backend actual
    // Endpoint /api/invoices/ no desplegado
  }, []);


  return (
    <PrivateLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">📄 Facturas</h1>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-yellow-900 mb-2">Módulo No Disponible</h2>
          <p className="text-yellow-800 mb-4">
            Este módulo requiere el endpoint <code className="bg-yellow-100 px-2 py-1 rounded">/api/invoices/</code> que no está desplegado en el backend actual.
          </p>
          <p className="text-sm text-yellow-700">
            Backend: <strong>https://vuelos-api.desarrollo-software.xyz</strong>
          </p>
        </div>
      </div>
    </PrivateLayout>
  );
};
