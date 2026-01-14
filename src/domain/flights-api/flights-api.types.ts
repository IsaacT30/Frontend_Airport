// Flights API Domain Types

// Catalog Types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

// Invoice Types
export interface Invoice {
  id: number;
  invoice_number: string;
  customer_name: string;
  customer_email?: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'cancelled';
  items?: InvoiceItem[];
  created_at: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id: number;
  invoice: number;
  product: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// User Types (beyond auth)
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
}

// Warehouse Types
export interface Warehouse {
  id: number;
  name: string;
  location: string;
  capacity: number;
  manager?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WarehouseInventory {
  id: number;
  warehouse: number;
  product: number;
  quantity: number;
  last_updated?: string;
}
