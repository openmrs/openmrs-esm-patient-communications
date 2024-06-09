import { defineConfigSchema, getAsyncLifecycle } from '@openmrs/esm-framework';

const moduleName = '@openmrs/esm-sms-app';

const options = {
  featureName: 'sms-provider-settings',
  moduleName,
};

export const importTranslation = require.context('../translations', true, /.json$/, 'lazy');

// export const root = getAsyncLifecycle(() => import('./root.component'), options);

export const smsAdminCardLink = getAsyncLifecycle(() => import('./sms-admin-card-link.component'), options);

export function startupApp() {
  defineConfigSchema(moduleName, {});
}
