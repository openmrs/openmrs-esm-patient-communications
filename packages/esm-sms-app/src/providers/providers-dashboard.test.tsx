import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProvidersDashboard from './providers-dashboard.component';
import { useTranslation } from 'react-i18next';
import { showModal, useWorkspaces } from '@openmrs/esm-framework';
import { useProviderConfigTemplates } from '../hooks/useProviderConfigTemplates';
import { renderWithSwr } from 'tools';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('../hooks/useProviderConfigTemplates', () => ({
  useProviderConfigTemplates: jest.fn(),
}));

describe('ProvidersDashboard', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  const mockShowModal = showModal as jest.Mock;
  const mockUseProviderConfigTemplates = useProviderConfigTemplates as jest.Mock;
  const mockUseTranslation = useTranslation as jest.Mock;
  const mockUseworkspaces = useWorkspaces as jest.Mock;

  beforeEach(() => {
    mockUseTranslation.mockReturnValue({ t: (_key: string, value: string) => value });
    mockUseworkspaces.mockReturnValue({ active: false });
    mockUseProviderConfigTemplates.mockReturnValue({ mutateTemplates: jest.fn() });
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
