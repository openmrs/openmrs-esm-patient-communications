import React from 'react';
import { screen } from '@testing-library/dom';
import { renderWithSwr, waitForLoadingToFinish } from 'tools';
import { mockMessageTemplates } from '__mocks__';
import MessagesDashboard from './messages-settings-dashboard.component';
import { useMessagesTemplates } from '../hooks/useMessagesTemplates';

jest.mock('@openmrs/esm-framework', () => {
  return {
    __esModule: true,
    useConfig: () => ({ endOfMessageType: [7, 8] }),
    useLayoutType: jest.fn(() => 'desktop'),
  };
});

jest.mock('../hooks/useMessagesTemplates', () => ({
  useMessagesTemplates: jest.fn(),
}));

describe('Messages Dashboard', () => {
  beforeAll(() => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  const mockuseMessageTemplates = useMessagesTemplates as jest.Mock;

  it('renders messages settings dashboard', async () => {
    mockuseMessageTemplates.mockImplementation(() => ({
      messagesTemplates: mockMessageTemplates,
      isLoadingTemplates: false,
      error: null,
      mutateTemplates: jest.fn(),
    }));
    renderDashboard();

    await waitForLoadingToFinish();
    expect(screen.getAllByText(/Messages Settings/i)).not.toBe([]);
    expect(screen.getByText(/Default Patient messages settings/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    mockMessageTemplates.forEach((template) => {
      expect(screen.getByText(template.name)).toBeInTheDocument();
    });
  });
});

function renderDashboard() {
  renderWithSwr(<MessagesDashboard />);
}
