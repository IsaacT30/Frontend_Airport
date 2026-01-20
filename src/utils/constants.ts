// Constantes de la Aplicación

// Estados de Vuelos
export const FLIGHT_STATUS = {
  SCHEDULED: 'scheduled',
  BOARDING: 'boarding',
  DEPARTED: 'departed',
  ARRIVED: 'arrived',
  CANCELLED: 'cancelled',
  DELAYED: 'delayed',
} as const;

export const FLIGHT_STATUS_OPTIONS = [
  { value: FLIGHT_STATUS.SCHEDULED, label: 'Scheduled' },
  { value: FLIGHT_STATUS.BOARDING, label: 'Boarding' },
  { value: FLIGHT_STATUS.DEPARTED, label: 'Departed' },
  { value: FLIGHT_STATUS.ARRIVED, label: 'Arrived' },
  { value: FLIGHT_STATUS.CANCELLED, label: 'Cancelled' },
  { value: FLIGHT_STATUS.DELAYED, label: 'Delayed' },
];

// Estados de Reservas
export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  PENDING: 'pending',
} as const;

export const BOOKING_STATUS_OPTIONS = [
  { value: BOOKING_STATUS.PENDING, label: 'Pending' },
  { value: BOOKING_STATUS.CONFIRMED, label: 'Confirmed' },
  { value: BOOKING_STATUS.COMPLETED, label: 'Completed' },
  { value: BOOKING_STATUS.CANCELLED, label: 'Cancelled' },
];

// Estados de Facturas
export const INVOICE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  OVERDUE: 'overdue',
} as const;

export const INVOICE_STATUS_OPTIONS = [
  { value: INVOICE_STATUS.PENDING, label: 'Pending' },
  { value: INVOICE_STATUS.PAID, label: 'Paid' },
  { value: INVOICE_STATUS.OVERDUE, label: 'Overdue' },
  { value: INVOICE_STATUS.CANCELLED, label: 'Cancelled' },
];

// Estados de Mantenimiento
export const MAINTENANCE_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const MAINTENANCE_STATUS_OPTIONS = [
  { value: MAINTENANCE_STATUS.SCHEDULED, label: 'Scheduled' },
  { value: MAINTENANCE_STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: MAINTENANCE_STATUS.COMPLETED, label: 'Completed' },
  { value: MAINTENANCE_STATUS.CANCELLED, label: 'Cancelled' },
];

// Tipos de Mantenimiento
export const MAINTENANCE_TYPE = {
  ROUTINE: 'routine',
  REPAIR: 'repair',
  INSPECTION: 'inspection',
  OVERHAUL: 'overhaul',
} as const;

export const MAINTENANCE_TYPE_OPTIONS = [
  { value: MAINTENANCE_TYPE.ROUTINE, label: 'Routine' },
  { value: MAINTENANCE_TYPE.REPAIR, label: 'Repair' },
  { value: MAINTENANCE_TYPE.INSPECTION, label: 'Inspection' },
  { value: MAINTENANCE_TYPE.OVERHAUL, label: 'Overhaul' },
];

// Posiciones de Tripulación
export const CREW_POSITION = {
  PILOT: 'pilot',
  CO_PILOT: 'co-pilot',
  FLIGHT_ATTENDANT: 'flight_attendant',
  ENGINEER: 'engineer',
} as const;

export const CREW_POSITION_OPTIONS = [
  { value: CREW_POSITION.PILOT, label: 'Pilot' },
  { value: CREW_POSITION.CO_PILOT, label: 'Co-Pilot' },
  { value: CREW_POSITION.FLIGHT_ATTENDANT, label: 'Flight Attendant' },
  { value: CREW_POSITION.ENGINEER, label: 'Engineer' },
];

// Estados de Tripulación
export const CREW_STATUS = {
  ACTIVE: 'active',
  ON_LEAVE: 'on_leave',
  RETIRED: 'retired',
} as const;

export const CREW_STATUS_OPTIONS = [
  { value: CREW_STATUS.ACTIVE, label: 'Active' },
  { value: CREW_STATUS.ON_LEAVE, label: 'On Leave' },
  { value: CREW_STATUS.RETIRED, label: 'Retired' },
];

// Métodos de Pago
export const PAYMENT_METHOD = {
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  OTHER: 'other',
} as const;

export const PAYMENT_METHOD_OPTIONS = [
  { value: PAYMENT_METHOD.CASH, label: 'Cash' },
  { value: PAYMENT_METHOD.CREDIT_CARD, label: 'Credit Card' },
  { value: PAYMENT_METHOD.DEBIT_CARD, label: 'Debit Card' },
  { value: PAYMENT_METHOD.BANK_TRANSFER, label: 'Bank Transfer' },
  { value: PAYMENT_METHOD.OTHER, label: 'Other' },
];

// Endpoints de API (relativos a URLs base)
export const API_ENDPOINTS = {
  // Autenticación
  LOGIN: '/api/token/',
  REFRESH: '/api/token/refresh/',
  REGISTER: '/api/users/register/',
  
  // API de Aeropuerto
  AIRLINES: '/api/airlines/',
  AIRPORTS: '/api/airports/',
  FLIGHTS: '/api/flights/',
  BOOKINGS: '/api/bookings/',
  PASSENGERS: '/api/passengers/',
  CREW: '/api/crew/',
  FLIGHT_CREW: '/api/flight-crew/',
  MAINTENANCE: '/api/maintenance/',
  
  // API de Facturación
  PRODUCTS: '/api/catalog/products/',
  INVOICES: '/api/invoices/',
  USERS: '/api/users/',
  WAREHOUSES: '/api/warehouses/',
  INVENTORY: '/api/inventory/',
  PAYMENTS: '/api/payments/',
} as const;

// Paginación
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Formatos de Fecha
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const TIME_FORMAT = 'HH:mm';

// Claves de LocalStorage
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const;

// Reglas de Validación
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSPORT_LENGTH: 9,
  PHONE_MIN_LENGTH: 7,
  FLIGHT_NUMBER_MAX_LENGTH: 10,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^[\d\s\+\-\(\)]+$/,
} as const;

// Mensajes de Error
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PHONE: 'Invalid phone format',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

// Mensajes de Éxito
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  SAVED: 'Saved successfully',
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
} as const;

// Información de la Aplicación
export const APP_INFO = {
  NAME: 'Airport Management System',
  VERSION: '1.0.0',
  DESCRIPTION: 'Comprehensive airport management and billing system',
} as const;

// Elementos de Navegación
export const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Flights', path: '/flights', icon: '✈️' },
  { name: 'Bookings', path: '/bookings', icon: '🎫' },
  { name: 'Passengers', path: '/passengers', icon: '👤' },
  { name: 'Catalog', path: '/catalog', icon: '📦' },
  { name: 'Invoices', path: '/invoices', icon: '📄' },
];

export default {
  FLIGHT_STATUS,
  FLIGHT_STATUS_OPTIONS,
  BOOKING_STATUS,
  BOOKING_STATUS_OPTIONS,
  INVOICE_STATUS,
  INVOICE_STATUS_OPTIONS,
  MAINTENANCE_STATUS,
  MAINTENANCE_STATUS_OPTIONS,
  MAINTENANCE_TYPE,
  MAINTENANCE_TYPE_OPTIONS,
  CREW_POSITION,
  CREW_POSITION_OPTIONS,
  CREW_STATUS,
  CREW_STATUS_OPTIONS,
  PAYMENT_METHOD,
  PAYMENT_METHOD_OPTIONS,
  API_ENDPOINTS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  STORAGE_KEYS,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  APP_INFO,
  NAV_ITEMS,
};
