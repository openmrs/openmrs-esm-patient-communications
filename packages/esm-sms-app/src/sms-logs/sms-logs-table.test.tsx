import React from 'react';
import { screen } from '@testing-library/react';
import SmslogsTable from './sms-logs-table.component';
import { useTranslation } from 'react-i18next';
import { useConfig, usePagination, useLayoutType } from '@openmrs/esm-framework';
import { useSMSLogs } from '../hooks/useLogs';
import { renderWithSwr } from 'tools';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('../hooks/useLogs', () => ({
  useSMSLogs: jest.fn(),
}));

describe('SmslogsTable', () => {
  const mockUseTranslation = useTranslation as jest.Mock;
  const mockUseConfig = useConfig as jest.Mock;
  const mockUsePagination = usePagination as jest.Mock;
  const mockUseLayoutType = useLayoutType as jest.Mock;
  const mockUseLogsRecords = useSMSLogs as jest.Mock;

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({ t: (key: string, value: string) => value });
    mockUseConfig.mockReturnValue({
      configurationPageSize: [10, 20, 50, 100],
      smsLogsColumns: ['phoneNumber', 'messageContent', 'config', 'timestamp', 'providerId'],
    });
    mockUseLayoutType.mockReturnValue('desktop');
    mockUsePagination.mockReturnValue({
      results: mockLogs,
      paginated: true,
      goTo: jest.fn(),
      currentPage: 1,
    });
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
      error: new Error(),
    });
    renderSmsLogsTable();
    expect(screen.getByText('Error undefined:')).toBeInTheDocument();
  });
});

function renderSmsLogsTable() {
  return renderWithSwr(<SmslogsTable />);
}

const mockLogs = [
  {
    id: 2,
    errorMessage: null,
    providerStatus: null,
    openMrsId: '2f702be8b4ae459ba4d2d05b185c9ab7',
    providerId: '5882ab57-50cd-4b52-b211-bca5c5b8a781',
    deliveryStatus: 'DISPATCHED',
    messageContent: 'Hello',
    timestamp: '2024-08-02T06:25:18.000Z',
    config: 'Vonage',
    smsDirection: 'OUTBOUND',
    phoneNumber: '256754544829',
    modificationDate: '',
    creationDate: '2024-08-02T06:25:18.000Z',
    modifiedBy: null,
    creator: 'daemon',
  },
  {
    id: 1,
    errorMessage: null,
    providerStatus: null,
    openMrsId: '2f702be8b4ae459ba4d2d05b185c9ab7',
    providerId: null,
    deliveryStatus: 'SCHEDULED',
    messageContent: 'Hello',
    timestamp: '2024-08-02T06:25:17.000Z',
    config: 'Vonage',
    smsDirection: 'OUTBOUND',
    phoneNumber: '256754544829',
    modificationDate: '',
    creationDate: '2024-08-02T06:25:17.000Z',
    modifiedBy: null,
    creator: 'admin',
  },
];
