import { flightsApiClient } from '../../infrastructure/http/httpClients';
import { Invoice, InvoiceCreate, InvoiceItem } from '../../domain/flights-api/flights-api.types';

export const invoiceService = {
  async getAllInvoices(params?: { status?: string; customer_name?: string; date_from?: string; date_to?: string }): Promise<Invoice[]> {
    try {
      const response = await flightsApiClient.get<Invoice[]>('/api/invoices/', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch invoices');
    }
  },

  async getInvoiceById(id: number): Promise<Invoice> {
    try {
      const response = await flightsApiClient.get<Invoice>(`/api/invoices/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching invoice:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch invoice');
    }
  },

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice> {
    try {
      const response = await flightsApiClient.get<Invoice>(`/api/invoices/number/${invoiceNumber}/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching invoice by number:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch invoice');
    }
  },

  async createInvoice(invoice: InvoiceCreate): Promise<Invoice> {
    try {
      const response = await flightsApiClient.post<Invoice>('/api/invoices/', invoice);
      return response.data;
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      throw new Error(error.response?.data?.message || 'Failed to create invoice');
    }
  },

  async updateInvoice(id: number, invoice: Partial<InvoiceCreate>): Promise<Invoice> {
    try {
      const response = await flightsApiClient.put<Invoice>(`/api/invoices/${id}/`, invoice);
      return response.data;
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      throw new Error(error.response?.data?.message || 'Failed to update invoice');
    }
  },

  async patchInvoice(id: number, invoice: Partial<InvoiceCreate>): Promise<Invoice> {
    try {
      const response = await flightsApiClient.patch<Invoice>(`/api/invoices/${id}/`, invoice);
      return response.data;
    } catch (error: any) {
      console.error('Error patching invoice:', error);
      throw new Error(error.response?.data?.message || 'Failed to patch invoice');
    }
  },

  async markAsPaid(id: number): Promise<Invoice> {
    try {
      const response = await flightsApiClient.post<Invoice>(`/api/invoices/${id}/mark_paid/`, {});
      return response.data;
    } catch (error: any) {
      console.error('Error marking invoice as paid:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark invoice as paid');
    }
  },

  async cancelInvoice(id: number): Promise<Invoice> {
    try {
      const response = await flightsApiClient.post<Invoice>(`/api/invoices/${id}/cancel/`, {});
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling invoice:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel invoice');
    }
  },

  async deleteInvoice(id: number): Promise<void> {
    try {
      await flightsApiClient.delete(`/api/invoices/${id}/`);
    } catch (error: any) {
      console.error('Error deleting invoice:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete invoice');
    }
  },

  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    try {
      const response = await flightsApiClient.get<InvoiceItem[]>(`/api/invoices/${invoiceId}/items/`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching invoice items:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch invoice items');
    }
  },

  async generateInvoicePDF(id: number): Promise<Blob> {
    try {
      const response = await flightsApiClient.get(`/api/invoices/${id}/pdf/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      console.error('Error generating invoice PDF:', error);
      throw new Error(error.response?.data?.message || 'Failed to generate PDF');
    }
  },
};

export default invoiceService;
