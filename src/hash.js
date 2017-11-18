import jsSHA from 'jssha';

import ID from './id';

export default class Hash extends ID {
  constructor(...args) {
    const shaObj = new jsSHA("SHA3-512", "TEXT");
    for (const arg of args) {
      shaObj.update(
        arg.constructor.name +
        "$$" +
        JSON.stringify(arg.origin)
      );
    }
    super(shaObj.getHash("HEX"));
  }

  prefix() {
    return "urn:sha3-512:";
  }
}
