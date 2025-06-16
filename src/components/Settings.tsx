import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Section, Stack, Grid } from './ui/Layout';
import { Form, Field, Input, Select, Checkbox, SubmitButton } from './ui/Form';
import { Button } from './ui/Button';
import { TabNavigation } from './ui/TabNavigation';
import { useAppSettings, useFavorites } from '../context/AppStateContext';
import { useTheme } from '../context/ThemeContext';
import { accessibilityService } from '../services/accessibilityService';
import { API_CONFIG } from '../constants';

// General settings component
function GeneralSettings() {
  const { settings, updateSettings } = useAppSettings();
  const { theme, setTheme } = useTheme();
  
  const handleSettingsSubmit = (data: Record<string, any>) => {
    updateSettings({
      notifications: data.notifications,
      autoRefresh: data.autoRefresh,
      refreshInterval: parseInt(data.refreshInterval),
    });
    
    setTheme(data.theme);
    
    accessibilityService.announceToScreenReader('Settings updated successfully');
  };
  
  const refreshIntervalOptions = [
    { value: '10000', label: '10 seconds' },
    { value: '30000', label: '30 seconds' },
    { value: '60000', label: '1 minute' },
    { value: '300000', label: '5 minutes' },
    { value: '0', label: 'Disabled' },
  ];
  
  const themeOptions = [
    { value: 'light', label: 'Light Mode' },
    { value: 'dark', label: 'Dark Mode' },
    { value: 'system', label: 'System Preference' },
  ];
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">General Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure your dashboard preferences
        </p>
      </CardHeader>
      <CardContent>
        <Form
          onSubmit={handleSettingsSubmit}
          initialValues={{
            theme,
            notifications: settings.notifications,
            autoRefresh: settings.autoRefresh,
            refreshInterval: settings.refreshInterval.toString(),
          }}
          validationRules={{
            refreshInterval: {
              required: true,
              validate: (value) => {
                const num = parseInt(value);
                if (isNaN(num) || num < 0) {
                  return 'Please enter a valid refresh interval';
                }
              },
            },
          }}
        >
          <Grid cols={{ default: 1, md: 2 }} gap={4}>
            <Field name="theme" label="Theme" required>
              <Select
                name="theme"
                options={themeOptions}
                placeholder="Select theme"
              />
            </Field>
            
            <Field name="refreshInterval" label="Auto Refresh Interval" required>
              <Select
                name="refreshInterval"
                options={refreshIntervalOptions}
                placeholder="Select interval"
              />
            </Field>
          </Grid>
          
          <Stack space={4}>
            <Checkbox
              name="notifications"
              label="Enable push notifications"
            />
            
            <Checkbox
              name="autoRefresh"
              label="Auto-refresh data"
            />
          </Stack>
          
          <div className="pt-4">
            <SubmitButton>Save Settings</SubmitButton>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

// Accessibility settings component
function AccessibilitySettings() {
  const [accessibilityPrefs, setAccessibilityPrefs] = useState(() => ({
    reduceMotion: localStorage.getItem('reduce-motion') === 'true',
    highContrast: localStorage.getItem('high-contrast') === 'true',
    largeText: localStorage.getItem('large-text') === 'true',
    screenReaderOptimized: localStorage.getItem('screenreader-optimized') === 'true',
    keyboardNavigation: localStorage.getItem('keyboard-navigation') !== 'false',
  }));
  
  const handleAccessibilitySubmit = (data: Record<string, any>) => {
    // Update localStorage
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key.replace(/([A-Z])/g, '-$1').toLowerCase(), String(value));
    });
    
    // Update state
    setAccessibilityPrefs(data);
    
    // Apply accessibility preferences
    document.documentElement.classList.toggle('reduce-motion', data.reduceMotion);
    document.documentElement.classList.toggle('high-contrast', data.highContrast);
    document.documentElement.classList.toggle('large-text', data.largeText);
    
    // Update accessibility service
    accessibilityService.updateSettings({
      reduceMotion: data.reduceMotion,
      highContrast: data.highContrast,
      fontSize: data.largeText ? 'large' : 'normal',
      screenReaderOptimized: data.screenReaderOptimized,
      keyboardNavigation: data.keyboardNavigation,
    });
    
    accessibilityService.announceToScreenReader('Accessibility settings updated');
  };
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Accessibility Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Customize accessibility features for better usability
        </p>
      </CardHeader>
      <CardContent>
        <Form
          onSubmit={handleAccessibilitySubmit}
          initialValues={accessibilityPrefs}
        >
          <Stack space={4}>
            <Checkbox
              name="reduceMotion"
              label="Reduce motion and animations"
            />
            
            <Checkbox
              name="highContrast"
              label="High contrast mode"
            />
            
            <Checkbox
              name="largeText"
              label="Large text size"
            />
            
            <Checkbox
              name="screenReaderOptimized"
              label="Screen reader optimizations"
            />
            
            <Checkbox
              name="keyboardNavigation"
              label="Enhanced keyboard navigation"
            />
          </Stack>
          
          <div className="pt-4">
            <SubmitButton>Save Accessibility Settings</SubmitButton>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

