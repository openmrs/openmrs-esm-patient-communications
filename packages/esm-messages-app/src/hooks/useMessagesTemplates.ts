import useSWR from 'swr';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { type MessagesTemplateResponse } from '../types';

export function useMessagesTemplates() {
  const url = '/ws/messages/templates';
  const { data, isLoading, isValidating, mutate, error } = useSWR<FetchResponse<MessagesTemplateResponse>>(
    url,
    openmrsFetch,
  );

  return {
    messagesTemplates: data?.data?.content ?? [],
    isLoadingTemplates: isLoading,
    isValidatingTemplates: isValidating,
    mutateTemplates: mutate,
    error,
  };
}
