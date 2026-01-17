import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  Button,
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
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
  Tag,
  Tile,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import {
  usePagination,
  useLayoutType,
  isDesktop as isDesktopLayout,
  showModal,
  launchWorkspace,
  CardHeader,
  ErrorState,
} from '@openmrs/esm-framework';
import { ConfigurationsActionMenu } from './providers-action-menu.component';
import { EmptyState } from '../empty-state/empty-state.component';
import { useConfigurationsSorting } from '../utils';
import { useProviderConfigurations } from '../../hooks/useProviderConfigurations';
import { type ConfigurationTableDataRow } from '../../types';
import styles from './providers-overview.scss';

const ProvidersListTable = () => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isDesktop = isDesktopLayout(layout);
  const isTablet = !isDesktop;
  const pageSizes = [10, 20, 30, 40, 50];
  const [pageSize, setPageSize] = useState<number>(pageSizes[0]);
  const { providerConfigurations, isLoadingConfigs, error, isValidatingConfigs } = useProviderConfigurations();

  const launchAddProviderConfigForm = useCallback(() => launchWorkspace('add-provider-config-form'), []);

  const headers = useMemo(
    () => [
      {
        key: 'configuration',
        header: t('configuration', 'Configuration'),
        isSortable: true,
        sortFunc: (valueA, valueB) => valueA.display?.localeCompare(valueB.display),
      },
      {
        key: 'templateName',
        header: t('template', 'Template'),
        isSortable: true,
        sortFunc: (valueA, valueB) => valueA.display?.localeCompare(valueB.display),
      },
    ],
    [t],
  );

  const tableRows = useMemo(
    () =>
      providerConfigurations.map((config, index) => ({
        ...config,
        id: `config-${index}`,
        configuration: config.name,
      })),
    [providerConfigurations],
  );

  const { sortedRows, onHeaderClick } = useConfigurationsSorting(headers, tableRows);

  const { results: paginatedConfigs, paginated, goTo, currentPage } = usePagination(sortedRows, pageSize);

  if (isLoadingConfigs) {
    return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={t('configurations', 'Configurations')} />;
  }

  if (providerConfigurations.length > 0) {
    return (
      <div className={styles.widgetCard}>
        <CardHeader title={t('configurations', 'Configurations')}>
          <span>{isValidatingConfigs ? <InlineLoading /> : null}</span>
          <div className={styles.rightMostFlexContainer}>
            <div className={styles.divider}>|</div>
            <Button
              kind="ghost"
              renderIcon={(props) => <Add size={16} {...props} />}
              iconDescription="Add configurations"
              onClick={launchAddProviderConfigForm}
            >
              {t('add', 'Add')}
            </Button>
          </div>
        </CardHeader>
        <DataTable
          aria-label="provider-configutations overview"
          rows={paginatedConfigs}
          headers={headers}
          isSortable
          size={isTablet ? 'lg' : 'sm'}
          useZebraStyles
          overflowMenuOnHover={isDesktop}
        >
          {({
            rows,
            headers,
            getHeaderProps,
            getTableProps,
            getRowProps,
            getExpandedRowProps,
            getExpandHeaderProps,
          }) => {
            const expandedRowIds = rows.map((row) => getExpandedRowProps({ row }).id).join(' ');
            const expandHeaderProps = getExpandHeaderProps();

            return (
              <>
                <TableContainer className={styles.tableContainer}>
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {(() => {
                          const { onExpand, ...restExpandHeaderProps } = expandHeaderProps;
                          return (
                            <TableExpandHeader
                              enableToggle
                              aria-controls={expandedRowIds}
                              {...restExpandHeaderProps}
                              onExpand={onExpand as unknown as React.MouseEventHandler<HTMLButtonElement>}
                            />
                          );
                        })()}
                        {headers.map((header, i) => {
                          const headerProps = getHeaderProps({ header, onClick: onHeaderClick });
                          const { onClick, ...restHeaderProps } = headerProps;
                          return (
                            <TableHeader
                              className={styles.tableHeader}
                              key={i}
                              {...restHeaderProps}
                              onClick={onClick as unknown as React.MouseEventHandler<HTMLButtonElement>}
                            >
                              {header.header}
                            </TableHeader>
                          );
                        })}
                        <TableHeader aria-label={t('actions', 'Actions')} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => {
                        const expandedRowProps = getExpandedRowProps({ row });
                        const rowConfig = tableRows.find((config) => `${config.id}:configuration` === row.cells[0].id);
                        const rowProps = getRowProps({ row });

                        return (
                          <React.Fragment key={row.id}>
                            {(() => {
                              const { onExpand, ...restRowProps } = rowProps;
                              return (
                                <TableExpandRow
                                  {...restRowProps}
                                  isExpanded={rowProps.isExpanded ?? false}
                                  aria-controls={expandedRowProps.id}
                                  onExpand={onExpand as unknown as React.MouseEventHandler<HTMLButtonElement>}
                                >
                                  {row.cells.map((cell, index) => {
                                    return index === 0 ? (
                                      <>
                                        <TableCell key={cell.id}>
                                          {cell.value}
                                          {(() => {
                                            if (rowConfig?.isDefaultConfig) {
                                              return (
                                                <Tag type="green" className={classNames(styles.tag, 'cds--label')}>
                                                  {t('default', 'Default')}
                                                </Tag>
                                              );
                                            }
                                          })()}
                                        </TableCell>
                                      </>
                                    ) : (
                                      <>
                                        <TableCell key={cell.id}>{cell.value}</TableCell>
                                      </>
                                    );
                                  })}
                                  <TableCell className="cds--table-column-menu">
                                    {rowConfig ? <ConfigurationsActionMenu config={rowConfig} /> : null}
                                  </TableCell>
                                </TableExpandRow>
                              );
                            })()}
                            {row.isExpanded ? (
                              <TableExpandedRow
                                {...expandedRowProps}
                                className={styles.expandedRow}
                                colSpan={headers.length + 2}
                              >
                                {rowConfig ? <ConfigDetails config={rowConfig} /> : null}
                              </TableExpandedRow>
                            ) : (
                              <TableExpandedRow className={styles.hiddenRow} colSpan={headers.length + 2} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

              {rows.length === 0 ? (
                <div className={styles.tileContainer}>
                  <Tile className={styles.tile}>
                    <div className={styles.tileContent}>
                      <p className={styles.content}>{t('noConfigurationsToDisplay', 'No configurations to display')}</p>
                    </div>
                  </Tile>
                </div>
              ) : null}
              </>
            );
          }}
        </DataTable>
        {paginated && (
          <Pagination
            forwardText="Next page"
            backwardText="Previous page"
            page={currentPage}
            pageSize={pageSize}
            pageSizes={pageSizes}
            totalItems={paginatedConfigs?.length}
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

  return (
    <EmptyState
      displayText={t('configurations', 'Configurations')}
      headerTitle={t('configurations', 'Configurations')}
      launchForm={launchAddProviderConfigForm}
    />
  );
};

export default ProvidersListTable;

function ConfigDetails({ config }: { config: ConfigurationTableDataRow }) {
  const { t } = useTranslation();
  const state = useMemo(() => ({ providerName: config.name, ...config }), [config]);

  const launchEditProviderConfigForm = useCallback(() => {
    launchWorkspace('add-provider-config-form', {
      workspaceTitle: t('editConfig', 'Edit {{ configName }}', {
        configName: config.name,
      }),
      ...state,
    });
  }, [config.name, state, t]);

  const launchConfigTestForm = useCallback(
    () =>
      launchWorkspace('provider-config-test-form', {
        workspaceTitle: t('testConfig', 'Test {{ configName }}', {
          configName: config.name,
        }),
        ...state,
      }),
    [config.name, state, t],
  );

  const removeConfigPrompt = useCallback(() => {
    const close = showModal('remove-config-prompt-modal', {
      configName: config.name,
      closeDeleteModal: () => {
        close();
      },
    });
  }, [config]);

  return (
    <div>
      <div className={styles.configInfo}>
        <p className={styles.gridTitle}>{t('configDetails', 'Configuration details')} </p>
        <div className={styles.labelContainer}>
          <p className={styles.labelBold}>{t('providerName', 'Provider name')}: </p>
          <p className={styles.label}>{config.name}</p>
        </div>
        <div className={styles.labelContainer}>
          <p className={styles.labelBold}>{t('templateName', 'Template name')}: </p>
          <p className={styles.label}>{config.templateName}</p>
        </div>
        <div className={styles.labelContainer}>
          <p className={styles.labelBold}>{t('maxRetries', 'Maximum retries')}: </p>
          <p className={styles.label}>{config.maxRetries}</p>
        </div>
        <div className={styles.labelContainer}>
          <p className={styles.labelBold}>{t('splitHeader', 'Header split text')}: </p>
          <p className={styles.label}>{config.splitHeader}</p>
        </div>
        <div className={styles.labelContainer}>
          <p className={styles.labelBold}>{t('splitFooter', 'Footer split text')}: </p>
          <p className={styles.label}>{config.splitFooter}</p>
        </div>
      </div>
      <Button kind="primary" onClick={launchConfigTestForm}>
        {t('test', 'Test')}
      </Button>
      <Button kind="secondary" onClick={launchEditProviderConfigForm}>
        {t('edit', 'Edit')}
      </Button>
      <Button kind="danger" onClick={removeConfigPrompt}>
        {t('remove', 'Remove')}
      </Button>
    </div>
  );
}
