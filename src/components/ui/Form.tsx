import React, { 
  ReactNode, 
  useState, 
  useCallback, 
  useEffect, 
  createContext, 
  useContext,
  FormEvent,
  ChangeEvent,
  FocusEvent,
} from 'react';
import { cn } from '../../utils/cn';
import { generateId, generateAriaAttributes } from '../../utils/accessibility';

// Form validation types
export interface FieldError {
  message: string;
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: any) => string | undefined;
}

export interface FieldState {
  value: any;
  error?: FieldError;
  touched: boolean;
  focused: boolean;
}

export interface FormState {
  [fieldName: string]: FieldState;
}

// Form context
interface FormContextValue {
  state: FormState;
  updateField: (name: string, value: any) => void;
  setFieldTouched: (name: string, touched: boolean) => void;
  setFieldFocused: (name: string, focused: boolean) => void;
  validateField: (name: string, rules?: ValidationRule) => void;
  isValid: boolean;
  hasErrors: boolean;
}

const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('Form components must be used within a Form');
  }
  return context;
}

// Form provider component
interface FormProps {
  children: ReactNode;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  validationRules?: Record<string, ValidationRule>;
  className?: string;
  initialValues?: Record<string, any>;
}

export function Form({ children, onSubmit, validationRules = {}, className, initialValues = {} }: FormProps) {
  const [state, setState] = useState<FormState>(() => {
    const initialState: FormState = {};
    Object.entries(initialValues).forEach(([key, value]) => {
      initialState[key] = {
        value,
        touched: false,
        focused: false,
      };
    });
    return initialState;
  });

  const validateField = useCallback((name: string, rules?: ValidationRule) => {
    const fieldRules = rules || validationRules[name];
    if (!fieldRules) return;

    const value = state[name]?.value;
    let error: FieldError | undefined;

    if (fieldRules.required && (!value || value === '')) {
      error = { message: 'This field is required', type: 'required' };
    } else if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
      error = { message: `Minimum length is ${fieldRules.minLength}`, type: 'minLength' };
    } else if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
      error = { message: `Maximum length is ${fieldRules.maxLength}`, type: 'maxLength' };
    } else if (fieldRules.pattern && value && !fieldRules.pattern.test(value)) {
      error = { message: 'Invalid format', type: 'pattern' };
    } else if (fieldRules.validate && value) {
      const customError = fieldRules.validate(value);
      if (customError) {
        error = { message: customError, type: 'custom' };
      }
    }

    setState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        error,
      },
    }));
  }, [state, validationRules]);

  const updateField = useCallback((name: string, value: any) => {
    setState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error: undefined, // Clear error when user types
      },
    }));
  }, []);

  const setFieldTouched = useCallback((name: string, touched: boolean) => {
    setState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched,
      },
    }));

    // Validate field when it loses focus
    if (touched && validationRules[name]) {
      setTimeout(() => validateField(name), 0);
    }
  }, [validateField, validationRules]);

  const setFieldFocused = useCallback((name: string, focused: boolean) => {
    setState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        focused,
      },
    }));
  }, []);

  const isValid = Object.values(state).every(field => !field.error);
  const hasErrors = Object.values(state).some(field => field.error && field.touched);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    Object.keys(validationRules).forEach(fieldName => {
      setFieldTouched(fieldName, true);
      validateField(fieldName);
    });

    if (isValid) {
      const formData = Object.entries(state).reduce((acc, [key, field]) => {
        acc[key] = field.value;
        return acc;
      }, {} as Record<string, any>);
      
      onSubmit(formData);
    }
  };

  const contextValue: FormContextValue = {
    state,
    updateField,
    setFieldTouched,
    setFieldFocused,
    validateField,
    isValid,
    hasErrors,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={cn('space-y-6', className)} noValidate>
        {children}
      </form>
    </FormContext.Provider>
  );
}

// Field wrapper component
interface FieldProps {
  children: ReactNode;
  name: string;
  label: string;
  required?: boolean;
  description?: string;
  className?: string;
}

export function Field({ children, name, label, required, description, className }: FieldProps) {
  const { state } = useFormContext();
  const fieldState = state[name];
  const fieldId = generateId(name);
  const hasError = fieldState?.error && fieldState?.touched;

  return (
    <div className={cn('space-y-2', className)}>
      <label 
        htmlFor={fieldId}
        className={cn(
          'block text-sm font-medium',
          hasError ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
        )}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          name,
          'aria-invalid': hasError,
          'aria-describedby': hasError ? `${fieldId}-error` : undefined,
        })}
      </div>
      
      {hasError && (
        <p 
          id={`${fieldId}-error`}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {fieldState.error?.message}
        </p>
      )}
    </div>
  );
}

// Input component
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur' | 'onFocus'> {
  name: string;
  variant?: 'default' | 'filled' | 'outlined';
}

