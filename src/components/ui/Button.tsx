import React, { memo, useCallback } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button = memo<ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className = '',
  disabled,
  onClick,
  ...props
}) => {
  const getVariantStyles = useCallback(() => {
    const baseStyles = "font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white`;
      case 'secondary':
        return `${baseStyles} bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white`;
      case 'outline':
        return `${baseStyles} border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-gray-500 text-gray-700 dark:text-gray-300`;
      case 'ghost':
        return `${baseStyles} hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500 text-gray-700 dark:text-gray-300`;
      case 'danger':
        return `${baseStyles} bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white`;
      default:
        return baseStyles;
    }
  }, [variant]);

  const getSizeStyles = useCallback(() => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  }, [size]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!loading && !disabled && onClick) {
      onClick(e);
    }
  }, [loading, disabled, onClick]);

  const LoadingSpinner = () => (
    <svg 
      className="animate-spin h-4 w-4" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  return (
    <button
      className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${fullWidth ? 'w-full' : ''}
        ${loading ? 'cursor-wait' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-busy={loading}
      {...props}
    >
      <span className="flex items-center justify-center space-x-2">
        {loading ? (
          <>
            <LoadingSpinner />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span aria-hidden="true">{icon}</span>}
            {children && <span>{children}</span>}
            {icon && iconPosition === 'right' && <span aria-hidden="true">{icon}</span>}
          </>
        )}
      </span>
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
