import { flightsApiClient } from '../../infrastructure/http/httpClients';
import { Invoice, InvoiceItem } from '../../domain/flights-api/flights-api.types';

export const invoiceService = {
  async getAllInvoices(): Promise<Invoice[]> {
    const response = await flightsApiClient.get<Invoice[]>('/api/invoices/');
    return response.data;
  },

  async getInvoiceById(id: number): Promise<Invoice> {
    const response = await flightsApiClient.get<Invoice>(`/api/invoices/${id}/`);
    return response.data;
  },

  async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at'>): Promise<Invoice> {
    const response = await flightsApiClient.post<Invoice>('/api/invoices/', invoice);
    return response.data;
  },

  async updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice> {
    const response = await flightsApiClient.put<Invoice>(`/api/invoices/${id}/`, invoice);
    return response.data;
  },

  async deleteInvoice(id: number): Promise<void> {
    await flightsApiClient.delete(`/api/invoices/${id}/`);
  },

  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    const response = await flightsApiClient.get<InvoiceItem[]>(`/api/invoices/${invoiceId}/items/`);
    return response.data;
  },
};
