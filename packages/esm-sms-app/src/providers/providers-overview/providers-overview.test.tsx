import React from 'react';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { launchWorkspace2 } from '@openmrs/esm-framework';
import { renderWithSwr } from 'tools';
import ProvidersListTable from './providers-overview.component';

vi.mock('../../hooks/useProviderConfigurations', () => ({
  useProviderConfigurations: () => ({
    providerConfigurations: [{ name: 'Twilio', templateName: 'Twilio', isDefaultConfig: true }],
    defaultConfig: 'Twilio',
    isLoadingConfigs: false,
    isValidatingConfigs: false,
    mutateConfigs: vi.fn(),
    error: null,
  }),
}));

const mockLaunchWorkspace2 = vi.mocked(launchWorkspace2);

describe('ProvidersListTable', () => {
  it('opens a new add form instead of restoring an open edit form', async () => {
    const user = userEvent.setup();
    renderWithSwr(<ProvidersListTable />);

    await user.click(screen.getByRole('button', { name: /add/i }));

    // Passing no props would restore an already open edit form, since the workspace
    // store treats missing props as compatible with any open workspace.
    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('add-provider-config-form', {});
  });
});
