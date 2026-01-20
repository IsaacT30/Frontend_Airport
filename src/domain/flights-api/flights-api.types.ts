// Tipos de Dominio de API de Vuelos (API de Facturación)

// Tipos de Catálogo
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  stock: number;
  category?: string;
  sku?: string;
  image?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductCreate {
  name: string;
  description: string;
  price: string | number;
  stock: number;
  category?: string;
  sku?: string;
  image?: string;
  is_active?: boolean;
}

// Tipos de Factura
export interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  total_amount: string | number;
  subtotal?: string | number;
  tax?: string | number;
  discount?: string | number;
  status: 'pending' | 'paid' | 'cancelled' | 'overdue';
  payment_method?: string;
  due_date?: string;
  paid_date?: string;
  items?: InvoiceItem[];
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface InvoiceCreate {
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  payment_method?: string;
  due_date?: string;
  items: InvoiceItemCreate[];
  notes?: string;
}

export interface InvoiceItem {
  id: number;
  invoice: number;
  product: number;
  product_details?: Product;
  product_name?: string;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
  discount?: string | number;
  tax?: string | number;
}

export interface InvoiceItemCreate {
  product: number;
  quantity: number;
  unit_price?: string | number;
  discount?: string | number;
}

// Tipos de Usuario (más allá de autenticación)
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  is_staff?: boolean;
  date_joined: string;
  last_login?: string;
}

export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Tipos de Almacén
export interface Warehouse {
  id: number;
  name: string;
  location: string;
  address?: string;
  capacity: number;
  current_stock?: number;
  manager?: string;
  contact_phone?: string;
  contact_email?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WarehouseCreate {
  name: string;
  location: string;
  address?: string;
  capacity: number;
  manager?: string;
  contact_phone?: string;
  contact_email?: string;
  is_active?: boolean;
}

export interface WarehouseInventory {
  id: number;
  warehouse: number;
  warehouse_details?: Warehouse;
  product: number;
  product_details?: Product;
  quantity: number;
  minimum_stock?: number;
  maximum_stock?: number;
  reorder_point?: number;
  last_updated?: string;
}

export interface WarehouseInventoryCreate {
  warehouse: number;
  product: number;
  quantity: number;
  minimum_stock?: number;
  maximum_stock?: number;
  reorder_point?: number;
}

// Tipos de Pago
export interface Payment {
  id: number;
  invoice: number;
  invoice_details?: Invoice;
  amount: string | number;
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'other';
  payment_date: string;
  reference_number?: string;
  notes?: string;
  status: 'completed' | 'pending' | 'failed';
  created_at?: string;
}

export interface PaymentCreate {
  invoice: number;
  amount: string | number;
  payment_method: string;
  payment_date: string;
  reference_number?: string;
  notes?: string;
}
