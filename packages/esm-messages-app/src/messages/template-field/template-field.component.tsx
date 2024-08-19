import React, { useCallback, useMemo } from 'react';
import { NumberInput, RadioButton, RadioButtonGroup, MultiSelect } from '@carbon/react';
import { Controller, useFormContext } from 'react-hook-form';
import { type TemplateField } from '../../types';
import { weekDays } from '../../constants';
import { useTranslation } from 'react-i18next';
import { Select } from '@carbon/react';
import { SelectItem } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import { Row } from '@carbon/react';
import { Column } from '@carbon/react';
import styles from './template-field.scss';

const TemplateField = ({ field, templateUuid }: { field: TemplateField; templateUuid: string }) => {
  const { t } = useTranslation();
  const config = useConfig;
  const { control, getValues } = useFormContext();
  const { name, mandatory, defaultValue, possibleValues, type } = field;

  const renderField = useCallback(
    (fieldProps) => {
      const defaultSelectedDays = () => {
        const dayLabels = getValues(`dynamicFields.${templateUuid}.fields.${type}`)?.split(',');
        return weekDays.filter((day) => dayLabels && dayLabels.includes(day.label));
      };

      const endOfMessages = [
        { key: 'after-7-times', value: 'AFTER_TIMES|7', label: t('afterSevenTimes', 'After 7 times') },
      ];

      switch (type) {
        case 'END_OF_MESSAGES':
          return (
            <Select {...fieldProps} labelText={t('selectTemplate', 'Choose when to end message')}>
              <SelectItem value={'NO_DATE|EMPTY'} text={t('noRepeat', 'Not specified')} />
              {endOfMessages.map((prop) => (
                <SelectItem key={prop.key} value={prop.value} text={prop.label} />
              ))}
            </Select>
          );
        case 'number':
          return <NumberInput {...fieldProps} id={name} labelText={name} />;
        case 'DAY_OF_WEEK':
          return (
            <MultiSelect
              label={t('selectDayOfWeek', 'Select days of message delivery')}
              id="daysOfWeek"
              titleText={name}
              items={weekDays}
              itemToString={(item) => (item ? t(item.labelCode, item.label) : '')}
              selectionFeedback="top-after-reopen"
              sortItems={(items) => {
                return items.sort((a, b) => a.order > b.order);
              }}
              initialSelectedItems={defaultSelectedDays()}
              onChange={({ selectedItems }) => {
                const days = selectedItems.map((d) => d.label).join(',');
                fieldProps.onChange(days);
              }}
            />
          );
        case 'SERVICE_TYPE':
          return (
            <RadioButtonGroup
              legendText={name}
              defaultSelected={getValues(`dynamicFields.${templateUuid}.fields.${type}`)}
              onChange={(selectedValue) => fieldProps.onChange(selectedValue)}
              {...fieldProps}
            >
              {possibleValues.map((value) => (
                <RadioButton key={value} labelText={value} value={value} />
              ))}
            </RadioButtonGroup>
          );

        default:
          <div>{t('noFieldsSet', 'No fields set yet')}</div>;
      }
    },
    [getValues, name, possibleValues, t, templateUuid, type],
  );

  return (
    <div>
      <Row className={styles.row}>
        <Column>
          <Controller
            name={`dynamicFields.${templateUuid}.fields.${type}`}
            control={control}
            defaultValue={defaultValue}
            render={({ field }) => renderField(field)}
          />
        </Column>
      </Row>
    </div>
  );
};

export default TemplateField;
