import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { CardHeader, ErrorState } from '@openmrs/esm-patient-common-lib';
import {
  InlineLoading,
  DataTable,
  DataTableSkeleton,
  Pagination,
  TableContainer,
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  Tile,
} from '@carbon/react';
import { useConfig, usePagination, useLayoutType, isDesktop as isDesktopLayout } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { useLogsRecords } from '../../hooks/useLogs';
import { EmptyState } from '../empty-state/empty-state.component';
import styles from './sms-logs-table.scss';
import { Search } from '@carbon/react';

const SmslogsTable = () => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const layout = useLayoutType();
  const isDesktop = isDesktopLayout(layout);
  const isTablet = !isDesktop;
  const headerTitle = t('smsLogs', 'SMS Logs');
  const pageSizes = [10, 20, 30, 40, 50];
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const { smsLogs, isLoadingLogs, isValidatingLogs, mutateLogs, error } = useLogsRecords();

  /**** Comments below are used for translating keys in logs table, remove with caution *****/
  // t('phoneNumber', 'Phone number')
  // t('messageContent', 'Message')
  // t('config', 'Configuration')
  // t('timestamp', 'Timestamp')
  // t('providerId', 'Provider')
  // t('errorMessage', 'Error message')
  // t('providerStatus', 'Provider status')
  // t('openMrsId', 'Openmrs ID')
  // t('deliveryStatus', 'Delivery status')
  // t('smsDirection', 'SMS direction')
  // t('modificationDate', 'Modification date')
  // t('creationDate', 'Creation date')
  // t('modifiedBy', 'Modified by')
  // t('creator', 'Creator')

  const headers = useMemo(
    () =>
      config?.smsLogsColumns?.map((column) => ({
        key: column,
        header: t(column),
        isSortable: true,
        sortFunc: (valueA, valueB) => valueA.display?.localeCompare(valueB.display),
      })),
    [config?.smsLogsColumns, t],
  );

  const filteredLogs = useMemo(() => {
    let logs = smsLogs;

    if (searchTerm) {
      logs = logs.filter((log) => log.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return logs;
  }, [searchTerm, smsLogs]);

  const tableRows = useMemo(
    () =>
      filteredLogs.map((smsLog) => ({
        ...smsLog,
        timestamp: new Date(smsLog.timestamp).toLocaleString(),
      })),
    [filteredLogs],
  );

  const { results: paginatedLogs, paginated, goTo, currentPage } = usePagination(tableRows, pageSize);

  if (isLoadingLogs) return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  if (error) return <ErrorState error={error} headerTitle={headerTitle} />;

  if (smsLogs.length > 0) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={headerTitle}>
          <span>{isValidatingLogs ? <InlineLoading /> : null}</span>
          <div className={styles.rightMostFlexContainer}>
            <div>
              <Search
                size={isTablet ? 'lg' : 'sm'}
                placeholder="Search for a phone number"
                labelText="Search"
                closeButtonLabelText="Clear search input"
                id="phone-search"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <DataTable
          aria-label="provider-configutations overview"
          rows={paginatedLogs}
          headers={headers}
          isSortable
          size={isTablet ? 'lg' : 'sm'}
          useZebraStyles
          overflowMenuOnHover={isDesktop}
        >
          {({ rows, headers, getHeaderProps, getTableProps }) => (
            <>
              <TableContainer>
                <Table {...getTableProps()}>
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
                      <TableRow key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {rows.length === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noSmsLogsToDisplay', 'No SMS Logs to display')}</p>
                    </div>
                  </Tile>
                </div>
              ) : null}
            </>
          )}
        </DataTable>
        {paginated && (
          <Pagination
            forwardText="Next page"
            backwardText="Previous page"
            page={currentPage}
            pageSize={pageSize}
            pageSizes={pageSizes}
            totalItems={tableRows?.length}
            className={styles.pagination}
            size={isDesktop ? 'sm' : 'lg'}
            onChange={({ pageSize: newPageSize, page: newPage }) => {
              if (newPageSize !== pageSize) {
                setPageSize(newPageSize);
              }
              if (newPage !== currentPage) {
                goTo(newPage);
              }
            }}
          />
        )}
      </div>
    );
  }

  return <EmptyState displayText={headerTitle} headerTitle={headerTitle} />;
};

export default SmslogsTable;
