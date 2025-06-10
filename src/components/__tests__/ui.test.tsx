import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import ErrorBoundary from '../components/ErrorBoundary';
import Loading from '../components/ui/Loading';
import Button from '../components/ui/Button';
import TabNavigation from '../components/ui/TabNavigation';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';

// Mock console.error to avoid noise in test output
const mockConsoleError = vi.fn();
beforeEach(() => {
  mockConsoleError.mockClear();
  vi.spyOn(console, 'error').mockImplementation(mockConsoleError);
});

describe('ErrorBoundary', () => {
  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>No error</div>;
  };

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error fallback when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('allows retry functionality', async () => {
    const user = userEvent.setup();
    
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);
    
    // Re-render with no error
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });
});

describe('Loading Component', () => {
  it('renders spinner variant by default', () => {
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders skeleton variant', () => {
    render(<Loading variant="skeleton" />);
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders pulse variant', () => {
    render(<Loading variant="pulse" text="Custom loading text" />);
    expect(screen.getByText('Custom loading text')).toBeInTheDocument();
    expect(screen.getByText('🏈')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Loading className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary-600');
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Submit</Button>);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders with icon', () => {
    const icon = <span data-testid="icon">📧</span>;
    render(<Button icon={icon}>Send Email</Button>);
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Send Email')).toBeInTheDocument();
  });

  it('applies different variants', () => {
    const { rerender } = render(<Button variant="secondary">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-gray-600');
    
    rerender(<Button variant="outline">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-gray-300');
    
    rerender(<Button variant="danger">Test</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  it('prevents click when loading', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button loading onClick={handleClick}>Submit</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('TabNavigation Component', () => {
  const mockTabs = [
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2' },
    { id: 'tab3', label: 'Tab 3', disabled: true },
  ];

  it('renders all tabs', () => {
    render(
      <TabNavigation
        tabs={mockTabs}
        activeTab="tab1"
        onTabChange={() => {}}
      />
    );
    
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tab 3' })).toBeInTheDocument();
  });

  it('handles tab selection', async () => {
    const handleTabChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TabNavigation
        tabs={mockTabs}
        activeTab="tab1"
        onTabChange={handleTabChange}
      />
    );
    
    await user.click(screen.getByRole('tab', { name: 'Tab 2' }));
    expect(handleTabChange).toHaveBeenCalledWith('tab2');
  });

  it('prevents selection of disabled tabs', async () => {
    const handleTabChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TabNavigation
        tabs={mockTabs}
        activeTab="tab1"
        onTabChange={handleTabChange}
      />
    );
    
    await user.click(screen.getByRole('tab', { name: 'Tab 3' }));
    expect(handleTabChange).not.toHaveBeenCalled();
  });

  it('supports keyboard navigation', async () => {
    const handleTabChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <TabNavigation
        tabs={mockTabs}
        activeTab="tab1"
        onTabChange={handleTabChange}
      />
    );
    
    const activeTab = screen.getByRole('tab', { name: 'Tab 1' });
    activeTab.focus();
    
    await user.keyboard('{ArrowRight}');
    expect(handleTabChange).toHaveBeenCalledWith('tab2');
    
    await user.keyboard('{Enter}');
    expect(handleTabChange).toHaveBeenCalledWith('tab1');
  });

  it('applies correct ARIA attributes', () => {
    render(
      <TabNavigation
        tabs={mockTabs}
        activeTab="tab1"
        onTabChange={() => {}}
      />
    );
    
    const activeTab = screen.getByRole('tab', { name: 'Tab 1' });
    const inactiveTab = screen.getByRole('tab', { name: 'Tab 2' });
    
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
    expect(activeTab).toHaveAttribute('tabindex', '0');
    expect(inactiveTab).toHaveAttribute('aria-selected', 'false');
    expect(inactiveTab).toHaveAttribute('tabindex', '-1');
  });
});

describe('Card Components', () => {
  it('renders basic card', () => {
    render(
      <Card>
        <CardContent>Card content</CardContent>
      </Card>
    );
    
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders card with header and footer', () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('applies different variants', () => {
    const { container, rerender } = render(
      <Card variant="outlined">Content</Card>
    );
    expect(container.firstChild).toHaveClass('border-gray-200');
    
    rerender(<Card variant="elevated">Content</Card>);
    expect(container.firstChild).toHaveClass('shadow-lg');
    
    rerender(<Card variant="interactive">Content</Card>);
    expect(container.firstChild).toHaveClass('cursor-pointer');
  });

  it('applies different padding sizes', () => {
    const { container, rerender } = render(
      <Card padding="sm">Content</Card>
    );
    expect(container.firstChild).toHaveClass('p-3');
    
    rerender(<Card padding="lg">Content</Card>);
    expect(container.firstChild).toHaveClass('p-8');
    
    rerender(<Card padding="none">Content</Card>);
    expect(container.firstChild).not.toHaveClass('p-6');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Card ref={ref}>Content</Card>);
    expect(ref).toHaveBeenCalled();
  });
});
