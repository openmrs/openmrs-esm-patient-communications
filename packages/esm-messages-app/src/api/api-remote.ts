import { openmrsFetch } from '@openmrs/esm-framework';
async function putData(url: string, data = {}, ac = new AbortController()) {
  const response = await openmrsFetch(url, {
    signal: ac.signal,
    method: 'PUT',
    body: data,
  });

  return response.data;
}

export async function saveMessageTemplates(payload) {
  const url = '/ws/rest/v1/messages/templates';
  return putData(url, payload);
}
