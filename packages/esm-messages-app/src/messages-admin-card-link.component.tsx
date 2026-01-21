import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, ClickableTile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';

const MessagesManagementCardLink: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Layer>
      <ClickableTile href={`${window.spaBase}/messages`} target="_blank" rel="noreferrer">
        <div>
          <div className="heading">{t('manageMessages', 'Manage Messages')}</div>
          <div className="content">{t('messagesManagement', 'Messages Management')}</div>
        </div>
        <div className="iconWrapper">
          <ArrowRight size={16} />
        </div>
      </ClickableTile>
    </Layer>
  );
};

export default MessagesManagementCardLink;
