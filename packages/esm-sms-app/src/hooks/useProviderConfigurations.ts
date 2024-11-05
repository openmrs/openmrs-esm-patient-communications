import { openmrsFetch, type FetchResponse } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type ProviderConfigurationsResponse } from '../types';
import { useMemo } from 'react';

export function useProviderConfigurations() {
  const url = '/ws/sms/configs';
  const { data, isLoading, error, mutate, isValidating } = useSWR<FetchResponse<ProviderConfigurationsResponse>, Error>(
    url,
    openmrsFetch,
  );

  const providerConfigurations = useMemo(() => {
    if (!isLoading || !isValidating) {
      return data.data.configs.map((config) => ({
        ...config,
        isDefaultConfig: data.data.defaultConfigName === config.name,
      }));
    } else {
      return [];
    }
  }, [data?.data?.configs, data?.data?.defaultConfigName, isLoading, isValidating]);

  return {
    providerConfigurations,
    defaultConfig: data?.data?.defaultConfigName,
    isLoadingConfigs: isLoading,
    isValidatingConfigs: isValidating,
    mutateConfigs: mutate,
    error,
  };
}
