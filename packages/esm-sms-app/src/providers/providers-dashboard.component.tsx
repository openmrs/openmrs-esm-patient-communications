import { Tab, Tabs, TabPanel, TabList, TabPanels } from '@carbon/react';
import React, { useCallback } from 'react';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import ProvidersListTable from './providers-overview/providers-overview.component';
import { Button } from '@carbon/react';
import { Export } from '@carbon/react/icons';
import { showModal } from '@openmrs/esm-framework';
import styles from './providers-dashboard.scss';
import SmslogsTable from './sms-logs-table/sms-logs-table.component';
import Overlay from '../workspace/workspace-window.component';
import { useOverlay } from '../hooks/useOverlay';
import { useProviderConfigTemplates } from '../hooks/useProviderConfigTemplates';

const ProvidersDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { isOverlayOpen } = useOverlay();
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
      <main className={classnames(['omrs-main-content', styles.mainWrapper, { [styles.overlayOpen]: isOverlayOpen }])}>
        <h3>{t('smsProviderSettings', 'SMS Provider Settings')}</h3>
        <div className={styles.tabsContainer}>
          <Tabs className={styles.tabs}>
            <TabList className={styles.tabList}>
              <Tab className={styles.tab}>{t('providers', 'Providers')}</Tab>
              <Tab className={styles.tab}>{t('logs', 'Logs')}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <div className={classnames([styles.tabPanel, { [styles.overlayOpen]: isOverlayOpen }])}>
                  <ProvidersListTable />
                  <Button onClick={showConfigUploadModal} className={styles.importConfigButton}>
                    <Export size={16} />
                    {t('importConfig', 'Import config template')}
                  </Button>
                </div>
              </TabPanel>
              <TabPanel>
                <div className={classnames([styles.tabPanel, { [styles.overlayOpen]: isOverlayOpen }])}>
                  <SmslogsTable />
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      </main>
      <Overlay />
    </>
  );
};

export default ProvidersDashboard;
