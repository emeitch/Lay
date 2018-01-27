import Path from './path';
import Comp from './comp';
import Act from './act';
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
      return this.book.obj(prop);
    }

    const path = new Path(this.id, v(key));
    const val = path.reduce(this.book);
    if (val === path){
      return null;
    } else {
      return this.book.obj(val);
    }
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

    // todo: 暫定的にActをこのタイミングで処理
    if (v instanceof Act) {
      let act = v;
      while(!act.settled) {
        act = act.proceed();
      }
    }

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
