import UUID from './uuid';
import { sym } from './sym';
import v from './v';

export default class Log {
  constructor(id, key, val=null, at_=null, in_=null) {
    if (!id) {
      throw "id is required";
    }

    if (!key) {
      throw "key is required";
    }

    this.logid = new UUID();
    this.id = typeof(id) === "string" ? sym(id) : v(id);
    this.key = typeof(key) === "string" ? sym(key) : v(key);
    this.val = typeof(val) === "string" ? sym(val) : v(val);
    this.at = at_;
    this.in = in_;
  }
}

export const n = (...args) => {
  return new Log(...args);
};
