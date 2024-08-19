import { openmrsFetch } from '@openmrs/esm-framework';
async function postData(url: string, data = {}, ac = new AbortController()) {
  const response = await openmrsFetch(url, {
    signal: ac.signal,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function saveMessageTemplates(payload) {
  const url = '/ws/rest/v1/messages/templates';
  return await postData(url, payload);
}
