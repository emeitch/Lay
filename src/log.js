import UUID from './uuid';
import Edge from './edge';
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
    this.at = at;
  }

  get in() {
    return this.id;
  }

  get edges() {
    return [
      new Edge(this.logid, "type", this.key),
      new Edge(this.logid, "subject", this.id),
      new Edge(this.logid, "object", this.val),
    ];
  }

  object(book) {
    return {
      logid: this.logid.object(book),
      id: this.id.object(book),
      key: this.key.object(book),
      val: this.val.object(book),
      at: this.at.toJSON()
    };
  }
}

export const n = (...args) => {
  return new Log(...args);
};
