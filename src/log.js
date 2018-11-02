import UUID from './uuid';
import v from './v';

export default class Log {
  constructor(id, key, val=null, at=new Date(), logid=new UUID()) {
    if (!id) {
      throw "id is required";
    }

    if (!key) {
      throw "key is required";
    }

    this.logid = logid;
    this.id = v(id);
    this.key = v(key).unpack();
    this.val = v(val).unpack();
    this.at = v(at);
  }

  get in() {
    return this.id;
  }

  object(book) {
    return {
      logid: this.logid.object(book),
      id: this.id.object(book),
      key: this.key.object(book),
      val: this.val.object(book),
      at: this.at.object(book),
    };
  }
}

export const n = (...args) => {
  return new Log(...args);
};
