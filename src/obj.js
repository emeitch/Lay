import Path from './path';
import Comp from './comp';
import v from './v';

export default class Obj {
  constructor(book, id) {
    this.book = book;
    this.id = id;
  }

  get origin() {
    return this.id.origin;
  }

  stringify(indent=0) {
    return this.id.stringify(indent);
  }

  get(key) {
    if (this.id instanceof Comp) {
      const comp = this.id;
      const prop = comp.get(key, this.book);
      return prop;
    }

    const log = this.book.findLogWithTags(this.id, key);
    return log ? log.val : v(null);
  }

  set(key, val) {
    if (this.id instanceof Comp) {
      throw "Obj#set method unsupported for comp id";
    }

    if (val instanceof Obj) {
      val = val.id;
    }
    this.book.put(this.id, key, val);

    return this;
  }

  send(key, ...args) {
    const path = new Path(this.id, [key, ...args]);
    const v = path.reduce(this.book);
    return this.book.obj(v);
  }

  get name() {
    return this.book.name(this.id);
  }

  get all() {
    return this.book.taggedIds(this.id).map(i => this.book.obj(i));
  }

  keys() {
    const logs = this.book.findActiveLogs({id: this.id});
    return logs.map(l => l.key);
  }
}
