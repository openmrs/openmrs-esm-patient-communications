import { openmrsFetch, type FetchResponse } from '@openmrs/esm-framework';
import type { SMSLogsResponse } from '../types';
import useSWR from 'swr';

export function useSmsLogs(
  pageNumber: number,
  pageSize: number,
  phoneNumber: string = '',
  sortColumn: 'id' | 'timestamp' | 'deliveryStatus' = 'id',
  sortDirection: 'asc' | 'desc' = 'desc',
) {
  const urlParams = new URLSearchParams({
    page: String(pageNumber),
    rows: String(pageSize),
    sortColumn: sortColumn,
    sortDirection: sortDirection,
  });

  let url = `/ws/sms/log?${urlParams.toString()}`;

  if (phoneNumber.trim() !== '') {
    url += `&phoneNumber=${encodeURIComponent(phoneNumber)}`;
  }

  const { data, error, isValidating, isLoading, mutate } = useSWR<FetchResponse<SMSLogsResponse>, Error>(
    url,
    openmrsFetch,
  );

  const responseData = data ? data.data : null;

  return {
    smsLogs: responseData?.rows,
    smsLogsTotalCount: responseData?.totalRecords,
    isLoadingLogs: isLoading,
    isValidatingLogs: isValidating,
    mutateLogs: mutate,
    error,
  };
}
