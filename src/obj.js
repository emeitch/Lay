export default class Obj {
  constructor(store, id) {
    this.store = store;
    this.id = id;
  }

  follow(val) {
    const prop = "follow" + val.constructor.name;
    const method = this[prop];
    return method ? method.call(this, val) : val;
  }

  followUUID(uuid) {
    return this.store.obj(uuid);
  }

  followSelf() {
    return this;
  }

  followPath(path) {
    const [receiver, ...keys] = path.origin;
    let obj = this.follow(receiver);
    for (const key of keys) {
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
