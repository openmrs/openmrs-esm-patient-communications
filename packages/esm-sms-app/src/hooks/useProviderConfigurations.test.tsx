import React from 'react';
import { SWRConfig } from 'swr';
import { renderHook, waitFor } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { useProviderConfigurations } from './useProviderConfigurations';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>{children}</SWRConfig>
);

describe('useProviderConfigurations', () => {
  it('marks the default configuration', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      data: { defaultConfigName: 'Twilio', configs: [{ name: 'Twilio' }, { name: 'Plivo' }] },
    } as Awaited<ReturnType<typeof openmrsFetch>>);

    const { result } = renderHook(() => useProviderConfigurations(), { wrapper });

    await waitFor(() => expect(result.current.isLoadingConfigs).toBe(false));
    expect(result.current.providerConfigurations).toEqual([
      expect.objectContaining({ name: 'Twilio', isDefaultConfig: true }),
      expect.objectContaining({ name: 'Plivo', isDefaultConfig: false }),
    ]);
  });

  it('returns the error instead of throwing when the request fails', async () => {
    const error = new Error('Not found');
    mockOpenmrsFetch.mockRejectedValue(error);

    const { result } = renderHook(() => useProviderConfigurations(), { wrapper });

    await waitFor(() => expect(result.current.error).toBe(error));
    expect(result.current.providerConfigurations).toEqual([]);
  });
});
