import classnames from 'classnames';
import {
  Stack,
  Column,
  Form,
  TextInput,
  Row,
  ButtonSet,
  Button,
  AccordionItem,
  TextArea,
  SelectSkeleton,
  Select,
  SelectItem,
  NumberInput,
  Checkbox,
  InlineLoading,
  Accordion,
} from '@carbon/react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ResponsiveWrapper, showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import { useProviderConfigTemplates } from '../../hooks/useProviderConfigTemplates';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { type Prop, type ProviderConfiguration } from '../../types';
import { saveConfig } from '../../api/providers.resource';
import { useProviderConfigurations } from '../../hooks/useProviderConfigurations';
import { closeOverlay } from '../../hooks/useOverlay';
import styles from './provider-config-form.scss';

interface AddProviderConfigProps {
  providerName?: string;
  templateName?: string;
  maxRetries?: number;
  splitHeader?: string;
  splitFooter?: string;
  excludeLastFooter?: boolean;
  autoScript?: string;
  props?: Array<Prop>;
}

const addProviderConfigFormSchema = z.object({
  providerName: z.string(),
  templateName: z.string(),
  maxRetries: z.number(),
  splitHeader: z.string(),
  splitFooter: z.string(),
  excludeLastFooter: z.boolean(),
  autoScript: z.string().optional(),
  dynamicFields: z.record(z.string(), z.string()),
});

type AddProviderConfigFormData = z.infer<typeof addProviderConfigFormSchema>;

