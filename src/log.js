import UUID from './uuid';
import { sym } from './sym';
import v from './v';

export default class Log {
  constructor(id, key, val=null, at_=new Date(), in_=null, logid=new UUID()) {
    if (!id) {
      throw "id is required";
    }

    if (!key) {
      throw "key is required";
    }

    this.logid = logid;
    this.id = typeof(id) === "string" ? sym(id) : v(id);
    this.key = typeof(key) === "string" ? sym(key) : v(key);
    this.val = typeof(val) === "string" ? sym(val) : v(val);
    this.at = at_;
    this.in = in_;
  }

  object(book) {
    const val = this.val.deepReduce(book);
    return {
      logid: this.logid.object(book),
      id: this.id.object(book),
      key: this.key.object(book),
      val: (this.key.equals(sym("class")) ? book.name(val) : val).object(book),
      at: this.at.toJSON(),
      in: this.in
    };
  }
}

export const n = (...args) => {
  return new Log(...args);
};
