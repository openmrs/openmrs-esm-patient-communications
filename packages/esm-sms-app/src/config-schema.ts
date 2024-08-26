import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  configurationPageSize: {
    _type: Type.Number,
    _description: 'The default page size for the configuration table',
    _default: 10,
  },
  deliveryTime: {
    _type: Type.Array,
    _description:
      'The default delivery times after which test messages are sent.They as a delay before sending the test messages, i.e After 2hrs, After 30 mins',
    _default: [],
  },
  smsLogsColumns: {
    _type: Type.Array,
    _description: 'Columns to display in logs table. Each value should be a property of SMSlogs record type',
    _default: ['phoneNumber', 'messageContent', 'config', 'timestamp', 'providerId'],
  },
};

export interface ConfigObject {
  configurationPageSize: number;
  deliveryTime: Array<string>;
  smsLogsColumns: Array<string>;
}
