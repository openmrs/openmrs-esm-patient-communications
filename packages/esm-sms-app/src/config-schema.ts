import { Type, oneOf } from '@openmrs/esm-framework';

// Define allowed properties for the sms logs table object.
// These properties are described here: https://github.com/johnsonandjohnson/openmrs-distro-cfl/wiki/Admin-SMS#sms-logs
const allowedProperties = [
  'id',
  'errorMessage',
  'providerStatus',
  'openMrsId',
  'providerId',
  'deliveryStatus',
  'messageContent',
  'timestamp',
  'config',
  'smsDirection',
  'phoneNumber',
  'modificationDate',
  'creationDate',
  'modifiedBy',
  'creator',
];

export const configSchema = {
  smsLogsColumns: {
    _type: Type.Array,
    _description: 'Columns to display in logs table. Each value should be a property of SMSlogs record type',
    _default: ['timestamp', 'messageContent', 'config', 'phoneNumber', 'providerId'],
    _validators: [oneOf(allowedProperties)],
  },
};

export interface ConfigObject {
  smsLogsColumns: Array<string>;
}
