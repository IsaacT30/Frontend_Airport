// Utility Helper Functions for Airport Management System

/**
 * Format date to localized string
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * Format datetime to localized string
 */
export const formatDateTime = (datetime: string | Date): string => {
  if (!datetime) return 'N/A';
  const d = typeof datetime === 'string' ? new Date(datetime) : datetime;
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format time from datetime
 */
export const formatTime = (datetime: string | Date): string => {
  if (!datetime) return 'N/A';
  const d = typeof datetime === 'string' ? new Date(datetime) : datetime;
  return d.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format currency
 */
export const formatCurrency = (amount: string | number): string => {
  if (amount === null || amount === undefined) return '$0.00';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Get status color for badges
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    // Flight statuses
    scheduled: 'bg-blue-100 text-blue-800',
    boarding: 'bg-yellow-100 text-yellow-800',
    departed: 'bg-green-100 text-green-800',
    arrived: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    delayed: 'bg-orange-100 text-orange-800',
    
    // Booking statuses
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-gray-100 text-gray-800',
    
    // Invoice statuses
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-red-100 text-red-800',
    overdue: 'bg-red-100 text-red-800',
    
    // Maintenance statuses
    in_progress: 'bg-yellow-100 text-yellow-800',
    
    // Crew statuses
    active: 'bg-green-100 text-green-800',
    on_leave: 'bg-yellow-100 text-yellow-800',
    retired: 'bg-gray-100 text-gray-800',
  };
  
  return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

/**
 * Parse error message from API response
 */
export const parseErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.response?.data) {
    // Handle validation errors
    const data = error.response.data;
    const errors = Object.keys(data).map(key => {
      const value = Array.isArray(data[key]) ? data[key][0] : data[key];
      return `${capitalize(key)}: ${value}`;
    });
    return errors.join(', ');
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Download file from blob
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7;
};

/**
 * Generate random ID (for temporary use)
 */
export const generateTempId = (): string => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Sleep function for async operations
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: any): boolean => {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Safe JSON parse
 */
export const safeJsonParse = <T = any>(json: string, defaultValue: T): T => {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return defaultValue;
  }
};

/**
 * Format flight number
 */
export const formatFlightNumber = (flightNumber: string): string => {
  if (!flightNumber) return 'N/A';
  return flightNumber.toUpperCase();
};

/**
 * Calculate duration between two dates
 */
export const calculateDuration = (start: string | Date, end: string | Date): string => {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  
  const diff = endDate.getTime() - startDate.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};

export default {
  formatDate,
  formatDateTime,
  formatTime,
  formatCurrency,
  capitalize,
  getStatusColor,
  parseErrorMessage,
  downloadFile,
  debounce,
  copyToClipboard,
  isValidEmail,
  isValidPhone,
  generateTempId,
  sleep,
  isEmpty,
  safeJsonParse,
  formatFlightNumber,
  calculateDuration,
};
