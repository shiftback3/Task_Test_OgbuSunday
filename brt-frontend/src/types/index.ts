// Base types
export interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  roles?: Role[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  title: string;
  body?: string;
  type?: string;
  meta?: Record<string, any>;
  owner_id: string;
  created_at: string;
  updated_at: string;
  owner?: User;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  event_type?: string;
  entity_type?: string;
  entity_id?: string;
  description: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: User;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  success: boolean;
  code: number;
}

export interface ApiErrorResponse {
  message: string;
  success: false;
  code: number;
  errors?: Record<string, string[]>;
  error_debug?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

// Form types
export interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  is_active?: boolean;
}

export interface UpdateUserForm {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  is_active?: boolean;
}

export interface CreateRoleForm {
  name: string;
  description?: string;
  permissions?: number[];
}

export interface CreateResourceForm {
  title: string;
  body?: string;
  type?: string;
  meta?: Record<string, any>;
}

// Type aliases for consistency
export type CreateUserData = CreateUserForm;
export type UpdateUserData = UpdateUserForm;
export type CreateRoleData = CreateRoleForm;
export type UpdateRoleData = Partial<CreateRoleForm>;
export type CreateResourceData = CreateResourceForm;
export type UpdateResourceData = Partial<CreateResourceForm>;

// Navigation types
export interface NavItem {
  name: string;
  path: string;
  permission?: string;
  icon?: string;
  children?: NavItem[];
}

// Wizard types
export interface WizardStep {
  id: string;
  title: string;
  isValid?: boolean;
  isComplete?: boolean;
}

export interface AccessRequestForm {
  requestType: string;
  justification: string;
  supportingDocuments?: File[];
  urgency: 'low' | 'medium' | 'high';
}

// WebSocket types
export interface AuditEvent {
  type: 'audit_log_created';
  data: AuditLog;
}

// Access Request types
export interface AccessRequest {
  id: number;
  user_id: string;
  request_type?: string | null;
  business_justification?: string | null;
  reason?: string | null;
  requested_permissions?: string[] | null;
  requested_roles?: string[];
  attachments?: any[];
  status: 'pending' | 'approved' | 'rejected';
  processed_by?: string | null;
  processed_at?: string | null;
  comments?: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  reviewer?: User;
}

export interface CreateAccessRequestData {
  requested_permissions?: string[];
  requested_roles?: number[];
  reason: string;
  supporting_document?: File;
}

export interface UpdateAccessRequestData {
  requested_permissions?: string[];
  requested_roles?: number[];
  reason?: string;
  supporting_document?: File;
}

// Ethereum/DApp types
export interface WalletConnection {
  address: string;
  chainId: number;
  isConnected: boolean;
}

export interface SignatureRequest {
  message: string;
  signature?: string;
  timestamp: number;
}