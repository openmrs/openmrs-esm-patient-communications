import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-sms-app';

const options = {
  featureName: 'provider-settings',
  moduleName,
};

export const importTranslation = require.context('../translations', true, /.json$/, 'lazy');

export const providersDashboard = getAsyncLifecycle(() => import('./providers/providers-dashboard.component'), options);

export const smsAdminCardLink = getAsyncLifecycle(() => import('./sms-admin-card-link.component'), options);

export const testProviderConfigForm = getAsyncLifecycle(
  () => import('./providers/test-form/provider-config-test-form.workspace'),
  options,
);

// t('addProviderConfigFormWorkspaceTitle',  'Add Provider')
export const addProviderConfigForm = getAsyncLifecycle(
  () => import('./providers/add-config-form/provider-config-form.component'),
  options,
);

export const fileUploadModal = getAsyncLifecycle(
  () => import('./providers/modals/upload-template-modal.component'),
  options,
);

export const removeProviderConfigPrompt = getAsyncLifecycle(
  () => import('./providers/modals/remove-config-modal.component'),
  options,
);

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}
