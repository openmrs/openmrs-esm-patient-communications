import React, { useEffect, useMemo, useState } from 'react';
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
} from '@carbon/react';
import { useConfig, useLayoutType, isDesktop as isDesktopLayout } from '@openmrs/esm-framework';
import { type ConfigObject } from '../config-schema';
import { useSmsLogs } from '../hooks/useLogs';
import { EmptyState } from '../providers/empty-state/empty-state.component';
import styles from './sms-logs-table.scss';
import { Search } from '@carbon/react';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZES } from './pagination-constant';
import { debounce } from 'lodash-es';

const SmsLogsTable = () => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const layout = useLayoutType();
  const isDesktop = isDesktopLayout(layout);
  const isTablet = !isDesktop;
  const headerTitle = t('smsLogs', 'SMS Logs');
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE_NUMBER);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [rawSearchTerm, setRawSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { smsLogs, smsLogsTotalCount, isLoadingLogs, isValidatingLogs, error } = useSmsLogs(
    currentPage,
    pageSize,
    searchTerm,
  );

  const debouncedSetSearchTerm = useMemo(
    () =>
      debounce((value: string) => {
        setSearchTerm(value);
      }, 1000),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRawSearchTerm(value);
    debouncedSetSearchTerm(value);
  };

  useEffect(() => {
    setCurrentPage(DEFAULT_PAGE_NUMBER);
  }, [searchTerm]);

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

  if (isLoadingLogs) return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  if (error) return <ErrorState error={error} headerTitle={headerTitle} />;

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={headerTitle}>
        <span>{isValidatingLogs ? <InlineLoading /> : null}</span>
        <div className={styles.rightMostFlexContainer}>
          <div>
            <Search
              id="phone-search"
              size={isTablet ? 'lg' : 'sm'}
              placeholder={t('searchByPhoneNumber', 'Search by phone number')}
              labelText={t('search', 'Search')}
              closeButtonLabelText={t('clearSearchInput', 'Clear search input')}
              onChange={handleSearchChange}
              value={rawSearchTerm}
            />
          </div>
        </div>
      </CardHeader>

      {smsLogs.length > 0 ? (
        <>
          <DataTable
            aria-label="provider-configutations overview"
            rows={smsLogs}
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
              </>
            )}
          </DataTable>
          <Pagination
            forwardText={t('nextPage', 'Next page')}
            backwardText={t('previousPage', 'Previous page')}
            page={currentPage}
            pageSize={pageSize}
            pageSizes={DEFAULT_PAGE_SIZES}
            totalItems={smsLogsTotalCount}
            className={styles.pagination}
            size={isDesktop ? 'sm' : 'lg'}
            onChange={({ pageSize: newPageSize, page: newPage }) => {
              if (newPageSize !== pageSize) {
                setPageSize(newPageSize);
              }
              if (newPage !== currentPage) {
                setCurrentPage(newPage);
              }
            }}
          />
        </>
      ) : (
        <EmptyState displayText={headerTitle} headerTitle={headerTitle} />
      )}
    </div>
  );
};

export default SmsLogsTable;
