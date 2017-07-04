/* eslint no-console: ["error", { allow: ["log"] }] */
/* eslint-env browser */

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
    let v = this.receiver.reduce(env);
    for (const key of this.keys) {
      const log = env.store.activeLog(v, key);
      if (!log) {
        throw `${v} don't have the specified key ${key}`;
      }
      v = log.val;
    }
    return v;
  }
}
