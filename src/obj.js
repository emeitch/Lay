export default class Obj {
  constructor(store, id) {
    this.store = store;
    this.id = id;
  }

  getAsUUID(uuid) {
    return this.store.obj(uuid);
  }

  getAsPath(path) {
    const [rcv, ...keys] = path.origin;
    let obj = this.store.obj(rcv);
    for (const key of keys) {
      obj = obj.get(key);
      if (!obj) {
        throw `specified key ${key} is unknown`;
      }
    }
    return obj;
  }

  get(key) {
    const log = this.store.activeLog(this.id, key);
    if (!log) {
      return undefined;
    }

    const val = log.val;
    const prop = "getAs" + val.constructor.name;
    const method = this[prop];
    return method ? method.call(this, val) : val;
  }
}
