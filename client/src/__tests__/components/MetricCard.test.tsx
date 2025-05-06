import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../../pages/operations';

// Mock the react-query provider to avoid errors
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn().mockReturnValue({ data: null, isLoading: false }),
  useMutation: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false })
}));

describe('MetricCard component', () => {
  it('renders correctly with props', () => {
    render(
      <MetricCard
        title="Active Users"
        value="1,234"
        change="+12%"
        trend="up"
        icon="people"
      />
    );

    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('+12% from last period')).toBeInTheDocument();
    expect(screen.getByText('people')).toBeInTheDocument();
  });

  it('renders with down trend', () => {
    render(
      <MetricCard
        title="Revenue"
        value="$5,678"
        change="-5%"
        trend="down"
        icon="money"
      />
    );

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$5,678')).toBeInTheDocument();
    expect(screen.getByText('-5% from last period')).toBeInTheDocument();
    expect(screen.getByText('arrow_downward')).toBeInTheDocument();
  });

  it('applies custom trend color when provided', () => {
    const { container } = render(
      <MetricCard
        title="Alerts"
        value="42"
        change="+7"
        trend="up"
        icon="warning"
        trendColor="text-warning"
      />
    );

    expect(screen.getByText('Alerts')).toBeInTheDocument();
    
    // Check for the custom trend color class
    const trendElement = container.querySelector('.text-warning');
    expect(trendElement).not.toBeNull();
  });
});