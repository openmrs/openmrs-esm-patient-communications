import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardHeader, ErrorState } from '@openmrs/esm-patient-common-lib';
import { useProviderConfigurations } from '../../hooks/useProviderConfigurations';
import { useConfigurationsSorting } from '../utils';
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
  Tile,
} from '@carbon/react';
import { Add } from '@carbon/react/icons';
import styles from './providers-overview.scss';
import {
  useConfig,
  usePagination,
  useLayoutType,
  isDesktop as isDesktopLayout,
  showModal,
  ExtensionSlot,
} from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { ConfigurationsActionMenu } from './providers-action-menu.component';
import { TableExpandRow } from '@carbon/react';
import { TableExpandedRow } from '@carbon/react';
import { launchOverlay } from '../../hooks/useOverlay';
import AddProviderConfigForm from '../add-config-form/provider-config-form.component';
import { EmptyState } from '../empty-state/empty-state.component';
import { Tag } from '@carbon/react';
import classNames from 'classnames';

const ProvidersListTable = () => {
  const { t } = useTranslation();
  const config = useConfig<ConfigObject>();
  const layout = useLayoutType();
  const isDesktop = isDesktopLayout(layout);
  const isTablet = !isDesktop;
  const pageSizes = [10, 20, 30, 40, 50];
  const [pageSize, setPageSize] = useState();
  const { providerConfigurations, isLoadingConfigs, error, isValidatingConfigs } = useProviderConfigurations();

  const launchAddProviderConfigForm = useCallback(
    () => launchOverlay(t('addProvider', 'Add Provider'), <AddProviderConfigForm />),
    [t],
  );

  const headers = useMemo(
    () => [
      {
        key: 'configuration',
        header: t('configuration', 'Configuration'),
        isSortable: true,
        sortFunc: (valueA, valueB) => valueA.display?.localeCompare(valueB.display),
      },
      {
        key: 'template',
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
        template: config.templateName,
      })),
    [providerConfigurations],
  );

  const { sortedRows, sortRow } = useConfigurationsSorting(headers, tableRows);

  const { results: paginatedConfigs, paginated, goTo, currentPage } = usePagination(sortedRows, pageSize);

  if (isLoadingConfigs) return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  if (error) return <ErrorState error={error} headerTitle={t('configurations', 'Configurations')} />;

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
          sortRow={sortRow}
        >
          {({
            rows,
            headers,
            getHeaderProps,
            getTableProps,
            getRowProps,
            getExpandedRowProps,
            getExpandHeaderProps,
          }) => (
            <>
              <TableContainer className={styles.tableContainer}>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      <TableExpandHeader enableToggle {...getExpandHeaderProps()} />
                      {headers.map((header, i) => (
                        <TableHeader className={styles.tableHeader} key={i} {...getHeaderProps({ header })}>
                          {header.header}
                        </TableHeader>
                      ))}
                      <TableExpandHeader />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => {
                      return (
                        <React.Fragment key={row.id}>
                          <TableExpandRow {...getRowProps({ row })}>
                            {row.cells.map((cell, index) => {
                              return index === 0 ? (
                                <>
                                  <TableCell key={cell.id}>
                                    {cell.value}
                                    {(() => {
                                      const config = tableRows.find((r) => `${r.id}:configuration` === row.cells[0].id);

                                      if (config.isDefaultConfig) {
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
                              <ConfigurationsActionMenu
                                config={tableRows.find((r) => `${r.id}:configuration` === row.cells[0].id)}
                              />
                            </TableCell>
                          </TableExpandRow>
                          {row.isExpanded ? (
                            <TableExpandedRow
                              {...getExpandedRowProps({ row })}
                              className={styles.expandedRow}
                              colSpan={headers.length + 2}
                            >
                              <ConfigDetails
                                config={tableRows.find((r) => `${r.id}:configuration` === row.cells[0].id)}
                              />
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
          )}
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

function ConfigDetails({ config }) {
  const { t } = useTranslation();

  const editConfigWorkspaceTitle = config
    ? t(`edit${config.name}`, `Edit ${config.name}`)
    : t('editConfig', 'Edit provider configuration');

  const state = useMemo(() => ({ providerName: config.name, ...config }), [config]);

  const launchEditProviderConfigForm = useCallback(() => {
    launchOverlay(editConfigWorkspaceTitle, <ExtensionSlot name="add-provider-config-form-slot" state={state} />);
  }, [editConfigWorkspaceTitle, state]);

  const launchConfigTestForm = useCallback(
    () =>
      launchOverlay(
        `${t('test', 'Test')} ${config.name}`,
        <ExtensionSlot name="test-provider-config-form-slot" state={state} />,
      ),
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
          <p className={styles.label}>{config.template}</p>
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
        {t('Test', 'Test')}
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
