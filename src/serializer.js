import {
  parse as circularParse,
  stringify as circularStringify
} from 'flatted';

import {
  parse as structuredPars,
  stringify as structuredStringify
} from '@ungap/structured-clone/json';

export default {
  json: JSON,
  circular: {
    parse: circularParse,
    stringify: circularStringify,
  },
  structured: {
    parse: structuredPars,
    stringify: structuredStringify,
  }
};
