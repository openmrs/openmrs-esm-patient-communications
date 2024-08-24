import React from 'react';
import { type Matcher, screen } from '@testing-library/dom';
import { renderWithSwr, waitForLoadingToFinish } from 'tools';
import MessagesDashboard from './messages-settings-dashboard.component';
import { openmrsFetch } from '@openmrs/esm-framework';
import { mockMessageTemplates } from '__mocks__';
import { useMessagesTemplates } from '../hooks/useMessagesTemplates';

const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockuseMessageTemplates = useMessagesTemplates as jest.Mock;

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
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    mockMessageTemplates.forEach((template: { name: Matcher }) => {
      expect(screen.getByText(template.name)).toBeInTheDocument();
    });
  });
});

function renderDashboard() {
  renderWithSwr(<MessagesDashboard />);
}
