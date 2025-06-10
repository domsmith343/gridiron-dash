interface EnvConfig {
  NODE_ENV: string;
  PUBLIC_WEBSOCKET_URL?: string;
  PUBLIC_API_URL?: string;
  DEV: boolean;
  PROD: boolean;
  MODE: 'development' | 'production';
}

function getEnvVar(key: keyof EnvConfig, required = false): string | undefined {
  const value = import.meta.env[key];
  
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
}

export const env: EnvConfig = {
  NODE_ENV: getEnvVar('NODE_ENV') || 'development',
  PUBLIC_WEBSOCKET_URL: getEnvVar('PUBLIC_WEBSOCKET_URL'),
  PUBLIC_API_URL: getEnvVar('PUBLIC_API_URL'),
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE as 'development' | 'production',
};

export function validateEnv(): void {
  if (env.PROD && !env.PUBLIC_API_URL) {
    console.warn('API URL not configured for production environment');
  }
  
  if (env.DEV) {
    console.log('🚀 Development mode enabled');
  }
}

// Validate on module load
validateEnv();
