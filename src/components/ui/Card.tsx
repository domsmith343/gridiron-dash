import React, { memo, forwardRef, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

const Card = memo(forwardRef<HTMLDivElement, CardProps>(({ 
  variant = 'default', 
  padding = 'md',
  className = '',
  children,
  ...props
}, ref) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
      case 'elevated':
        return 'bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700';
      case 'interactive':
        return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 cursor-pointer';
      default:
        return 'bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700';
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-3';
      case 'lg':
        return 'p-8';
      default:
        return 'p-6';
    }
  };

  return (
    <div
      ref={ref}
      className={`rounded-lg ${getVariantStyles()} ${getPaddingStyles()} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}));

const CardHeader = memo<CardHeaderProps>(({ className = '', children, ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
));

const CardContent = memo<CardContentProps>(({ className = '', children, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
));

const CardFooter = memo<CardFooterProps>(({ className = '', children, ...props }) => (
  <div className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 ${className}`} {...props}>
    {children}
  </div>
));

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardContent, CardFooter };
export default Card;
