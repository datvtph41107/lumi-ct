import { FieldDef } from '../store/fieldStore';

export function formatValue(value: any, field?: FieldDef): string {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  if (!field) {
    return String(value);
  }

  switch (field.type) {
    case 'money':
      return formatMoney(value, field.format);
    
    case 'date':
      return formatDate(value, field.format);
    
    case 'number':
      return formatNumber(value);
    
    case 'select':
      return formatSelect(value, field.options);
    
    case 'checkbox':
      return value ? 'Có' : 'Không';
    
    default:
      return String(value);
  }
}

function formatMoney(value: any, format?: string): string {
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return String(value);
  }

  const currency = format || 'VND';
  
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(numValue);
}

function formatDate(value: any, format?: string): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return String(value);
  }

  const dateFormat = format || 'DD/MM/YYYY';
  
  // Simple date formatting - in real app would use date-fns
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  switch (dateFormat) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return date.toLocaleDateString('vi-VN');
  }
}

function formatNumber(value: any): string {
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return String(value);
  }

  return new Intl.NumberFormat('vi-VN').format(numValue);
}

function formatSelect(value: any, options?: { value: any; label: string }[]): string {
  if (!options) {
    return String(value);
  }

  const option = options.find(opt => opt.value === value);
  return option ? option.label : String(value);
}

export function validateFieldValue(value: any, field: FieldDef): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required validation
  if (field.required && (value === undefined || value === null || value === '')) {
    errors.push('Trường này là bắt buộc');
    return { isValid: false, errors };
  }

  // Skip other validations if value is empty and not required
  if (value === undefined || value === null || value === '') {
    return { isValid: true, errors: [] };
  }

  // Type validation
  switch (field.type) {
    case 'number':
    case 'money':
      if (isNaN(Number(value))) {
        errors.push('Phải là số hợp lệ');
      }
      break;
    
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(value))) {
        errors.push('Email không hợp lệ');
      }
      break;
    
    case 'phone':
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(String(value))) {
        errors.push('Số điện thoại không hợp lệ');
      }
      break;
    
    case 'date':
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        errors.push('Ngày tháng không hợp lệ');
      }
      break;
  }

  // Custom validation
  if (field.validation) {
    if (field.validation.regex) {
      const regex = new RegExp(field.validation.regex);
      if (!regex.test(String(value))) {
        errors.push(field.validation.message || 'Định dạng không hợp lệ');
      }
    }

    if (field.validation.min !== undefined && Number(value) < field.validation.min) {
      errors.push(`Giá trị tối thiểu là ${field.validation.min}`);
    }

    if (field.validation.max !== undefined && Number(value) > field.validation.max) {
      errors.push(`Giá trị tối đa là ${field.validation.max}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}