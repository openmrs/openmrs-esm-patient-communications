import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  configurationPageSize: {
    _type: Type.Number,
    _description: 'The default page size for the configuration table',
    _default: 50,
  },
  deliveryTime: {
    _type: Type.Array,
    _description: 'The default delivery times for when testing configurations',
    _default: [],
  },
  maxFileSize: {
    _type: Type.Number,
    _description: 'The maximum filesize for the templates',
    _default: 1,
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
  maxFileSize: number;
  smsLogsColumns: Array<{ key: string; header: string }>;
}
