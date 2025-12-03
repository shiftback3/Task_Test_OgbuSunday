import * as Yup from 'yup';

// Auth validation schemas
export const loginSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const registerSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Password confirmation is required'),
});

// User management schemas
export const createUserSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Password confirmation is required'),
  is_active: Yup.boolean(),
});

export const updateUserSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters'),
  email: Yup.string()
    .email('Invalid email address'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .nullable(),
  password_confirmation: Yup.string()
    .when('password', {
      is: (password: string) => password && password.length > 0,
      then: (schema) => schema.oneOf([Yup.ref('password')], 'Passwords must match').required(),
      otherwise: (schema) => schema.nullable(),
    }),
  is_active: Yup.boolean(),
});

// Role management schemas
export const createRoleSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Role name must be at least 2 characters')
    .max(255, 'Role name must not exceed 255 characters')
    .required('Role name is required'),
  description: Yup.string()
    .max(1000, 'Description must not exceed 1000 characters'),
  permissions: Yup.array()
    .of(Yup.number())
    .nullable(),
});

// Permission management schemas
export const createPermissionSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Permission name must be at least 2 characters')
    .max(255, 'Permission name must not exceed 255 characters')
    .required('Permission name is required'),
  description: Yup.string()
    .max(1000, 'Description must not exceed 1000 characters'),
});

// Resource management schemas
export const createResourceSchema = Yup.object({
  title: Yup.string()
    .min(1, 'Title is required')
    .max(255, 'Title must not exceed 255 characters')
    .required('Title is required'),
  body: Yup.string(),
  type: Yup.string()
    .max(100, 'Type must not exceed 100 characters'),
  meta: Yup.object(),
});

// Access request schema for wizard
export const accessRequestSchema = Yup.object({
  requestType: Yup.string()
    .required('Request type is required'),
  justification: Yup.string()
    .min(10, 'Justification must be at least 10 characters')
    .max(1000, 'Justification must not exceed 1000 characters')
    .required('Justification is required'),
  urgency: Yup.string()
    .oneOf(['low', 'medium', 'high'], 'Invalid urgency level')
    .required('Urgency level is required'),
  supportingDocuments: Yup.array()
    .of(Yup.mixed())
    .max(5, 'Maximum 5 documents allowed'),
});