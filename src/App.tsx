import React, { Suspense, lazy, useEffect } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { AppStateProvider, useUIState } from '../context/AppStateContext';
import { ThemeProvider } from '../context/ThemeContext';
import { Loading } from './ui/Loading';
import { Container, SidebarLayout, DashboardLayout } from './ui/Layout';
import { usePerformanceMonitoring } from '../hooks/usePerformance';
import { accessibilityService } from '../services/accessibilityService';
import { API_CONFIG } from '../constants';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./Dashboard'));
const PlayerStats = lazy(() => import('./DetailedPlayerStatsOptimized'));
const FantasyFootball = lazy(() => import('./FantasyFootballOptimized'));
const TeamAnalytics = lazy(() => import('./TeamAnalytics'));
const Settings = lazy(() => import('./Settings'));

// Navigation items
const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', component: Dashboard },
  { id: 'players', label: 'Player Stats', icon: '👤', component: PlayerStats },
  { id: 'fantasy', label: 'Fantasy', icon: '⚡', component: FantasyFootball },
  { id: 'teams', label: 'Team Analytics', icon: '🏈', component: TeamAnalytics },
  { id: 'settings', label: 'Settings', icon: '⚙️', component: Settings },
];

// Header component
function AppHeader() {
  const { ui, toggleSidebar } = useUIState();
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <Container>
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏈</span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Gridiron Dash
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Week {API_CONFIG.CURRENT_WEEK} • {API_CONFIG.CURRENT_SEASON}
            </div>
            
            {ui.loading && (
              <div className="flex items-center space-x-2">
                <Loading variant="spinner" size="sm" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
              </div>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}

// Sidebar component
function AppSidebar() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  
  return (
    <nav className="flex-1 p-4 space-y-2">
      <div className="space-y-1">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`
              w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
              ${activeTab === item.id 
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            `}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            <span className="mr-3 text-lg" role="img" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </div>
      
      <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          Quick Stats
        </div>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div>Games Today: 3</div>
          <div>Active Players: 1,847</div>
          <div>Fantasy Leagues: 12</div>
        </div>
      </div>
    </nav>
  );
}

// Main content component
function AppContent() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const ActiveComponent = navigationItems.find(item => item.id === activeTab)?.component || Dashboard;
  
  return (
    <main className="flex-1 p-6">
      <Container>
        <ErrorBoundary>
          <Suspense fallback={<Loading variant="skeleton" />}>
            <ActiveComponent />
          </Suspense>
        </ErrorBoundary>
      </Container>
    </main>
  );
}

// Main app layout component
function AppLayout() {
  const { ui, toggleSidebar } = useUIState();
  
  return (
    <SidebarLayout
      sidebarOpen={ui.sidebarOpen}
      onSidebarToggle={toggleSidebar}
      sidebar={<AppSidebar />}
    >
      <DashboardLayout header={<AppHeader />}>
        <AppContent />
      </DashboardLayout>
    </SidebarLayout>
  );
}

// App component with providers
function App() {
  // Initialize performance monitoring
  usePerformanceMonitoring();
  
  // Initialize accessibility service
  useEffect(() => {
    accessibilityService.initialize();
    
    // Announce app ready
    accessibilityService.announceToScreenReader('Gridiron Dash NFL Dashboard loaded');
    
    return () => {
      accessibilityService.cleanup();
    };
  }, []);
  
  // Handle global errors
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Log to error reporting service
    };
    
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      // Log to error reporting service
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppStateProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <AppLayout />
          </div>
        </AppStateProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
