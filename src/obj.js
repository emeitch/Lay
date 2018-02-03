import Path from './path';
import Comp from './comp';
import { Env } from './book';
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

    const findLog = (i) => {
      const log = this.book.activeLog(i, key);
      if (!log) {
        const tlogs = this.book.activeLogs(i, v("tag"));
        for (const tlog of tlogs) {
          const env = new Env(this.book);
          env.set("self", i);

          const p = tlog.val.reduce(env);
          const l = findLog(p);
          if (l) {
            return l;
          }
        }
      }
      return log;
    };
    const log = findLog(this.id) || this.book.activeLog(this.book.get("Object"), key);

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
    return this.book.taggedObjs(this.id);
  }

  keys() {
    const logs = this.book.findActiveLogs({id: this.id});
    return logs.map(l => l.key);
  }
}
