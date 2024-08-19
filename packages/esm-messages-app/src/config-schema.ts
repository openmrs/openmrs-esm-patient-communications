import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  endOfMessage: {
    _type: Type.Number,
    _description: 'Specifies the end of message',
    _default: [],
  },
};

export interface ConfigObject {
  endOfMessage: Array<any>;
}
