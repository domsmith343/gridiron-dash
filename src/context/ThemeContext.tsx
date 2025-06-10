import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useUtilities';
import { STORAGE_KEYS } from '../constants';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  systemTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
}

/**
 * Advanced theme provider with system preference detection
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = STORAGE_KEYS.THEME,
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useLocalStorage<Theme>(storageKey, defaultTheme);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Detect system theme preference
  const updateSystemTheme = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const newSystemTheme: ResolvedTheme = systemPrefersDark ? 'dark' : 'light';
    setSystemTheme(newSystemTheme);
  }, []);

  // Update resolved theme when theme or system theme changes
  useEffect(() => {
    const newResolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;
    setResolvedTheme(newResolvedTheme);
  }, [theme, systemTheme]);

  // Apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    root.classList.add(resolvedTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        resolvedTheme === 'dark' ? '#1f2937' : '#ffffff'
      );
    }
  }, [resolvedTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem || typeof window === 'undefined') return;

    updateSystemTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => updateSystemTheme();
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableSystem, updateSystemTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, [setThemeState]);

  const toggleTheme = useCallback(() => {
    if (theme === 'system') {
      setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  }, [theme, systemTheme, setTheme]);

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    systemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

/**
 * Advanced theme toggle component
 */
export const ThemeToggle: React.FC<{
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ className = '', showLabel = false, size = 'md' }) => {
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        inline-flex items-center justify-center
        rounded-lg border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-gray-100
        hover:bg-gray-50 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        transition-all duration-200
        ${className}
      `}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Current theme: ${theme}`}
    >
      {resolvedTheme === 'dark' ? (
        <svg className={iconSize[size]} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className={iconSize[size]} fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
      
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};

/**
 * Theme-aware CSS variable generator
 */
export const getThemeVariables = (theme: ResolvedTheme) => ({
  '--color-primary': theme === 'dark' ? '#3B82F6' : '#2563EB',
  '--color-primary-foreground': theme === 'dark' ? '#FFFFFF' : '#FFFFFF',
  '--color-secondary': theme === 'dark' ? '#374151' : '#F3F4F6',
  '--color-secondary-foreground': theme === 'dark' ? '#F9FAFB' : '#111827',
  '--color-background': theme === 'dark' ? '#111827' : '#FFFFFF',
  '--color-foreground': theme === 'dark' ? '#F9FAFB' : '#111827',
  '--color-muted': theme === 'dark' ? '#374151' : '#F3F4F6',
  '--color-muted-foreground': theme === 'dark' ? '#9CA3AF' : '#6B7280',
  '--color-border': theme === 'dark' ? '#374151' : '#E5E7EB',
  '--color-input': theme === 'dark' ? '#374151' : '#FFFFFF',
  '--color-ring': theme === 'dark' ? '#3B82F6' : '#2563EB',
});

/**
 * Theme-aware utility functions
 */
export const themeUtils = {
  /**
   * Get appropriate text color for background
   */
  getContrastColor: (backgroundColor: string, theme: ResolvedTheme): string => {
    // Simple contrast detection - in production, use a proper contrast library
    const isDarkBackground = backgroundColor.includes('gray-') || backgroundColor.includes('black');
    
    if (theme === 'dark') {
      return isDarkBackground ? 'text-gray-100' : 'text-gray-900';
    } else {
      return isDarkBackground ? 'text-white' : 'text-gray-900';
    }
  },

  /**
   * Get theme-appropriate shadow class
   */
  getShadowClass: (theme: ResolvedTheme): string => {
    return theme === 'dark' 
      ? 'shadow-lg shadow-gray-900/20' 
      : 'shadow-lg shadow-gray-900/10';
  },

  /**
   * Get theme-appropriate gradient
   */
  getGradientClass: (theme: ResolvedTheme): string => {
    return theme === 'dark'
      ? 'bg-gradient-to-br from-gray-800 to-gray-900'
      : 'bg-gradient-to-br from-white to-gray-50';
  },

  /**
   * Get team color with theme consideration
   */
  getTeamColorClass: (teamColor: string, theme: ResolvedTheme): string => {
    // Adjust team colors for better visibility in dark mode
    if (theme === 'dark') {
      return `${teamColor} brightness-110`;
    }
    return teamColor;
  },
};
