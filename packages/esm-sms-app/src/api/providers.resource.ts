import { openmrsFetch } from '@openmrs/esm-framework';
import { type ProviderConfiguration } from '../types';

async function postData(url: string, data = {}, ac = new AbortController()) {
  const response = await openmrsFetch(url, {
    signal: ac.signal,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function saveConfig(providerConfig: Array<ProviderConfiguration>) {
  const url = '/ws/sms/configs';
  return await postData(url, { configs: providerConfig });
}

export async function uploadConfigTemplate(file: File) {
  const url = '/ws/sms/templates/import';
  const ac = new AbortController();

  const formData = new FormData();
  formData.append('file', file);

  return await openmrsFetch(url, {
    signal: ac.signal,
    method: 'POST',
    headers: {},
    body: formData,
  });
}

export async function sendTestMessage(payload) {
  const url = '/ws/sms/send';
  return await postData(url, payload);
}

export async function setAsDefaultConfig(payload) {
  const url = '/ws/sms/configs';
  return await postData(url, payload);
}
