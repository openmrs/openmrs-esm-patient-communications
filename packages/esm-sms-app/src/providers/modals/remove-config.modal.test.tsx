import React from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { saveConfig } from '../../api/providers.resource';
import RemoveConfigModal from './remove-config.modal';

const mockProviderConfigurations = [
  { name: 'Twilio', templateName: 'Twilio' },
  { name: 'Plivo', templateName: 'Plivo' },
];

vi.mock('@openmrs/esm-framework', () => ({
  showSnackbar: vi.fn(),
}));

vi.mock('../../hooks/useProviderConfigurations', () => ({
  useProviderConfigurations: () => ({
    mutateConfigs: vi.fn(),
    providerConfigurations: mockProviderConfigurations,
    defaultConfig: 'Twilio',
  }),
}));

vi.mock('../../api/providers.resource', () => ({
  saveConfig: vi.fn(),
}));

const mockSaveConfig = vi.mocked(saveConfig);

describe('RemoveConfigModal', () => {
  beforeEach(() => {
    mockSaveConfig.mockResolvedValue({});
  });

  it('keeps the default configuration when removing another one', async () => {
    const user = userEvent.setup();
    render(<RemoveConfigModal closeDeleteModal={vi.fn()} configName="Plivo" />);

    await user.click(screen.getByRole('button', { name: /remove$/i }));

    expect(mockSaveConfig).toHaveBeenCalledWith([mockProviderConfigurations[0]], 'Twilio');
  });

  it('clears the default configuration when removing it', async () => {
    const user = userEvent.setup();
    render(<RemoveConfigModal closeDeleteModal={vi.fn()} configName="Twilio" />);

    await user.click(screen.getByRole('button', { name: /remove$/i }));

    expect(mockSaveConfig).toHaveBeenCalledWith([mockProviderConfigurations[1]], null);
  });
});
