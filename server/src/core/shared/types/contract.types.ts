/**
 * Contract-related type definitions
 */

import { ContractStatus, ContractType, ContractPhaseStatus, ContractTaskStatus } from '@/core/shared/enums/base.enums';
import { BaseFilter, PaginatedResponse, ID, Timestamp } from './common.types';

// Contract types
export interface ContractData {
  id?: ID;
  title: string;
  description?: string;
  type: ContractType;
  status: ContractStatus;
  start_date: Timestamp;
  end_date: Timestamp;
  value?: number;
  currency?: string;
  partner_info?: PartnerInfo;
  terms?: string;
  conditions?: string;
  attachments?: string[];
}

export interface PartnerInfo {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_code?: string;
}

export interface ContractTemplate {
  id: ID;
  name: string;
  description?: string;
  structure: TemplateStructure;
  is_active: boolean;
  created_by: number;
}

export interface TemplateStructure {
  sections: TemplateSection[];
  fields: TemplateField[];
  workflow?: WorkflowStep[];
}

export interface TemplateSection {
  id: string;
  title: string;
  content: string;
  order: number;
  required: boolean;
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  label: string;
  required: boolean;
  options?: string[];
  validation?: FieldValidation;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  order: number;
  assignee_role?: string;
  required_permissions?: string[];
  auto_approve?: boolean;
}

// Contract queries and filters
export interface ContractFilter extends BaseFilter {
  status?: ContractStatus;
  type?: ContractType;
  user_id?: number;
  department?: string;
  partner_name?: string;
  value_min?: number;
  value_max?: number;
}

export interface ContractQuery extends ContractFilter {
  include_drafts?: boolean;
  include_expired?: boolean;
  sort_by?: 'created_at' | 'updated_at' | 'end_date' | 'value';
  sort_order?: 'ASC' | 'DESC';
}

// Contract operations
export interface CreateContractDto {
  title: string;
  description?: string;
  type: ContractType;
  start_date: Timestamp;
  end_date: Timestamp;
  value?: number;
  currency?: string;
  partner_info: PartnerInfo;
  template_id?: ID;
  content?: ContractContentData;
}

export interface UpdateContractDto extends Partial<CreateContractDto> {
  status?: ContractStatus;
}

export interface ContractContentData {
  sections: Record<string, string>;
  fields: Record<string, unknown>;
  custom_content?: string;
}

// Milestone and Task types
export interface Milestone {
  id: ID;
  contract_id: ID;
  title: string;
  description?: string;
  due_date: Timestamp;
  status: ContractPhaseStatus;
  completion_percentage: number;
  assigned_to?: number;
}

export interface ContractTask {
  id: ID;
  contract_id: ID;
  milestone_id?: ID;
  title: string;
  description?: string;
  due_date: Timestamp;
  status: ContractTaskStatus;
  assigned_to: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Audit and collaboration types
export interface AuditLogFilter extends BaseFilter {
  action?: string;
  user_id?: number;
  resource_type?: string;
  resource_id?: ID;
}

export interface AuditLogEntry {
  id: ID;
  user_id: number;
  action: string;
  resource_type: string;
  resource_id: ID;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: Timestamp;
}

export interface CollaboratorData {
  user_id: number;
  contract_id: ID;
  role: 'owner' | 'editor' | 'viewer';
  permissions: string[];
  added_by: number;
  added_at: Timestamp;
}

// File types
export interface ContractFile {
  id: ID;
  contract_id: ID;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  uploaded_at: Timestamp;
}

// Export types
export interface ExportOptions {
  format: 'pdf' | 'docx' | 'html';
  include_attachments?: boolean;
  template_style?: string;
}

export type ContractListResponse = PaginatedResponse<ContractData>;
export type AuditLogResponse = PaginatedResponse<AuditLogEntry>;