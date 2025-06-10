import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Test utilities
export const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <div>
        {children}
      </div>
    );
  };
  
  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Mock data generators
export const mockPlayer = (overrides = {}) => ({
  id: '1',
  name: 'Test Player',
  position: 'QB',
  team: 'TEST',
  teamId: '1',
  stats: {
    passingYards: 300,
    passingTDs: 2,
    interceptions: 1,
    fantasyPoints: 18.5,
  },
  ...overrides,
});

export const mockTeam = (overrides = {}) => ({
  id: '1',
  name: 'Test Team',
  abbreviation: 'TEST',
  city: 'Test City',
  conference: 'NFC',
  division: 'North',
  record: '8-6',
  ...overrides,
});

export const mockGame = (overrides = {}) => ({
  id: '1',
  date: new Date().toISOString(),
  week: 1,
  homeTeam: mockTeam({ id: '1', name: 'Home Team' }),
  awayTeam: mockTeam({ id: '2', name: 'Away Team' }),
  status: 'scheduled',
  ...overrides,
});

// API mocking utilities
export const mockApiResponse = (data: any, delay = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data, status: 200, ok: true });
    }, delay);
  });
};

export const mockApiError = (message = 'API Error', status = 500) => {
  return Promise.reject({
    message,
    status,
    response: { status, data: { message } }
  });
};

// Custom testing hooks
export const useTestUser = () => {
  const user = userEvent.setup();
  return user;
};

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  await waitFor(() => {
    // Wait for any async operations to complete
  });
  const end = performance.now();
  return end - start;
};

// Accessibility testing utilities
export const checkAccessibility = async (container: HTMLElement) => {
  const { axe } = await import('axe-core');
  const results = await axe.run(container);
  return results;
};

// Local storage mocking
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

// Window mocking utilities
export const mockWindow = (overrides = {}) => {
  const mockWindow = {
    innerWidth: 1024,
    innerHeight: 768,
    location: {
      href: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
    },
    matchMedia: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
    ...overrides,
  };
  
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: mockWindow.innerWidth,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: mockWindow.innerHeight,
  });
  
  return mockWindow;
};

// Network mocking
export const mockFetch = (responses: Record<string, any>) => {
  const fetch = vi.fn((url: string) => {
    const response = responses[url];
    if (response) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response)),
      });
    }
    return Promise.reject(new Error(`No mock response for ${url}`));
  });
  
  (global as any).fetch = fetch;
  return fetch;
};

// Test data generators
export const generatePlayers = (count: number) => {
  return Array.from({ length: count }, (_, index) => mockPlayer({
    id: String(index + 1),
    name: `Player ${index + 1}`,
  }));
};

export const generateTeams = (count: number) => {
  return Array.from({ length: count }, (_, index) => mockTeam({
    id: String(index + 1),
    name: `Team ${index + 1}`,
  }));
};

// Component testing utilities
export const findByTestId = (testId: string) => screen.findByTestId(testId);
export const getByTestId = (testId: string) => screen.getByTestId(testId);
export const queryByTestId = (testId: string) => screen.queryByTestId(testId);

// Form testing utilities
export const fillForm = async (formData: Record<string, string>) => {
  const user = useTestUser();
  
  for (const [fieldName, value] of Object.entries(formData)) {
    const field = screen.getByLabelText(new RegExp(fieldName, 'i'));
    await user.clear(field);
    await user.type(field, value);
  }
};

export const submitForm = async () => {
  const user = useTestUser();
  const submitButton = screen.getByRole('button', { name: /submit/i });
  await user.click(submitButton);
};

// Chart testing utilities
export const mockChartData = () => ({
  datasets: [
    {
      label: 'Test Data',
      data: [10, 20, 30, 40, 50],
      backgroundColor: '#3B82F6',
    },
  ],
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
});

// Error boundary testing
export const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Async testing utilities
export const waitForLoadingToFinish = () => {
  return waitFor(() => {
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });
};

export const waitForErrorToAppear = (errorMessage: string) => {
  return waitFor(() => {
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
};

// Mock intersection observer
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
};

// Mock resize observer
export const mockResizeObserver = () => {
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
  return mockResizeObserver;
};

// Performance testing
export const measureComponentPerformance = async (
  Component: React.ComponentType,
  props = {}
) => {
  const measurements = [];
  
  for (let i = 0; i < 10; i++) {
    const start = performance.now();
    render(<Component {...props} />);
    const end = performance.now();
    measurements.push(end - start);
  }
  
  const average = measurements.reduce((a, b) => a + b, 0) / measurements.length;
  const min = Math.min(...measurements);
  const max = Math.max(...measurements);
  
  return { average, min, max, measurements };
};
