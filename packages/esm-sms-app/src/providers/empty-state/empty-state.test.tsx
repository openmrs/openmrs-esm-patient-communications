import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from './empty-state.component';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  useLayoutType: jest.fn(),
}));

jest.mock('./empty-data-illustration.component', () => ({
  EmptyDataIllustration: jest.fn(() => <div>EmptyDataIllustration</div>),
}));

describe('EmptyState', () => {
  const mockUseTranslation = useTranslation as jest.Mock;
  const mockUseLayoutType = useLayoutType as jest.Mock;

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({
      t: (key: string, options: any) => (options ? `${key} ${JSON.stringify(options)}` : key),
    });
    mockUseLayoutType.mockReturnValue('desktop');
  });

  it('renders the component correctly', () => {
    render(<EmptyState displayText="Items" headerTitle="No Items" />);
    expect(screen.getByText('No Items')).toBeInTheDocument();
    expect(screen.getByText('EmptyDataIllustration')).toBeInTheDocument();
    expect(screen.getByText('emptyTableStateText {"displayText":"items"}')).toBeInTheDocument();
  });

  it('renders correctly on tablet layout', () => {
    mockUseLayoutType.mockReturnValueOnce('tablet');
    render(<EmptyState displayText="Items" headerTitle="No Items" />);
    expect(screen.getByText('No Items')).toHaveClass('tabletHeading');
  });

  it('renders correctly on desktop layout', () => {
    render(<EmptyState displayText="Items" headerTitle="No Items" />);
    expect(screen.getByText('No Items')).toHaveClass('desktopHeading');
  });

  it('calls launchForm when button is clicked', () => {
    const mockLaunchForm = jest.fn();
    render(<EmptyState displayText="Items" headerTitle="No Items" launchForm={mockLaunchForm} />);
    fireEvent.click(screen.getByText('record {"displayText":"items"}'));
    expect(mockLaunchForm).toHaveBeenCalledTimes(1);
  });

  it('does not render the button if launchForm is not provided', () => {
    render(<EmptyState displayText="Items" headerTitle="No Items" />);
    expect(screen.queryByText('record {"displayText":"items"}')).not.toBeInTheDocument();
  });
});
