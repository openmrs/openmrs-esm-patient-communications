import React from 'react';
import { type MessagesTemplate } from '../../types';
import TemplateField from '../template-field/template-field.component';
import { useTranslation } from 'react-i18next';
import { Layer } from '@carbon/react';
import styles from './messages-template-field.scss';

const MessagesTemplate = ({ template }: { template: MessagesTemplate }) => {
  const { t } = useTranslation();
  const { templateFields, uuid } = template;

  if (!templateFields || templateFields.length === 0) {
    return <div>{t('noFieldsSet', 'No fields set yet')}</div>;
  }
  return (
    <div className={styles.layer}>
      {templateFields.map((field) => (
        <TemplateField key={field.uuid} field={field} templateUuid={uuid} />
      ))}
    </div>
  );
};

export default MessagesTemplate;
