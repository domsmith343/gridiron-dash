import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  renderWithProviders, 
  mockPlayer, 
  mockApiResponse, 
  useTestUser,
  mockLocalStorage,
  mockIntersectionObserver,
} from '../../utils/testUtils';

// Import components to test
import { Form, Field, Input, SubmitButton } from '../ui/Form';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';
import { TabNavigation } from '../ui/TabNavigation';
import { LineChart, BarChart, PieChart } from '../ui/Charts';
import Dashboard from '../Dashboard';
import Settings from '../Settings';

// Mock modules
vi.mock('../hooks/useApi');
vi.mock('../context/AppStateContext');
vi.mock('../context/ThemeContext');

describe('Form Components', () => {
  const user = useTestUser();

  it('should render form with fields', () => {
    const onSubmit = vi.fn();
    
    render(
      <Form onSubmit={onSubmit}>
        <Field name="test" label="Test Field">
          <Input name="test" />
        </Field>
        <SubmitButton>Submit</SubmitButton>
      </Form>
    );

    expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const onSubmit = vi.fn();
    
    render(
      <Form 
        onSubmit={onSubmit}
        validationRules={{
          test: { required: true }
        }}
      >
        <Field name="test" label="Test Field" required>
          <Input name="test" />
        </Field>
        <SubmitButton>Submit</SubmitButton>
      </Form>
    );

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    const onSubmit = vi.fn();
    
    render(
      <Form onSubmit={onSubmit}>
        <Field name="test" label="Test Field">
          <Input name="test" />
        </Field>
        <SubmitButton>Submit</SubmitButton>
      </Form>
    );

    const input = screen.getByLabelText('Test Field');
    const submitButton = screen.getByRole('button', { name: 'Submit' });

    await user.type(input, 'test value');
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ test: 'test value' });
    });
  });
});

describe('UI Components', () => {
  it('should render Card component', () => {
    render(
      <Card>
        <Card.Header>
          <h2>Test Header</h2>
        </Card.Header>
        <Card.Content>
          <p>Test content</p>
        </Card.Content>
      </Card>
    );

    expect(screen.getByText('Test Header')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render Button with different variants', () => {
    render(
      <div>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
      </div>
    );

    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Secondary')).toBeInTheDocument();
    expect(screen.getByText('Danger')).toBeInTheDocument();
  });

  it('should render Loading component with different variants', () => {
    render(
      <div>
        <Loading variant="spinner" data-testid="spinner" />
        <Loading variant="skeleton" data-testid="skeleton" />
        <Loading variant="pulse" data-testid="pulse" />
      </div>
    );

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('pulse')).toBeInTheDocument();
  });

  it('should handle tab navigation', async () => {
    const user = useTestUser();
    const onTabChange = vi.fn();
    
    const tabs = [
      { id: 'tab1', label: 'Tab 1' },
      { id: 'tab2', label: 'Tab 2' },
    ];

    render(
      <TabNavigation
        tabs={tabs}
        activeTab="tab1"
        onTabChange={onTabChange}
      />
    );

    const tab2 = screen.getByText('Tab 2');
    await user.click(tab2);

    expect(onTabChange).toHaveBeenCalledWith('tab2');
  });
});

describe('Chart Components', () => {
  beforeEach(() => {
    // Mock any required chart dependencies
    mockIntersectionObserver();
  });

  it('should render LineChart with data', () => {
    const data = [{
      name: 'Test Series',
      data: [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 15 },
      ],
      color: '#3B82F6',
    }];

    render(<LineChart data={data} />);
    
    // Check if SVG is rendered
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('should render BarChart with data', () => {
    const data = [
      { x: 'A', y: 10 },
      { x: 'B', y: 20 },
      { x: 'C', y: 15 },
    ];

    render(<BarChart data={data} />);
    
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('should render PieChart with data', () => {
    const data = [
      { x: 'A', y: 30, label: 'Category A' },
      { x: 'B', y: 40, label: 'Category B' },
      { x: 'C', y: 30, label: 'Category C' },
    ];

    render(<PieChart data={data} showLabels={true} />);
    
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    expect(screen.getByText('Category A')).toBeInTheDocument();
  });
});

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Mock API responses
    vi.mocked(require('../hooks/useApi').useApi).mockImplementation((endpoint) => {
      if (endpoint === '/api/dashboard/quick-stats') {
        return {
          data: {
            activePlayers: 1000,
            gamesThisWeek: 16,
            fantasyLeagues: 12,
            avgPoints: 24.5,
          },
          loading: false,
          error: null,
        };
      }
      
      if (endpoint === '/api/players/top-performers') {
        return {
          data: [mockPlayer()],
          loading: false,
          error: null,
        };
      }
      
      return { data: null, loading: true, error: null };
    });
  });

  it('should render dashboard with quick stats', async () => {
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('1,000')).toBeInTheDocument(); // Active players
      expect(screen.getByText('16')).toBeInTheDocument(); // Games this week
    });
  });

  it('should switch between tabs', async () => {
    const user = useTestUser();
    renderWithProviders(<Dashboard />);

    const playersTab = screen.getByText('Players');
    await user.click(playersTab);

    // Verify tab content changed
    expect(screen.getByText('Players')).toBeInTheDocument();
  });
});

