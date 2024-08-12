import React from 'react';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { renderWithSwr } from 'tools';
import AddProviderConfigForm from './provider-config-form.component';
import { openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import { saveConfig } from '../../api/providers.resource';

jest.mock('zod', () => {
  const originalModule = jest.requireActual('zod');
  const mockedZod = {
    ...originalModule,
    z: {
      ...originalModule.z,
      schema: jest.fn(() => ({
        safeParse: jest.fn(() => ({
          success: true,
          data: {},
        })),
      })),
    },
  };
  return mockedZod;
});

jest.mock('../../hooks/useProviderConfigurations', () => ({
  useProviderConfigurations: () => ({
    mutateConfigs: jest.fn(),
    providerConfigurations: [],
  }),
}));

jest.mock('../../hooks/useProviderConfigTemplates', () => ({
  useProviderConfigTemplates: () => ({
    templates: mockTemplates,
    isLoading: false,
    error: null,
  }),
}));

jest.mock('../../api/providers.resource', () => ({
  saveConfig: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  openmrsFetch: jest.fn(),
  showSnackbar: jest.fn(),
  useLayoutType: () => 'desktop',
  ResponsiveWrapper: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../hooks/useOverlay', () => ({
  closeOverlay: jest.fn(),
}));

const mockOpenmrsFetch = openmrsFetch as jest.Mock;
const mockSaveConfig = saveConfig as jest.Mock;

describe('AddProviderConfigForm', () => {
  it('Renders form fields correctly', async () => {
    renderAddProviderConfigForm();
    const inputs = getFormInputs();

    expect(inputs.nameInput).toBeInTheDocument();
    expect(inputs.templateInput).toBeInTheDocument();
    expect(inputs.maxRetriesInput).toBeInTheDocument();
    expect(inputs.splitHeaderInput).toBeInTheDocument();
    expect(inputs.splitFooterInput).toBeInTheDocument();
    expect(inputs.excludeLastFooterInput).toBeInTheDocument();
    expect(inputs.autoScriptInput).toBeInTheDocument();

    const buttons = getFormButtons();
    expect(buttons.cancelButton).toBeInTheDocument();
    expect(buttons.cancelButton).not.toBeDisabled();
    expect(buttons.submitButton).toBeInTheDocument();
    expect(buttons.submitButton).not.toBeDisabled();
  });

  it('saves and creates a new provider configuration', async () => {
    mockSaveConfig.mockResolvedValue({ data: { configs: [mockConfig], defaultConfigName: null } });
    const user = userEvent.setup();
    renderAddProviderConfigForm();
    const inputs = getFormInputs();

    await fillFormInputs(user, inputs, {
      name: 'Vonage',
      template: 'Twilio',
      maxRetries: '0',
      splitHeader: 'Msg $m of $t',
      splitFooter: '...',
    });

    const dynamicInputs = getDynamicFormInputs();

    await fillDynamicFormInputs(user, dynamicInputs, {
      username: 'test-username',
      password: 'test-password',
      from: 'test-from',
    });

    const buttons = getFormButtons();
    await user.click(buttons.submitButton);

    expect(saveConfig).toHaveBeenCalled();
    expect(saveConfig).toHaveBeenCalledWith([
      {
        name: 'Vonage',
        templateName: 'Twilio',
        autoScript: undefined,
        maxRetries: 0,
        splitHeader: 'Msg $m of $t',
        splitFooter: '...',
        excludeLastFooter: true,
        props: [
          { name: 'username', value: 'test-username' },
          { name: 'password', value: 'test-password' },
          { name: 'from', value: 'test-from' },
        ],
      },
    ]);
    expect(showSnackbar).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalledWith({
      title: 'Configuration saved',
      kind: 'success',
    });
  });

  it('should show field errors when invalid data type is provided', async () => {
    const user = userEvent.setup();
    renderAddProviderConfigForm();

    const formbuttons = getFormButtons();
    await user.click(formbuttons.submitButton);

    expect(screen.getAllByText('Required')).toHaveLength(4);
  });

  it('renders an error snackbar when there is a problem creating a new provider config', async () => {
    const user = userEvent.setup();
    renderAddProviderConfigForm();
    const error = new Error('Configuration not saved');

    mockSaveConfig.mockResolvedValue(error);

    const formbuttons = getFormButtons();
    await user.click(formbuttons.submitButton);

    expect(saveConfig).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalled();
  });
});

function renderAddProviderConfigForm() {
  return renderWithSwr(<AddProviderConfigForm />);
}

function getFormInputs() {
  return {
    nameInput: screen.getByTestId('provider-name'),
    templateInput: screen.getByTestId('select-template'),
    maxRetriesInput: screen.getByTestId('numberOfRetries'),
    splitHeaderInput: screen.getByTestId('split-header'),
    splitFooterInput: screen.getByTestId('split-footer'),
    excludeLastFooterInput: screen.getByTestId('exclude-last-footer'),
    autoScriptInput: screen.getByTestId('auto-script'),
  };
}

function getDynamicFormInputs() {
  return {
    dynamicUsernameInput: screen.getByTestId('username'),
    dynamicPasswordInput: screen.getByTestId('password'),
    dynamicFromInput: screen.getByTestId('from'),
  };
}

function getFormButtons() {
  return {
    cancelButton: screen.getByRole('button', { name: /Discard/i }),
    submitButton: screen.getByRole('button', { name: /Save and close/i }),
  };
}

async function fillFormInputs(user, inputs, values) {
  await user.type(inputs.nameInput, values.name);
  await user.selectOptions(inputs.templateInput, values.template);
  await user.type(inputs.maxRetriesInput, values.maxRetries);
  await user.type(inputs.splitHeaderInput, values.splitHeader);
  await user.type(inputs.splitFooterInput, values.splitFooter);
  await user.click(inputs.excludeLastFooterInput);
}

async function fillDynamicFormInputs(user, inputs, values) {
  await user.type(inputs.dynamicUsernameInput, values.username);
  await user.type(inputs.dynamicPasswordInput, values.password);
  await user.type(inputs.dynamicFromInput, values.from);
}

const mockTemplates = {
  Clickatell: {
    name: 'Clickatell',
    configurables: ['username', 'password', 'clickatell_api_id', 'from'],
  },
  Nuntium: {
    name: 'Nuntium',
    configurables: ['username', 'password', 'from'],
  },
  Twilio: {
    name: 'Twilio',
    configurables: ['username', 'password', 'from'],
  },
  Voxeo: {
    name: 'Voxeo',
    configurables: ['username', 'password', 'botkey', 'from'],
  },
  KooKoo: {
    name: 'KooKoo',
    configurables: ['api_key'],
  },
  Plivo: {
    name: 'Plivo',
    configurables: ['username', 'password', 'from'],
  },
  Voto: {
    name: 'Voto',
    configurables: ['api_key'],
  },
  Rancard: {
    name: 'Rancard',
    configurables: ['username', 'password', 'from'],
  },
};

const mockConfig = {
  name: 'Vonage',
  maxRetries: 0,
  excludeLastFooter: true,
  splitHeader: 'Msg $m of $t',
  splitFooter: '...',
  templateName: 'Twilio',
  props: [
    {
      name: 'username',
      value: '13ad7f87',
    },
    {
      name: 'password',
      value: 'tHUk4XoMxTKBw4fj',
    },
    {
      name: 'from',
      value: '14157386102',
    },
  ],
  automaticResponseScript: null,
};
