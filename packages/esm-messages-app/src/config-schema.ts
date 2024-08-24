import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  endOfMessage: {
    _type: Type.Array,
    _description: 'Specifies time to end of message service',
    _default: [7],
  },
};

export interface ConfigObject {
  endOfMessage: Array<number>;
}