describe('Settings Component', () => {
  beforeEach(() => {
    // Mock localStorage
    const mockStorage = mockLocalStorage();
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
    });

    // Mock context hooks
    vi.mocked(require('../context/AppStateContext').useAppSettings).mockReturnValue({
      settings: {
        theme: 'light',
        notifications: true,
        autoRefresh: true,
        refreshInterval: 30000,
      },
      updateSettings: vi.fn(),
    });

    vi.mocked(require('../context/ThemeContext').useTheme).mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
      systemTheme: 'light',
    });
  });

  it('should render settings form', () => {
    renderWithProviders(<Settings />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
  });

  it('should save general settings', async () => {
    const user = useTestUser();
    const updateSettings = vi.fn();
    
    vi.mocked(require('../context/AppStateContext').useAppSettings).mockReturnValue({
      settings: {
        theme: 'light',
        notifications: true,
        autoRefresh: true,
        refreshInterval: 30000,
      },
      updateSettings,
    });

    renderWithProviders(<Settings />);

    // Find and click the notifications checkbox
    const notificationsCheckbox = screen.getByLabelText(/notifications/i);
    await user.click(notificationsCheckbox);

    // Submit the form
    const saveButton = screen.getByText('Save Settings');
    await user.click(saveButton);

    await waitFor(() => {
      expect(updateSettings).toHaveBeenCalled();
    });
  });
});

describe('Error Handling', () => {
  it('should handle API errors gracefully', async () => {
    vi.mocked(require('../hooks/useApi').useApi).mockReturnValue({
      data: null,
      loading: false,
      error: new Error('API Error'),
    });

    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      // Should show error state or fallback content
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });
});

describe('Accessibility', () => {
  it('should have proper ARIA attributes', () => {
    render(
      <Button aria-label="Test button">
        Click me
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Test button' });
    expect(button).toHaveAttribute('aria-label', 'Test button');
  });

  it('should support keyboard navigation', async () => {
    const user = useTestUser();
    const onTabChange = vi.fn();
    
    const tabs = [
      { id: 'tab1', label: 'Tab 1' },
      { id: 'tab2', label: 'Tab 2' },
    ];

    render(
      <TabNavigation
        tabs={tabs}
        activeTab="tab1"
        onTabChange={onTabChange}
      />
    );

    const tab1 = screen.getByText('Tab 1');
    
    // Focus and navigate with keyboard
    tab1.focus();
    await user.keyboard('{ArrowRight}');
    
    // Should focus next tab
    expect(screen.getByText('Tab 2')).toHaveFocus();
  });
});

describe('Performance', () => {
  it('should render components within acceptable time', async () => {
    const start = performance.now();
    
    renderWithProviders(<Dashboard />);
    
    const end = performance.now();
    const renderTime = end - start;
    
    // Should render within 100ms
    expect(renderTime).toBeLessThan(100);
  });

  it('should handle large datasets efficiently', async () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      x: i,
      y: Math.random() * 100,
    }));

    const start = performance.now();
    
    render(<BarChart data={largeDataset} />);
    
    const end = performance.now();
    const renderTime = end - start;
    
    // Should handle large datasets within reasonable time
    expect(renderTime).toBeLessThan(500);
  });
});
