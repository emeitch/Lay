export default class Obj {
  constructor(store, id) {
    this.store = store;
    this.id = id;
  }

  follow(val) {
    const followFuncName = "follow" + val.constructor.name;
    const followFunc = this[followFuncName];
    if (!followFunc) {
      throw `class "${val.constructor.name}" is not followed`;
    }
    return followFunc.call(this, val);
  }

  followVal(val) {
    return val;
  }

  followUUID(uuid) {
    return this.store.obj(uuid);
  }

  followSelf() {
    return this;
  }

  followPath(path) {
    let obj = this.follow(path.receiver);
    for (const key of path.keys) {
      const o = obj.get(key);
      if (!o) {
        throw `${obj} don't have the specified key ${key}`;
      }
      obj = o;
    }
    return obj;
  }

  get(key) {
    const log = this.store.activeLog(this.id, key);
    if (!log) {
      return undefined;
    }

    return this.follow(log.val);
  }
}
