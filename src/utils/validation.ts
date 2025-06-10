/**
 * Data validation utilities with TypeScript support
 */

export type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export type FieldValidation<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

/**
 * Common validation rules
 */
export const validationRules = {
  required: <T>(message = 'This field is required'): ValidationRule<T> => ({
    validate: (value: T) => value !== null && value !== undefined && value !== '',
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => value.length >= min,
    message: message || `Minimum length is ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validate: (value: string) => value.length <= max,
    message: message || `Maximum length is ${max} characters`,
  }),

  email: (message = 'Invalid email format'): ValidationRule<string> => ({
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  numeric: (message = 'Must be a number'): ValidationRule<any> => ({
    validate: (value: any) => !isNaN(Number(value)),
    message,
  }),

  positive: (message = 'Must be a positive number'): ValidationRule<number> => ({
    validate: (value: number) => value > 0,
    message,
  }),

  range: (min: number, max: number, message?: string): ValidationRule<number> => ({
    validate: (value: number) => value >= min && value <= max,
    message: message || `Value must be between ${min} and ${max}`,
  }),

  teamCode: (message = 'Invalid team code'): ValidationRule<string> => ({
    validate: (value: string) => /^[A-Z]{2,3}$/.test(value),
    message,
  }),

  position: (message = 'Invalid position'): ValidationRule<string> => ({
    validate: (value: string) => ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(value),
    message,
  }),

  url: (message = 'Invalid URL format'): ValidationRule<string> => ({
    validate: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),
};

/**
 * Validate a single field
 */
export function validateField<T>(
  value: T,
  rules: ValidationRule<T>[]
): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate an entire object
 */
export function validateObject<T extends Record<string, any>>(
  data: T,
  schema: FieldValidation<T>
): ValidationResult & { fieldErrors: Record<keyof T, string[]> } {
  const fieldErrors: Record<keyof T, string[]> = {} as Record<keyof T, string[]>;
  let isValid = true;
  const allErrors: string[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    if (rules && Array.isArray(rules)) {
      const fieldValue = data[field as keyof T];
      const result = validateField(fieldValue, rules);
      
      if (!result.isValid) {
        isValid = false;
        fieldErrors[field as keyof T] = result.errors;
        allErrors.push(...result.errors);
      }
    }
  }

  return {
    isValid,
    errors: allErrors,
    fieldErrors,
  };
}

/**
 * Fantasy player validation schema
 */
export const fantasyPlayerValidation = {
  id: [validationRules.required('Player ID is required')],
  name: [
    validationRules.required('Player name is required'),
    validationRules.minLength(2, 'Name must be at least 2 characters'),
    validationRules.maxLength(50, 'Name must be less than 50 characters'),
  ],
  position: [
    validationRules.required('Position is required'),
    validationRules.position('Invalid position'),
  ],
  team: [
    validationRules.required('Team is required'),
    validationRules.teamCode('Invalid team code'),
  ],
  projectedPoints: [
    validationRules.required('Projected points is required'),
    validationRules.numeric('Projected points must be a number'),
    validationRules.positive('Projected points must be positive'),
  ],
  actualPoints: [
    validationRules.numeric('Actual points must be a number'),
    validationRules.range(0, 100, 'Actual points must be between 0 and 100'),
  ],
};

/**
 * Game data validation schema
 */
export const gameValidation = {
  id: [validationRules.required('Game ID is required')],
  homeTeam: [
    validationRules.required('Home team is required'),
    validationRules.teamCode('Invalid home team code'),
  ],
  awayTeam: [
    validationRules.required('Away team is required'),
    validationRules.teamCode('Invalid away team code'),
  ],
  date: [validationRules.required('Game date is required')],
  week: [
    validationRules.required('Week is required'),
    validationRules.numeric('Week must be a number'),
    validationRules.range(1, 18, 'Week must be between 1 and 18'),
  ],
};

/**
 * API response validation
 */
export function validateApiResponse<T>(
  data: unknown,
  validator: (data: unknown) => data is T
): T | null {
  try {
    if (validator(data)) {
      return data;
    }
    return null;
  } catch (error) {
    console.error('API response validation error:', error);
    return null;
  }
}

/**
 * Type guards for common data types
 */
export const typeGuards = {
  isString: (value: unknown): value is string => typeof value === 'string',
  
  isNumber: (value: unknown): value is number => 
    typeof value === 'number' && !isNaN(value),
  
  isBoolean: (value: unknown): value is boolean => typeof value === 'boolean',
  
  isObject: (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value),
  
  isArray: (value: unknown): value is unknown[] => Array.isArray(value),
  
  hasProperty: <T extends Record<string, unknown>, K extends string>(
    obj: T,
    key: K
  ): obj is T & Record<K, unknown> => key in obj,
  
  isFantasyPlayer: (data: unknown): data is import('../types').FantasyPlayer => {
    if (!typeGuards.isObject(data)) return false;
    
    return (
      typeGuards.hasProperty(data, 'id') && typeGuards.isString(data.id) &&
      typeGuards.hasProperty(data, 'name') && typeGuards.isString(data.name) &&
      typeGuards.hasProperty(data, 'position') && typeGuards.isString(data.position) &&
      typeGuards.hasProperty(data, 'team') && typeGuards.isString(data.team) &&
      typeGuards.hasProperty(data, 'projectedPoints') && typeGuards.isNumber(data.projectedPoints)
    );
  },
};

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS vectors
    .replace(/\s+/g, ' '); // Normalize whitespace
}

/**
 * Deep clone with validation
 */
export function deepCloneAndValidate<T>(
  obj: T,
  validator?: (data: unknown) => data is T
): T | null {
  try {
    const cloned = JSON.parse(JSON.stringify(obj));
    
    if (validator && !validator(cloned)) {
      return null;
    }
    
    return cloned;
  } catch (error) {
    console.error('Deep clone validation error:', error);
    return null;
  }
}

/**
 * Async validation with debouncing
 */
export function createAsyncValidator<T>(
  validationFn: (value: T) => Promise<ValidationResult>,
  debounceMs = 300
) {
  let timeoutId: NodeJS.Timeout;
  
  return (value: T): Promise<ValidationResult> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const result = await validationFn(value);
          resolve(result);
        } catch (error) {
          resolve({
            isValid: false,
            errors: ['Validation failed']
          });
        }
      }, debounceMs);
    });
  };
}
