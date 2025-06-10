import React, { useState } from 'react';

interface ThemeToggleProps {
  className?: string;
}

// Initialize theme state based on localStorage or system preference
const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // First check localStorage
  if ('theme' in localStorage) {
    return localStorage.theme === 'dark';
  }
  
  // Then check system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Apply theme to document
const applyTheme = (isDark: boolean) => {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
    localStorage.theme = 'dark';
  } else {
    root.classList.remove('dark');
    localStorage.theme = 'light';
  }
};

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  // Initialize state with function to ensure it only runs once
  const [isDark, setIsDark] = useState(() => {
    const initialTheme = getInitialTheme();
    // Apply theme on initial render
    applyTheme(initialTheme);
    return initialTheme;
  });

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    applyTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full transition-colors ${className} ${
        isDark 
          ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
          : 'bg-blue-100 text-gray-700 hover:bg-blue-200'
      }`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
