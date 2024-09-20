import useSWRInfinite from 'swr/infinite';
import { openmrsFetch, useConfig, type FetchResponse } from '@openmrs/esm-framework';
import { type SMSLog, type SMSLogsResponse } from '../types';
import { type ConfigObject } from '../config-schema';

export function useLogsRecords() {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.rows.length) return null;

    return `/ws/sms/log?page=${pageIndex + 1}`;
  };

  const { data, error, size, setSize, isValidating, isLoading, mutate } = useSWRInfinite<
    FetchResponse<SMSLogsResponse>,
    Error
  >(getKey, openmrsFetch);

  const smsLogs: SMSLog[] = data ? [].concat(...data.map((page) => page.data.rows)) : [];

  return {
    smsLogs,
    isLoadingLogs: isLoading,
    isValidatingLogs: isValidating,
    mutateLogs: mutate,
    setSize,
    error,
  };
}
