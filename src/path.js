import Ref from './ref';
import { Env } from './book';
import Val from './val';
import v from './v';
import { exp } from './exp';

export default class Path extends Ref {
  constructor(...ids) {
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

  str() {
    return "Path" + Val.stringify(this.origin);
  }

  step(book) {
    let r = this.receiver.reduce(book);
    for (const elm of this.keys) {
      let key;
      let args = [];
      if (Array.isArray(elm)) {
        const [top, ...rest] = elm;
        key = top;
        args = rest;
      } else {
        key = elm;
      }

      const k = key.reduce(book);
      const findLog = (i) => {
        const log = book.activeLog(i, k);
        if (!log) {
          const tlogs = book.activeLogs(i, v("tag"));
          for (const tlog of tlogs) {
            const env = new Env(book);
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
      const log = findLog(r) || book.activeLog(book.get("Object"), k);
      if (!log) {
        return super.step(book);
      }

      const env = new Env(book);
      env.set("self", r);

      if (args.length > 0) {
        const e = exp(log.val, ...args);
        r = e.reduce(env);
      } else {
        r = log.val.reduce(env);
      }
    }
    return r;
  }
}

export function path(...args) {
  return new Path(...args);
}
