import classnames from 'classnames';
import React, { useCallback } from 'react';
import { Tab, Tabs, TabPanel, TabList, TabPanels } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Export } from '@carbon/react/icons';
import { WorkspaceContainer, showModal, useWorkspaces } from '@openmrs/esm-framework';
import { useProviderConfigTemplates } from '../hooks/useProviderConfigTemplates';
import ProvidersListTable from './providers-overview/providers-overview.component';
import SmsLogsTable from '../sms-logs/sms-logs-table.component';
import styles from './providers-dashboard.scss';

const ProvidersDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { active: workspaceOpen } = useWorkspaces();
  const { mutateTemplates } = useProviderConfigTemplates();

  const showConfigUploadModal = useCallback(() => {
    const close = showModal('config-upload-modal', {
      mutateTemplates: mutateTemplates,
      closeModal: () => {
        close();
      },
    });
  }, [mutateTemplates]);

  return (
    <>
      <main className={classnames(['omrs-main-content', styles.mainPageWrapper])}>
        <div className={classnames([styles.container, { [styles.workspaceOpen]: workspaceOpen }])}>
          <h3>{t('smsProviderSettings', 'SMS Provider Settings')}</h3>
          <div className={styles.tabsContainer}>
            <Tabs className={styles.tabs}>
              <TabList className={styles.tabList}>
                <Tab className={styles.tab}>{t('providers', 'Providers')}</Tab>
                <Tab className={styles.tab}>{t('logs', 'Logs')}</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <div className={styles.tabPanel}>
                    <ProvidersListTable />
                    <Button onClick={showConfigUploadModal} className={styles.importConfigButton}>
                      <Export size={16} />
                      {t('importConfig', 'Import config template')}
                    </Button>
                  </div>
                </TabPanel>
                <TabPanel>
                  <div className={styles.tabPanel}>
                    <SmsLogsTable />
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        </div>
        <WorkspaceContainer contextKey="provider-settings" />
      </main>
    </>
  );
};

export default ProvidersDashboard;
