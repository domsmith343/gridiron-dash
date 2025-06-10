import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'spinner' | 'skeleton' | 'pulse';
  className?: string;
}

const LoadingSpinner = ({ size }: { size: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 ${sizeClasses[size]}`}></div>
  );
};

const LoadingSkeleton = ({ size }: { size: 'sm' | 'md' | 'lg' }) => {
  const heightClasses = {
    sm: 'h-20',
    md: 'h-32',
    lg: 'h-48'
  };

  return (
    <div className={`bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${heightClasses[size]} w-full`}>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
      </div>
    </div>
  );
};

export default function Loading({ 
  size = 'md', 
  text = 'Loading...', 
  variant = 'spinner',
  className = ''
}: LoadingProps) {
  const baseClasses = "flex flex-col items-center justify-center p-4";
  
  return (
    <div className={`${baseClasses} ${className}`}>
      {variant === 'spinner' && <LoadingSpinner size={size} />}
      {variant === 'skeleton' && <LoadingSkeleton size={size} />}
      {variant === 'pulse' && (
        <div className="animate-pulse">
          <div className="text-2xl">🏈</div>
        </div>
      )}
      {text && variant !== 'skeleton' && (
        <p className="mt-3 text-gray-600 dark:text-gray-300 text-center">{text}</p>
      )}
    </div>
  );
}
