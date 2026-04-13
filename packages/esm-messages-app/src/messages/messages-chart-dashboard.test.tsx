import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithSwr, waitForLoadingToFinish } from 'tools';
import { mockMessageTemplates } from '__mocks__';
import MessagesChartDashboard from './messages-chart-dashboard.component';
import { useMessagesTemplates } from '../hooks/useMessagesTemplates';

const mockuseMessageTemplates = useMessagesTemplates as jest.Mock;

jest.mock('../hooks/useMessagesTemplates', () => ({
  useMessagesTemplates: jest.fn(),
}));

describe('MessagesTable', () => {
  it('renders the messages table with templates', async () => {
    mockuseMessageTemplates.mockImplementation(() => ({
      messagesTemplates: mockMessageTemplates,
      isLoadingTemplates: false,
      error: null,
      mutateTemplates: jest.fn(),
    }));
    renderMessagesChartDashboard();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Messages/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Message Type/i)).not.toBe([]);
    expect(screen.getAllByText(/Status/i)).not.toBe([]);

    mockMessageTemplates.forEach((template) => {
      expect(screen.getByText(template.name)).toBeInTheDocument();
    });
  });

  it('rennder an empty state when there are no templates', async () => {
    mockuseMessageTemplates.mockImplementation(() => ({
      messagesTemplates: [],
      isLoadingTemplates: false,
      error: null,
      mutateTemplates: jest.fn(),
    }));

    renderMessagesChartDashboard();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Empty data illustration/i)).toBeInTheDocument();
  });
});

function renderMessagesChartDashboard() {
  renderWithSwr(<MessagesChartDashboard />);
}