// Fantasy settings component
function FantasySettings() {
  const [fantasySettings, setFantasySettings] = useState(() => ({
    league: localStorage.getItem('fantasy-league') || '',
    scoringSystem: localStorage.getItem('fantasy-scoring') || 'standard',
    rosterSize: localStorage.getItem('fantasy-roster-size') || '16',
    waiversDay: localStorage.getItem('fantasy-waivers-day') || 'wednesday',
  }));
  
  const scoringOptions = [
    { value: 'standard', label: 'Standard Scoring' },
    { value: 'ppr', label: 'PPR (Point Per Reception)' },
    { value: 'half-ppr', label: 'Half PPR (0.5 per reception)' },
    { value: 'custom', label: 'Custom Scoring' },
  ];
  
  const waiversOptions = [
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
  ];
  
  const handleFantasySubmit = (data: Record<string, any>) => {
    // Update localStorage
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(`fantasy-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, String(value));
    });
    
    setFantasySettings(data);
    accessibilityService.announceToScreenReader('Fantasy settings updated');
  };
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Fantasy Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure your fantasy football preferences
        </p>
      </CardHeader>
      <CardContent>
        <Form
          onSubmit={handleFantasySubmit}
          initialValues={fantasySettings}
          validationRules={{
            league: { required: true, minLength: 3 },
            rosterSize: {
              required: true,
              validate: (value) => {
                const num = parseInt(value);
                if (isNaN(num) || num < 10 || num > 20) {
                  return 'Roster size must be between 10 and 20';
                }
              },
            },
          }}
        >
          <Stack space={4}>
            <Field name="league" label="League Name" required>
              <Input
                name="league"
                placeholder="Enter your league name"
              />
            </Field>
            
            <Grid cols={{ default: 1, md: 2 }} gap={4}>
              <Field name="scoringSystem" label="Scoring System" required>
                <Select
                  name="scoringSystem"
                  options={scoringOptions}
                  placeholder="Select scoring system"
                />
              </Field>
              
              <Field name="rosterSize" label="Roster Size" required>
                <Input
                  name="rosterSize"
                  type="number"
                  min="10"
                  max="20"
                  placeholder="16"
                />
              </Field>
            </Grid>
            
            <Field name="waiversDay" label="Waivers Clear Day">
              <Select
                name="waiversDay"
                options={waiversOptions}
                placeholder="Select day"
              />
            </Field>
          </Stack>
          
          <div className="pt-4">
            <SubmitButton>Save Fantasy Settings</SubmitButton>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

// Data management component
function DataManagement() {
  const { favorites } = useFavorites();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  const handleExportData = async () => {
    setIsExporting(true);
    
    try {
      const exportData = {
        favorites,
        settings: {
          theme: localStorage.getItem('theme'),
          notifications: localStorage.getItem('notifications'),
          autoRefresh: localStorage.getItem('autoRefresh'),
          refreshInterval: localStorage.getItem('refreshInterval'),
        },
        timestamp: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gridiron-dash-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      accessibilityService.announceToScreenReader('Data exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      accessibilityService.announceToScreenReader('Export failed');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all stored data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Data Management</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Export, import, or clear your dashboard data
        </p>
      </CardHeader>
      <CardContent>
        <Stack space={4}>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Export Data
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Download your settings, favorites, and preferences as a JSON file.
            </p>
            <Button
              onClick={handleExportData}
              disabled={isExporting}
              variant="secondary"
            >
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Clear All Data
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Remove all stored settings, favorites, and cached data. This action cannot be undone.
            </p>
            <Button
              onClick={handleClearData}
              variant="danger"
            >
              Clear All Data
            </Button>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Data Storage Information
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Favorite players: {favorites.players.length} saved</li>
              <li>• Favorite teams: {favorites.teams.length} saved</li>
              <li>• Local storage usage: ~{Math.round(JSON.stringify(localStorage).length / 1024)}KB</li>
            </ul>
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}

// About component
function About() {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">About Gridiron Dash</h3>
      </CardHeader>
      <CardContent>
        <Stack space={4}>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Version</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">1.0.0</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A comprehensive NFL dashboard built with modern web technologies including 
              Astro, React, TypeScript, and Tailwind CSS. Features real-time stats, 
              fantasy football tools, and advanced analytics.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Features</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Real-time player and team statistics</li>
              <li>• Fantasy football analytics and tools</li>
              <li>• Responsive design for all devices</li>
              <li>• Accessibility-first approach</li>
              <li>• Dark/light theme support</li>
              <li>• Performance optimized</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Technology Stack</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Frontend: Astro, React, TypeScript</li>
              <li>• Styling: Tailwind CSS</li>
              <li>• State Management: React Context</li>
              <li>• Testing: Vitest, React Testing Library</li>
              <li>• Build: Vite</li>
            </ul>
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}

// Main settings component
export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  
  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'accessibility', label: 'Accessibility' },
    { id: 'fantasy', label: 'Fantasy' },
    { id: 'data', label: 'Data' },
    { id: 'about', label: 'About' },
  ];
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'accessibility':
        return <AccessibilitySettings />;
      case 'fantasy':
        return <FantasySettings />;
      case 'data':
        return <DataManagement />;
      case 'about':
        return <About />;
      default:
        return null;
    }
  };
  
  return (
    <Section title="Settings" subtitle="Customize your dashboard experience">
      <div className="mb-8">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="underline"
        />
      </div>
      
      {renderTabContent()}
    </Section>
  );
}
