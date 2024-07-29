import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProvidersDashboard from './providers-dashboard.component';
import { useTranslation } from 'react-i18next';
import { showModal } from '@openmrs/esm-framework';
import { useOverlay } from '../hooks/useOverlay';
import { useProviderConfigTemplates } from '../hooks/useProviderConfigTemplates';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  showModal: jest.fn(),
}));

jest.mock('../hooks/useOverlay', () => ({
  useOverlay: jest.fn(),
}));

jest.mock('../hooks/useProviderConfigTemplates', () => ({
  useProviderConfigTemplates: jest.fn(),
}));

jest.mock('./providers-overview/providers-overview.component', () => () => <div>ProvidersListTable</div>);
jest.mock('./sms-logs-table/sms-logs-table.component', () => () => <div>SmslogsTable</div>);
jest.mock('../workspace/workspace-window.component', () => () => <div>Overlay</div>);

describe('ProvidersDashboard', () => {
  const mockShowModal = showModal as jest.Mock;
  const mockUseOverlay = useOverlay as jest.Mock;
  const mockUseProviderConfigTemplates = useProviderConfigTemplates as jest.Mock;
  const mockUseTranslation = useTranslation as jest.Mock;

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({ t: (key: string) => key });
    mockUseOverlay.mockReturnValue({ isOverlayOpen: false });
    mockUseProviderConfigTemplates.mockReturnValue({ mutateTemplates: jest.fn() });
  });

  it('renders the component correctly', () => {
    render(<ProvidersDashboard />);
    expect(screen.getByText('smsProviderSettings')).toBeInTheDocument();
    expect(screen.getByText('ProvidersListTable')).toBeInTheDocument();
    expect(screen.getByText('importConfig')).toBeInTheDocument();
  });

  it('switches between tabs', () => {
    render(<ProvidersDashboard />);

    // Initially, the Providers tab is displayed
    expect(screen.getByText('ProvidersListTable')).toBeInTheDocument();
    expect(screen.queryByText('SmslogsTable')).not.toBeInTheDocument();

    // Switch to Logs tab
    fireEvent.click(screen.getByText('logs'));
    expect(screen.queryByText('ProvidersListTable')).not.toBeInTheDocument();
    expect(screen.getByText('SmslogsTable')).toBeInTheDocument();
  });

  it('triggers showConfigUploadModal when the import button is clicked', () => {
    render(<ProvidersDashboard />);
    fireEvent.click(screen.getByText('importConfig'));

    expect(mockShowModal).toHaveBeenCalledWith('config-upload-modal', expect.any(Object));
  });
});
