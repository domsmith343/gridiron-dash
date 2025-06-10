import React, { memo } from 'react';

interface Tab {
  id: string;
  label: string;
  ariaLabel?: string;
  disabled?: boolean;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

const TabNavigation = memo<TabNavigationProps>(({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className = '',
  variant = 'default'
}) => {
  const getTabStyles = () => {
    const baseStyles = "transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50";
    
    switch (variant) {
      case 'pills':
        return {
          container: "flex space-x-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg",
          tab: `${baseStyles} px-4 py-2 text-sm font-medium rounded-md`,
          active: "bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-300 shadow-sm",
          inactive: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        };
      case 'underline':
        return {
          container: "flex border-b border-gray-200 dark:border-gray-700",
          tab: `${baseStyles} px-4 py-3 text-sm font-medium border-b-2`,
          active: "border-primary-500 text-primary-600 dark:text-primary-400",
          inactive: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
        };
      default:
        return {
          container: "flex space-x-1",
          tab: `${baseStyles} px-3 py-2 text-sm font-medium rounded-md`,
          active: "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300",
          inactive: "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        };
    }
  };

  const styles = getTabStyles();

  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTabChange(tabId);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
      const direction = e.key === 'ArrowLeft' ? -1 : 1;
      const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
      const nextTab = tabs[nextIndex];
      
      if (!nextTab.disabled) {
        onTabChange(nextTab.id);
      }
    }
  };

  return (
    <nav className={`${styles.container} ${className}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          tabIndex={activeTab === tab.id ? 0 : -1}
          aria-selected={activeTab === tab.id}
          aria-label={tab.ariaLabel || tab.label}
          disabled={tab.disabled}
          className={`${styles.tab} ${
            activeTab === tab.id ? styles.active : styles.inactive
          } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
});

TabNavigation.displayName = 'TabNavigation';

export default TabNavigation;
