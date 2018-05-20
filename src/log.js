import UUID from './uuid';
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
    this.id = v(id);
    this.key = v(key);
    this.val = v(val).unpack();
    this.at = at_;
    this.in = in_;
  }

  object(book) {
    return {
      logid: this.logid.object(book),
      id: this.id.object(book),
      key: this.key.object(book),
      val: this.val.object(book),
      at: this.at.toJSON(),
      in: this.in
    };
  }
}

export const n = (...args) => {
  return new Log(...args);
};
