import React, { ReactNode, useState, useEffect } from 'react';
import { cn } from '../utils/cn';

// Breakpoint hook for responsive design
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg');
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else if (width < 1280) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return breakpoint;
}

// Container component with responsive padding and max-width
interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export function Container({ children, size = 'xl', className }: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full',
  };
  
  return (
    <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', sizeClasses[size], className)}>
      {children}
    </div>
  );
}

// Grid system with responsive columns
interface GridProps {
  children: ReactNode;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export function Grid({ children, cols = { default: 1 }, gap = 4, className }: GridProps) {
  const gridClasses = [
    `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    `gap-${gap}`,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={cn('grid', gridClasses, className)}>
      {children}
    </div>
  );
}

// Flex utilities
interface FlexProps {
  children: ReactNode;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: number;
  className?: string;
}

export function Flex({ 
  children, 
  direction = 'row', 
  align = 'start', 
  justify = 'start', 
  wrap = false,
  gap = 0,
  className 
}: FlexProps) {
  const classes = [
    'flex',
    `flex-${direction}`,
    `items-${align}`,
    `justify-${justify}`,
    wrap && 'flex-wrap',
    gap > 0 && `gap-${gap}`,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={cn(classes, className)}>
      {children}
    </div>
  );
}

// Stack component for vertical layouts
interface StackProps {
  children: ReactNode;
  space?: number;
  className?: string;
}

export function Stack({ children, space = 4, className }: StackProps) {
  return (
    <div className={cn(`space-y-${space}`, className)}>
      {children}
    </div>
  );
}

// Section wrapper with consistent spacing
interface SectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerClassName?: string;
}

export function Section({ children, title, subtitle, className, headerClassName }: SectionProps) {
  return (
    <section className={cn('py-8 lg:py-12', className)}>
      {(title || subtitle) && (
        <div className={cn('mb-8', headerClassName)}>
          {title && (
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

// Sidebar layout component
interface SidebarLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
  sidebarWidth?: 'sm' | 'md' | 'lg';
}

export function SidebarLayout({ 
  children, 
  sidebar, 
  sidebarOpen, 
  onSidebarToggle,
  sidebarWidth = 'md'
}: SidebarLayoutProps) {
  const sidebarWidths = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
  };
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onSidebarToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0',
        sidebarWidths[sidebarWidth],
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          {sidebar}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// Dashboard layout with header and main content
interface DashboardLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  className?: string;
}

export function DashboardLayout({ children, header, sidebar, className }: DashboardLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900', className)}>
      {header && (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          {header}
        </header>
      )}
      
      <div className="flex">
        {sidebar && (
          <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
            {sidebar}
          </aside>
        )}
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

// Responsive table wrapper
interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className="overflow-x-auto">
      <div className={cn('inline-block min-w-full py-2 align-middle', className)}>
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}

// Card grid layout
interface CardGridProps {
  children: ReactNode;
  minCardWidth?: string;
  gap?: number;
  className?: string;
}

export function CardGrid({ children, minCardWidth = '300px', gap = 6, className }: CardGridProps) {
  return (
    <div 
      className={cn(`grid gap-${gap}`, className)}
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidth}, 1fr))` }}
    >
      {children}
    </div>
  );
}

// Masonry layout for dynamic content
interface MasonryProps {
  children: ReactNode;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export function Masonry({ children, columns = { default: 1, md: 2, lg: 3 }, gap = 4, className }: MasonryProps) {
  const columnClasses = [
    `columns-${columns.default}`,
    columns.sm && `sm:columns-${columns.sm}`,
    columns.md && `md:columns-${columns.md}`,
    columns.lg && `lg:columns-${columns.lg}`,
    columns.xl && `xl:columns-${columns.xl}`,
    `gap-${gap}`,
  ].filter(Boolean).join(' ');
  
  return (
    <div className={cn(columnClasses, className)}>
      {children}
    </div>
  );
}
