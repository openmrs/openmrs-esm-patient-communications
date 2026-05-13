import React from 'react';
import { type Mock } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import ProvidersDashboard from './providers-dashboard.component';
import { useTranslation } from 'react-i18next';
import { showModal, useWorkspaces } from '@openmrs/esm-framework';
import { useProviderConfigTemplates } from '../hooks/useProviderConfigTemplates';
import { renderWithSwr } from 'tools';

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(),
}));

vi.mock('../hooks/useProviderConfigTemplates', () => ({
  useProviderConfigTemplates: vi.fn(),
}));

vi.mock('../sms-logs/sms-logs-table.component', () => ({ default: () => <div>Sms Logs Table</div> }));

describe('ProvidersDashboard', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  const mockShowModal = showModal as Mock;
  const mockUseProviderConfigTemplates = useProviderConfigTemplates as Mock;
  const mockUseTranslation = useTranslation as Mock;
  const mockUseworkspaces = useWorkspaces as Mock;

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({ t: (_key: string, value: string) => value });
    mockUseworkspaces.mockReturnValue({ active: false });
    mockUseProviderConfigTemplates.mockReturnValue({ mutateTemplates: vi.fn() });
  });

  it('renders the component correctly', () => {
    renderProvidersDashboard();
    expect(screen.getByText('SMS Provider Settings')).toBeInTheDocument();
    expect(screen.getByText('Import config template')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Providers' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Logs' })).toBeInTheDocument();
  });

  it('triggers showConfigUploadModal when the import button is clicked', () => {
    renderProvidersDashboard();
    fireEvent.click(screen.getByText('Import config template'));

    expect(mockShowModal).toHaveBeenCalledWith('config-upload-modal', expect.any(Object));
  });
});

function renderProvidersDashboard() {
  return renderWithSwr(<ProvidersDashboard />);
}
