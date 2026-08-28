import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useMessagesTemplates } from '../hooks/useMessagesTemplates';
import { useLayoutType } from '@openmrs/esm-framework';
import MessagesForm from './messages-form-workspace.component';
import styles from './messages-settings-dashboard.scss';

const MessagesDashboard = () => {
  const { t } = useTranslation();
  const methods = useMessagesTemplates();
  const isLayoutTablet = useLayoutType() === 'tablet';

  return (
    <div className={classNames('omrs-main-content', styles.mainContainer, styles.messagesContent)}>
      <div className={classNames(isLayoutTablet ? styles.tabletContainer : styles.desktopContainer)}>
        <p className={styles.title}>{t('messagesSettings', 'Messages Settings')}</p>
        <div className={styles.tabContainer}>
          <p className={styles.heading}>{t('defaultPatientMessagesSettings', 'Default Patient messages settings')}</p>
          <MessagesForm {...methods} />
        </div>
      </div>
    </div>
  );
};

export default MessagesDashboard;