export function Input({ name, variant = 'default', className, ...props }: InputProps) {
  const { state, updateField, setFieldTouched, setFieldFocused } = useFormContext();
  const fieldState = state[name] || { value: '', touched: false, focused: false };
  const hasError = fieldState.error && fieldState.touched;

  const baseClasses = 'block w-full px-3 py-2 text-sm transition-colors';
  const variants = {
    default: 'border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    filled: 'bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-blue-500',
    outlined: 'border-2 border-gray-300 rounded-md focus:border-blue-500',
  };

  const errorClasses = hasError 
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
    : 'text-gray-900 dark:text-gray-100 placeholder-gray-400';

  return (
    <input
      {...props}
      name={name}
      value={fieldState.value || ''}
      onChange={(e: ChangeEvent<HTMLInputElement>) => updateField(name, e.target.value)}
      onBlur={(e: FocusEvent<HTMLInputElement>) => {
        setFieldFocused(name, false);
        setFieldTouched(name, true);
        props.onBlur?.(e);
      }}
      onFocus={(e: FocusEvent<HTMLInputElement>) => {
        setFieldFocused(name, true);
        props.onFocus?.(e);
      }}
      className={cn(baseClasses, variants[variant], errorClasses, className)}
    />
  );
}

// Textarea component
interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'onBlur' | 'onFocus'> {
  name: string;
  rows?: number;
}

export function Textarea({ name, rows = 4, className, ...props }: TextareaProps) {
  const { state, updateField, setFieldTouched, setFieldFocused } = useFormContext();
  const fieldState = state[name] || { value: '', touched: false, focused: false };
  const hasError = fieldState.error && fieldState.touched;

  const errorClasses = hasError 
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500';

  return (
    <textarea
      {...props}
      name={name}
      rows={rows}
      value={fieldState.value || ''}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => updateField(name, e.target.value)}
      onBlur={(e: FocusEvent<HTMLTextAreaElement>) => {
        setFieldFocused(name, false);
        setFieldTouched(name, true);
        props.onBlur?.(e);
      }}
      onFocus={(e: FocusEvent<HTMLTextAreaElement>) => {
        setFieldFocused(name, true);
        props.onFocus?.(e);
      }}
      className={cn(
        'block w-full px-3 py-2 text-sm border rounded-md shadow-sm transition-colors resize-vertical',
        errorClasses,
        className
      )}
    />
  );
}

// Select component
interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'onBlur' | 'onFocus'> {
  name: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export function Select({ name, options, placeholder, className, ...props }: SelectProps) {
  const { state, updateField, setFieldTouched, setFieldFocused } = useFormContext();
  const fieldState = state[name] || { value: '', touched: false, focused: false };
  const hasError = fieldState.error && fieldState.touched;

  const errorClasses = hasError 
    ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500';

  return (
    <select
      {...props}
      name={name}
      value={fieldState.value || ''}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => updateField(name, e.target.value)}
      onBlur={(e: FocusEvent<HTMLSelectElement>) => {
        setFieldFocused(name, false);
        setFieldTouched(name, true);
        props.onBlur?.(e);
      }}
      onFocus={(e: FocusEvent<HTMLSelectElement>) => {
        setFieldFocused(name, true);
        props.onFocus?.(e);
      }}
      className={cn(
        'block w-full px-3 py-2 text-sm border rounded-md shadow-sm transition-colors',
        errorClasses,
        className
      )}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map(option => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// Checkbox component
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur' | 'onFocus' | 'type'> {
  name: string;
  label: string;
}

export function Checkbox({ name, label, className, ...props }: CheckboxProps) {
  const { state, updateField, setFieldTouched, setFieldFocused } = useFormContext();
  const fieldState = state[name] || { value: false, touched: false, focused: false };
  const fieldId = generateId(name);

  return (
    <div className={cn('flex items-center', className)}>
      <input
        {...props}
        type="checkbox"
        id={fieldId}
        name={name}
        checked={fieldState.value || false}
        onChange={(e: ChangeEvent<HTMLInputElement>) => updateField(name, e.target.checked)}
        onBlur={(e: FocusEvent<HTMLInputElement>) => {
          setFieldFocused(name, false);
          setFieldTouched(name, true);
          props.onBlur?.(e);
        }}
        onFocus={(e: FocusEvent<HTMLInputElement>) => {
          setFieldFocused(name, true);
          props.onFocus?.(e);
        }}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label htmlFor={fieldId} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
        {label}
      </label>
    </div>
  );
}

// Submit button component
interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export function SubmitButton({ 
  children, 
  loading = false, 
  loadingText = 'Submitting...', 
  className,
  ...props 
}: SubmitButtonProps) {
  const { isValid } = useFormContext();

  return (
    <button
      type="submit"
      disabled={loading || !isValid}
      className={cn(
        'flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white',
        'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
        className
      )}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
}
