import jsSHA from 'jssha';

import ID from './id';

export default class Hash extends ID {
  constructor(object) {
    const shaObj = new jsSHA("SHA-1", "TEXT");
    shaObj.update(JSON.stringify(object));
    const hash = shaObj.getHash("HEX");
    super(hash);
  }

  prefix() {
    return "urn:sha1:";
  }
}
