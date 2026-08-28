import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { dashboardMeta } from './dashboard.meta';

const moduleName = '@openmrs/esm-messages-app';

const options = {
  featureName: 'messages',
  moduleName,
};

export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const importTranslation = require.context('../translations', true, /.json$/, 'lazy');

export const messagesDashboard = getAsyncLifecycle(
  () => import('./messages/messages-settings-dashboard.component'),
  options,
);

export const messagesManagementCardLink = getAsyncLifecycle(
  () => import('./messages-admin-card-link.component'),
  options,
);

export const messagesPatientChartDashboard = getAsyncLifecycle(
  () => import('./messages/messages-chart-dashboard.component'),
  options,
);

export const messagesDashboardLink = getSyncLifecycle(
  createDashboardLink({
    ...dashboardMeta,
    moduleName,
  }),
  options,
);

export const messagesFormWorkspace = getAsyncLifecycle(
  () => import('./messages/messages-form-workspace.component'),
  options,
);
