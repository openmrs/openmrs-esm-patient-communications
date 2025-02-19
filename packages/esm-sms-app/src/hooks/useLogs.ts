import useSWRInfinite from 'swr/infinite';
import { openmrsFetch, type FetchResponse } from '@openmrs/esm-framework';
import { type SMSLogsResponse } from '../types';

export function useSMSLogs(
  pageNumber: number,
  pageSize: number,
  phoneNumber: string = '',
  sortColumn: string = 'id',
  sortDirection: string = 'desc',
) {
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.rows.length) return null;

    let url = `/ws/sms/log?page=${pageNumber}&rows=${pageSize}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`;

    if (phoneNumber.trim() !== '') {
      url += `&phoneNumber=${encodeURIComponent(phoneNumber)}`;
    }

    return url;
  };

  const { data, error, setSize, isValidating, isLoading, mutate } = useSWRInfinite<
    FetchResponse<SMSLogsResponse>,
    Error
  >(getKey, openmrsFetch);

  const responseData = data ? data[0].data : null;

  return {
    smsLogs: responseData?.rows,
    smsLogsTotalCount: responseData?.totalRecords,
    isLoadingLogs: isLoading,
    isValidatingLogs: isValidating,
    mutateLogs: mutate,
    setSize,
    error,
  };
}
