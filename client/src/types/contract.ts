export type ContractType = 'employment' | 'service' | 'lease' | 'partnership' | 'nda' | 'all';

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: ContractType;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface Contract {
  id: string;
  type: ContractType;
  content: string;
  template: string;
  createdAt: string;
  updatedAt: string;
  status?: 'draft' | 'review' | 'final' | 'signed';
  parties?: ContractParty[];
  metadata?: ContractMetadata;
}

export interface ContractParty {
  id: string;
  name: string;
  type: 'individual' | 'company';
  email?: string;
  phone?: string;
  address?: string;
  role: string;
}

export interface ContractMetadata {
  title: string;
  effectiveDate?: string;
  expirationDate?: string;
  value?: number;
  currency?: string;
  tags?: string[];
  notes?: string;
}

export interface ContractStructure {
  id: string;
  name: string;
  description: string;
  category: ContractType;
  content: string;
  icon: string;
  order: number;
}

export interface TextSuggestion {
  id: string;
  text: string;
  category: string;
  tags: string[];
  usage: number;
  isFavorite: boolean;
  contractTypes: ContractType[];
}

export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  pageSize: 'a4' | 'letter' | 'legal';
  showLineNumbers: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
}

export interface PrintSettings {
  orientation: 'portrait' | 'landscape';
  pageSize: 'a4' | 'letter' | 'legal';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  includeHeaders: boolean;
  includeFooters: boolean;
  pageNumbers: boolean;
}

export interface ExportSettings {
  format: 'pdf' | 'docx' | 'html' | 'txt';
  includeMetadata: boolean;
  includeStyles: boolean;
  watermark?: string;
  password?: string;
}