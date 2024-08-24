import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Layer,
  OverflowMenu,
  OverflowMenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useMessagesTemplates } from '../hooks/useMessagesTemplates';
import styles from './messages-chart-dashboard.scss';
import { type MessagesTemplate } from '../types';

function MessagesChartDashboard() {
  const { t } = useTranslation();
  const displayText = t('messages', 'Messages');
  const headerTitle = t('messages', 'Messages');
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';

  const { messagesTemplates, isLoadingTemplates, error, isValidatingTemplates, mutateTemplates } =
    useMessagesTemplates();

  const headers = useMemo(
    () => [
      {
        key: 'name',
        header: t('messageType', 'Message Type'),
        isSortable: true,
        sortFunc: (valueA, valueB) => valueA.display?.localeCompare(valueB.display),
      },
      {
        key: 'status',
        header: t('status', 'Status'),
        isSortable: true,
        sortFunc: (valueA, valueB) => valueA.display?.localeCompare(valueB.display),
      },
    ],
    [t],
  );

  const getStatus = useCallback(
    (template: MessagesTemplate) => {
      const defaultValue = template.templateFields.find((field) => field.type === 'SERVICE_TYPE')?.defaultValue ?? null;

      if (defaultValue) {
        return defaultValue === 'Deactivate service'
          ? t('deactivated', 'DEACTIVATED')
          : `${defaultValue}, Started: ${new Date(template.createdAt).toISOString().split('T')[0]}, Ends: ${template.templateFields.find((field) => field.type === 'END_OF_MESSAGES')?.defaultValue === 'AFTER_TIMES|7' ? t('after', 'After 7 times') : ''}`;
      } else {
        return '';
      }
    },
    [t],
  );

  const tableRows = useMemo(() => {
    if (!messagesTemplates.length) return [];
    return messagesTemplates?.map((template) => {
      return {
        ...template,
        id: template.uuid,
        status: getStatus(template),
      };
    });
  }, [getStatus, messagesTemplates]);

  const launchEditMessagesForm = useCallback(
    (uuid) => {
      const template = messagesTemplates.find((template) => template.uuid === uuid);
      return launchPatientWorkspace('messages-form-workspace', {
        workspaceTitle: `Edit ${template.name}`,
        mutateTemplates: mutateTemplates,
        template: template,
        patientWorkspaceSize: true,
      });
    },
    [messagesTemplates, mutateTemplates],
  );

  if (isLoadingTemplates) return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  if (error) return <ErrorState error={error} headerTitle={headerTitle} />;
  if (messagesTemplates?.length) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidatingTemplates ? <InlineLoading /> : null}</span>
          <div className={styles.rightMostFlexContainer}>
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              iconDescription="Add messages"
              onClick={() => {}}
            >
              {t('add', 'Add')}
            </Button>
          </div>
        </CardHeader>
        <DataTable
          rows={tableRows}
          headers={headers}
          isSortable
          size={isTablet ? 'lg' : 'sm'}
          useZebraStyles
          overflowMenuOnHover={isDesktop}
        >
          {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
            <>
              <TableContainer>
                <Table aria-label="messages summary" {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader
                          className={classNames(styles.productiveHeading01, styles.text02)}
                          {...getHeaderProps({
                            header,
                            isSortable: header.isSortable,
                          })}
                        >
                          {header.header?.content ?? header.header}
                        </TableHeader>
                      ))}
                      <TableHeader />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id} {...getRowProps({ row })}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                        ))}
                        <TableCell className="cds--table-column-menu">
                          <Layer className={styles.layer}>
                            <OverflowMenu
                              aria-label="Edit message type"
                              size={isTablet ? 'lg' : 'sm'}
                              flipped
                              align="left"
                            >
                              <OverflowMenuItem
                                className={styles.menuItem}
                                id="editMessageType"
                                onClick={() => launchEditMessagesForm(row.id)}
                                itemText={t('edit', 'Edit')}
                              />
                            </OverflowMenu>
                          </Layer>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {rows.length === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noConditionsToDisplay', 'No messages to display')}</p>
                      <p className={styles.helper}>{t('checkFilters', 'Check the filters above')}</p>
                    </div>
                  </Tile>
                </div>
              ) : null}
            </>
          )}
        </DataTable>
      </div>
    );
  }
  return <EmptyState displayText={displayText} headerTitle={headerTitle} />;
}

export default MessagesChartDashboard;