const AddProviderConfigForm: React.FC<AddProviderConfigProps> = ({
  providerName,
  templateName,
  excludeLastFooter,
  splitFooter,
  splitHeader,
  maxRetries,
  autoScript,
  props,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { mutateConfigs, providerConfigurations } = useProviderConfigurations();
  const { templates, isLoadingTemplates, error } = useProviderConfigTemplates();

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isSubmitting, isDirty },
  } = useForm<AddProviderConfigFormData>({
    mode: 'all',
    resolver: zodResolver(addProviderConfigFormSchema),
    defaultValues: {
      providerName: providerName ? providerName : undefined,
      templateName: templateName ? templateName : undefined,
      maxRetries: maxRetries ? maxRetries : 0,
      splitHeader: splitHeader ? splitHeader : undefined,
      splitFooter: splitFooter ? splitFooter : undefined,
      excludeLastFooter: excludeLastFooter ? excludeLastFooter : false,
      autoScript: autoScript ? autoScript : undefined,
    },
  });

  const onSubmit = async (data: AddProviderConfigFormData) => {
    if (!isDirty) {
      return closeOverlay();
    }
    const props = Object.entries(data.dynamicFields).map(([key, value]) => ({ name: key, value: value }));
    const { providerName, dynamicFields, ...rest } = data;
    const payload = {
      ...rest,
      props,
      name: providerName,
    };

    await saveConfig([...providerConfigurations, payload as ProviderConfiguration])
      .then(() => {
        showSnackbar({
          title: t('configSaved', 'Configuration saved'),
          kind: 'success',
        });
        mutateConfigs();
        closeOverlay();
      })
      .catch(() =>
        showSnackbar({
          title: t('configNotSaved', 'Configuration not saved'),
          kind: 'error',
        }),
      );
  };

  const selectedTemplate = templates[watch('templateName')] ?? null;

  useEffect(() => {
    if (props) {
      props.forEach(({ name, value }) => {
        setValue(`dynamicFields.${name}`, value);
      });
    }
  }, [props, setValue]);

  return (
    <Form data-testid="add-provider-form" className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={2} className={styles.formContainer}>
        <Row className={styles.row}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('providerName', ' Provider Name')}</span>
          </Column>
          <Column sm={3}>
            <ResponsiveWrapper>
              <Controller
                name="providerName"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextInput
                    {...field}
                    data-testid="provider-name"
                    invalid={!!error?.message}
                    invalidText={error?.message}
                    labelText={t('nameOfProvider', 'Name of the provider')}
                    placeholder={t('namePlaceHolder', 'Enter provider name e.g Twilio')}
                  />
                )}
              />
            </ResponsiveWrapper>
          </Column>
        </Row>
        <Row className={styles.row}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('template', 'Template')}</span>
          </Column>
          <Column sm={3}>
            <ResponsiveWrapper>
              {isLoadingTemplates ? (
                <SelectSkeleton />
              ) : (
                <Controller
                  name="templateName"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <Select
                      {...field}
                      data-testid="select-template"
                      labelText={t('selectTemplate', 'Select a template')}
                      invalid={!!error?.message}
                      invalidText={error?.message}
                    >
                      <SelectItem value={''} text={t('chooseTemplate', 'Choose a template')} />
                      {Object.keys(templates).map((value) => (
                        <SelectItem value={value} text={value} />
                      ))}
                    </Select>
                  )}
                />
              )}
            </ResponsiveWrapper>
          </Column>
        </Row>
        <Row className={styles.row}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('maximumRetries', 'Maximum retries')}</span>
          </Column>
          <Column sm={3}>
            <ResponsiveWrapper>
              <Controller
                name="maxRetries"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <NumberInput
                    {...field}
                    data-testid="numberOfRetries"
                    invalid={!!error?.message}
                    invalidText={error?.message}
                    onChange={(_, { value }) => field.onChange(Number(value))}
                    labelText={t('numberOfRetries', 'Number of retries')}
                  />
                )}
              />
            </ResponsiveWrapper>
          </Column>
        </Row>
        <Row className={styles.row}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('headerSplitMessage', 'Header split message')}</span>
          </Column>
          <Column sm={3}>
            <ResponsiveWrapper>
              <Controller
                name="splitHeader"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextInput
                    data-testid="split-header"
                    invalid={!!error?.message}
                    invalidText={error?.message}
                    {...field}
                    labelText={t('headerSplitText', 'Header split text')}
                  />
                )}
              />
            </ResponsiveWrapper>
          </Column>
        </Row>
        <Row className={styles.row}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('footerSplitMessage', 'Footer split message')}</span>
          </Column>
          <Column sm={3}>
            <ResponsiveWrapper>
              <Controller
                name="splitFooter"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextInput
                    {...field}
                    data-testid="split-footer"
                    invalid={!!error?.message}
                    invalidText={error?.message}
                    labelText={t('footerSplitText', 'Footers split text')}
                  />
                )}
              />
            </ResponsiveWrapper>
          </Column>
        </Row>
        <Row className={styles.row}>
          <Column sm={3}>
            <ResponsiveWrapper>
              <Controller
                name="excludeLastFooter"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    data-testid="exclude-last-footer"
                    id={field.name}
                    name={field.name}
                    checked={field.value}
                    onChange={(_, { checked }) => setValue('excludeLastFooter', checked)}
                    onBlur={field.onBlur}
                    className={styles.checkBox}
                    labelText={t('excludeLastFooter', 'Exclude footer from last split message')}
                  />
                )}
              />
            </ResponsiveWrapper>
          </Column>
        </Row>
        <Row className={styles.row}>
          <Accordion>
            <AccordionItem title={t('advanced', 'Advanced')}>
              <Column sm={1}>
                <span className={styles.columnLabel}>
                  {t('automaticResponseScript', 'Automatic response script (Optional)')}
                </span>
              </Column>
              <Column sm={3}>
                <ResponsiveWrapper>
                  <Controller
                    name="autoScript"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextArea
                        {...field}
                        data-testid="auto-script"
                        invalid={!!error?.message}
                        invalidText={error?.message}
                        labelText={t('writeYourScript', 'Write your script')}
                        placeholder={t('enterAutomaticScript', 'Enter your script')}
                      />
                    )}
                  />
                </ResponsiveWrapper>
              </Column>
            </AccordionItem>
          </Accordion>
        </Row>
        {(() => {
          if (selectedTemplate) {
            return selectedTemplate.configurables.map((dataField, index) => (
              <Row className={styles.dynamicRow} key={index}>
                <ResponsiveWrapper>
                  <Controller
                    name={`dynamicFields.${dataField}`}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextInput
                        {...field}
                        invalid={!!error?.message}
                        invalidText={error?.message}
                        labelText={dataField}
                        data-testid={dataField}
                      />
                    )}
                  />
                </ResponsiveWrapper>
              </Row>
            ));
          }
        })()}
      </Stack>
      <ButtonSet className={classnames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
        <Button className={styles.button} kind="secondary" onClick={closeOverlay}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? (
            <InlineLoading description={t('sending', 'Sending') + '...'} />
          ) : (
            <span>{t('saveAndClose', 'Save and close')}</span>
          )}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default AddProviderConfigForm;
