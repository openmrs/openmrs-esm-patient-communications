import { useMemo, useState } from 'react';
import type React from 'react';
import { type ConfigurationTableDataRow, type ConfigurationTableHeader } from '../../types';

export function readFileAsString(file: File) {
  return new Promise<string>((resolve) => {
    if (file) {
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          resolve('');
        }
      });

      reader.addEventListener('error', () => {
        resolve('');
      });

      reader.readAsDataURL(file);
    } else {
      resolve('');
    }
  });
}

export function useConfigurationsSorting(
  tableHeaders: Array<ConfigurationTableHeader>,
  tableRows: Array<ConfigurationTableDataRow>,
) {
  const [sortParams, setSortParams] = useState<{
    key: ConfigurationTableHeader['key'] | '';
    sortDirection: 'ASC' | 'DESC' | 'NONE';
  }>({ key: '', sortDirection: 'NONE' });
  const onHeaderClick = (
    _event: React.MouseEvent<HTMLButtonElement>,
    { sortHeaderKey, sortDirection }: { sortHeaderKey?: string; sortDirection: 'ASC' | 'DESC' | 'NONE' },
  ) => {
    const key = sortHeaderKey ?? '';
    setSortParams((prev) => {
      if (prev.key === key && prev.sortDirection === sortDirection) {
        return prev;
      }
      return { key, sortDirection };
    });
  };
  const sortedRows = useMemo(() => {
    if (sortParams.sortDirection === 'NONE') {
      return tableRows;
    }

    const { key, sortDirection } = sortParams;
    const tableHeader = tableHeaders.find((h) => h.key === key);

    return tableRows?.slice().sort((a, b) => {
      const sortingNum = tableHeader.sortFunc(a, b);
      return sortDirection === 'DESC' ? sortingNum : -sortingNum;
    });
  }, [sortParams, tableRows, tableHeaders]);

  return {
    sortedRows,
    onHeaderClick,
  };
}
