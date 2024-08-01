import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SmslogsTable from './sms-logs-table.component';
import { useTranslation } from 'react-i18next';
import { useConfig, usePagination, useLayoutType, isDesktop as isDesktopLayout } from '@openmrs/esm-framework';
import { useLogsRecords } from '../../hooks/useLogs';
import { renderWithSwr } from 'tools';
import { ErrorState } from '@openmrs/esm-patient-common-lib';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  useConfig: jest.fn(),
  usePagination: jest.fn(),
  useLayoutType: jest.fn(),
  isDesktop: jest.fn(),
}));

jest.mock('../../hooks/useLogs', () => ({
  useLogsRecords: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ErrorState: jest.fn(() => <div>ErrorState</div>),
}));

jest.mock('../empty-state/empty-state.component', () => ({
  EmptyState: jest.fn(() => <div>EmptyState</div>),
}));

describe('SmslogsTable', () => {
  const mockUseTranslation = useTranslation as jest.Mock;
  const mockUseConfig = useConfig as jest.Mock;
  const mockUsePagination = usePagination as jest.Mock;
  const mockUseLayoutType = useLayoutType as jest.Mock;
  const mockIsDesktopLayout = isDesktopLayout as jest.Mock;
  const mockUseLogsRecords = useLogsRecords as jest.Mock;

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({ t: (key: string) => key });
    mockUseConfig.mockReturnValue({
      configurationPageSize: [10, 20, 30, 40, 50],
      smsLogsColumns: [{ header: 'Phone Number' }, { header: 'Message' }, { header: 'Timestamp' }],
    });
    mockUseLayoutType.mockReturnValue('desktop');
    mockIsDesktopLayout.mockReturnValue(true);
    mockUseLogsRecords.mockReturnValue({
      smsLogs: [
        { id: 1, phoneNumber: '12345', messageContent: 'Test message 1', timestamp: '2021-01-01T12:00:00Z' },
        { id: 2, phoneNumber: '67890', messageContent: 'Test message 2', timestamp: '2021-01-02T12:00:00Z' },
      ],
      isLoadingLogs: false,
      isValidatingLogs: false,
      mutateLogs: jest.fn(),
      error: null,
    });
    mockUsePagination.mockReturnValue({
      results: [
        { id: 1, phoneNumber: '12345', messageContent: 'Test message 1', timestamp: '2021-01-01 12:00:00 PM' },
        { id: 2, phoneNumber: '67890', messageContent: 'Test message 2', timestamp: '2021-01-02 12:00:00 PM' },
      ],
      paginated: true,
      goTo: jest.fn(),
      currentPage: 1,
    });
  });

  it('renders the component correctly', () => {
    renderSmsLogsTable();
    expect(screen.getByText('smsLogs')).toBeInTheDocument();
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
    expect(screen.getByText('Timestamp')).toBeInTheDocument();
    expect(screen.getByText('Test message 1')).toBeInTheDocument();
    expect(screen.getByText('Test message 2')).toBeInTheDocument();
  });

  it('displays loading skeleton when logs are loading', () => {
    mockUseLogsRecords.mockReturnValueOnce({
      smsLogs: [],
      isLoadingLogs: true,
      isValidatingLogs: false,
      mutateLogs: jest.fn(),
      error: null,
    });
    renderSmsLogsTable();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error state when there is an error', () => {
    mockUseLogsRecords.mockReturnValueOnce({
      smsLogs: [],
      isLoadingLogs: false,
      isValidatingLogs: false,
      mutateLogs: jest.fn(),
      error: new Error('Failed to fetch logs'),
    });
    renderSmsLogsTable();
    expect(screen.getByText('ErrorState')).toBeInTheDocument();
  });

  it('filters logs by phone number', () => {
    renderSmsLogsTable();
    fireEvent.change(screen.getByLabelText('fitlerLogsByNumber:'), { target: { value: '12345' } });
    expect(screen.queryByText('Test message 2')).not.toBeInTheDocument();
    expect(screen.getByText('Test message 1')).toBeInTheDocument();
  });

  it('filters logs by search term', () => {
    renderSmsLogsTable();
    fireEvent.change(screen.getByPlaceholderText('Search for a message'), { target: { value: 'message 2' } });
    expect(screen.queryByText('Test message 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test message 2')).toBeInTheDocument();
  });

  it('paginates logs correctly', async () => {
    const mockGoTo = jest.fn();
    mockUsePagination.mockReturnValueOnce({
      results: [
        { id: 1, phoneNumber: '12345', messageContent: 'Test message 1', timestamp: '2021-01-01 12:00:00 PM' },
        { id: 2, phoneNumber: '67890', messageContent: 'Test message 2', timestamp: '2021-01-02 12:00:00 PM' },
      ],
      paginated: true,
      goTo: mockGoTo,
      currentPage: 1,
    });
    renderSmsLogsTable();
    fireEvent.click(screen.getByText('Next page'));
    await waitFor(() => {
      expect(mockGoTo).toHaveBeenCalledWith(2);
    });
  });
});

function renderSmsLogsTable() {
  return renderWithSwr(<SmslogsTable />);
}
