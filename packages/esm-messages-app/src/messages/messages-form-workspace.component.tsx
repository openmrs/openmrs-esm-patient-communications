import React, { useEffect, useMemo } from 'react';
import { useMessagesTemplates } from '../hooks/useMessagesTemplates';
import styles from './messages-settings-dashboard.scss';
import MessagesTemplate from './messages-template/messages-template.component';
import classNames from 'classnames';
import { Tab, Tabs, TabPanel, TabList, TabPanels, TabsSkeleton } from '@carbon/react';
import { ErrorState, showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { saveMessageTemplates } from '../api/api-remote';
import { ButtonSet } from '@carbon/react';
import { Button } from '@carbon/react';
import { type MessagesTemplate as Template } from '../types';

const schema = z.object({
  dynamicFields: z.record(
    z.string(),
    z.object({
      fields: z.record(z.string(), z.union([z.string(), z.number(), z.array(z.string())])),
    }),
  ),
});

interface MessagesDashboardProps {
  mutateTemplates?: () => void;
  messagesTemplates: Array<Template>;
  template?: Template;
  isLoadingTemplates: boolean;
  patientWorkspaceSize?: boolean;
  closeWorkspace?: () => void;
  error: any;
}

const MessagesForm: React.FC<MessagesDashboardProps> = ({
  messagesTemplates,
  error,
  isLoadingTemplates,
  mutateTemplates,
  patientWorkspaceSize,
  template,
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const isLayoutTablet = useLayoutType() === 'tablet';

  const defaultValues = useMemo(() => {
    const dynamicFields = {};

    if (patientWorkspaceSize) {
      dynamicFields[template.uuid] = {
        fields: {},
      };
      template.templateFields.forEach((field) => {
        dynamicFields[template.uuid].fields[field.type] = field.defaultValue;
      });

      return dynamicFields;
    }

    messagesTemplates?.forEach((template) => {
      dynamicFields[template.uuid] = {
        fields: {},
      };

      template?.templateFields?.forEach((field) => {
        dynamicFields[template.uuid].fields[field.type] = field.defaultValue;
      });
    });

    return dynamicFields;
  }, [messagesTemplates, patientWorkspaceSize, template?.templateFields, template?.uuid]);

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues,
  });
  const { handleSubmit } = methods;

  const onSubmit = async (data) => {
    const updatedTemplates = messagesTemplates.map((template) => {
      if (data.dynamicFields[template.uuid]) {
        const updatedFields = template.templateFields.map((field) => ({
          ...field,
          defaultValue: data.dynamicFields[template.uuid].fields[field.type] || field.defaultValue,
        }));
        return { ...template, templateFields: updatedFields };
      }
      return template;
    });

    const payload = { templates: updatedTemplates };

    return await saveMessageTemplates(payload)
      .then(() =>
        showSnackbar({
          title: t('templatesUpdated', 'Default setting updated'),
          kind: 'success',
        }),
      )
      .catch(() =>
        showSnackbar({
          title: t('templatesNotUpdated', 'Error updating templates'),
          kind: 'error',
        }),
      );
  };

  if (isLoadingTemplates) {
    return (
      <div
        style={{
          maxWidth: '100%',
        }}
      >
        <TabsSkeleton />
      </div>
    );
  }

  if (error) {
    return <ErrorState headerTitle="Error" error={error} />;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {patientWorkspaceSize ? (
          <>
            <div className={styles.box}>
              <MessagesTemplate template={template} />
            </div>
            <ButtonSet className={styles.buttonSet}>
              <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button className={styles.button} kind="primary" type="submit">
                {t('save', 'Save')}
              </Button>
            </ButtonSet>
          </>
        ) : (
          <>
            <div className={styles.tab}>
              <Tabs
                className={classNames(styles.verticalTabs, {
                  [styles.tabletTab]: isLayoutTablet,
                  [styles.desktopTab]: !isLayoutTablet,
                })}
              >
                <TabList>
                  {messagesTemplates.map((template) => (
                    <Tab id={template.uuid} key={template.uuid}>
                      {template.name}
                    </Tab>
                  ))}
                </TabList>
                <TabPanels>
                  {messagesTemplates.map((template) => (
                    <TabPanel key={template.uuid}>
                      <MessagesTemplate template={template} />
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            </div>
            <ButtonSet>
              <Button kind="secondary" onClick={closeWorkspace}>
                {t('cancel', 'Cancel')}
              </Button>
              <Button kind="primary" type="submit">
                {t('save', 'Save')}
              </Button>
            </ButtonSet>
          </>
        )}
      </form>
    </FormProvider>
  );
};

export default MessagesForm;
