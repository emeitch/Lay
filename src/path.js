import Ref from './ref';
import ID from './id';
import { self } from './self';

export default class Path extends Ref {
  constructor(...ids) {
    const [receiver, ...keys] = ids;
    if (!(receiver instanceof ID) && receiver !== self) {
      throw `${receiver} is not a ID or a Self`;
    }
    for (const id of keys) {
      if (!(id instanceof ID)) {
        throw `${id} is not a ID`;
      }
    }
    super(ids);
  }

  get receiver() {
    const [receiver,] = this.origin;
    return receiver;
  }

  get keys() {
    const [, ...keys] = this.origin;
    return keys;
  }

  toString() {
    return this.origin.join("/");
  }

  reduce(env) {
    let obj = env.obj(this.receiver);
    for (const key of this.keys) {
      const o = obj.get(key);
      if (!o) {
        throw `${obj} don't have the specified key ${key}`;
      }
      obj = o;
    }
    return obj.id;
  }
}
