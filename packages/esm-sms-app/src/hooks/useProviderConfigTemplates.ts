import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type ServiceConfigTemplates } from '../types';

export function useProviderConfigTemplates() {
  const url = 'ws/sms/templates';

  const { data, isLoading, mutate, error } = useSWR<FetchResponse<ServiceConfigTemplates>>(url, openmrsFetch);

  return {
    templates: data?.data ?? {},
    isLoadingTemplates: isLoading,
    mutateTemplates: mutate,
    error,
  };
}
