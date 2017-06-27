import UUID from './uuid';
import Path from './path';

export default class Obj {
  constructor(store, id) {
    this.store = store;
    this.id = id;
  }

  get(key) {
    const log = this.store.activeLog(this.id, key);
    if (!log) {
      return undefined;
    }

    const val = log.val;

    if (val instanceof UUID) {
      return this.store.obj(val);
    }

    if (val instanceof Path) {
      const [rcv, ...keys] = val.origin;
      let obj = this.store.obj(rcv);
      for (const key of keys) {
        obj = obj.get(key);
        if (obj === undefined) {
          throw `specified key ${key} is unknown`;
        }
      }
      return obj;
    }

    return val;
  }
}
