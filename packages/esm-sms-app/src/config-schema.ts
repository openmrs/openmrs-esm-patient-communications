import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  configurationPageSize: {
    _type: Type.Number,
    _description: 'The default page size for the configuration table',
    _default: 10,
  },
  deliveryTime: {
    _type: Type.Array,
    _description: 'The default delivery times for when testing configurations',
    _default: [],
  },
  smsLogsColumns: {
    _type: Type.Array,
    _description: 'Number of columns to display in logs table',
    _default: [
      {
        key: 'phoneNumber',
        header: 'Phone number',
      },
      {
        key: 'messageContent',
        header: 'Message',
      },
      {
        key: 'config',
        header: 'Configuration',
      },
      {
        key: 'timestamp',
        header: 'Timestamp',
      },
      {
        key: 'providerId',
        header: 'Provider',
      },
    ],
  },
};

export interface ConfigObject {
  configurationPageSize: number;
  deliveryTime: Array<string>;
  smsLogsColumns: Array<{ key: string; header: string }>;
}
