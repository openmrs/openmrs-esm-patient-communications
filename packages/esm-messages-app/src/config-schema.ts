import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  endOfMessageType: {
    _type: Type.Array,
    _description: 'Specifies the number of time after which a message service is endend, i.e After 7 times',
    _default: [7, 8],
  },
};

export interface ConfigObject {
  endOfMessageType: Array<number>;
}
