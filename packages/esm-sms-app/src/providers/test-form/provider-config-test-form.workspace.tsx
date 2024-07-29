import classnames from 'classnames';
import React, { useCallback } from 'react';
import {
  RadioButton,
  Stack,
  Row,
  RadioButtonGroup,
  Column,
  Form,
  TextInput,
  ButtonSet,
  Button,
  AccordionItem,
  InlineLoading,
  Accordion,
  TextArea,
} from '@carbon/react';
import { ResponsiveWrapper, useLayoutType, showSnackbar } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import styles from './provider-config-test-form.scss';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendTestMessage } from '../../api/providers.resource';
import { closeOverlay } from '../../hooks/useOverlay';
import { useLogsRecords } from '../../hooks/useLogs';

const configTestFormSchema = z.object({
  deliveryTime: z.number(),
  recipients: z
    .string()
    .refine((val) => !val.includes('+'), {
      message: 'Phone numbers should not contain the "+" sign.',
    })
    .refine((val) => val.split(',').every((num) => num.trim().length >= 10), {
      message: 'Each phone number must have at least 10 digits.',
    })
    .refine((val) => val.split(',').every((num) => num.trim().length <= 15), {
      message: 'Each phone number must have no more than 15 digits.',
    })
    .refine((val) => val.split(',').every((num) => /^[0-9\s\-()]+$/.test(num.trim())), {
      message: 'Phone numbers can only contain digits, spaces, hyphens, and parentheses.',
    }),
  message: z.string(),
  customParams: z.string().optional(),
});

type ConfigTestFormData = z.infer<typeof configTestFormSchema>;

interface ConfigTestFormProps {
  providerName: string;
}
const ConfigTestForm: React.FC<ConfigTestFormProps> = ({ providerName }) => {
  const { t } = useTranslation();
  const { mutateLogs } = useLogsRecords();
  const isTablet = useLayoutType() === 'tablet';

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<ConfigTestFormData>({
    mode: 'all',
    resolver: zodResolver(configTestFormSchema),
  });
  const deliveryTimes = [
    { key: 'immediately', labelText: 'Immediately', value: 0 },
    { key: 'after10secs', labelText: '10s', value: 10000 },
    { key: 'after1min', labelText: '1m', value: 60000 },
    { key: 'afterOneHour', labelText: '30s', value: 3600000 },
  ];

  const getFutureTime = (delay: number) => {
    const currentTime = new Date();
    const futureTime = new Date(currentTime.getTime() + delay);
    return futureTime.toISOString();
  };

  const onSubmit = useCallback(
    async (data: ConfigTestFormData) => {
      const { deliveryTime, recipients, message, customParams } = data;
      const futureTime = getFutureTime(deliveryTime);
      const recipientsArray = recipients.split(',').map((num) => num.trim());
      const payload = {
        config: providerName,
        deliveryTime: futureTime,
        recipients: recipientsArray,
        message,
        customParams,
      };
      await sendTestMessage(payload)
        .then(() => {
          mutateLogs();
          showSnackbar({
            title: t('testMessageSent', 'Message sent'),
            kind: 'success',
            autoClose: true,
          });
        })
        .catch((errror) =>
          showSnackbar({
            title: t('errorSendingMessage', 'Message not sent'),
            subtitle: errror?.message,
            kind: 'error',
          }),
        );
    },
    [providerName, mutateLogs, t],
  );

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={2} className={styles.formContainer}>
        <Row className={styles.row}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('deliveryTime', 'Delivery Time')}</span>
          </Column>
          <Column sm={3}>
            <Controller
              name="deliveryTime"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <RadioButtonGroup
                  {...field}
                  invalid={!!error?.message}
                  invalidText={error?.message}
                  className={styles.radioButtonGroup}
                  orientation="vertical"
                  data-testid="delivery-time"
                >
                  {deliveryTimes.map((deliveryTime) => (
                    <RadioButton
                      key={deliveryTime.key}
                      labelText={deliveryTime.labelText}
                      value={deliveryTime.value}
                      id={deliveryTime.key}
                    />
                  ))}
                </RadioButtonGroup>
              )}
            />
          </Column>
        </Row>
        <Row className={styles.row}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('recipients', 'Recipient(s)')}</span>
          </Column>
          <Column sm={3}>
            <ResponsiveWrapper>
              <Controller
                name="recipients"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextInput
                    {...field}
                    invalid={!!error?.message}
                    invalidText={error?.message}
                    labelText={t('multipleRecipientsNotice', 'Separate multiple numbers with comma')}
                    placeholder={t('placeHolder', 'Enter phone +123455690, +09348...')}
                    data-testid="recipients"
                  />
                )}
              />
            </ResponsiveWrapper>
          </Column>
        </Row>
        <Row className={styles.row}>
          <Column sm={1}>
            <span className={styles.columnLabel}>{t('message', 'Message')}</span>
          </Column>
          <Column sm={3}>
            <ResponsiveWrapper>
              <Controller
                name="message"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextArea
                    {...field}
                    invalid={!!error?.message}
                    invalidText={error?.message}
                    labelText={t('writeTestMessage', 'Write your test message')}
                    placeholder={t('writeTestMessage', 'Write your test message')}
                    data-testid="test-message"
                  />
                )}
              />
            </ResponsiveWrapper>
          </Column>
        </Row>
        <Row className={styles.row}>
          <ResponsiveWrapper>
            <Accordion>
              <AccordionItem title={t('advanced', 'Advanced')}>
                <Column sm={1}>
                  <span className={styles.columnLabel}>{t('customParameters', 'Custom params (optional)')}</span>
                </Column>
                <Column sm={3}>
                  <ResponsiveWrapper>
                    <Controller
                      name="customParams"
                      control={control}
                      render={({ field }) => (
                        <TextArea
                          {...field}
                          labelText={t('mapCustomParams', 'Map custom params in key:value format')}
                          placeholder={t('enterCustomParams', 'Enter custom parameters. Use new line as separator')}
                          data-testid="custom-params"
                        />
                      )}
                    />
                  </ResponsiveWrapper>
                </Column>
              </AccordionItem>
            </Accordion>
          </ResponsiveWrapper>
        </Row>
      </Stack>
      <ButtonSet className={classnames({ [styles.tablet]: isTablet, [styles.desktop]: !isTablet })}>
        <Button className={styles.button} kind="secondary" onClick={closeOverlay}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <InlineLoading description={t('sending', 'Sending') + '...'} />
          ) : (
            <span>{t('sendAndClose', 'Send and close')}</span>
          )}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default ConfigTestForm;
