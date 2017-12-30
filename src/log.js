import Val from './val';
import UUID from './uuid';
import v from './v';

export default class Log {
  constructor(id, key, val, at_=null, in_=null) {
    if (!id) {
      throw "id is required";
    }

    if (!key) {
      throw "key is required";
    }

    if (val && !(val instanceof Val)) {
      throw "val is not a Val";
    }

    this.logid = new UUID();
    this.id = v(id);
    this.key = v(key);
    this.val = val;
    this.at = at_;
    this.in = in_;
  }
}

export const n = (...args) => {
  return new Log(...args);
};
