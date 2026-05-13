import React from 'react';
import { type Mock } from 'vitest';
import type * as Zod from 'zod';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { renderWithSwr } from 'tools';
import ConfigTestForm from './provider-config-test-form.workspace';
import { openmrsFetch } from '@openmrs/esm-framework';

vi.mock('zod', async (importOriginal) => {
  const originalModule = await importOriginal<typeof Zod>();
  const mockedZod = {
    ...originalModule,
    z: {
      ...originalModule.z,
      schema: vi.fn(() => ({
        safeParse: vi.fn(() => ({
          success: true,
          data: {},
        })),
      })),
    },
  };
  return mockedZod;
});

vi.mock('../../api/providers.resource', () => ({
  sendTestMessage: vi.fn(),
}));

vi.mock('@openmrs/esm-framework', () => ({
  openmrsFetch: vi.fn(),
  showSnackbar: vi.fn(),
  useLayoutType: () => 'desktop',
  useConfig: vi.fn(() => ({ configurationPageSize: 10 })),
  ResponsiveWrapper: ({ children }) => <div>{children}</div>,
}));

vi.mock('../../hooks/useLogs', () => ({
  useSmsLogs: vi.fn(() => ({ mutateLogs: vi.fn() })),
}));

const mockOpenmrsFetch = openmrsFetch as Mock;

describe('AddProviderConfigForm', () => {
  it('Renders form fields correctly', async () => {
    renderConfigTestForm();
    const inputs = getFormInputs();

    expect(inputs.deliveryTimeInput).toBeInTheDocument();
    expect(inputs.recipientsInput).toBeInTheDocument();
    expect(inputs.testMessageInput).toBeInTheDocument();
    expect(inputs.customParamsInput).toBeInTheDocument();

    const buttons = getFormButtons();
    expect(buttons.cancelButton).toBeInTheDocument();
    expect(buttons.cancelButton).not.toBeDisabled();
    expect(buttons.submitButton).toBeInTheDocument();
    expect(buttons.submitButton).not.toBeDisabled();
  });

  it('sends a test message', async () => {
    mockOpenmrsFetch.mockReturnValue(mockTestMessageResponse);
    const user = userEvent.setup();
    renderConfigTestForm();
    const inputs = getFormInputs();

    await fillFormInputs(user, inputs, {
      deliveryTime: '0',
      recipients: '1234567890',
      testMessage: 'Hello world',
    });

    const buttons = getFormButtons();
    await user.click(buttons.submitButton);
  });

  it('should show field errors when invalid data type is provided', async () => {
    const user = userEvent.setup();
    renderConfigTestForm();

    const formbuttons = getFormButtons();
    await user.click(formbuttons.submitButton);

    expect(screen.getAllByText('Required')).toHaveLength(3);
  });
});

function renderConfigTestForm() {
  const props = { providerName: 'test-provider' };
  return renderWithSwr(<ConfigTestForm {...props} />);
}

function getFormInputs() {
  return {
    deliveryTimeInput: screen.getByTestId('delivery-time'),
    recipientsInput: screen.getByTestId('recipients'),
    testMessageInput: screen.getByTestId('test-message'),
    customParamsInput: screen.getByTestId('custom-params'),
  };
}

function getFormButtons() {
  return {
    cancelButton: screen.getByRole('button', { name: /Discard/i }),
    submitButton: screen.getByRole('button', { name: /Send and close/i }),
  };
}

async function fillFormInputs(user, inputs, values) {
  await user.click(inputs.deliveryTimeInput, values.deliveryTime);
  await user.type(inputs.recipientsInput, values.recipients);
  await user.type(inputs.testMessageInput, values.testMessage);
}

const mockTestMessageResponse = {
  config: 'test-provider',
  deliveryTime: '0',
  recipients: '1234567890',
  testMessage: 'Hello world',
};
